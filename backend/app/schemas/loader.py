"""
Loader output schema.

LoadResult is a plain dataclass (not a Pydantic model) because it carries a
pandas DataFrame, which cannot be serialised to JSON by Pydantic.  The rest of
the pipeline works with the DataFrame directly; the caller is responsible for
converting it to an AnalyticsResponse via process_analytics().
"""
from dataclasses import dataclass, field
from typing import List
import pandas as pd


@dataclass
class LoadResult:
    """Outcome of loading a CSV file from disk."""

    # The raw, un-cleaned DataFrame (columns NOT yet normalised).
    dataframe: pd.DataFrame

    # Absolute path that was loaded.
    file_path: str

    # Number of data rows in the file (excluding the header).
    raw_row_count: int

    # Number of rows that pandas could not parse at all (e.g. malformed CSV lines).
    unparseable_rows: int = 0

    # Encoding that was successfully used to decode the file.
    detected_encoding: str = "utf-8"

    # Column names exactly as they appear in the file (before normalisation).
    original_columns: List[str] = field(default_factory=list)

    # Non-fatal warnings collected during loading (e.g. mixed-type columns).
    warnings: List[str] = field(default_factory=list)
