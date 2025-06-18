"""
Patient schemas - using SQLModel for unified approach.
Re-export from models for compatibility.
"""
from app.models.patient import (
    PatientBase,
    PatientCreate,
    PatientUpdate,
    PatientResponse,
    GenderEnum,
    BloodTypeEnum,
)

__all__ = [
    "PatientBase",
    "PatientCreate", 
    "PatientUpdate",
    "PatientResponse",
    "GenderEnum",
    "BloodTypeEnum",
]