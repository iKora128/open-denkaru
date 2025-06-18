"""
API route definitions.
"""
from fastapi import APIRouter
from app.api.endpoints import patients, health

# Create main API router
api_router = APIRouter()

# Include route modules
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(patients.router, prefix="/patients", tags=["patients"])