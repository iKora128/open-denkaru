"""
Authentication and authorization schemas for API endpoints.
"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr, field_validator


class LoginRequest(BaseModel):
    """Login request schema."""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=1)
    mfa_token: Optional[str] = Field(None, pattern=r"^\d{6}$", description="6-digit MFA token")


class TokenResponse(BaseModel):
    """JWT token response schema."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds
    mfa_required: bool = False
    mfa_setup_required: bool = False


class RefreshTokenRequest(BaseModel):
    """Refresh token request schema."""
    refresh_token: str


class MFASetupResponse(BaseModel):
    """MFA setup response with QR code."""
    secret: str
    qr_code: str  # Base64 encoded QR code image
    backup_codes: List[str]


class MFAVerifyRequest(BaseModel):
    """MFA verification request."""
    token: str = Field(..., pattern=r"^\d{6}$")


class PasswordChangeRequest(BaseModel):
    """Password change request schema."""
    current_password: str
    new_password: str = Field(..., min_length=14)
    
    @field_validator('new_password')
    @classmethod
    def validate_password_strength(cls, v):
        """Validate password meets security requirements."""
        errors = []
        
        if len(v) < 14:
            errors.append("Password must be at least 14 characters")
        
        if not any(c.isupper() for c in v):
            errors.append("Password must contain uppercase letter")
        
        if not any(c.islower() for c in v):
            errors.append("Password must contain lowercase letter")
        
        if not any(c.isdigit() for c in v):
            errors.append("Password must contain number")
        
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in v):
            errors.append("Password must contain special character")
        
        if errors:
            raise ValueError("; ".join(errors))
        
        return v


class UserRegistrationRequest(BaseModel):
    """User registration request schema."""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=14)
    full_name: str = Field(..., min_length=1, max_length=100)
    
    # Medical personnel information
    medical_license_number: Optional[str] = Field(None, max_length=50)
    department: Optional[str] = Field(None, max_length=100)
    position: Optional[str] = Field(None, max_length=50)
    
    # Initial role
    role: str = Field(..., description="Initial role: doctor, nurse, pharmacist, receptionist")


class SessionInfo(BaseModel):
    """Active session information."""
    session_id: UUID
    created_at: datetime
    last_accessed_at: datetime
    ip_address: Optional[str]
    user_agent: Optional[str]
    expires_at: datetime


class CurrentUser(BaseModel):
    """Current authenticated user information."""
    id: UUID
    username: str
    email: str
    full_name: str
    roles: List[str]
    permissions: List[str]
    mfa_enabled: bool
    is_active: bool
    last_login_at: Optional[datetime]
    current_session_id: UUID


class AuditLogEntry(BaseModel):
    """Audit log entry for API responses."""
    id: UUID
    timestamp: datetime
    action: str
    resource_type: Optional[str]
    resource_id: Optional[UUID]
    user_id: Optional[UUID]
    username: Optional[str]
    ip_address: Optional[str]
    success: bool
    error_message: Optional[str]
    phi_accessed: bool
    risk_score: int
    medical_significance: str


class PermissionCheck(BaseModel):
    """Permission check request."""
    resource: str
    action: str


class RoleAssignment(BaseModel):
    """Role assignment request."""
    user_id: UUID
    role_name: str
    assigned_by: UUID