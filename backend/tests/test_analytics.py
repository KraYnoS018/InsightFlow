import pytest
import pandas as pd
from app.services.analytics.cleaner import (
    normalize_columns,
    validate_schema,
    clean_data,
    ValidationError,
)
from app.services.analytics.metrics import calculate_summary_metrics
from app.services.analytics.trends import calculate_time_series_and_growth
from app.services.analytics.rankings import (
    calculate_top_products,
    calculate_category_metrics,
    calculate_location_metrics,
    calculate_country_metrics,
    calculate_customer_metrics,
)
from app.services.analytics.anomalies import detect_revenue_anomalies
from app.schemas.analytics import TimeSeriesPoint
from app.services.analytics.pipeline import process_analytics


def test_1_revenue_calculation():
    # invoice_no, total_amount, quantity
    df = pd.DataFrame({
        "invoice_no": ["INV1", "INV2", "INV3"],
        "total_amount": [100.50, 200.25, 49.25],
        "quantity": [2, 4, 1],
    })
    metrics = calculate_summary_metrics(df)
    assert metrics.total_revenue == 350.0


def test_2_order_calculation():
    # Multiple rows with same invoice_no represent line items in the same order
    df = pd.DataFrame({
        "invoice_no": ["INV1", "INV1", "INV2", "INV3"],
        "total_amount": [50.0, 50.0, 200.0, 100.0],
        "quantity": [1, 1, 2, 1],
    })
    metrics = calculate_summary_metrics(df)
    assert metrics.total_orders == 3


def test_3_unit_calculation():
    df = pd.DataFrame({
        "invoice_no": ["INV1", "INV2"],
        "total_amount": [100.0, 200.0],
        "quantity": [5, 15],
    })
    metrics = calculate_summary_metrics(df)
    assert metrics.total_units == 20.0


def test_4_average_order_value():
    df = pd.DataFrame({
        "invoice_no": ["INV1", "INV2"],
        "total_amount": [100.0, 200.0],
        "quantity": [1, 2],
    })
    metrics = calculate_summary_metrics(df)
    # total_revenue = 300, total_orders = 2, AOV = 150.0
    assert metrics.average_order_value == 150.0


def test_5_monthly_aggregation():
    df = pd.DataFrame({
        "transaction_date": ["2023-01-15", "2023-01-20", "2023-02-10"],
        "invoice_no": ["INV1", "INV2", "INV3"],
        "total_amount": [100.0, 150.0, 200.0],
        "quantity": [2, 3, 4],
    })
    time_series, _ = calculate_time_series_and_growth(df)
    assert len(time_series) == 2
    assert time_series[0].period == "2023-01"
    assert time_series[0].revenue == 250.0
    assert time_series[0].orders == 2
    assert time_series[0].units == 5.0
    assert time_series[1].period == "2023-02"
    assert time_series[1].revenue == 200.0


def test_6_category_ranking():
    df = pd.DataFrame({
        "category": ["Electronics", "Clothing", "Electronics"],
        "invoice_no": ["INV1", "INV2", "INV3"],
        "total_amount": [500.0, 150.0, 300.0],
        "quantity": [2, 1, 1],
    })
    categories = calculate_category_metrics(df)
    assert len(categories) == 2
    assert categories[0].category == "Electronics"
    assert categories[0].revenue == 800.0
    assert categories[0].revenue_share == 84.21  # 800 / 950 * 100
    assert categories[1].category == "Clothing"
    assert categories[1].revenue == 150.0


def test_7_location_ranking():
    df = pd.DataFrame({
        "store_location": ["North", "South", "North"],
        "invoice_no": ["INV1", "INV2", "INV3"],
        "total_amount": [100.0, 300.0, 200.0],
        "quantity": [1, 3, 2],
    })
    locations = calculate_location_metrics(df)
    assert len(locations) == 2
    # Both locations have 300.0
    assert {loc.store_location for loc in locations} == {"North", "South"}


def test_8_duplicate_handling():
    # Exact duplicate rows should be removed, while distinct lines kept
    df = pd.DataFrame({
        "invoice_no": ["INV1", "INV1", "INV2"],
        "total_amount": [100.0, 100.0, 50.0],
        "quantity": [1, 1, 1],
    })
    cleaned, quality = clean_data(df)
    assert quality.duplicate_rows_removed == 1
    assert len(cleaned) == 2


def test_9_invalid_numeric_values():
    # String currencies and malformed values
    df = pd.DataFrame({
        "invoice_no": ["INV1", "INV2", "INV3"],
        "total_amount": ["$100.00", "200,50", "corrupt_data"],
        "quantity": ["2", "4", "invalid"],
    })
    cleaned, quality = clean_data(df)
    # The corrupt row should have invalid_numeric tracked and be removed
    assert quality.invalid_numeric_rows > 0
    assert len(cleaned) == 2
    assert cleaned["total_amount"].iloc[0] == 100.0


def test_10_invalid_dates():
    df = pd.DataFrame({
        "transaction_date": ["2023-01-01", "not_a_date", "2023-02-01"],
        "invoice_no": ["INV1", "INV2", "INV3"],
        "total_amount": [100.0, 200.0, 300.0],
        "quantity": [1, 2, 3],
    })
    cleaned, quality = clean_data(df)
    assert quality.invalid_date_rows == 1


def test_11_missing_required_columns():
    # DataFrame missing total_amount
    df = pd.DataFrame({
        "invoice_no": ["INV1", "INV2"],
        "quantity": [1, 2],
    })
    with pytest.raises(ValidationError) as exc_info:
        validate_schema(df)
    assert "total_amount" in str(exc_info.value)


def test_12_negative_values():
    # Negative quantity/revenue representing refunds should be preserved, not silently dropped
    df = pd.DataFrame({
        "invoice_no": ["INV1", "INV2"],
        "total_amount": [200.0, -50.0],
        "quantity": [2, -1],
    })
    cleaned, quality = clean_data(df)
    assert len(cleaned) == 2
    assert quality.negative_quantity_rows == 1
    assert quality.negative_revenue_rows == 1
    metrics = calculate_summary_metrics(cleaned)
    assert metrics.total_revenue == 150.0


def test_13_zero_orders():
    df = pd.DataFrame({
        "invoice_no": [],
        "total_amount": [],
        "quantity": [],
    })
    metrics = calculate_summary_metrics(df)
    assert metrics.total_orders == 0
    assert metrics.average_order_value is None


def test_14_insufficient_historical_data():
    # Only 1 month of data -> growth should be None
    df = pd.DataFrame({
        "transaction_date": ["2023-01-05", "2023-01-20"],
        "invoice_no": ["INV1", "INV2"],
        "total_amount": [100.0, 150.0],
        "quantity": [1, 2],
    })
    time_series, growth = calculate_time_series_and_growth(df)
    assert len(time_series) == 1
    assert growth.revenue is None
    assert growth.orders is None


def test_15_anomaly_detection():
    # Construct 6 months where one month has an extreme revenue surge
    points = [
        TimeSeriesPoint(period="2023-01", revenue=100.0, orders=10, units=20.0),
        TimeSeriesPoint(period="2023-02", revenue=105.0, orders=11, units=21.0),
        TimeSeriesPoint(period="2023-03", revenue=98.0, orders=10, units=19.0),
        TimeSeriesPoint(period="2023-04", revenue=102.0, orders=10, units=20.0),
        TimeSeriesPoint(period="2023-05", revenue=99.0, orders=10, units=20.0),
        TimeSeriesPoint(period="2023-06", revenue=1000.0, orders=80, units=200.0),  # Anomaly!
    ]
    anomalies = detect_revenue_anomalies(points)
    assert len(anomalies) == 1
    assert anomalies[0].period == "2023-06"
    assert anomalies[0].metric == "revenue"
    assert "unusually high" in anomalies[0].reason


def test_full_pipeline_processing():
    df = pd.DataFrame({
        "Transaction Date": ["2023-01-01", "2023-02-01"],
        "Invoice No": ["1001", "1002"],
        "Stock Code": ["SKU1", "SKU2"],
        "Description": ["Widget A", "Widget B"],
        "Quantity": ["2", "5"],
        "Unit Price": ["50", "20"],
        "Total Amount": ["100", "100"],
        "Category": ["Gadgets", "Gadgets"],
        "Store Location": ["Downtown", "Uptown"],
    })
    res = process_analytics(df, "test-dataset-id")
    assert res.dataset_id == "test-dataset-id"
    assert res.summary.total_revenue == 200.0
    assert res.summary.total_orders == 2
    assert res.summary.total_units == 7.0
    assert len(res.categories) == 1
    assert res.categories[0].category == "Gadgets"
    assert len(res.locations) == 2


def test_average_unit_price_calculation():
    df_with_price = pd.DataFrame({
        "invoice_no": ["INV1", "INV2"],
        "total_amount": [100.0, 200.0],
        "quantity": [2, 4],
        "unit_price": [50.0, 50.0],
    })
    metrics = calculate_summary_metrics(df_with_price)
    assert metrics.average_unit_price == 50.0

    df_without_price = pd.DataFrame({
        "invoice_no": ["INV1"],
        "total_amount": [100.0],
        "quantity": [2],
    })
    metrics_no_price = calculate_summary_metrics(df_without_price)
    assert metrics_no_price.average_unit_price is None


def test_country_metrics_when_present_and_absent():
    df = pd.DataFrame({
        "country": ["USA", "USA", "UK"],
        "invoice_no": ["INV1", "INV2", "INV3"],
        "total_amount": [100.0, 200.0, 150.0],
        "quantity": [1, 2, 1],
    })
    countries = calculate_country_metrics(df)
    assert len(countries) == 2
    assert countries[0].country == "USA"
    assert countries[0].revenue == 300.0

    df_no_country = pd.DataFrame({"invoice_no": ["INV1"], "total_amount": [100.0], "quantity": [1]})
    assert calculate_country_metrics(df_no_country) == []


def test_customer_metrics_when_present_and_absent():
    df = pd.DataFrame({
        "customer_id": ["C101", "C101", "C102"],
        "invoice_no": ["INV1", "INV2", "INV3"],
        "total_amount": [100.0, 200.0, 50.0],
        "quantity": [1, 2, 1],
    })
    metrics = calculate_summary_metrics(df)
    assert metrics.unique_customers == 2

    customers = calculate_customer_metrics(df)
    assert len(customers) == 2
    assert customers[0].customer_id == "C101"
    assert customers[0].revenue == 300.0
    assert customers[0].orders == 2

    df_no_customer = pd.DataFrame({"invoice_no": ["INV1"], "total_amount": [100.0], "quantity": [1]})
    assert calculate_summary_metrics(df_no_customer).unique_customers is None
    assert calculate_customer_metrics(df_no_customer) == []
