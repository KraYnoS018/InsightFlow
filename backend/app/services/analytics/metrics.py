from typing import Optional
import pandas as pd
from app.schemas.analytics import SummaryMetrics


def calculate_summary_metrics(df: pd.DataFrame) -> SummaryMetrics:
    if df.empty:
        return SummaryMetrics(
            total_revenue=0.0,
            total_orders=0,
            total_units=0.0,
            average_order_value=None,
            average_unit_price=None,
            unique_customers=None,
        )

    # Total Revenue: SUM(total_amount)
    total_revenue = (
        float(df["total_amount"].sum())
        if "total_amount" in df.columns
        else 0.0
    )

    # Total Orders:
    # Use distinct invoice/order IDs when available.
    # If no invoice/order ID exists, use transaction/record count.
    if "invoice_no" in df.columns:
        valid_invoices = df["invoice_no"].dropna().astype(str).str.strip()
        valid_invoices = valid_invoices[
            (valid_invoices != "")
            & (valid_invoices != "nan")
            & (valid_invoices != "None")
        ]

        if not valid_invoices.empty:
            total_orders = int(valid_invoices.nunique())
        else:
            total_orders = len(df)
    else:
        total_orders = len(df)

    # Total Units: SUM(quantity)
    total_units = (
        float(df["quantity"].sum())
        if "quantity" in df.columns
        else 0.0
    )

    # Average Order Value / Average Transaction Value
    if total_orders > 0:
        average_order_value = round(total_revenue / total_orders, 2)
    else:
        average_order_value = None

    # Average Unit Price
    average_unit_price: Optional[float] = None
    if "unit_price" in df.columns:
        valid_prices = df["unit_price"].dropna()

        if not valid_prices.empty:
            average_unit_price = round(
                float(valid_prices.mean()),
                2,
            )

    # Unique Customers
    unique_customers: Optional[int] = None

    if "customer_id" in df.columns:
        valid_customers = (
            df["customer_id"]
            .dropna()
            .astype(str)
            .str.strip()
        )

        valid_customers = valid_customers[
            (valid_customers != "")
            & (valid_customers != "Unknown")
            & (valid_customers != "nan")
            & (valid_customers != "None")
        ]

        if not valid_customers.empty:
            unique_customers = int(
                valid_customers.nunique()
            )

    return SummaryMetrics(
        total_revenue=round(total_revenue, 2),
        total_orders=total_orders,
        total_units=round(total_units, 2),
        average_order_value=average_order_value,
        average_unit_price=average_unit_price,
        unique_customers=unique_customers,
    )