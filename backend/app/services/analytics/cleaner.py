import re
from typing import Dict, List, Tuple, Any
import pandas as pd
from app.schemas.analytics import DataQualityMetrics


COLUMN_ALIASES: Dict[str, List[str]] = {
    "transaction_date": ["transaction_date", "transaction date", "date", "order_date", "order date", "invoicedate", "invoice_date"],
    "invoice_no": ["invoice_no", "invoice no", "invoiceno", "invoice_number", "order_id", "order id", "order_number"],
    "stock_code": ["stock_code", "stock code", "stockcode", "item_code", "product_id", "sku"],
    "description": ["description", "item_description", "product_name", "product", "item_name"],
    "quantity": ["quantity", "qty", "units", "quantity_sold"],
    "unit_price": ["unit_price", "unit price", "price", "item_price"],
    "total_amount": ["total_amount", "total amount", "amount", "total_price", "sales", "revenue", "line_total"],
    "customer_id": ["customer_id", "customer id", "customerid", "client_id"],
    "country": ["country", "nation"],
    "store_location": ["store_location", "store location", "location", "store", "branch"],
    "category": ["category", "product_category", "department"],
}

REQUIRED_COLUMNS = ["transaction_date", "invoice_no", "quantity", "total_amount"]


class ValidationError(Exception):
    pass


def normalize_column_name(col: str) -> str:
    cleaned = str(col).strip().lower().replace("-", " ")
    cleaned = re.sub(r"[^\w\s]", "", cleaned)
    cleaned = re.sub(r"\s+", "_", cleaned)
    
    for canonical, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            norm_alias = re.sub(r"\s+", "_", alias.strip().lower())
            if cleaned == norm_alias:
                return canonical
    return cleaned


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    new_cols = {}
    used_canonical = set()
    
    for col in df.columns:
        norm = normalize_column_name(col)
        # Avoid duplicate column names if multiple columns match same alias
        if norm in used_canonical:
            new_cols[col] = f"{norm}_{col}"
        else:
            new_cols[col] = norm
            used_canonical.add(norm)
            
    return df.rename(columns=new_cols)


def validate_schema(df: pd.DataFrame) -> None:
    missing = [req for req in REQUIRED_COLUMNS if req not in df.columns]
    if missing:
        raise ValidationError(
            f"Dataset cannot be analyzed because the following required columns are missing: {', '.join(missing)}"
        )


def clean_numeric_series(series: pd.Series) -> pd.Series:
    if pd.api.types.is_numeric_dtype(series):
        return pd.to_numeric(series, errors="coerce")
    
    # Remove currency symbols, commas, spaces
    cleaned = series.astype(str).str.replace(r"[\$,\s]", "", regex=True)
    return pd.to_numeric(cleaned, errors="coerce")


def clean_data(df: pd.DataFrame) -> Tuple[pd.DataFrame, DataQualityMetrics]:
    total_rows = len(df)
    
    # 1. Deduplication: exact duplicate rows only
    duplicates_count = int(df.duplicated().sum())
    cleaned_df = df.drop_duplicates().copy()
    
    # 2. Clean numeric columns
    invalid_numeric_count = 0
    for col in ["total_amount", "quantity"]:
        if col in cleaned_df.columns:
            converted = clean_numeric_series(cleaned_df[col])
            # Count invalid numerics (NaNs produced from non-empty string)
            invalid_mask = converted.isna() & cleaned_df[col].notna()
            invalid_numeric_count += int(invalid_mask.sum())
            cleaned_df[col] = converted
            
    if "unit_price" in cleaned_df.columns:
        cleaned_df["unit_price"] = clean_numeric_series(cleaned_df["unit_price"])

    # 3. Clean and parse transaction_date if available
    invalid_date_count = 0
    if "transaction_date" in cleaned_df.columns:
        converted_dates = pd.to_datetime(cleaned_df["transaction_date"], format="mixed", errors="coerce")
        invalid_date_mask = converted_dates.isna() & cleaned_df["transaction_date"].notna()
        invalid_date_count = int(invalid_date_mask.sum())
        cleaned_df["transaction_date"] = converted_dates

    # 4. Track negative rows (refunds/returns) - preserve them, do not delete!
    negative_quantity_count = int((cleaned_df["quantity"] < 0).sum()) if "quantity" in cleaned_df.columns else 0
    negative_revenue_count = int((cleaned_df["total_amount"] < 0).sum()) if "total_amount" in cleaned_df.columns else 0

    # 5. Filter out rows missing required critical values (NaN in total_amount or quantity or invoice_no)
    essential_cols = [c for c in ["invoice_no", "total_amount", "quantity"] if c in cleaned_df.columns]
    valid_df = cleaned_df.dropna(subset=essential_cols).copy()
    
    # Clean categorical string columns
    for col in ["store_location", "country", "category", "description", "stock_code"]:
        if col in valid_df.columns:
            valid_df[col] = valid_df[col].fillna("Unknown").astype(str).str.strip()

    valid_rows = len(valid_df)
    removed_rows = total_rows - valid_rows

    quality_metrics = DataQualityMetrics(
        total_rows=total_rows,
        valid_rows=valid_rows,
        removed_rows=removed_rows,
        duplicate_rows_removed=duplicates_count,
        invalid_date_rows=invalid_date_count,
        invalid_numeric_rows=invalid_numeric_count,
        negative_quantity_rows=negative_quantity_count,
        negative_revenue_rows=negative_revenue_count,
    )

    return valid_df, quality_metrics
