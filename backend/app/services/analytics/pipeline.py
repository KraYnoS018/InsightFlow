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

from app.services.analytics.currency import detect_currency


SUPPORTED_ENCODINGS = [
    "utf-8-sig",
    "utf-8",
    "cp1252",
    "latin1",
]


def process_analytics(
    df: pd.DataFrame,
    dataset_id: str,
) -> AnalyticsResponse:

    # 0. Detect currency before cleaning converts raw string symbols into floats
    currency = detect_currency(df)

    # 1. Normalize column names
    normalized_df = normalize_columns(df)

    # 2. Validate essential schema
    validate_schema(normalized_df)

    # 3. Clean data & collect quality stats
    cleaned_df, quality_metrics = clean_data(normalized_df)

    # 4. Summary metrics
    summary = calculate_summary_metrics(cleaned_df)

    # 5. Time series & growth
    time_series, growth = calculate_time_series_and_growth(
        cleaned_df
    )

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
        currency=currency,
    )


def _looks_like_header(row: pd.Series) -> bool:
    """
    Check whether a CSV row looks like a real data header.

    We only use this when the first CSV read does not contain
    recognizable InsightFlow fields.
    """

    normalized_values = {
        str(value).strip().lower().replace("_", " ")
        for value in row.tolist()
        if pd.notna(value)
    }

    header_keywords = {
        "date",
        "order date",
        "transaction date",
        "sale date",
        "order id",
        "order no",
        "invoice no",
        "product",
        "product name",
        "quantity",
        "order quantity",
        "sales",
        "sales amount",
        "total",
        "total price",
        "total usd",
        "revenue",
        "price",
        "unit price",
        "customer",
        "customer name",
        "category",
        "region",
        "country",
    }

    matches = normalized_values.intersection(header_keywords)

    return len(matches) >= 2


def _read_csv_with_header_detection(
    csv_bytes: bytes,
    encoding: str,
) -> pd.DataFrame:

    # First: normal CSV behavior.
    df = pd.read_csv(
        io.BytesIO(csv_bytes),
        encoding=encoding,
        low_memory=False,
    )

    # Normalize the first-read column names temporarily.
    normalized_columns = {
        str(column).strip().lower().replace("_", " ")
        for column in df.columns
    }

    # If the first row already looks like a useful header,
    # return it unchanged.
    known_header_terms = {
        "date",
        "order date",
        "transaction date",
        "sale date",
        "order id",
        "order no",
        "invoice no",
        "product",
        "quantity",
        "order quantity",
        "sales",
        "sales amount",
        "total",
        "total price",
        "total usd",
        "revenue",
        "price",
        "unit price",
        "customer",
        "customer name",
        "category",
        "region",
        "country",
    }

    if len(normalized_columns.intersection(known_header_terms)) >= 2:
        return df

    # First row was not a useful header.
    # Read a small sample without assigning a header.
    preview = pd.read_csv(
        io.BytesIO(csv_bytes),
        encoding=encoding,
        header=None,
        nrows=15,
        low_memory=False,
    )

    # Look through the first 15 rows for a real header.
    for row_index in range(len(preview)):
        if _looks_like_header(preview.iloc[row_index]):
            detected_header = row_index

            return pd.read_csv(
                io.BytesIO(csv_bytes),
                encoding=encoding,
                skiprows=detected_header,
                low_memory=False,
            )

    # Nothing recognizable was found.
    # Return the original dataframe so normal validation
    # produces the appropriate missing-column error.
    return df


def process_csv_content(
    csv_bytes: bytes,
    dataset_id: str,
) -> AnalyticsResponse:

    last_error = None

    for encoding in SUPPORTED_ENCODINGS:
        try:
            df = _read_csv_with_header_detection(
                csv_bytes,
                encoding,
            )

            return process_analytics(
                df,
                dataset_id,
            )

        except (
            UnicodeDecodeError,
            UnicodeError,
            LookupError,
        ) as error:
            last_error = error
            continue

    if last_error is not None:
        raise ValidationError(
            "Dataset CSV could not be decoded with any supported encoding."
        )

    raise ValidationError(
        "Dataset CSV could not be processed."
    )