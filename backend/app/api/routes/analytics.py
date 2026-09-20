import traceback
from fastapi import APIRouter, Header, HTTPException, status
from app.schemas.analytics import AnalyticsResponse
from app.services.analytics.loader import (
    verify_supabase_token,
    fetch_dataset_metadata,
    download_dataset_csv,
    AuthenticationError,
    DatasetNotFoundError,
    AccessDeniedError,
    StorageError,
)
from app.services.analytics.cleaner import ValidationError
from app.services.analytics.pipeline import process_csv_content

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/{dataset_id}", response_model=AnalyticsResponse)
async def get_dataset_analytics(
    dataset_id: str,
    authorization: str = Header(..., description="Supabase Session Bearer Token"),
) -> AnalyticsResponse:
    # 1. Extract Bearer token
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header must start with 'Bearer '",
        )
    token = authorization[7:].strip()

    # 2. Authenticate user with Supabase
    try:
        user_info = await verify_supabase_token(token)
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )

    user_id = user_info.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user session.",
        )

    # 3. Verify user ownership of dataset
    try:
        dataset = await fetch_dataset_metadata(dataset_id, token, user_id)
    except DatasetNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except AccessDeniedError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )

    storage_path = dataset.get("storage_path")
    if not storage_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Storage path for dataset is missing.",
        )

    # 4. Download file from private Storage
    try:
        csv_bytes = await download_dataset_csv(storage_path, token)
    except StorageError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Unable to retrieve dataset file: {str(e)}",
        )

    # 5. Process analytics
    try:
        analytics_result = process_csv_content(csv_bytes, dataset_id)
        return analytics_result
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    
    except Exception as e:
        print("\n========== ANALYTICS ERROR ==========")
        print(f"{type(e).__name__}: {str(e)}")
        traceback.print_exc()
        print("=====================================\n")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analytics processing error: {type(e).__name__}: {str(e)}",
        )