from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base
from app.db.seed import seed_database
import app.models  # Ensure all SQLAlchemy models are registered

# Import routers
from app.api.auth import router as auth_router
from app.api.modules import router as modules_router
from app.api.assessments import router as assessments_router
from app.api.alerts import router as alerts_router
from app.api.reviews import router as reviews_router
from app.api.follow_ups import router as follow_ups_router
from app.api.models import router as models_router
from app.api.audit_logs import router as audit_logs_router
from app.api.stats import router as stats_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    # Seed default data if empty
    seed_database()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Explainable AI-Powered Multi-Domain Early Warning and Risk Assessment Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins if settings.cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth_router, prefix="/api")
app.include_router(modules_router, prefix="/api")
app.include_router(assessments_router, prefix="/api")
app.include_router(alerts_router, prefix="/api")
app.include_router(reviews_router, prefix="/api")
app.include_router(follow_ups_router, prefix="/api")
app.include_router(models_router, prefix="/api")
app.include_router(audit_logs_router, prefix="/api")
app.include_router(stats_router, prefix="/api")


@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "database": "connected"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
