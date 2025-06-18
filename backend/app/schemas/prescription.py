"""
Prescription schemas for API requests and responses.
"""
from datetime import date, datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from ..models.prescription import (
    DosageUnit, DosageFrequency, PrescriptionStatus,
    MedicationCreate, MedicationResponse,
    PrescriptionItemCreate, PrescriptionItemResponse,
    PrescriptionCreate, PrescriptionResponse, PrescriptionUpdate
)


class PrescriptionListResponse(BaseModel):
    """Response schema for prescription list."""
    prescriptions: List[PrescriptionResponse]
    total: int
    page: int
    size: int
    pages: int


class PrescriptionSearchParams(BaseModel):
    """Search parameters for prescriptions."""
    patient_id: Optional[UUID] = None
    status: Optional[PrescriptionStatus] = None
    prescribed_by: Optional[str] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    pharmacy_name: Optional[str] = None
    
    
class MedicationSearchParams(BaseModel):
    """Search parameters for medications."""
    name: Optional[str] = None
    generic_name: Optional[str] = None
    code: Optional[str] = None
    manufacturer: Optional[str] = None


class PrescriptionFormOutput(BaseModel):
    """Prescription form for printing/export."""
    
    # Patient Information
    patient_name: str
    patient_number: str
    patient_birth_date: date
    patient_age: int
    patient_gender: str
    patient_address: str
    patient_phone: Optional[str] = None
    
    # Insurance Information
    insurance_type: Optional[str] = None
    insurance_number: Optional[str] = None
    
    # Prescription Information
    prescription_id: int
    prescribed_date: date
    valid_until: date
    prescribed_by: str
    clinic_name: Optional[str] = "医療法人オープン電カル"
    clinic_address: Optional[str] = None
    clinic_phone: Optional[str] = None
    
    # Medical Information
    diagnosis: Optional[str] = None
    clinical_info: Optional[str] = None
    
    # Medications
    medications: List[dict] = Field(..., description="List of medications with dosage info")
    
    # Additional Information
    notes: Optional[str] = None
    pharmacy_name: Optional[str] = None
    
    # Generated Information
    total_medications: int
    generated_at: datetime = Field(default_factory=datetime.now)


class DrugInteractionCheck(BaseModel):
    """Drug interaction check result."""
    medication_a: str
    medication_b: str
    interaction_level: str  # "minor", "moderate", "major", "contraindicated"
    description: str
    recommendation: Optional[str] = None


class PrescriptionValidation(BaseModel):
    """Prescription validation result."""
    prescription_id: int
    is_valid: bool
    errors: List[str] = []
    warnings: List[str] = []
    drug_interactions: List[DrugInteractionCheck] = []
    
    
class PrescriptionStats(BaseModel):
    """Prescription statistics."""
    total_prescriptions: int
    active_prescriptions: int
    completed_prescriptions: int
    cancelled_prescriptions: int
    expired_prescriptions: int
    most_prescribed_medications: List[dict]
    prescriptions_by_month: List[dict]