import pytest
import pandas as pd
from app.services.analytics.currency import detect_currency
from app.services.analytics.pipeline import process_analytics


def test_currency_column_inr():
    df = pd.DataFrame({
        "transaction_date": ["2024-01-01"],
        "invoice_no": ["INV1"],
        "quantity": [1],
        "total_amount": [100.0],
        "currency": ["INR"],
    })
    res = detect_currency(df)
    assert res.code == "INR"
    assert res.symbol == "₹"
    assert res.source == "currency_column"
    assert res.confidence == "high"


def test_currency_column_usd():
    df = pd.DataFrame({
        "transaction_date": ["2024-01-01"],
        "invoice_no": ["INV1"],
        "quantity": [1],
        "total_amount": [100.0],
        "Currency Code": ["USD"],
    })
    res = detect_currency(df)
    assert res.code == "USD"
    assert res.symbol == "$"
    assert res.source == "currency_column"
    assert res.confidence == "high"


def test_currency_symbol_inr():
    df = pd.DataFrame({
        "transaction_date": ["2024-01-01"],
        "invoice_no": ["INV1"],
        "quantity": [1],
        "total_amount": ["₹ 1,500.00"],
    })
    res = detect_currency(df)
    assert res.code == "INR"
    assert res.symbol == "₹"
    assert res.source == "currency_symbol"
    assert res.confidence == "high"


def test_currency_symbol_usd():
    df = pd.DataFrame({
        "transaction_date": ["2024-01-01"],
        "invoice_no": ["INV1"],
        "quantity": [1],
        "total_amount": ["$250.50"],
    })
    res = detect_currency(df)
    assert res.code == "USD"
    assert res.symbol == "$"
    assert res.source == "currency_symbol"
    assert res.confidence == "high"


def test_currency_unknown_plain_numerics():
    df = pd.DataFrame({
        "transaction_date": ["2024-01-01"],
        "invoice_no": ["INV1"],
        "quantity": [1],
        "total_amount": [100.0],
        "country": ["United States"],
        "store_location": ["New York"],
    })
    res = detect_currency(df)
    assert res.code == "UNKNOWN"
    assert res.symbol == ""
    assert res.source == "unknown"
    assert res.confidence == "low"


def test_currency_conflicting_column_values():
    df = pd.DataFrame({
        "transaction_date": ["2024-01-01", "2024-01-02"],
        "invoice_no": ["INV1", "INV2"],
        "quantity": [1, 2],
        "total_amount": [100.0, 200.0],
        "currency": ["USD", "EUR"],
    })
    res = detect_currency(df)
    assert res.code == "UNKNOWN"
    assert res.symbol == ""
    assert "conflicting" in res.source
    assert res.confidence == "low"


def test_currency_conflicting_symbols():
    df = pd.DataFrame({
        "transaction_date": ["2024-01-01", "2024-01-02"],
        "invoice_no": ["INV1", "INV2"],
        "quantity": [1, 2],
        "total_amount": ["$100.00", "€200.00"],
    })
    res = detect_currency(df)
    assert res.code == "UNKNOWN"
    assert res.symbol == ""
    assert "conflicting" in res.source
    assert res.confidence == "low"


def test_currency_conflicting_column_and_symbol_evidence():
    df = pd.DataFrame({
        "transaction_date": ["2024-01-01"],
        "invoice_no": ["INV1"],
        "quantity": [1],
        "total_amount": ["$100.00"],
        "currency": ["INR"],
    })
    res = detect_currency(df)
    assert res.code == "UNKNOWN"
    assert res.symbol == ""
    assert "conflicting" in res.source
    assert res.confidence == "low"


def test_pipeline_currency_integration():
    df = pd.DataFrame({
        "transaction_date": ["2024-01-01"],
        "invoice_no": ["INV1"],
        "quantity": [1],
        "total_amount": ["₹ 500.00"],
    })
    resp = process_analytics(df, "dataset-test-123")
    assert resp.currency.code == "INR"
    assert resp.currency.symbol == "₹"
    assert resp.currency.source == "currency_symbol"
    assert resp.summary.total_revenue == 500.0
