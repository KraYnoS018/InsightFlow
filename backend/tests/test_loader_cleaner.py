"""
Focused tests for the data loading and cleaning layer.

Covers:
  load_csv_from_path, normalize_columns, validate_schema,
  clean_data, load_and_clean.
"""
import os
import textwrap
import pytest
import pandas as pd

from app.services.analytics.loader import (
    load_csv_from_path,
    load_and_clean,
    FileNotFoundError as LoaderFileNotFoundError,
    EmptyFileError,
)
from app.schemas.loader import LoadResult
from app.services.analytics.cleaner import (
    normalize_columns,
    normalize_column_name,
    validate_schema,
    clean_data,
    ValidationError,
    COLUMN_ALIASES,
    REQUIRED_COLUMNS,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def write_csv(tmp_path, filename, content):
    p = tmp_path / filename
    p.write_text(textwrap.dedent(content), encoding="utf-8")
    return str(p)


def minimal_df(**overrides):
    base = dict(
        transaction_date=["2024-01-15"],
        invoice_no=["INV-001"],
        quantity=["3"],
        total_amount=["99.99"],
    )
    base.update(overrides)
    return pd.DataFrame(base)


# ===========================================================================
# normalize_column_name
# ===========================================================================

def test_norm_strips_and_lowercases():
    assert normalize_column_name("  Total Amount  ") == "total_amount"


def test_norm_removes_special_chars():
    assert normalize_column_name("Unit-Price!") == "unit_price"


def test_norm_collapses_spaces():
    assert normalize_column_name("Store Location") == "store_location"


def test_norm_all_aliases_resolve():
    for canonical, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            result = normalize_column_name(alias)
            assert result == canonical, f"Alias {alias!r} -> {result!r}, expected {canonical!r}"


def test_norm_unknown_passthrough():
    assert normalize_column_name("mystery_field_xyz") == "mystery_field_xyz"


# ===========================================================================
# normalize_columns (DataFrame-level)
# ===========================================================================

def test_df_norm_renames_headers():
    df = pd.DataFrame(columns=["Transaction Date", "Invoice No", "Quantity", "Total Amount"])
    out = normalize_columns(df)
    assert set(out.columns) == {"transaction_date", "invoice_no", "quantity", "total_amount"}


def test_df_norm_unknown_cols_preserved():
    df = pd.DataFrame(columns=["invoice_no", "total_amount", "mystery_col"])
    out = normalize_columns(df)
    assert "mystery_col" in out.columns


def test_df_norm_collision_avoidance():
    df = pd.DataFrame(columns=["Quantity", "qty"])
    out = normalize_columns(df)
    cols = list(out.columns)
    assert len(cols) == len(set(cols))
    assert "quantity" in cols


def test_df_norm_no_mutation():
    df = pd.DataFrame(columns=["Invoice No", "Total Amount"])
    original = list(df.columns)
    normalize_columns(df)
    assert list(df.columns) == original


def test_df_norm_idempotent():
    df = pd.DataFrame(columns=["transaction_date", "invoice_no", "quantity", "total_amount"])
    out = normalize_columns(df)
    assert list(out.columns) == list(df.columns)


# ===========================================================================
# validate_schema
# ===========================================================================

def test_validate_passes_all_required():
    validate_schema(pd.DataFrame(columns=REQUIRED_COLUMNS))


def test_validate_raises_single_missing():
    df = pd.DataFrame(columns=["transaction_date", "invoice_no", "quantity"])
    with pytest.raises(ValidationError) as exc:
        validate_schema(df)
    assert "total_amount" in str(exc.value)


def test_validate_raises_multiple_missing():
    df = pd.DataFrame(columns=["invoice_no"])
    with pytest.raises(ValidationError) as exc:
        validate_schema(df)
    msg = str(exc.value)
    assert "transaction_date" in msg and "quantity" in msg and "total_amount" in msg


def test_validate_error_human_readable():
    df = pd.DataFrame(columns=["invoice_no"])
    with pytest.raises(ValidationError) as exc:
        validate_schema(df)
    assert any(w in str(exc.value).lower() for w in ("missing", "required"))


def test_validate_extra_cols_ok():
    validate_schema(pd.DataFrame(columns=REQUIRED_COLUMNS + ["bonus"]))


# ===========================================================================
# clean_data
# ===========================================================================

def test_clean_exact_duplicates_removed():
    df = pd.DataFrame({
        "transaction_date": ["2024-01-01", "2024-01-01", "2024-01-02"],
        "invoice_no": ["A1", "A1", "A2"],
        "quantity": ["1", "1", "2"],
        "total_amount": ["10.0", "10.0", "20.0"],
    })
    cleaned, q = clean_data(df)
    assert q.duplicate_rows_removed == 1
    assert len(cleaned) == 2


def test_clean_non_exact_dupes_preserved():
    df = pd.DataFrame({
        "transaction_date": ["2024-01-01", "2024-01-01"],
        "invoice_no": ["A1", "A1"],
        "quantity": ["1", "2"],
        "total_amount": ["10.0", "20.0"],
    })
    cleaned, q = clean_data(df)
    assert q.duplicate_rows_removed == 0
    assert len(cleaned) == 2


def test_clean_currency_symbol_stripped():
    df = pd.DataFrame({
        "transaction_date": ["2024-01-01"],
        "invoice_no": ["A1"],
        "quantity": ["2"],
        "total_amount": ["$149.99"],
    })
    cleaned, _ = clean_data(df)
    assert cleaned["total_amount"].iloc[0] == pytest.approx(149.99)


def test_clean_comma_thousands_stripped():
    df = pd.DataFrame({
        "transaction_date": ["2024-01-01"],
        "invoice_no": ["A1"],
        "quantity": ["1"],
        "total_amount": ["1,500"],
    })
    cleaned, _ = clean_data(df)
    assert cleaned["total_amount"].iloc[0] == pytest.approx(1500.0)


def test_clean_corrupt_numeric_rows_dropped():
    df = pd.DataFrame({
        "transaction_date": ["2024-01-01", "2024-01-02", "2024-01-03"],
        "invoice_no": ["A1", "A2", "A3"],
        "quantity": ["2", "invalid_qty", "3"],
        "total_amount": ["10.0", "50.0", "30.0"],
    })
    cleaned, q = clean_data(df)
    assert q.invalid_numeric_rows > 0
    assert len(cleaned) == 2


def test_clean_invalid_numeric_count():
    df = pd.DataFrame({
        "transaction_date": ["2024-01-01", "2024-01-02"],
        "invoice_no": ["A1", "A2"],
        "quantity": ["abc", "xyz"],
        "total_amount": ["10.0", "20.0"],
    })
    _, q = clean_data(df)
    assert q.invalid_numeric_rows == 2


def test_clean_iso_date_parsed():
    df = minimal_df(transaction_date=["2024-03-15"])
    cleaned, _ = clean_data(df)
    assert pd.api.types.is_datetime64_any_dtype(cleaned["transaction_date"])


def test_clean_invalid_date_counted():
    df = pd.DataFrame({
        "transaction_date": ["2024-01-01", "not-a-date", "2024-01-03"],
        "invoice_no": ["A1", "A2", "A3"],
        "quantity": ["1", "2", "3"],
        "total_amount": ["10.0", "20.0", "30.0"],
    })
    _, q = clean_data(df)
    assert q.invalid_date_rows == 1


def test_clean_various_date_formats():
    df = pd.DataFrame({
        "transaction_date": ["01/15/2024", "2024-01-16", "16-Jan-2024"],
        "invoice_no": ["A1", "A2", "A3"],
        "quantity": ["1", "1", "1"],
        "total_amount": ["10.0", "20.0", "30.0"],
    })
    cleaned, q = clean_data(df)
    assert q.invalid_date_rows == 0
    assert pd.api.types.is_datetime64_any_dtype(cleaned["transaction_date"])


def test_clean_negative_quantity_preserved():
    df = pd.DataFrame({
        "transaction_date": ["2024-01-01", "2024-01-02"],
        "invoice_no": ["A1", "A2"],
        "quantity": ["5", "-2"],
        "total_amount": ["50.0", "-20.0"],
    })
    cleaned, q = clean_data(df)
    assert len(cleaned) == 2
    assert q.negative_quantity_rows == 1


def test_clean_negative_revenue_preserved():
    df = pd.DataFrame({
        "transaction_date": ["2024-01-01", "2024-01-02"],
        "invoice_no": ["A1", "A2"],
        "quantity": ["5", "-2"],
        "total_amount": ["50.0", "-20.0"],
    })
    cleaned, q = clean_data(df)
    assert q.negative_revenue_rows == 1


def test_clean_refund_reduces_revenue():
    df = pd.DataFrame({
        "transaction_date": ["2024-01-01", "2024-01-02"],
        "invoice_no": ["A1", "A2"],
        "quantity": ["5", "-2"],
        "total_amount": ["100.0", "-30.0"],
    })
    cleaned, _ = clean_data(df)
    assert cleaned["total_amount"].sum() == pytest.approx(70.0)


def test_clean_quality_total_rows():
    _, q = clean_data(minimal_df())
    assert q.total_rows == 1


def test_clean_valid_plus_removed_equals_total():
    df = pd.DataFrame({
        "transaction_date": ["2024-01-01", "2024-01-01", "2024-01-02"],
        "invoice_no": ["A1", "A1", "A2"],
        "quantity": ["1", "1", "2"],
        "total_amount": ["10.0", "10.0", "20.0"],
    })
    cleaned, q = clean_data(df)
    assert q.valid_rows + q.removed_rows == q.total_rows


def test_clean_unknown_columns_survive():
    df = pd.DataFrame({
        "transaction_date": ["2024-01-01"],
        "invoice_no": ["A1"],
        "quantity": ["1"],
        "total_amount": ["10.0"],
        "alien_column": ["some_value"],
    })
    cleaned, _ = clean_data(df)
    assert "alien_column" in cleaned.columns


# ===========================================================================
# load_csv_from_path
# ===========================================================================

def test_load_simple_csv(tmp_path):
    path = write_csv(tmp_path, "simple.csv",
        "Transaction Date,Invoice No,Quantity,Total Amount\n"
        "2024-01-01,INV1,2,100.00\n"
        "2024-01-02,INV2,1,50.00\n")
    result = load_csv_from_path(path)
    assert isinstance(result, LoadResult)
    assert result.raw_row_count == 2
    assert result.file_path == os.path.abspath(path)


def test_load_original_columns_preserved(tmp_path):
    path = write_csv(tmp_path, "cols.csv",
        "Transaction Date,Invoice No,Quantity,Total Amount,Extra Field\n"
        "2024-01-01,INV1,2,100.00,some_val\n")
    result = load_csv_from_path(path)
    assert "Transaction Date" in result.original_columns
    assert "Extra Field" in result.original_columns


def test_load_values_as_str(tmp_path):
    path = write_csv(tmp_path, "types.csv",
        "Transaction Date,Invoice No,Quantity,Total Amount\n"
        "2024-01-01,INV1,2,$100.00\n")
    result = load_csv_from_path(path)
    assert result.dataframe["Total Amount"].iloc[0] == "$100.00"


def test_load_raises_missing_file(tmp_path):
    with pytest.raises(LoaderFileNotFoundError):
        load_csv_from_path(str(tmp_path / "does_not_exist.csv"))


def test_load_raises_empty_file(tmp_path):
    p = tmp_path / "empty.csv"
    p.write_bytes(b"")
    with pytest.raises(Exception):
        load_csv_from_path(str(p))


def test_load_raises_header_only(tmp_path):
    p = tmp_path / "header_only.csv"
    p.write_text("col1,col2,col3", encoding="utf-8")
    with pytest.raises(EmptyFileError):
        load_csv_from_path(str(p))


def test_load_utf8_bom(tmp_path):
    p = tmp_path / "bom.csv"
    content = "Transaction Date,Invoice No,Quantity,Total Amount\n2024-01-01,INV1,2,100.00\n"
    p.write_bytes(b"\xef\xbb\xbf" + content.encode("utf-8"))
    result = load_csv_from_path(str(p))
    assert result.raw_row_count == 1
    assert result.detected_encoding == "utf-8-sig"


def test_load_latin1_fallback(tmp_path):
    p = tmp_path / "latin.csv"
    content = b"Transaction Date,Invoice No,Quantity,Total Amount\n2024-01-01,INV\xe91,2,50.00\n"
    p.write_bytes(content)
    result = load_csv_from_path(str(p))
    assert result.raw_row_count == 1
    assert result.detected_encoding == "latin-1"


def test_load_encoding_recorded(tmp_path):
    path = write_csv(tmp_path, "enc.csv",
        "Transaction Date,Invoice No,Quantity,Total Amount\n"
        "2024-01-01,INV1,1,10.00\n")
    result = load_csv_from_path(path)
    assert result.detected_encoding in ("utf-8", "utf-8-sig", "latin-1")


def test_load_no_unparseable_on_clean_file(tmp_path):
    path = write_csv(tmp_path, "clean.csv",
        "Transaction Date,Invoice No,Quantity,Total Amount\n"
        "2024-01-01,INV1,2,100.00\n"
        "2024-01-02,INV2,1,50.00\n")
    result = load_csv_from_path(path)
    assert result.unparseable_rows == 0


# ===========================================================================
# load_and_clean (end-to-end)
# ===========================================================================

def test_e2e_round_trip(tmp_path):
    path = write_csv(tmp_path, "retail.csv",
        "Transaction Date,Invoice No,Quantity,Total Amount\n"
        "2024-01-01,INV1,2,$100.00\n"
        "2024-01-02,INV2,3,150.00\n")
    cleaned, quality, load_result = load_and_clean(path)
    assert len(cleaned) == 2
    assert quality.total_rows == 2
    assert quality.duplicate_rows_removed == 0
    assert load_result.raw_row_count == 2


def test_e2e_aliases_resolved(tmp_path):
    path = write_csv(tmp_path, "alias.csv",
        "Transaction Date,Invoice No,Qty,Revenue\n"
        "2024-01-01,INV1,2,100.00\n")
    cleaned, _, _ = load_and_clean(path)
    assert "transaction_date" in cleaned.columns
    assert "invoice_no" in cleaned.columns
    assert "quantity" in cleaned.columns
    assert "total_amount" in cleaned.columns


def test_e2e_missing_required_raises(tmp_path):
    path = write_csv(tmp_path, "incomplete.csv",
        "Invoice No,Quantity\n"
        "INV1,2\n")
    with pytest.raises(ValidationError) as exc:
        load_and_clean(path)
    assert "total_amount" in str(exc.value)


def test_e2e_duplicates_removed(tmp_path):
    path = write_csv(tmp_path, "dupes.csv",
        "Transaction Date,Invoice No,Quantity,Total Amount\n"
        "2024-01-01,INV1,1,10.00\n"
        "2024-01-01,INV1,1,10.00\n"
        "2024-01-02,INV2,2,20.00\n")
    cleaned, quality, _ = load_and_clean(path)
    assert quality.duplicate_rows_removed == 1
    assert len(cleaned) == 2


def test_e2e_negative_values_preserved(tmp_path):
    path = write_csv(tmp_path, "returns.csv",
        "Transaction Date,Invoice No,Quantity,Total Amount\n"
        "2024-01-01,INV1,5,100.00\n"
        "2024-01-02,INV2,-2,-40.00\n")
    cleaned, quality, _ = load_and_clean(path)
    assert len(cleaned) == 2
    assert quality.negative_quantity_rows == 1
    assert quality.negative_revenue_rows == 1


def test_e2e_unknown_cols_survive(tmp_path):
    path = write_csv(tmp_path, "extra.csv",
        "Transaction Date,Invoice No,Quantity,Total Amount,Internal Notes\n"
        "2024-01-01,INV1,1,10.00,check this\n")
    cleaned, _, _ = load_and_clean(path)
    assert "internal_notes" in cleaned.columns


def test_e2e_file_not_found(tmp_path):
    with pytest.raises(LoaderFileNotFoundError):
        load_and_clean(str(tmp_path / "ghost.csv"))