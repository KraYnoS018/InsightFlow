import io
import pandas as pd
from app.schemas.analytics import AnalyticsResponse
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


def process_analytics(df: pd.DataFrame, dataset_id: str) -> AnalyticsResponse:
    # 1. Normalize column names
    normalized_df = normalize_columns(df)

    # 2. Validate essential schema
    validate_schema(normalized_df)

    # 3. Clean data & collect quality stats
    cleaned_df, quality_metrics = clean_data(normalized_df)

    # 4. Summary metrics
    summary = calculate_summary_metrics(cleaned_df)

    # 5. Time series & growth
    time_series, growth = calculate_time_series_and_growth(cleaned_df)

    # 6. Rankings
    top_products = calculate_top_products(cleaned_df)
    categories = calculate_category_metrics(cleaned_df)
    locations = calculate_location_metrics(cleaned_df)
    countries = calculate_country_metrics(cleaned_df)
    customers = calculate_customer_metrics(cleaned_df)

    # 7. Anomalies
    anomalies = detect_revenue_anomalies(time_series)

    # 8. Return structured result
    return AnalyticsResponse(
        dataset_id=dataset_id,
        summary=summary,
        growth=growth,
        time_series=time_series,
        top_products=top_products,
        categories=categories,
        locations=locations,
        countries=countries,
        customers=customers,
        anomalies=anomalies,
        data_quality=quality_metrics,
    )


SUPPORTED_ENCODINGS = ["utf-8-sig", "utf-8", "cp1252", "latin1"]


def process_csv_content(csv_bytes: bytes, dataset_id: str) -> AnalyticsResponse:
    df = None
    for enc in SUPPORTED_ENCODINGS:
        try:
            df = pd.read_csv(io.BytesIO(csv_bytes), encoding=enc, low_memory=False)
            break
        except (UnicodeDecodeError, UnicodeError, LookupError):
            continue

    if df is None:
        raise ValidationError("Dataset CSV could not be decoded with any supported encoding.")

    return process_analytics(df, dataset_id)
