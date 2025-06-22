"""
Patient management endpoints.
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
import structlog

from app.core.database import get_session
from app.models.patient import Patient, PatientCreate, PatientResponse, PatientUpdate
from app.core.logging import audit_logger
from app.core.auth_deps import get_current_active_user, require_permission
from app.models.user import User
from app.core.input_sanitizer import sanitize_request_data

router = APIRouter()
logger = structlog.get_logger()


@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(
    patient_data: PatientCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_permission("patient:create")),
):
    """Create a new patient record. Requires 'patient:create' permission."""
    try:
        # Sanitize input data
        sanitized_data = sanitize_request_data(patient_data.model_dump())
        
        # Create patient instance with sanitized data
        patient = Patient(**sanitized_data)
        
        # Add to session and commit
        session.add(patient)
        await session.commit()
        await session.refresh(patient)
        
        # Audit log with actual user ID
        audit_logger.log_patient_access(
            user_id=str(current_user.id),
            patient_id=str(patient.id),
            action="create",
            details={
                "name": patient.full_name,
                "created_by": current_user.username,
                "department": current_user.department
            },
        )
        
        logger.info(
            "Patient created", 
            patient_id=str(patient.id), 
            user_id=str(current_user.id),
            username=current_user.username
        )
        return PatientResponse.model_validate(patient)
        
    except Exception as e:
        await session.rollback()
        logger.error("Failed to create patient", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create patient",
        )


@router.get("/debug", response_model=dict)
async def debug_patients(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_permission("admin:debug")),
):
    """Debug endpoint to check patient data existence. Requires admin permissions."""
    try:
        # Simple count query
        from sqlalchemy import func, text
        count_result = await session.execute(select(func.count(Patient.id)))
        total_count = count_result.scalar()
        
        # Get first patient
        first_patient_result = await session.execute(select(Patient).limit(1))
        first_patient = first_patient_result.scalar_one_or_none()
        
        # Audit log for debug access
        audit_logger.log_patient_access(
            user_id=str(current_user.id),
            patient_id="debug_access",
            action="debug",
            details={
                "total_patients": total_count,
                "accessed_by": current_user.username,
                "department": current_user.department
            },
        )
        
        return {
            "total_patients": total_count,
            "first_patient": {
                "id": str(first_patient.id) if first_patient else None,
                "name": f"{first_patient.family_name} {first_patient.given_name}" if first_patient else None,
                "patient_number": first_patient.patient_number if first_patient else None
            } if first_patient else None,
            "database_tables": "patient table accessible"
        }
    except Exception as e:
        logger.error("Debug endpoint failed", error=str(e))
        return {"error": str(e), "type": type(e).__name__}


@router.get("/", response_model=List[PatientResponse])
async def list_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None, description="Search term for patient name, number, or phone"),
    sort_by: str = Query("created_at", description="Sort field: created_at, full_name, age, patient_number"),
    sort_order: str = Query("desc", description="Sort order: asc, desc"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
    age_min: Optional[int] = Query(None, ge=0, le=150, description="Minimum age filter"),
    age_max: Optional[int] = Query(None, ge=0, le=150, description="Maximum age filter"),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_permission("patient:read")),
):
    """Get patients with advanced search, filtering, and sorting."""
    try:
        query = select(Patient).where(Patient.is_active == True)
        
        # Apply search filter
        if search:
            search_term = f"%{search}%"
            query = query.where(
                or_(
                    Patient.family_name.ilike(search_term),
                    Patient.given_name.ilike(search_term),
                    Patient.family_name_kana.ilike(search_term),
                    Patient.given_name_kana.ilike(search_term),
                    Patient.patient_number.ilike(search_term),
                    Patient.phone_number.ilike(search_term),
                    Patient.email.ilike(search_term)
                )
            )
        
        # Apply gender filter
        if gender:
            query = query.where(Patient.gender == gender)
        
        # Apply age filters
        if age_min is not None or age_max is not None:
            from datetime import date
            today = date.today()
            
            if age_min is not None:
                max_birth_date = date(today.year - age_min, today.month, today.day)
                query = query.where(Patient.birth_date <= max_birth_date)
            
            if age_max is not None:
                min_birth_date = date(today.year - age_max - 1, today.month, today.day)
                query = query.where(Patient.birth_date >= min_birth_date)
        
        # Apply sorting
        sort_column = Patient.created_at  # default
        if sort_by == "full_name":
            sort_column = Patient.family_name
        elif sort_by == "age":
            sort_column = Patient.birth_date
            # For age sorting, reverse the order (older birth_date = younger age)
            sort_order = "asc" if sort_order == "desc" else "desc"
        elif sort_by == "patient_number":
            sort_column = Patient.patient_number
        elif sort_by == "created_at":
            sort_column = Patient.created_at
        
        if sort_order.lower() == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        result = await session.execute(query)
        patients = result.scalars().all()
        
        # Audit log (temporarily disabled for debugging)
        # audit_logger.log_system_event(
        #     user_id="system",  # TODO: Get from authenticated user
        #     action="list",
        #     resource="patients",
        #     details={
        #         "count": len(patients), 
        #         "skip": skip, 
        #         "limit": limit,
        #         "search": search,
        #         "filters": {
        #             "gender": gender,
        #             "age_min": age_min,
        #             "age_max": age_max
        #         }
        #     },
        # )
        
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


@router.get("/stats/summary")
async def get_patient_statistics(
    session: AsyncSession = Depends(get_session),
):
    """Get patient statistics summary."""
    try:
        from datetime import date, timedelta
        
        # Total patients
        total_query = select(func.count(Patient.id)).where(Patient.is_active == True)
        total_result = await session.execute(total_query)
        total_patients = total_result.scalar()
        
        # New patients in last 30 days
        thirty_days_ago = date.today() - timedelta(days=30)
        new_30d_query = select(func.count(Patient.id)).where(
            Patient.is_active == True,
            Patient.created_at >= thirty_days_ago
        )
        new_30d_result = await session.execute(new_30d_query)
        new_patients_30d = new_30d_result.scalar()
        
        # New patients in last 7 days
        seven_days_ago = date.today() - timedelta(days=7)
        new_7d_query = select(func.count(Patient.id)).where(
            Patient.is_active == True,
            Patient.created_at >= seven_days_ago
        )
        new_7d_result = await session.execute(new_7d_query)
        new_patients_7d = new_7d_result.scalar()
        
        # Gender distribution
        male_query = select(func.count(Patient.id)).where(
            Patient.is_active == True,
            Patient.gender == "male"
        )
        male_result = await session.execute(male_query)
        male_patients = male_result.scalar()
        
        female_query = select(func.count(Patient.id)).where(
            Patient.is_active == True,
            Patient.gender == "female"
        )
        female_result = await session.execute(female_query)
        female_patients = female_result.scalar()
        
        # Age distribution (approximate)
        today = date.today()
        age_groups = {
            "0-18": 0,
            "19-39": 0,
            "40-64": 0,
            "65+": 0
        }
        
        # Get all birth dates for age calculation
        birth_dates_query = select(Patient.birth_date).where(Patient.is_active == True)
        birth_dates_result = await session.execute(birth_dates_query)
        birth_dates = birth_dates_result.scalars().all()
        
        for birth_date in birth_dates:
            if birth_date:
                age = today.year - birth_date.year
                if today < date(today.year, birth_date.month, birth_date.day):
                    age -= 1
                
                if age <= 18:
                    age_groups["0-18"] += 1
                elif age <= 39:
                    age_groups["19-39"] += 1
                elif age <= 64:
                    age_groups["40-64"] += 1
                else:
                    age_groups["65+"] += 1
        
        statistics = {
            "total_patients": total_patients or 0,
            "new_patients_30d": new_patients_30d or 0,
            "new_patients_7d": new_patients_7d or 0,
            "gender_distribution": {
                "male": male_patients or 0,
                "female": female_patients or 0,
                "other": (total_patients or 0) - (male_patients or 0) - (female_patients or 0)
            },
            "age_distribution": age_groups,
            "growth_rate_7d": round(
                ((new_patients_7d or 0) / max((total_patients or 1), 1)) * 100, 2
            ),
            "growth_rate_30d": round(
                ((new_patients_30d or 0) / max((total_patients or 1), 1)) * 100, 2
            )
        }
        
        return statistics
        
    except Exception as e:
        logger.error("Failed to get patient statistics", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve statistics",
        )


@router.get("/search/advanced")
async def advanced_patient_search(
    query: str = Query(..., min_length=1, description="Search query"),
    session: AsyncSession = Depends(get_session),
):
    """Advanced patient search with ranking."""
    try:
        # Use similarity search for better results
        search_term = f"%{query}%"
        
        # Build complex search query with ranking
        search_query = select(Patient).where(
            Patient.is_active == True
        ).where(
            or_(
                Patient.family_name.ilike(search_term),
                Patient.given_name.ilike(search_term),
                Patient.family_name_kana.ilike(search_term),
                Patient.given_name_kana.ilike(search_term),
                Patient.patient_number.ilike(search_term),
                Patient.phone_number.ilike(search_term),
                Patient.email.ilike(search_term)
            )
        ).limit(20)
        
        result = await session.execute(search_query)
        patients = result.scalars().all()
        
        # Calculate relevance score (simplified)
        scored_patients = []
        for patient in patients:
            score = 0
            
            # Exact matches get higher scores
            if query.lower() in patient.patient_number.lower():
                score += 100
            if query.lower() in patient.family_name.lower():
                score += 80
            if query.lower() in patient.given_name.lower():
                score += 80
            if patient.family_name_kana and query.lower() in patient.family_name_kana.lower():
                score += 70
            if patient.given_name_kana and query.lower() in patient.given_name_kana.lower():
                score += 70
            if patient.phone_number and query in patient.phone_number:
                score += 60
            
            # Partial matches get lower scores
            if query.lower() in patient.family_name.lower() and score == 0:
                score += 40
            if query.lower() in patient.given_name.lower() and score == 0:
                score += 40
            
            scored_patients.append({
                "patient": PatientResponse.model_validate(patient),
                "score": score
            })
        
        # Sort by score
        scored_patients.sort(key=lambda x: x["score"], reverse=True)
        
        return {
            "query": query,
            "total_results": len(scored_patients),
            "results": scored_patients
        }
        
    except Exception as e:
        logger.error("Failed to perform advanced search", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform search",
        )