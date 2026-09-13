from typing import List, Tuple, Optional
import pandas as pd
from app.schemas.analytics import TimeSeriesPoint, GrowthMetrics


def calculate_time_series_and_growth(
    df: pd.DataFrame
) -> Tuple[List[TimeSeriesPoint], GrowthMetrics]:
    if "transaction_date" not in df.columns or df.empty:
        return [], GrowthMetrics(revenue=None, orders=None, units=None)

    valid_dates_df = df.dropna(subset=["transaction_date"]).copy()
    if valid_dates_df.empty:
        return [], GrowthMetrics(revenue=None, orders=None, units=None)

    # Ensure transaction_date is datetime
    if not pd.api.types.is_datetime64_any_dtype(valid_dates_df["transaction_date"]):
        valid_dates_df["transaction_date"] = pd.to_datetime(
            valid_dates_df["transaction_date"], errors="coerce"
        )
        valid_dates_df = valid_dates_df.dropna(subset=["transaction_date"])

    if valid_dates_df.empty:
        return [], GrowthMetrics(revenue=None, orders=None, units=None)

    # Group by Year-Month (e.g. "2023-01")
    valid_dates_df["period"] = valid_dates_df["transaction_date"].dt.to_period("M").astype(str)

    monthly_grouped = valid_dates_df.groupby("period").agg(
        revenue=("total_amount", "sum"),
        orders=("invoice_no", "nunique"),
        units=("quantity", "sum"),
    ).reset_index()

    # Sort chronologically
    monthly_grouped = monthly_grouped.sort_values("period")

    time_series = [
        TimeSeriesPoint(
            period=str(row["period"]),
            revenue=round(float(row["revenue"]), 2),
            orders=int(row["orders"]),
            units=round(float(row["units"]), 2),
        )
        for _, row in monthly_grouped.iterrows()
    ]

    # Calculate growth if at least 2 distinct periods exist
    revenue_growth: Optional[float] = None
    orders_growth: Optional[float] = None
    units_growth: Optional[float] = None

    if len(monthly_grouped) >= 2:
        latest = monthly_grouped.iloc[-1]
        previous = monthly_grouped.iloc[-2]

        if previous["revenue"] != 0:
            revenue_growth = round(float((latest["revenue"] - previous["revenue"]) / abs(previous["revenue"]) * 100), 2)
        
        if previous["orders"] != 0:
            orders_growth = round(float((latest["orders"] - previous["orders"]) / previous["orders"] * 100), 2)
            
        if previous["units"] != 0:
            units_growth = round(float((latest["units"] - previous["units"]) / abs(previous["units"]) * 100), 2)

    growth = GrowthMetrics(
        revenue=revenue_growth,
        orders=orders_growth,
        units=units_growth,
    )

    return time_series, growth
