"""
Input sanitization and validation for enhanced security.
Prevents SQL injection, XSS, and other injection attacks.
"""
import html
import re
import urllib.parse
from typing import Any, Dict, List, Optional, Union

import bleach
from pydantic import BaseModel, Field, validator


class InputSanitizer:
    """Comprehensive input sanitization for medical data."""
    
    # Allowed HTML tags for rich text (medical records)
    ALLOWED_TAGS = [
        'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'blockquote', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
    ]
    
    ALLOWED_ATTRIBUTES = {
        '*': ['class', 'id'],
        'table': ['border', 'cellpadding', 'cellspacing'],
        'td': ['colspan', 'rowspan'],
        'th': ['colspan', 'rowspan']
    }
    
    # Dangerous patterns that should be blocked
    DANGEROUS_PATTERNS = [
        # SQL injection patterns
        r'(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)',
        r'(\bOR\b|\bAND\b)\s+[\'"]\s*[\'"]\s*=\s*[\'"]',
        r'[\'"]\s*;\s*--',
        r'[\'"]\s*;\s*/\*',
        
        # Script injection patterns
        r'<\s*script\b[^<]*(?:(?!<\/\s*script\s*>)<[^<]*)*<\/\s*script\s*>',
        r'javascript\s*:',
        r'on\w+\s*=',
        r'<\s*iframe\b',
        r'<\s*object\b',
        r'<\s*embed\b',
        r'<\s*form\b',
        
        # Path traversal
        r'\.\.\/',
        r'\.\.\\\\'
    ]
    
    def __init__(self):
        """Initialize sanitizer with compiled patterns."""
        self.dangerous_regex = [re.compile(pattern, re.IGNORECASE) for pattern in self.DANGEROUS_PATTERNS]
    
    def sanitize_string(self, value: str, allow_html: bool = False) -> str:
        """
        Sanitize string input.
        
        Args:
            value: Input string to sanitize
            allow_html: Whether to allow safe HTML tags
            
        Returns:
            Sanitized string
        """
        if not isinstance(value, str):
            return str(value)
        
        # Check for dangerous patterns
        for pattern in self.dangerous_regex:
            if pattern.search(value):
                raise ValueError(f"Potentially dangerous input detected: {value[:50]}...")
        
        # Basic sanitization
        value = value.strip()
        
        if allow_html:
            # Sanitize HTML but keep safe tags
            value = bleach.clean(
                value,
                tags=self.ALLOWED_TAGS,
                attributes=self.ALLOWED_ATTRIBUTES,
                strip=True
            )
        else:
            # Escape HTML entities
            value = html.escape(value)
        
        # Normalize whitespace
        value = re.sub(r'\s+', ' ', value)
        
        return value
    
    def sanitize_medical_text(self, value: str) -> str:
        """Sanitize medical text (SOAP notes, diagnoses, etc.)."""
        return self.sanitize_string(value, allow_html=True)
    
    def sanitize_patient_name(self, value: str) -> str:
        """Sanitize patient name with strict validation."""
        value = self.sanitize_string(value, allow_html=False)
        
        # Allow only letters, spaces, hyphens, and Japanese characters
        if not re.match(r'^[\p{L}\s\-\.\']+$', value, re.UNICODE):
            raise ValueError(f"Invalid characters in name: {value}")
        
        # Limit length
        if len(value) > 100:
            raise ValueError("Name too long")
        
        return value
    
    def sanitize_email(self, value: str) -> str:
        """Sanitize email address."""
        value = self.sanitize_string(value, allow_html=False).lower()
        
        # Basic email validation
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, value):
            raise ValueError(f"Invalid email format: {value}")
        
        return value
    
    def sanitize_phone(self, value: str) -> str:
        """Sanitize phone number."""
        value = self.sanitize_string(value, allow_html=False)
        
        # Remove all non-digit characters except + and -
        value = re.sub(r'[^\d\+\-\(\)\s]', '', value)
        
        # Basic phone validation (10-15 digits)
        digits_only = re.sub(r'[^\d]', '', value)
        if not (10 <= len(digits_only) <= 15):
            raise ValueError(f"Invalid phone number: {value}")
        
        return value
    
    def sanitize_medical_id(self, value: str) -> str:
        """Sanitize medical license numbers, patient IDs, etc."""
        value = self.sanitize_string(value, allow_html=False)
        
        # Allow only alphanumeric characters and hyphens
        if not re.match(r'^[A-Za-z0-9\-]+$', value):
            raise ValueError(f"Invalid medical ID format: {value}")
        
        return value.upper()
    
    def sanitize_dict(self, data: Dict[str, Any], schema: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Sanitize dictionary data based on schema.
        
        Args:
            data: Dictionary to sanitize
            schema: Optional schema defining sanitization rules
            
        Returns:
            Sanitized dictionary
        """
        sanitized = {}
        
        for key, value in data.items():
            # Sanitize key
            safe_key = self.sanitize_string(str(key), allow_html=False)
            
            # Determine sanitization method based on schema or key name
            if schema and safe_key in schema:
                sanitization_type = schema[safe_key]
            else:
                sanitization_type = self._infer_sanitization_type(safe_key)
            
            # Sanitize value
            if isinstance(value, str):
                sanitized[safe_key] = self._sanitize_by_type(value, sanitization_type)
            elif isinstance(value, dict):
                sanitized[safe_key] = self.sanitize_dict(value, schema)
            elif isinstance(value, list):
                sanitized[safe_key] = [
                    self._sanitize_by_type(item, sanitization_type) if isinstance(item, str) else item
                    for item in value
                ]
            else:
                sanitized[safe_key] = value
        
        return sanitized
    
    def _infer_sanitization_type(self, key: str) -> str:
        """Infer sanitization type from key name."""
        key_lower = key.lower()
        
        if any(word in key_lower for word in ['name', 'title']):
            return 'name'
        elif 'email' in key_lower:
            return 'email'
        elif any(word in key_lower for word in ['phone', 'tel', 'mobile']):
            return 'phone'
        elif any(word in key_lower for word in ['license', 'id', 'number']):
            return 'medical_id'
        elif any(word in key_lower for word in ['note', 'comment', 'description', 'diagnosis', 'plan']):
            return 'medical_text'
        else:
            return 'string'
    
    def _sanitize_by_type(self, value: str, sanitization_type: str) -> str:
        """Apply specific sanitization based on type."""
        if sanitization_type == 'name':
            return self.sanitize_patient_name(value)
        elif sanitization_type == 'email':
            return self.sanitize_email(value)
        elif sanitization_type == 'phone':
            return self.sanitize_phone(value)
        elif sanitization_type == 'medical_id':
            return self.sanitize_medical_id(value)
        elif sanitization_type == 'medical_text':
            return self.sanitize_medical_text(value)
        else:
            return self.sanitize_string(value)


class SanitizedInput(BaseModel):
    """Base model with automatic input sanitization."""
    
    class Config:
        str_strip_whitespace = True
        validate_assignment = True
    
    @validator('*', pre=True)
    def sanitize_strings(cls, v):
        """Automatically sanitize string inputs."""
        if isinstance(v, str):
            sanitizer = InputSanitizer()
            return sanitizer.sanitize_string(v)
        return v


class MedicalInput(SanitizedInput):
    """Specialized input validation for medical data."""
    
    @validator('*', pre=True)
    def sanitize_medical_data(cls, v, field):
        """Apply medical-specific sanitization."""
        if isinstance(v, str):
            sanitizer = InputSanitizer()
            field_name = field.name if field else 'unknown'
            sanitization_type = sanitizer._infer_sanitization_type(field_name)
            return sanitizer._sanitize_by_type(v, sanitization_type)
        return v


# Global sanitizer instance
sanitizer = InputSanitizer()


def sanitize_request_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitize request data dictionary."""
    return sanitizer.sanitize_dict(data)


def validate_no_injection(value: str) -> str:
    """Validator function to check for injection attacks."""
    try:
        sanitizer.sanitize_string(value)
        return value
    except ValueError as e:
        raise ValueError(f"Input validation failed: {e}")