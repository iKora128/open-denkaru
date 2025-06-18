"""
Logging configuration for Open Denkaru EMR.
"""
import logging
import sys
from typing import Any, Dict

import structlog
from app.core.config import settings


def setup_logging() -> None:
    """Configure structured logging for the application."""
    
    # Configure structlog
    structlog.configure(
        processors=[
            # Add context information
            structlog.contextvars.merge_contextvars,
            # Add timestamp
            structlog.processors.TimeStamper(fmt="iso"),
            # Add log level
            structlog.processors.add_log_level,
            # Add caller information in debug mode
            structlog.processors.CallsiteParameterAdder(
                parameters=[
                    structlog.processors.CallsiteParameter.FILENAME,
                    structlog.processors.CallsiteParameter.FUNC_NAME,
                    structlog.processors.CallsiteParameter.LINENO,
                ]
            ) if settings.DEBUG else structlog.processors.CallsiteParameterAdder(),
            # Format as JSON in production, colorize in development
            structlog.dev.ConsoleRenderer(colors=True) if settings.DEBUG 
            else structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            getattr(logging, settings.LOG_LEVEL.upper())
        ),
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )
    
    # Configure standard library logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, settings.LOG_LEVEL.upper()),
    )
    
    # Reduce noise from third-party libraries
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


def get_logger(context: Dict[str, Any] = None) -> structlog.BoundLogger:
    """Get a logger with optional context."""
    logger = structlog.get_logger()
    if context:
        logger = logger.bind(**context)
    return logger


class AuditLogger:
    """Specialized logger for audit trails required in medical systems."""
    
    def __init__(self):
        self.logger = structlog.get_logger("audit")
    
    def log_patient_access(self, user_id: str, patient_id: str, action: str, details: Dict[str, Any] = None):
        """Log patient data access for compliance."""
        self.logger.info(
            "Patient data accessed",
            user_id=user_id,
            patient_id=patient_id,
            action=action,
            details=details or {},
            event_type="patient_access",
        )
    
    def log_medical_record_change(self, user_id: str, patient_id: str, record_type: str, 
                                 record_id: str, action: str, changes: Dict[str, Any] = None):
        """Log medical record modifications."""
        self.logger.info(
            "Medical record modified",
            user_id=user_id,
            patient_id=patient_id,
            record_type=record_type,
            record_id=record_id,
            action=action,
            changes=changes or {},
            event_type="medical_record_change",
        )
    
    def log_prescription_event(self, user_id: str, patient_id: str, prescription_id: str, 
                              action: str, details: Dict[str, Any] = None):
        """Log prescription-related events."""
        self.logger.info(
            "Prescription event",
            user_id=user_id,
            patient_id=patient_id,
            prescription_id=prescription_id,
            action=action,
            details=details or {},
            event_type="prescription_event",
        )
    
    def log_system_event(self, user_id: str, action: str, resource: str, 
                        details: Dict[str, Any] = None):
        """Log system-level events."""
        self.logger.info(
            "System event",
            user_id=user_id,
            action=action,
            resource=resource,
            details=details or {},
            event_type="system_event",
        )


audit_logger = AuditLogger()