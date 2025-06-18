"""
Patient management endpoints.
"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import structlog

from app.core.database import get_session
from app.models.patient import Patient, PatientCreate, PatientResponse, PatientUpdate
from app.core.logging import audit_logger

router = APIRouter()
logger = structlog.get_logger()


@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(
    patient_data: PatientCreate,
    session: AsyncSession = Depends(get_session),
):
    """Create a new patient record."""
    try:
        # Create patient instance
        patient = Patient(**patient_data.model_dump())
        
        # Add to session and commit
        session.add(patient)
        await session.commit()
        await session.refresh(patient)
        
        # Audit log
        audit_logger.log_patient_access(
            user_id="system",  # TODO: Get from authenticated user
            patient_id=str(patient.id),
            action="create",
            details={"name": patient.full_name},
        )
        
        logger.info("Patient created", patient_id=str(patient.id))
        return PatientResponse.model_validate(patient)
        
    except Exception as e:
        await session.rollback()
        logger.error("Failed to create patient", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create patient",
        )


@router.get("/", response_model=List[PatientResponse])
async def list_patients(
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_session),
):
    """Get list of patients."""
    try:
        stmt = select(Patient).offset(skip).limit(limit)
        result = await session.execute(stmt)
        patients = result.scalars().all()
        
        # Audit log
        audit_logger.log_system_event(
            user_id="system",  # TODO: Get from authenticated user
            action="list",
            resource="patients",
            details={"count": len(patients), "skip": skip, "limit": limit},
        )
        
        return [PatientResponse.model_validate(patient) for patient in patients]
        
    except Exception as e:
        logger.error("Failed to list patients", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve patients",
        )


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    """Get a specific patient by ID."""
    try:
        stmt = select(Patient).where(Patient.id == patient_id)
        result = await session.execute(stmt)
        patient = result.scalar_one_or_none()
        
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found",
            )
        
        # Audit log
        audit_logger.log_patient_access(
            user_id="system",  # TODO: Get from authenticated user
            patient_id=str(patient.id),
            action="read",
            details={"name": patient.full_name},
        )
        
        return PatientResponse.model_validate(patient)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get patient", patient_id=str(patient_id), error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve patient",
        )


@router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: UUID,
    patient_data: PatientUpdate,
    session: AsyncSession = Depends(get_session),
):
    """Update a patient record."""
    try:
        stmt = select(Patient).where(Patient.id == patient_id)
        result = await session.execute(stmt)
        patient = result.scalar_one_or_none()
        
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found",
            )
        
        # Update fields
        update_data = patient_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(patient, field, value)
        
        await session.commit()
        await session.refresh(patient)
        
        # Audit log
        audit_logger.log_patient_access(
            user_id="system",  # TODO: Get from authenticated user
            patient_id=str(patient.id),
            action="update",
            details={"updated_fields": list(update_data.keys())},
        )
        
        logger.info("Patient updated", patient_id=str(patient.id))
        return PatientResponse.model_validate(patient)
        
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        logger.error("Failed to update patient", patient_id=str(patient_id), error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update patient",
        )


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(
    patient_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    """Delete a patient record."""
    try:
        stmt = select(Patient).where(Patient.id == patient_id)
        result = await session.execute(stmt)
        patient = result.scalar_one_or_none()
        
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found",
            )
        
        await session.delete(patient)
        await session.commit()
        
        # Audit log
        audit_logger.log_patient_access(
            user_id="system",  # TODO: Get from authenticated user
            patient_id=str(patient_id),
            action="delete",
            details={"name": patient.full_name},
        )
        
        logger.info("Patient deleted", patient_id=str(patient_id))
        
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        logger.error("Failed to delete patient", patient_id=str(patient_id), error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete patient",
        )