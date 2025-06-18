"""
Health check endpoints.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import structlog

from app.core.database import get_session
from app.core.config import settings

router = APIRouter()
logger = structlog.get_logger()


@router.get("/")
async def health_check():
    """Basic health check."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


@router.get("/detailed")
async def detailed_health_check(session: AsyncSession = Depends(get_session)):
    """Detailed health check with database connectivity."""
    health_data = {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "components": {
            "database": "unknown",
            "cache": "unknown",
        }
    }
    
    # Check database
    try:
        result = await session.execute(text("SELECT 1"))
        health_data["components"]["database"] = "healthy"
    except Exception as e:
        logger.error("Database health check failed", error=str(e))
        health_data["components"]["database"] = "unhealthy"
        health_data["status"] = "unhealthy"
    
    # TODO: Add Redis health check when implemented
    health_data["components"]["cache"] = "not_implemented"
    
    return health_data