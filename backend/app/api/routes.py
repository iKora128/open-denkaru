"""
API route definitions.
"""
from fastapi import APIRouter
from app.api.endpoints import patients, health, prescriptions, lab_orders, ai_assistant, auth, medical_records

# Create main API router
api_router = APIRouter()

# Include route modules
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(patients.router, prefix="/patients", tags=["patients"])
api_router.include_router(prescriptions.router, prefix="/prescriptions", tags=["prescriptions"])
api_router.include_router(lab_orders.router, prefix="/lab-orders", tags=["lab_orders"])
api_router.include_router(medical_records.router, prefix="/medical-records", tags=["medical_records"])
api_router.include_router(ai_assistant.router, prefix="/ai", tags=["ai_assistant"])