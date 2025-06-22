"""
Medical Records API endpoints.
"""
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlmodel import Session, select, and_, or_, func, desc, asc
from sqlalchemy.orm import selectinload

from ...core.database import get_session
from ...core.auth_deps import get_current_active_user
from ...models import (
    MedicalRecord, MedicalRecordCreate, MedicalRecordUpdate, MedicalRecordResponse,
    MedicalRecordSign, MedicalRecordFilter,
    MedicalTemplate, MedicalTemplateCreate, MedicalTemplateResponse,
    User, Patient, RecordStatusEnum, VisitTypeEnum, SeverityEnum
)
from ...utils.audit import log_audit_event


router = APIRouter()


@router.post("/", response_model=MedicalRecordResponse)
async def create_medical_record(
    record_data: MedicalRecordCreate,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new medical record."""
    
    # Verify patient exists
    patient = session.get(Patient, record_data.patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Check permissions - only doctors can create medical records
    if not current_user.medical_license_number:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only licensed medical professionals can create medical records"
        )
    
    # Create medical record
    medical_record = MedicalRecord(
        **record_data.model_dump(),
        created_by=current_user.id,
        updated_at=datetime.utcnow()
    )
    
    session.add(medical_record)
    session.commit()
    session.refresh(medical_record)
    
    # Load relationships for response
    medical_record = session.get(
        MedicalRecord, 
        medical_record.id,
        options=[
            selectinload(MedicalRecord.patient),
            selectinload(MedicalRecord.creator),
            selectinload(MedicalRecord.signer)
        ]
    )
    
    # Log audit event
    background_tasks.add_task(
        log_audit_event,
        user_id=current_user.id,
        action="medical_record_create",
        resource_type="medical_record",
        resource_id=str(medical_record.id),
        details={
            "patient_id": str(patient.id),
            "patient_name": patient.full_name,
            "visit_type": record_data.visit_type,
            "chief_complaint": record_data.chief_complaint
        }
    )
    
    return medical_record


@router.get("/", response_model=List[MedicalRecordResponse])
async def get_medical_records(
    filter_params: MedicalRecordFilter = Depends(),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get medical records with filtering and pagination."""
    
    # Base query
    query = select(MedicalRecord).where(MedicalRecord.is_active == True)
    
    # Apply filters
    if filter_params.patient_id:
        query = query.where(MedicalRecord.patient_id == filter_params.patient_id)
    
    if filter_params.created_by:
        query = query.where(MedicalRecord.created_by == filter_params.created_by)
    
    if filter_params.visit_type:
        query = query.where(MedicalRecord.visit_type == filter_params.visit_type)
    
    if filter_params.severity:
        query = query.where(MedicalRecord.severity == filter_params.severity)
    
    if filter_params.status:
        query = query.where(MedicalRecord.status == filter_params.status)
    
    if filter_params.department:
        query = query.where(MedicalRecord.department == filter_params.department)
    
    if filter_params.date_from:
        query = query.where(MedicalRecord.visit_date >= filter_params.date_from)
    
    if filter_params.date_to:
        query = query.where(MedicalRecord.visit_date <= filter_params.date_to)
    
    # Search in multiple fields
    if filter_params.search_query:
        search_term = f"%{filter_params.search_query}%"
        query = query.join(Patient).where(
            or_(
                MedicalRecord.chief_complaint.ilike(search_term),
                MedicalRecord.subjective.ilike(search_term),
                MedicalRecord.assessment.ilike(search_term),
                Patient.family_name.ilike(search_term),
                Patient.given_name.ilike(search_term)
            )
        )
    
    # Sorting
    if filter_params.sort_by == "created_at":
        sort_column = MedicalRecord.created_at
    elif filter_params.sort_by == "visit_date":
        sort_column = MedicalRecord.visit_date
    elif filter_params.sort_by == "patient_name":
        query = query.join(Patient)
        sort_column = Patient.family_name
    else:
        sort_column = MedicalRecord.created_at
    
    if filter_params.sort_order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))
    
    # Pagination
    offset = (filter_params.page - 1) * filter_params.limit
    query = query.offset(offset).limit(filter_params.limit)
    
    # Load relationships
    query = query.options([
        selectinload(MedicalRecord.patient),
        selectinload(MedicalRecord.creator),
        selectinload(MedicalRecord.signer)
    ])
    
    medical_records = session.exec(query).all()
    return medical_records


@router.get("/{record_id}", response_model=MedicalRecordResponse)
async def get_medical_record(
    record_id: UUID,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific medical record by ID."""
    
    medical_record = session.get(
        MedicalRecord,
        record_id,
        options=[
            selectinload(MedicalRecord.patient),
            selectinload(MedicalRecord.creator),
            selectinload(MedicalRecord.signer)
        ]
    )
    
    if not medical_record or not medical_record.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found"
        )
    
    # Log audit event for accessing medical record
    background_tasks.add_task(
        log_audit_event,
        user_id=current_user.id,
        action="medical_record_view",
        resource_type="medical_record",
        resource_id=str(record_id),
        details={
            "patient_id": str(medical_record.patient_id),
            "patient_name": medical_record.patient.full_name if medical_record.patient else "Unknown",
            "visit_date": medical_record.visit_date.isoformat()
        }
    )
    
    return medical_record


@router.put("/{record_id}", response_model=MedicalRecordResponse)
async def update_medical_record(
    record_id: UUID,
    update_data: MedicalRecordUpdate,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Update a medical record."""
    
    medical_record = session.get(MedicalRecord, record_id)
    
    if not medical_record or not medical_record.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found"
        )
    
    # Check if record can be edited
    if not medical_record.can_be_edited:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot edit signed or archived medical record"
        )
    
    # Check permissions - only creator or supervisor can edit
    if (medical_record.created_by != current_user.id and 
        not current_user.medical_license_number):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to edit this medical record"
        )
    
    # Store original data for audit
    original_data = {
        "subjective": medical_record.subjective,
        "objective": medical_record.objective,
        "assessment": medical_record.assessment,
        "plan": medical_record.plan
    }
    
    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(medical_record, field, value)
    
    medical_record.updated_at = datetime.utcnow()
    
    session.add(medical_record)
    session.commit()
    session.refresh(medical_record)
    
    # Load relationships for response
    medical_record = session.get(
        MedicalRecord,
        record_id,
        options=[
            selectinload(MedicalRecord.patient),
            selectinload(MedicalRecord.creator),
            selectinload(MedicalRecord.signer)
        ]
    )
    
    # Log audit event
    background_tasks.add_task(
        log_audit_event,
        user_id=current_user.id,
        action="medical_record_edit",
        resource_type="medical_record",
        resource_id=str(record_id),
        details={
            "changes": update_dict,
            "original_data": original_data,
            "patient_id": str(medical_record.patient_id)
        }
    )
    
    return medical_record


@router.patch("/{record_id}/sign", response_model=MedicalRecordResponse)
async def sign_medical_record(
    record_id: UUID,
    sign_data: MedicalRecordSign,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Sign a medical record."""
    
    medical_record = session.get(MedicalRecord, record_id)
    
    if not medical_record or not medical_record.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found"
        )
    
    # Check if record is already signed
    if medical_record.is_signed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Medical record is already signed"
        )
    
    # Only licensed medical professionals can sign
    if not current_user.medical_license_number:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only licensed medical professionals can sign medical records"
        )
    
    # Sign the record
    medical_record.status = RecordStatusEnum.SIGNED
    medical_record.signed_by = current_user.id
    medical_record.signed_at = datetime.utcnow()
    medical_record.updated_at = datetime.utcnow()
    
    session.add(medical_record)
    session.commit()
    session.refresh(medical_record)
    
    # Load relationships for response
    medical_record = session.get(
        MedicalRecord,
        record_id,
        options=[
            selectinload(MedicalRecord.patient),
            selectinload(MedicalRecord.creator),
            selectinload(MedicalRecord.signer)
        ]
    )
    
    # Log audit event
    background_tasks.add_task(
        log_audit_event,
        user_id=current_user.id,
        action="medical_record_sign",
        resource_type="medical_record",
        resource_id=str(record_id),
        details={
            "patient_id": str(medical_record.patient_id),
            "signer_license": current_user.medical_license_number,
            "digital_signature": sign_data.digital_signature,
            "comments": sign_data.comments
        }
    )
    
    return medical_record


@router.delete("/{record_id}")
async def delete_medical_record(
    record_id: UUID,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Soft delete a medical record."""
    
    medical_record = session.get(MedicalRecord, record_id)
    
    if not medical_record or not medical_record.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found"
        )
    
    # Check if record is signed - signed records cannot be deleted
    if medical_record.is_signed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete signed medical record"
        )
    
    # Check permissions - only creator or admin can delete
    if (medical_record.created_by != current_user.id and 
        not current_user.medical_license_number):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to delete this medical record"
        )
    
    # Soft delete
    medical_record.is_active = False
    medical_record.updated_at = datetime.utcnow()
    
    session.add(medical_record)
    session.commit()
    
    # Log audit event
    background_tasks.add_task(
        log_audit_event,
        user_id=current_user.id,
        action="medical_record_delete",
        resource_type="medical_record",
        resource_id=str(record_id),
        details={
            "patient_id": str(medical_record.patient_id),
            "reason": "User requested deletion"
        }
    )
    
    return {"message": "Medical record deleted successfully"}


# Template endpoints
@router.get("/templates/", response_model=List[MedicalTemplateResponse])
async def get_medical_templates(
    department: Optional[str] = Query(None),
    visit_type: Optional[VisitTypeEnum] = Query(None),
    is_public: Optional[bool] = Query(None),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get medical record templates."""
    
    query = select(MedicalTemplate).where(MedicalTemplate.is_active == True)
    
    # Apply filters
    if department:
        query = query.where(MedicalTemplate.department == department)
    
    if visit_type:
        query = query.where(MedicalTemplate.visit_type == visit_type)
    
    if is_public is not None:
        if is_public:
            query = query.where(MedicalTemplate.is_public == True)
        else:
            # Show user's private templates or public templates
            query = query.where(
                or_(
                    MedicalTemplate.is_public == True,
                    MedicalTemplate.created_by == current_user.id
                )
            )
    
    query = query.order_by(MedicalTemplate.name)
    templates = session.exec(query).all()
    
    return templates


@router.post("/templates/", response_model=MedicalTemplateResponse)
async def create_medical_template(
    template_data: MedicalTemplateCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new medical record template."""
    
    template = MedicalTemplate(
        **template_data.model_dump(),
        created_by=current_user.id
    )
    
    session.add(template)
    session.commit()
    session.refresh(template)
    
    return template


@router.get("/{record_id}/blocks", response_model=Dict[str, Any])
async def get_record_blocks(
    record_id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get BlockNote blocks data for a medical record."""
    
    medical_record = session.get(MedicalRecord, record_id)
    
    if not medical_record or not medical_record.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found"
        )
    
    return {
        "blocks_data": medical_record.blocks_data,
        "soap_content": medical_record.soap_content,
        "editor_version": medical_record.editor_version
    }


@router.get("/stats/dashboard")
async def get_medical_records_stats(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get medical records statistics for dashboard."""
    
    # Total records
    total_records = session.exec(
        select(func.count(MedicalRecord.id)).where(MedicalRecord.is_active == True)
    ).one()
    
    # Today's records
    today = datetime.utcnow().date()
    today_records = session.exec(
        select(func.count(MedicalRecord.id)).where(
            and_(
                MedicalRecord.is_active == True,
                MedicalRecord.visit_date == today
            )
        )
    ).one()
    
    # This week's records
    from datetime import timedelta
    week_start = today - timedelta(days=today.weekday())
    this_week_records = session.exec(
        select(func.count(MedicalRecord.id)).where(
            and_(
                MedicalRecord.is_active == True,
                MedicalRecord.visit_date >= week_start
            )
        )
    ).one()
    
    # Pending records (draft status)
    pending_records = session.exec(
        select(func.count(MedicalRecord.id)).where(
            and_(
                MedicalRecord.is_active == True,
                MedicalRecord.status == RecordStatusEnum.DRAFT
            )
        )
    ).one()
    
    # Records by department
    records_by_department = session.exec(
        select(
            MedicalRecord.department,
            func.count(MedicalRecord.id).label('count')
        ).where(
            MedicalRecord.is_active == True
        ).group_by(MedicalRecord.department)
    ).all()
    
    # Records by type
    records_by_type = session.exec(
        select(
            MedicalRecord.visit_type,
            func.count(MedicalRecord.id).label('count')
        ).where(
            MedicalRecord.is_active == True
        ).group_by(MedicalRecord.visit_type)
    ).all()
    
    return {
        "total_records": total_records,
        "today_records": today_records,
        "this_week_records": this_week_records,
        "pending_records": pending_records,
        "records_by_department": [
            {"department": dept or "未分類", "count": count}
            for dept, count in records_by_department
        ],
        "records_by_type": [
            {"type": visit_type, "count": count}
            for visit_type, count in records_by_type
        ]
    }