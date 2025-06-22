"""
Audit logging utilities.
"""
from typing import Dict, Any, Optional
from uuid import UUID
from datetime import datetime

from sqlmodel import Session
from ..core.database import get_session
from ..models import AuditLog


async def log_audit_event(
    user_id: UUID,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    severity: str = "medium"
):
    """Log an audit event asynchronously."""
    
    try:
        with get_session() as session:
            audit_log = AuditLog(
                user_id=user_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                details=details or {},
                severity=severity,
                timestamp=datetime.utcnow()
            )
            
            session.add(audit_log)
            session.commit()
            
    except Exception as e:
        # Log error but don't fail the main operation
        print(f"Failed to log audit event: {e}")


def log_patient_access(
    user_id: UUID,
    action: str,
    patient_id: UUID,
    details: Optional[Dict[str, Any]] = None
):
    """Helper function to log patient access."""
    
    from ..core.database import SessionLocal
    
    try:
        with SessionLocal() as session:
            audit_log = AuditLog(
                user_id=user_id,
                action=action,
                resource_type="patient",
                resource_id=str(patient_id),
                details=details or {},
                severity="low",
                timestamp=datetime.utcnow()
            )
            
            session.add(audit_log)
            session.commit()
            
    except Exception as e:
        print(f"Failed to log patient access: {e}")


def log_medical_record_access(
    user_id: UUID,
    action: str,
    record_id: UUID,
    details: Optional[Dict[str, Any]] = None
):
    """Helper function to log medical record access."""
    
    from ..core.database import SessionLocal
    
    try:
        with SessionLocal() as session:
            audit_log = AuditLog(
                user_id=user_id,
                action=action,
                resource_type="medical_record",
                resource_id=str(record_id),
                details=details or {},
                severity="medium",
                timestamp=datetime.utcnow()
            )
            
            session.add(audit_log)
            session.commit()
            
    except Exception as e:
        print(f"Failed to log medical record access: {e}")