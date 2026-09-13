from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes.analytics import router as analytics_router

app = FastAPI(
    title="InsightFlow Analytics Engine",
    version="1.0.0",
    description="Deterministic retail sales analytics engine for InsightFlow",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analytics_router)


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "InsightFlow Analytics Engine",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
