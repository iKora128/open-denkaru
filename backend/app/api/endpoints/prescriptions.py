"""
Prescription API endpoints.
"""
from datetime import date, datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from ...core.database import get_session
from ...models.prescription import (
    Prescription, PrescriptionItem, Medication,
    PrescriptionCreate, PrescriptionResponse, PrescriptionUpdate,
    MedicationCreate, MedicationResponse,
    PrescriptionStatus
)
from ...models.patient import Patient
from ...schemas.prescription import (
    PrescriptionListResponse, PrescriptionSearchParams,
    MedicationSearchParams, PrescriptionFormOutput,
    PrescriptionValidation, DrugInteractionCheck,
    PrescriptionStats
)

router = APIRouter()


@router.post("/", response_model=PrescriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_prescription(
    prescription_data: PrescriptionCreate,
    session: AsyncSession = Depends(get_session)
):
    """Create a new prescription."""
    
    # Verify patient exists
    patient_query = select(Patient).where(Patient.id == prescription_data.patient_id)
    patient_result = await session.exec(patient_query)
    patient = patient_result.first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Create prescription
    prescription = Prescription.model_validate(prescription_data.model_dump(exclude={"items"}))
    session.add(prescription)
    await session.commit()
    await session.refresh(prescription)
    
    # Create prescription items
    for item_data in prescription_data.items:
        # Verify medication exists
        med_query = select(Medication).where(Medication.id == item_data.medication_id)
        med_result = await session.exec(med_query)
        medication = med_result.first()
        
        if not medication:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Medication with ID {item_data.medication_id} not found"
            )
        
        item = PrescriptionItem(
            prescription_id=prescription.id,
            **item_data.model_dump()
        )
        session.add(item)
    
    await session.commit()
    
    # Reload with relationships
    prescription_query = select(Prescription).options(
        selectinload(Prescription.items).selectinload(PrescriptionItem.medication)
    ).where(Prescription.id == prescription.id)
    result = await session.exec(prescription_query)
    prescription = result.first()
    
    return prescription


@router.get("/", response_model=PrescriptionListResponse)
async def get_prescriptions(
    patient_id: Optional[UUID] = Query(None),
    status: Optional[PrescriptionStatus] = Query(None),
    prescribed_by: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    session: AsyncSession = Depends(get_session)
):
    """Get prescriptions with filtering and pagination."""
    
    query = select(Prescription).options(
        selectinload(Prescription.items).selectinload(PrescriptionItem.medication)
    )
    count_query = select(func.count(Prescription.id))
    
    # Apply filters
    filters = []
    if patient_id:
        filters.append(Prescription.patient_id == patient_id)
    if status:
        filters.append(Prescription.status == status)
    if prescribed_by:
        filters.append(Prescription.prescribed_by.ilike(f"%{prescribed_by}%"))
    if date_from:
        filters.append(Prescription.prescribed_date >= date_from)
    if date_to:
        filters.append(Prescription.prescribed_date <= date_to)
    
    if filters:
        query = query.where(and_(*filters))
        count_query = count_query.where(and_(*filters))
    
    # Get total count
    total_result = await session.exec(count_query)
    total = total_result.first() or 0
    
    # Apply pagination
    offset = (page - 1) * size
    query = query.offset(offset).limit(size).order_by(Prescription.created_at.desc())
    
    result = await session.exec(query)
    prescriptions = result.all()
    
    pages = (total + size - 1) // size
    
    return PrescriptionListResponse(
        prescriptions=prescriptions,
        total=total,
        page=page,
        size=size,
        pages=pages
    )


@router.get("/{prescription_id}", response_model=PrescriptionResponse)
async def get_prescription(
    prescription_id: int,
    session: AsyncSession = Depends(get_session)
):
    """Get a specific prescription by ID."""
    
    query = select(Prescription).options(
        selectinload(Prescription.items).selectinload(PrescriptionItem.medication)
    ).where(Prescription.id == prescription_id)
    
    result = await session.exec(query)
    prescription = result.first()
    
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found"
        )
    
    return prescription


@router.patch("/{prescription_id}", response_model=PrescriptionResponse)
async def update_prescription(
    prescription_id: int,
    prescription_data: PrescriptionUpdate,
    session: AsyncSession = Depends(get_session)
):
    """Update a prescription."""
    
    query = select(Prescription).where(Prescription.id == prescription_id)
    result = await session.exec(query)
    prescription = result.first()
    
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found"
        )
    
    # Update fields
    update_data = prescription_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(prescription, field, value)
    
    prescription.updated_at = datetime.now()
    await session.commit()
    await session.refresh(prescription)
    
    return prescription


@router.delete("/{prescription_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prescription(
    prescription_id: int,
    session: AsyncSession = Depends(get_session)
):
    """Delete a prescription (soft delete by changing status)."""
    
    query = select(Prescription).where(Prescription.id == prescription_id)
    result = await session.exec(query)
    prescription = result.first()
    
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found"
        )
    
    prescription.status = PrescriptionStatus.CANCELLED
    prescription.updated_at = datetime.now()
    await session.commit()


@router.get("/{prescription_id}/form", response_model=PrescriptionFormOutput)
async def get_prescription_form(
    prescription_id: int,
    session: AsyncSession = Depends(get_session)
):
    """Generate prescription form for printing."""
    
    query = select(Prescription).options(
        selectinload(Prescription.patient),
        selectinload(Prescription.items).selectinload(PrescriptionItem.medication)
    ).where(Prescription.id == prescription_id)
    
    result = await session.exec(query)
    prescription = result.first()
    
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found"
        )
    
    patient = prescription.patient
    medications = []
    
    for item in prescription.items:
        med_info = {
            "name": item.medication.name,
            "generic_name": item.medication.generic_name,
            "dosage": item.dosage,
            "dosage_unit": item.dosage_unit,
            "frequency": item.frequency,
            "duration_days": item.duration_days,
            "total_amount": item.total_amount,
            "instructions": item.instructions,
            "manufacturer": item.medication.manufacturer
        }
        medications.append(med_info)
    
    return PrescriptionFormOutput(
        # Patient info
        patient_name=patient.full_name,
        patient_number=patient.patient_number,
        patient_birth_date=patient.birth_date,
        patient_age=patient.age,
        patient_gender=patient.gender,
        patient_address=patient.full_address,
        patient_phone=patient.phone_number,
        
        # Insurance info
        insurance_type=patient.insurance_type,
        insurance_number=patient.insurance_number,
        
        # Prescription info
        prescription_id=prescription.id,
        prescribed_date=prescription.prescribed_date,
        valid_until=prescription.valid_until,
        prescribed_by=prescription.prescribed_by,
        diagnosis=prescription.diagnosis,
        clinical_info=prescription.clinical_info,
        
        # Medications
        medications=medications,
        total_medications=len(medications),
        
        # Additional info
        notes=prescription.notes,
        pharmacy_name=prescription.pharmacy_name
    )


@router.post("/{prescription_id}/validate", response_model=PrescriptionValidation)
async def validate_prescription(
    prescription_id: int,
    session: AsyncSession = Depends(get_session)
):
    """Validate prescription for drug interactions and safety."""
    
    query = select(Prescription).options(
        selectinload(Prescription.items).selectinload(PrescriptionItem.medication)
    ).where(Prescription.id == prescription_id)
    
    result = await session.exec(query)
    prescription = result.first()
    
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found"
        )
    
    errors = []
    warnings = []
    interactions = []
    
    # Basic validation
    if prescription.valid_until < date.today():
        errors.append("Prescription has expired")
    
    if not prescription.items:
        errors.append("Prescription has no medications")
    
    # Check for drug interactions (simplified logic)
    medications = [item.medication for item in prescription.items]
    for i, med_a in enumerate(medications):
        for med_b in medications[i+1:]:
            # Simplified interaction check - in real system, use drug database
            if "aspirin" in med_a.name.lower() and "warfarin" in med_b.name.lower():
                interactions.append(DrugInteractionCheck(
                    medication_a=med_a.name,
                    medication_b=med_b.name,
                    interaction_level="major",
                    description="Increased risk of bleeding",
                    recommendation="Monitor INR closely"
                ))
    
    # Dosage validation
    for item in prescription.items:
        if item.dosage <= 0:
            errors.append(f"Invalid dosage for {item.medication.name}")
        if item.duration_days <= 0:
            errors.append(f"Invalid duration for {item.medication.name}")
    
    is_valid = len(errors) == 0
    
    return PrescriptionValidation(
        prescription_id=prescription_id,
        is_valid=is_valid,
        errors=errors,
        warnings=warnings,
        drug_interactions=interactions
    )


# Medication endpoints
@router.post("/medications/", response_model=MedicationResponse, status_code=status.HTTP_201_CREATED)
async def create_medication(
    medication_data: MedicationCreate,
    session: AsyncSession = Depends(get_session)
):
    """Create a new medication."""
    
    medication = Medication.model_validate(medication_data)
    session.add(medication)
    await session.commit()
    await session.refresh(medication)
    
    return medication


@router.get("/medications/", response_model=List[MedicationResponse])
async def get_medications(
    name: Optional[str] = Query(None),
    generic_name: Optional[str] = Query(None),
    code: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    session: AsyncSession = Depends(get_session)
):
    """Get medications with filtering."""
    
    query = select(Medication)
    
    filters = []
    if name:
        filters.append(Medication.name.ilike(f"%{name}%"))
    if generic_name:
        filters.append(Medication.generic_name.ilike(f"%{generic_name}%"))
    if code:
        filters.append(Medication.code == code)
    
    if filters:
        query = query.where(or_(*filters))
    
    query = query.limit(limit).order_by(Medication.name)
    
    result = await session.exec(query)
    medications = result.all()
    
    return medications


@router.get("/stats", response_model=PrescriptionStats)
async def get_prescription_stats(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    session: AsyncSession = Depends(get_session)
):
    """Get prescription statistics."""
    
    base_query = select(Prescription)
    
    # Apply date filters
    if date_from or date_to:
        filters = []
        if date_from:
            filters.append(Prescription.prescribed_date >= date_from)
        if date_to:
            filters.append(Prescription.prescribed_date <= date_to)
        base_query = base_query.where(and_(*filters))
    
    # Count by status
    total_result = await session.exec(select(func.count(Prescription.id)))
    total = total_result.first() or 0
    
    active_result = await session.exec(
        select(func.count(Prescription.id)).where(Prescription.status == PrescriptionStatus.ACTIVE)
    )
    active = active_result.first() or 0
    
    completed_result = await session.exec(
        select(func.count(Prescription.id)).where(Prescription.status == PrescriptionStatus.COMPLETED)
    )
    completed = completed_result.first() or 0
    
    cancelled_result = await session.exec(
        select(func.count(Prescription.id)).where(Prescription.status == PrescriptionStatus.CANCELLED)
    )
    cancelled = cancelled_result.first() or 0
    
    expired_result = await session.exec(
        select(func.count(Prescription.id)).where(Prescription.status == PrescriptionStatus.EXPIRED)
    )
    expired = expired_result.first() or 0
    
    return PrescriptionStats(
        total_prescriptions=total,
        active_prescriptions=active,
        completed_prescriptions=completed,
        cancelled_prescriptions=cancelled,
        expired_prescriptions=expired,
        most_prescribed_medications=[],  # TODO: implement
        prescriptions_by_month=[]  # TODO: implement
    )