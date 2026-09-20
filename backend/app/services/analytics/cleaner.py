import re
from typing import Dict, List, Tuple

import pandas as pd

from app.schemas.analytics import DataQualityMetrics


COLUMN_ALIASES: Dict[str, List[str]] = {
    "transaction_date": [
        "transaction_date",
        "transaction date",
        "date",
        "sale_date",
        "sale date",
        "order_date",
        "order date",
        "invoicedate",
        "invoice_date",
    ],

    "invoice_no": [
        "invoice_no",
        "invoice no",
        "invoiceno",
        "invoice_number",
        "order_id",
        "order id",
        "orderid",
        "order_number",
        "order no",
        "order_no",
    ],

    "stock_code": [
        "stock_code",
        "stock code",
        "stockcode",
        "item_code",
        "product_id",
        "sku",
    ],

    "description": [
        "description",
        "item_description",
        "product_name",
        "product",
        "item_name",
    ],

    "quantity": [
        "quantity",
        "qty",
        "units",
        "quantity_sold",
        "quantity sold",
        "order_quantity",
        "order quantity",
    ],

    "unit_price": [
        "unit_price",
        "unit price",
        "unitprice",
        "price",
        "item_price",
        "item price",
        "retail_price",
        "retail price",
    ],

    "total_amount": [
        "total_amount",
        "total amount",
        "amount",
        "total_price",
        "total price",
        "totalprice",
        "total_usd",
        "total usd",
        "total",
        "sales",
        "sales_amount",
        "sales amount",
        "revenue",
        "line_total",
        "line total",
    ],

    "customer_id": [
        "customer_id",
        "customer id",
        "customerid",
        "customer_i",
        "client_id",
    ],

    "country": [
        "country",
        "nation",
    ],

    "store_location": [
        "store_location",
        "store location",
        "storelocation",
        "store_locat",
        "store locat",
        "location",
        "store",
        "branch",
        "region",
    ],

    "category": [
        "category",
        "product_category",
        "product category",
        "department",
    ],

    "currency": [
        "currency",
        "currency_code",
        "currency code",
    ],
}


# These are the minimum fields required for analytics.
# Invoice/order ID is optional.
REQUIRED_COLUMNS = [
    "transaction_date",
    "quantity",
    "total_amount",
]


class ValidationError(Exception):
    pass


def normalize_column_name(col: str) -> str:
    """
    Convert different column naming styles into InsightFlow's
    canonical column names.
    """

    cleaned = (
        str(col)
        .strip()
        .lower()
        .replace("-", " ")
    )

    # Remove punctuation such as:
    # ( ), /, ., $, etc.
    cleaned = re.sub(r"[^\w\s]", "", cleaned)

    # Convert spaces to underscores.
    cleaned = re.sub(r"\s+", "_", cleaned)

    for canonical, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            normalized_alias = (
                re.sub(
                    r"\s+",
                    "_",
                    alias.strip().lower(),
                )
            )

            if cleaned == normalized_alias:
                return canonical

    return cleaned


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Normalize all dataframe columns.

    Prevents duplicate canonical column names from overwriting
    one another.
    """

    new_cols = {}
    used_canonical = set()

    for col in df.columns:
        normalized = normalize_column_name(col)

        if normalized in used_canonical:
            new_cols[col] = f"{normalized}_{col}"
        else:
            new_cols[col] = normalized
            used_canonical.add(normalized)

    return df.rename(columns=new_cols)


def validate_schema(df: pd.DataFrame) -> None:
    """
    Validate the minimum schema required by InsightFlow.
    """

    missing = [
        required
        for required in REQUIRED_COLUMNS
        if required not in df.columns
    ]

    if missing:
        raise ValidationError(
            "Dataset cannot be analyzed because the following "
            f"required columns are missing: {', '.join(missing)}"
        )


def clean_numeric_series(series: pd.Series) -> pd.Series:
    """
    Convert a series containing numbers, commas, spaces or
    common currency symbols into numeric values.
    """

    if pd.api.types.is_numeric_dtype(series):
        return pd.to_numeric(
            series,
            errors="coerce",
        )

    cleaned = (
        series
        .astype(str)
        .str.replace(
            r"[\$,₹,€,£,\s]",
            "",
            regex=True,
        )
    )

    cleaned = cleaned.str.replace(
        r"\bRs\.?\b",
        "",
        regex=True,
        flags=re.IGNORECASE,
    )

    return pd.to_numeric(
        cleaned,
        errors="coerce",
    )


def clean_data(
    df: pd.DataFrame,
) -> Tuple[pd.DataFrame, DataQualityMetrics]:
    """
    Clean and validate the normalized dataframe while preserving
    useful information such as negative values for returns/refunds.
    """

    total_rows = len(df)

    # 1. Remove exact duplicate rows.
    duplicates_count = int(
        df.duplicated().sum()
    )

    cleaned_df = df.drop_duplicates().copy()

    # 2. Clean numeric columns.
    invalid_numeric_count = 0

    for col in [
        "total_amount",
        "quantity",
    ]:
        if col in cleaned_df.columns:

            converted = clean_numeric_series(
                cleaned_df[col]
            )

            invalid_mask = (
                converted.isna()
                & cleaned_df[col].notna()
            )

            invalid_numeric_count += int(
                invalid_mask.sum()
            )

            cleaned_df[col] = converted

    # Unit price is optional.
    if "unit_price" in cleaned_df.columns:
        cleaned_df["unit_price"] = clean_numeric_series(
            cleaned_df["unit_price"]
        )

    # 3. Clean and parse transaction dates.
    invalid_date_count = 0

    if "transaction_date" in cleaned_df.columns:

        converted_dates = pd.to_datetime(
            cleaned_df["transaction_date"],
            format="mixed",
            errors="coerce",
        )

        invalid_date_mask = (
            converted_dates.isna()
            & cleaned_df["transaction_date"].notna()
        )

        invalid_date_count = int(
            invalid_date_mask.sum()
        )

        cleaned_df["transaction_date"] = converted_dates

    # 4. Track negative values.
    #
    # Negative values can represent refunds/returns.
    # We preserve them rather than deleting them.
    negative_quantity_count = 0
    negative_revenue_count = 0

    if "quantity" in cleaned_df.columns:
        negative_quantity_count = int(
            (cleaned_df["quantity"] < 0).sum()
        )

    if "total_amount" in cleaned_df.columns:
        negative_revenue_count = int(
            (cleaned_df["total_amount"] < 0).sum()
        )

    # 5. Remove rows missing required analytical values.
    #
    # invoice_no is intentionally NOT required.
    # Some datasets have no order/invoice identifier.
    essential_cols = [
        col
        for col in [
            "total_amount",
            "quantity",
        ]
        if col in cleaned_df.columns
    ]

    valid_df = cleaned_df.dropna(
        subset=essential_cols
    ).copy()

    # 6. Clean categorical fields.
    for col in [
        "store_location",
        "country",
        "category",
        "description",
        "stock_code",
    ]:
        if col in valid_df.columns:

            valid_df[col] = (
                valid_df[col]
                .fillna("Unknown")
                .astype(str)
                .str.strip()
            )

    valid_rows = len(valid_df)

    removed_rows = (
        total_rows - valid_rows
    )

    # 7. Build data-quality information.
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

    return (
        valid_df,
        quality_metrics,
    )