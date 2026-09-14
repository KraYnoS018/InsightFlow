import re
import pandas as pd
from typing import Optional, Set, Tuple
from app.schemas.analytics import CurrencyMetadata

# Standard ISO currencies supported
ISO_CURRENCIES = {
    "INR": ("INR", "₹"),
    "USD": ("USD", "$"),
    "EUR": ("EUR", "€"),
    "GBP": ("GBP", "£"),
}

# Aliases and symbols mapping to ISO currency codes
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


def detect_currency_from_column(df: pd.DataFrame) -> Tuple[Optional[Tuple[str, str]], bool]:
    """
    Inspects explicit currency columns in the DataFrame.
    Returns (candidate_tuple, is_conflict).
    """
    target_cols = []
    for col in df.columns:
        col_clean = re.sub(r"[^\w\s]", "", str(col).strip().lower()).replace("_", " ")
        col_clean = re.sub(r"\s+", " ", col_clean)
        if col_clean in ("currency", "currency code", "currencycode"):
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
        return None, True  # Multiple conflicting currencies in currency column
    elif len(detected) == 1:
        return list(detected)[0], False

    return None, False


def detect_currency_from_symbols(df: pd.DataFrame) -> Tuple[Optional[Tuple[str, str]], bool]:
    """
    Scans raw monetary columns for currency symbols.
    Returns (candidate_tuple, is_conflict).
    """
    monetary_cols = []
    for col in df.columns:
        col_clean = str(col).strip().lower().replace("-", "_").replace(" ", "_")
        col_clean = re.sub(r"[^\w_]", "", col_clean)
        if any(kw in col_clean for kw in ["total_amount", "amount", "unit_price", "price", "sales", "revenue", "line_total"]):
            monetary_cols.append(col)

    if not monetary_cols:
        return None, False

    detected: Set[Tuple[str, str]] = set()

    for col in monetary_cols:
        series = df[col].dropna()
        if pd.api.types.is_numeric_dtype(series):
            continue  # Numeric series contains no string symbols

        str_vals = series.astype(str)
        for val in str_vals:
            if "₹" in val or re.search(r"\bRs\.?\b", val, re.IGNORECASE):
                detected.add(ISO_CURRENCIES["INR"])
            if "$" in val:
                detected.add(ISO_CURRENCIES["USD"])
            if "€" in val:
                detected.add(ISO_CURRENCIES["EUR"])
            if "£" in val:
                detected.add(ISO_CURRENCIES["GBP"])

    if len(detected) > 1:
        return None, True  # Multiple conflicting currency symbols found
    elif len(detected) == 1:
        return list(detected)[0], False

    return None, False


def detect_currency(df: pd.DataFrame) -> CurrencyMetadata:
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

    if col_currency and sym_currency and col_currency != sym_currency:
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

    return CurrencyMetadata(
        code="UNKNOWN",
        symbol="",
        source="unknown",
        confidence="low",
    )
