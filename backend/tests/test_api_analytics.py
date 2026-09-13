import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from app.main import app
from app.services.analytics.loader import (
    AuthenticationError,
    DatasetNotFoundError,
    AccessDeniedError,
    StorageError,
)
from app.services.analytics.cleaner import ValidationError

client = TestClient(app)


def test_get_analytics_missing_header():
    response = client.get("/api/analytics/dataset-123")
    assert response.status_code == 422


def test_get_analytics_invalid_bearer_prefix():
    response = client.get(
        "/api/analytics/dataset-123",
        headers={"Authorization": "Basic invalidtoken"},
    )
    assert response.status_code == 401
    assert "Authorization header must start with 'Bearer '" in response.json()["detail"]


@patch("app.api.routes.analytics.verify_supabase_token", new_callable=AsyncMock)
def test_get_analytics_unauthenticated_user(mock_verify):
    mock_verify.side_effect = AuthenticationError("Invalid or expired session token.")

    response = client.get(
        "/api/analytics/dataset-123",
        headers={"Authorization": "Bearer expired-token"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid or expired session token."


@patch("app.api.routes.analytics.verify_supabase_token", new_callable=AsyncMock)
@patch("app.api.routes.analytics.fetch_dataset_metadata", new_callable=AsyncMock)
def test_get_analytics_dataset_not_found(mock_fetch, mock_verify):
    mock_verify.return_value = {"id": "user-123", "email": "user@example.com"}
    mock_fetch.side_effect = DatasetNotFoundError("Dataset with ID 'dataset-123' not found.")

    response = client.get(
        "/api/analytics/dataset-123",
        headers={"Authorization": "Bearer valid-token"},
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Dataset with ID 'dataset-123' not found."


@patch("app.api.routes.analytics.verify_supabase_token", new_callable=AsyncMock)
@patch("app.api.routes.analytics.fetch_dataset_metadata", new_callable=AsyncMock)
def test_get_analytics_access_denied(mock_fetch, mock_verify):
    mock_verify.return_value = {"id": "user-123", "email": "user@example.com"}
    mock_fetch.side_effect = AccessDeniedError("You do not have permission to access this dataset.")

    response = client.get(
        "/api/analytics/dataset-123",
        headers={"Authorization": "Bearer valid-token"},
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "You do not have permission to access this dataset."


@patch("app.api.routes.analytics.verify_supabase_token", new_callable=AsyncMock)
@patch("app.api.routes.analytics.fetch_dataset_metadata", new_callable=AsyncMock)
@patch("app.api.routes.analytics.download_dataset_csv", new_callable=AsyncMock)
def test_get_analytics_storage_error(mock_download, mock_fetch, mock_verify):
    mock_verify.return_value = {"id": "user-123", "email": "user@example.com"}
    mock_fetch.return_value = {
        "id": "dataset-123",
        "user_id": "user-123",
        "storage_path": "user-123/dataset-123.csv",
    }
    mock_download.side_effect = StorageError("Failed to retrieve file from storage (404): Object not found")

    response = client.get(
        "/api/analytics/dataset-123",
        headers={"Authorization": "Bearer valid-token"},
    )
    assert response.status_code == 502
    assert "Unable to retrieve dataset file" in response.json()["detail"]


@patch("app.api.routes.analytics.verify_supabase_token", new_callable=AsyncMock)
@patch("app.api.routes.analytics.fetch_dataset_metadata", new_callable=AsyncMock)
@patch("app.api.routes.analytics.download_dataset_csv", new_callable=AsyncMock)
def test_get_analytics_invalid_csv_schema(mock_download, mock_fetch, mock_verify):
    mock_verify.return_value = {"id": "user-123", "email": "user@example.com"}
    mock_fetch.return_value = {
        "id": "dataset-123",
        "user_id": "user-123",
        "storage_path": "user-123/dataset-123.csv",
    }
    # CSV missing required columns like total_amount
    invalid_csv = b"transaction_date,invoice_no\n2024-01-01,INV1\n"
    mock_download.return_value = invalid_csv

    response = client.get(
        "/api/analytics/dataset-123",
        headers={"Authorization": "Bearer valid-token"},
    )
    assert response.status_code == 422
    assert "Dataset cannot be analyzed because the following required columns are missing" in response.json()["detail"]


@patch("app.api.routes.analytics.verify_supabase_token", new_callable=AsyncMock)
@patch("app.api.routes.analytics.fetch_dataset_metadata", new_callable=AsyncMock)
@patch("app.api.routes.analytics.download_dataset_csv", new_callable=AsyncMock)
def test_get_analytics_success(mock_download, mock_fetch, mock_verify):
    mock_verify.return_value = {"id": "user-123", "email": "user@example.com"}
    mock_fetch.return_value = {
        "id": "dataset-123",
        "user_id": "user-123",
        "storage_path": "user-123/dataset-123.csv",
    }
    valid_csv = (
        b"Transaction Date,Invoice No,Quantity,Total Amount,Category\n"
        b"2024-01-01,INV1001,2,150.00,Electronics\n"
        b"2024-01-02,INV1002,1,50.00,Apparel\n"
    )
    mock_download.return_value = valid_csv

    response = client.get(
        "/api/analytics/dataset-123",
        headers={"Authorization": "Bearer valid-token"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["dataset_id"] == "dataset-123"
    assert data["summary"]["total_revenue"] == 200.0
    assert data["summary"]["total_orders"] == 2
    assert data["summary"]["total_units"] == 3.0
    assert len(data["categories"]) == 2
