import re
import pandas as pd
from typing import Optional, Set, Tuple
from app.schemas.analytics import CurrencyMetadata

ISO_CURRENCIES = {
    "INR": ("INR", "₹"),
    "USD": ("USD", "$"),
    "EUR": ("EUR", "€"),
    "GBP": ("GBP", "£"),
    "CAD": ("CAD", "C$"),
}

SYMBOL_OR_NAME_TO_ISO = {
    "inr": "INR",
    "₹": "INR",
    "rs": "INR",
    "rs.": "INR",
    "rupees": "INR",
    "rupee": "INR",
    "usd": "USD",
    "$": "USD",
    "dollars": "USD",
    "dollar": "USD",
    "eur": "EUR",
    "€": "EUR",
    "euros": "EUR",
    "euro": "EUR",
    "gbp": "GBP",
    "£": "GBP",
    "pounds": "GBP",
    "pound": "GBP",
}

# Used only as a fallback when no explicit currency evidence exists.
COUNTRY_TO_ISO = {
    "india": "INR",
    "in": "INR",

    "united states": "USD",
    "united states of america": "USD",
    "usa": "USD",
    "us": "USD",

    "united kingdom": "GBP",
    "uk": "GBP",
    "gb": "GBP",
    "great britain": "GBP",

    "germany": "EUR",
    "france": "EUR",
    "italy": "EUR",
    "spain": "EUR",
    "portugal": "EUR",
    "ireland": "EUR",
    "netherlands": "EUR",
    "belgium": "EUR",
    "austria": "EUR",
    "finland": "EUR",
    "greece": "EUR",
    "luxembourg": "EUR",
    "slovakia": "EUR",
    "slovenia": "EUR",
    "estonia": "EUR",
    "latvia": "EUR",
    "lithuania": "EUR",
    "cyprus": "EUR",
    "malta": "EUR",
    "croatia": "EUR",
    "canada":  "C$",
    "CAD" : "C$",
}


def parse_currency_str(val: str) -> Optional[Tuple[str, str]]:
    if val is None:
        return None

    s = str(val).strip().lower()

    if not s or s in ("unknown", "nan", "none", "null"):
        return None

    if s in SYMBOL_OR_NAME_TO_ISO:
        iso_code = SYMBOL_OR_NAME_TO_ISO[s]
        return ISO_CURRENCIES[iso_code]

    upper = str(val).strip().upper()

    if upper in ISO_CURRENCIES:
        return ISO_CURRENCIES[upper]

    return None


def detect_currency_from_column(
    df: pd.DataFrame,
) -> Tuple[Optional[Tuple[str, str]], bool]:

    target_cols = []

    for col in df.columns:
        col_clean = re.sub(
            r"[^\w\s]", "",
            str(col).strip().lower()
        ).replace("_", " ")

        col_clean = re.sub(r"\s+", " ", col_clean)

        if col_clean in (
            "currency",
            "currency code",
            "currencycode",
        ):
            target_cols.append(col)

    if not target_cols:
        return None, False

    detected: Set[Tuple[str, str]] = set()

    for col in target_cols:
        series = df[col].dropna().astype(str)

        for raw_val in series:
            parsed = parse_currency_str(raw_val)

            if parsed:
                detected.add(parsed)

    if len(detected) > 1:
        return None, True

    if len(detected) == 1:
        return list(detected)[0], False

    return None, False


def detect_currency_from_symbols(
    df: pd.DataFrame,
) -> Tuple[Optional[Tuple[str, str]], bool]:

    monetary_cols = []

    for col in df.columns:
        col_clean = (
            str(col)
            .strip()
            .lower()
            .replace("-", "_")
            .replace(" ", "_")
        )

        col_clean = re.sub(r"[^\w_]", "", col_clean)

        if any(
            kw in col_clean
            for kw in [
                "total_amount",
                "amount",
                "unit_price",
                "price",
                "sales",
                "revenue",
                "line_total",
            ]
        ):
            monetary_cols.append(col)

    if not monetary_cols:
        return None, False

    detected: Set[Tuple[str, str]] = set()

    for col in monetary_cols:
        series = df[col].dropna()

        if pd.api.types.is_numeric_dtype(series):
            continue

        for val in series.astype(str):

            if "₹" in val or re.search(
                r"\bRs\.?\b",
                val,
                re.IGNORECASE,
            ):
                detected.add(ISO_CURRENCIES["INR"])

            if "$" in val:
                detected.add(ISO_CURRENCIES["USD"])

            if "€" in val:
                detected.add(ISO_CURRENCIES["EUR"])

            if "£" in val:
                detected.add(ISO_CURRENCIES["GBP"])

    if len(detected) > 1:
        return None, True

    if len(detected) == 1:
        return list(detected)[0], False

    return None, False

def detect_currency_from_country(df: pd.DataFrame):
    country_cols = []

    for col in df.columns:
        col_clean = re.sub(
            r"[^\w\s]",
            "",
            str(col).strip().lower(),
        ).replace("_", " ")

        col_clean = re.sub(r"\s+", " ", col_clean).strip()

        if col_clean in (
            "country",
            "country name",
            "countryname",
            "country region",
            "countryregion",
        ):
            country_cols.append(col)

    if not country_cols:
        return None

    country_col = country_cols[0]

    country_series = (
        df[country_col]
        .dropna()
        .astype(str)
        .str.strip()
        .str.lower()
    )

    if country_series.empty:
        return None

    # Count rows by inferred currency
    currency_counts = {}

    for country, count in country_series.value_counts().items():
        iso_code = COUNTRY_TO_ISO.get(country)

        if iso_code:
            currency_counts[iso_code] = (
                currency_counts.get(iso_code, 0) + int(count)
            )

    if not currency_counts:
        return None

    total_mapped_rows = sum(currency_counts.values())

    # If one currency clearly dominates the dataset,
    # use it as a low-confidence country inference.
    dominant_currency, dominant_count = max(
        currency_counts.items(),
        key=lambda item: item[1],
    )

    dominance = dominant_count / total_mapped_rows

    if dominance < 0.95:
        return None

    return ISO_CURRENCIES[dominant_currency]


def detect_currency(df: pd.DataFrame) -> CurrencyMetadata:

    # Priority:
    # 1. Explicit currency column
    # 2. Explicit currency symbol
    # 3. Country inference
    # 4. UNKNOWN

    col_currency, col_conflict = detect_currency_from_column(df)

    sym_currency, sym_conflict = detect_currency_from_symbols(df)

    if col_conflict:
        return CurrencyMetadata(
            code="UNKNOWN",
            symbol="",
            source="conflicting_currency_column",
            confidence="low",
        )

    if sym_conflict:
        return CurrencyMetadata(
            code="UNKNOWN",
            symbol="",
            source="conflicting_currency_symbols",
            confidence="low",
        )

    if col_currency and sym_currency:
        if col_currency != sym_currency:
            return CurrencyMetadata(
                code="UNKNOWN",
                symbol="",
                source="conflicting_currency_evidence",
                confidence="low",
            )

    if col_currency:
        return CurrencyMetadata(
            code=col_currency[0],
            symbol=col_currency[1],
            source="currency_column",
            confidence="high",
        )

    if sym_currency:
        return CurrencyMetadata(
            code=sym_currency[0],
            symbol=sym_currency[1],
            source="currency_symbol",
            confidence="high",
        )

    country_currency = detect_currency_from_country(df)

    if country_currency:
        return CurrencyMetadata(
            code=country_currency[0],
            symbol=country_currency[1],
            source="country_inference",
            confidence="medium",
        )

    return CurrencyMetadata(
        code="UNKNOWN",
        symbol="",
        source="unknown",
        confidence="low",
    )