from typing import List
import pandas as pd
from app.schemas.analytics import TopProduct, CategoryMetric, LocationMetric, CountryMetric, CustomerMetric


def calculate_top_products(df: pd.DataFrame, limit: int = 10) -> List[TopProduct]:
    has_code = "stock_code" in df.columns
    has_desc = "description" in df.columns

    if not (has_code or has_desc) or df.empty:
        return []

    group_keys = []
    if has_code:
        group_keys.append("stock_code")
    if has_desc:
        group_keys.append("description")

    grouped = df.groupby(group_keys, as_index=False).agg(
        revenue=("total_amount", "sum"),
        units=("quantity", "sum"),
    )

    ranked = grouped.sort_values(by=["revenue", "units"], ascending=False).head(limit)

    results = []
    for _, row in ranked.iterrows():
        results.append(
            TopProduct(
                stock_code=str(row["stock_code"]) if has_code and pd.notna(row["stock_code"]) else None,
                description=str(row["description"]) if has_desc and pd.notna(row["description"]) else None,
                revenue=round(float(row["revenue"]), 2),
                units=round(float(row["units"]), 2),
            )
        )
    return results


def calculate_category_metrics(df: pd.DataFrame) -> List[CategoryMetric]:
    if "category" not in df.columns or df.empty:
        return []

    total_revenue = float(df["total_amount"].sum())

    grouped = df.groupby("category", as_index=False).agg(
        revenue=("total_amount", "sum"),
        orders=("invoice_no", "nunique"),
        units=("quantity", "sum"),
    )

    grouped = grouped.sort_values(by="revenue", ascending=False)

    results = []
    for _, row in grouped.iterrows():
        rev = float(row["revenue"])
        share = round((rev / total_revenue * 100), 2) if total_revenue > 0 else 0.0
        results.append(
            CategoryMetric(
                category=str(row["category"]),
                revenue=round(rev, 2),
                orders=int(row["orders"]),
                units=round(float(row["units"]), 2),
                revenue_share=share,
            )
        )
    return results


def calculate_location_metrics(df: pd.DataFrame) -> List[LocationMetric]:
    if "store_location" not in df.columns or df.empty:
        return []

    grouped = df.groupby("store_location", as_index=False).agg(
        revenue=("total_amount", "sum"),
        orders=("invoice_no", "nunique"),
        units=("quantity", "sum"),
    )

    grouped = grouped.sort_values(by="revenue", ascending=False)

    return [
        LocationMetric(
            store_location=str(row["store_location"]),
            revenue=round(float(row["revenue"]), 2),
            orders=int(row["orders"]),
            units=round(float(row["units"]), 2),
        )
        for _, row in grouped.iterrows()
    ]


def calculate_country_metrics(df: pd.DataFrame) -> List[CountryMetric]:
    if "country" not in df.columns or df.empty:
        return []

    grouped = df.groupby("country", as_index=False).agg(
        revenue=("total_amount", "sum"),
        orders=("invoice_no", "nunique"),
        units=("quantity", "sum"),
    )

    grouped = grouped.sort_values(by="revenue", ascending=False)

    return [
        CountryMetric(
            country=str(row["country"]),
            revenue=round(float(row["revenue"]), 2),
            orders=int(row["orders"]),
            units=round(float(row["units"]), 2),
        )
        for _, row in grouped.iterrows()
    ]


def calculate_customer_metrics(df: pd.DataFrame, limit: int = 10) -> List[CustomerMetric]:
    if "customer_id" not in df.columns or df.empty:
        return []

    valid_df = df.dropna(subset=["customer_id"]).copy()
    valid_df["customer_id"] = valid_df["customer_id"].astype(str).str.strip()
    valid_df = valid_df[
        ~valid_df["customer_id"].isin(["", "Unknown", "nan", "NaN", "None"])
    ]

    if valid_df.empty:
        return []

    grouped = valid_df.groupby("customer_id", as_index=False).agg(
        revenue=("total_amount", "sum"),
        orders=("invoice_no", "nunique"),
        units=("quantity", "sum"),
    )

    grouped = grouped.sort_values(by="revenue", ascending=False).head(limit)

    return [
        CustomerMetric(
            customer_id=str(row["customer_id"]),
            revenue=round(float(row["revenue"]), 2),
            orders=int(row["orders"]),
            units=round(float(row["units"]), 2),
        )
        for _, row in grouped.iterrows()
    ]
