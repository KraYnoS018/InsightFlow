import httpx
from typing import Optional, Dict, Any
from app.core.config import settings


class AuthenticationError(Exception):
    pass


class DatasetNotFoundError(Exception):
    pass


class AccessDeniedError(Exception):
    pass


class StorageError(Exception):
    pass


async def verify_supabase_token(token: str) -> Dict[str, Any]:
    """Verify Supabase JWT token against Supabase Auth API and return user profile."""
    if not token:
        raise AuthenticationError("Missing authentication token.")

    auth_url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user"
    headers = {
        "Authorization": f"Bearer {token}",
        "apikey": settings.SUPABASE_ANON_KEY,
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(auth_url, headers=headers, timeout=10.0)
            if response.status_code != 200:
                raise AuthenticationError("Invalid or expired session token.")
            return response.json()
        except httpx.RequestError as exc:
            raise AuthenticationError(f"Auth verification service unavailable: {str(exc)}")


async def fetch_dataset_metadata(dataset_id: str, user_token: str, user_id: str) -> Dict[str, Any]:
    """Fetch dataset record from PostgreSQL datasets table and verify user ownership."""
    api_key = settings.SUPABASE_ANON_KEY
    url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/datasets"
    params = {"id": f"eq.{dataset_id}", "select": "*"}
    
    # Send user token so RLS is enforced at the database level too
    headers = {
        "Authorization": f"Bearer {user_token}",
        "apikey": api_key,
        "Accept": "application/json",
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers, params=params, timeout=10.0)
            if response.status_code != 200:
                raise DatasetNotFoundError(f"Failed to query dataset metadata: {response.text}")

            records = response.json()
            if not records or len(records) == 0:
                raise DatasetNotFoundError(f"Dataset with ID '{dataset_id}' not found.")

            dataset = records[0]
            # Strict multi-tenant verification
            if dataset.get("user_id") != user_id:
                raise AccessDeniedError("You do not have permission to access this dataset.")

            return dataset
        except httpx.RequestError as exc:
            raise DatasetNotFoundError(f"Database query error: {str(exc)}")


async def download_dataset_csv(storage_path: str, user_token: str) -> bytes:
    """Download CSV file bytes securely from private Supabase Storage using authenticated user token."""
    api_key = settings.SUPABASE_ANON_KEY
    # Path in bucket 'sales-csv'
    bucket = "sales-csv"
    url = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/object/{bucket}/{storage_path}"
    
    headers = {
        "Authorization": f"Bearer {user_token}",
        "apikey": api_key,
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers, timeout=30.0)
            if response.status_code != 200:
                raise StorageError(f"Failed to retrieve file from storage ({response.status_code}): {response.text}")

            return response.content
        except httpx.RequestError as exc:
            raise StorageError(f"Storage service request error: {str(exc)}")


# ---------------------------------------------------------------------------
# Local CSV loader
# ---------------------------------------------------------------------------
import io
import os
import pandas as pd
from typing import Tuple
from app.schemas.loader import LoadResult
from app.services.analytics.cleaner import (
    normalize_columns,
    validate_schema,
    clean_data,
    ValidationError,
)
from app.schemas.analytics import DataQualityMetrics

# Encoding candidates tried in order.  latin-1 is a byte-safe last resort that
# never raises a UnicodeDecodeError (every byte is a valid codepoint).
_ENCODING_CANDIDATES = ["utf-8", "utf-8-sig", "latin-1"]


class FileNotFoundError(OSError):  # noqa: A001 – shadow built-in intentionally
    """Raised when the requested CSV path does not exist."""


class EmptyFileError(ValueError):
    """Raised when the CSV file contains no data rows at all."""


def load_csv_from_path(file_path: str) -> LoadResult:
    """Load a CSV from *file_path* on the local filesystem.

    Strategy
    --------
    1. Resolve and validate the path.
    2. Attempt to decode with each encoding in ``_ENCODING_CANDIDATES`` until
       one succeeds.
    3. Ask pandas to skip unparseable lines (``on_bad_lines="warn"``), then
       count how many were skipped by comparing expected vs actual row count.
    4. Preserve every column exactly as found; normalisation happens later in
       the cleaner layer.
    5. Return a :class:`~app.schemas.loader.LoadResult` with load statistics.

    Parameters
    ----------
    file_path:
        Absolute or relative path to the CSV file.

    Returns
    -------
    LoadResult
        Raw DataFrame plus loading metadata.

    Raises
    ------
    FileNotFoundError
        When the path does not exist.
    EmptyFileError
        When the file is present but contains no data rows.
    ValueError
        When the file cannot be decoded with any supported encoding.
    """
    resolved = os.path.abspath(file_path)
    if not os.path.exists(resolved):
        raise FileNotFoundError(f"CSV file not found: {resolved}")

    warnings: list[str] = []
    detected_encoding = "utf-8"
    raw_bytes: bytes | None = None

    # Read raw bytes once; we'll decode inside pandas via StringIO to avoid
    # re-reading the file for each encoding attempt.
    with open(resolved, "rb") as fh:
        raw_bytes = fh.read()

    # --- Encoding detection via trial decode ---
    if raw_bytes.startswith(b"\xef\xbb\xbf"):
        detected_encoding = "utf-8-sig"
    else:
        for enc in _ENCODING_CANDIDATES:
            try:
                raw_bytes.decode(enc)
                detected_encoding = enc
                break
            except (UnicodeDecodeError, LookupError):
                continue
        else:
            raise ValueError(
                f"Could not decode '{resolved}' with any of the supported encodings: "
                f"{_ENCODING_CANDIDATES}"
            )

    # --- Parse with pandas, counting bad lines ---
    # We count total newlines in the raw text to later detect skipped rows.
    text = raw_bytes.decode(detected_encoding)
    # Naive line count (header + data rows, ignoring quoted newlines – good
    # enough for the skipped-row heuristic).
    total_newlines = text.count("\n")
    # Strip a trailing newline so it doesn't inflate the count.
    if text.endswith("\n"):
        total_newlines -= 1
    # total_newlines ≈ header(1) + data rows; guard against empty files.
    estimated_data_lines = max(0, total_newlines - 1)

    import warnings as _warnings_mod

    bad_line_warnings: list[str] = []

    with _warnings_mod.catch_warnings(record=True) as caught:
        _warnings_mod.simplefilter("always")
        try:
            df = pd.read_csv(
                io.StringIO(text),
                on_bad_lines="warn",   # pandas ≥ 1.3 (replaces error_bad_lines)
                low_memory=False,
                dtype=str,             # read everything as str; cleaner coerces types
            )
        except Exception as exc:
            raise ValueError(f"pandas could not parse '{resolved}': {exc}") from exc

        for w in caught:
            msg = str(w.message)
            if "bad line" in msg.lower() or "tokenizing" in msg.lower():
                bad_line_warnings.append(msg)

    if df.empty or len(df.columns) == 0:
        raise EmptyFileError(f"CSV file contains no parseable data: {resolved}")

    raw_row_count = len(df)
    if raw_row_count == 0:
        raise EmptyFileError(f"CSV file contains a header but no data rows: {resolved}")

    # Estimate unparseable rows from the count difference.
    unparseable_rows = max(0, estimated_data_lines - raw_row_count)

    if unparseable_rows > 0:
        warnings.append(
            f"{unparseable_rows} row(s) were skipped because they could not be parsed."
        )
    if bad_line_warnings:
        warnings.extend(bad_line_warnings)

    original_columns = list(df.columns)

    return LoadResult(
        dataframe=df,
        file_path=resolved,
        raw_row_count=raw_row_count,
        unparseable_rows=unparseable_rows,
        detected_encoding=detected_encoding,
        original_columns=original_columns,
        warnings=warnings,
    )


def load_and_clean(
    file_path: str,
) -> Tuple[pd.DataFrame, DataQualityMetrics, LoadResult]:
    """Convenience: load → normalise → validate → clean in one call.

    Parameters
    ----------
    file_path:
        Path to the CSV file on disk.

    Returns
    -------
    cleaned_df:
        DataFrame after normalisation and cleaning.
    quality_metrics:
        Cleaning statistics (duplicates, invalids, etc.).
    load_result:
        Raw loading statistics (encoding, row count, unparseable rows).

    Raises
    ------
    FileNotFoundError, EmptyFileError, ValueError:
        Propagated from :func:`load_csv_from_path`.
    ValidationError:
        When required columns are absent after normalisation.
    """
    load_result = load_csv_from_path(file_path)
    normalised_df = normalize_columns(load_result.dataframe)
    validate_schema(normalised_df)
    cleaned_df, quality_metrics = clean_data(normalised_df)
    return cleaned_df, quality_metrics, load_result
