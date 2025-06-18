"""
Authentication API endpoints for user login, logout, and session management.
"""
from datetime import datetime, timezone, timedelta
from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlmodel import select as sqlmodel_select

from app.core.database import get_session
from app.core.security import security
from app.core.config import settings
from app.models.user import User, UserSession, AuditLog, Role, UserRole
from app.schemas.auth import (
    LoginRequest, TokenResponse, RefreshTokenRequest,
    CurrentUser, SessionInfo, PasswordChangeRequest,
    MFASetupResponse, MFAVerifyRequest
)

router = APIRouter()
bearer_scheme = HTTPBearer()


async def log_audit(
    db: AsyncSession,
    action: str,
    user_id: Optional[UUID] = None,
    success: bool = True,
    error_message: Optional[str] = None,
    request: Optional[Request] = None,
    phi_accessed: bool = False,
    resource_type: Optional[str] = None,
    resource_id: Optional[UUID] = None,
    risk_score: int = 0
):
    """Create audit log entry."""
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        success=success,
        error_message=error_message,
        ip_address=request.client.host if request else None,
        user_agent=request.headers.get("User-Agent") if request else None,
        phi_accessed=phi_accessed,
        resource_type=resource_type,
        resource_id=resource_id,
        risk_score=risk_score,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(audit_log)
    await db.commit()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    db: Annotated[AsyncSession, Depends(get_session)]
) -> CurrentUser:
    """
    Get current authenticated user from JWT token.
    
    Raises:
        HTTPException: If token is invalid or user not found
    """
    try:
        # Verify access token
        claims = security.verify_token(credentials.credentials, token_type="access")
        user_id = UUID(claims["sub"])
        
        # Get user with roles
        result = await db.execute(
            select(User)
            .where(User.id == user_id)
            .where(User.is_active == True)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Get user roles and permissions
        roles = []
        permissions = set(claims.get("permissions", []))
        
        # Fetch user roles
        user_roles_result = await db.execute(
            select(Role)
            .join(UserRole)
            .where(UserRole.user_id == user_id)
        )
        for role in user_roles_result.scalars():
            roles.append(role.name)
        
        return CurrentUser(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            roles=roles,
            permissions=list(permissions),
            mfa_enabled=user.mfa_enabled,
            is_active=user.is_active,
            last_login_at=user.last_login_at,
            current_session_id=UUID(claims.get("jti", "00000000-0000-0000-0000-000000000000"))
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )


@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    login_data: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_session)]
):
    """
    Authenticate user and return JWT tokens.
    
    Returns:
        TokenResponse with access and refresh tokens
        
    Raises:
        HTTPException: If authentication fails
    """
    # Find user by username
    result = await db.execute(
        select(User).where(User.username == login_data.username)
    )
    user = result.scalar_one_or_none()
    
    # Calculate risk score
    risk_score = 0
    if user:
        risk_score = security.calculate_risk_score(
            ip_address=request.client.host,
            user_agent=request.headers.get("User-Agent", ""),
            failed_attempts=user.failed_login_attempts,
            new_device=True  # TODO: Implement device tracking
        )
    
    # Check if user exists and is not locked
    if not user or (user.locked_until and user.locked_until > datetime.now(timezone.utc)):
        await log_audit(
            db, "login_failed", None, False, 
            "Invalid credentials or account locked",
            request, risk_score=risk_score
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Verify password
    if not security.verify_password(login_data.password, user.hashed_password):
        # Increment failed attempts
        user.failed_login_attempts += 1
        
        # Lock account after 5 failed attempts
        if user.failed_login_attempts >= 5:
            user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=30)
        
        await db.commit()
        
        await log_audit(
            db, "login_failed", user.id, False,
            f"Invalid password (attempt {user.failed_login_attempts})",
            request, risk_score=risk_score
        )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Check if password needs rehashing
    if security.needs_rehash(user.hashed_password):
        user.hashed_password = security.hash_password(login_data.password)
    
    # Check MFA requirement
    if user.mfa_enabled and not login_data.mfa_token:
        await log_audit(
            db, "login_mfa_required", user.id, True,
            None, request, risk_score=risk_score
        )
        return TokenResponse(
            access_token="",
            refresh_token="",
            token_type="bearer",
            expires_in=0,
            mfa_required=True,
            mfa_setup_required=False
        )
    
    # Verify MFA token if provided
    if user.mfa_enabled and login_data.mfa_token:
        if not security.verify_mfa_token(user.mfa_secret, login_data.mfa_token):
            await log_audit(
                db, "login_mfa_failed", user.id, False,
                "Invalid MFA token", request, risk_score=risk_score
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid MFA token"
            )
    
    # Get user permissions
    permissions = []
    result = await db.execute(
        select(Role)
        .join(UserRole)
        .where(UserRole.user_id == user.id)
    )
    for role in result.scalars():
        # TODO: Load actual permissions for role
        if role.name == "doctor":
            permissions.extend(["read_patient", "write_patient", "write_prescription"])
        elif role.name == "nurse":
            permissions.extend(["read_patient", "update_patient", "read_prescription"])
    
    # Create session
    session = UserSession(
        user_id=user.id,
        session_token=security.generate_session_token(),
        ip_address=request.client.host,
        user_agent=request.headers.get("User-Agent"),
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    )
    db.add(session)
    
    # Update user login info
    user.last_login_at = datetime.now(timezone.utc)
    user.failed_login_attempts = 0
    user.locked_until = None
    
    # Create tokens
    access_token = security.create_access_token(
        user_id=user.id,
        permissions=permissions,
        mfa_verified=user.mfa_enabled and bool(login_data.mfa_token)
    )
    
    refresh_token = security.create_refresh_token(
        user_id=user.id,
        session_id=session.id
    )
    
    session.refresh_token = refresh_token
    await db.commit()
    
    await log_audit(
        db, "login_success", user.id, True,
        None, request, risk_score=risk_score
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60,
        mfa_required=False,
        mfa_setup_required=not user.mfa_enabled and settings.mfa_required
    )


@router.post("/logout")
async def logout(
    request: Request,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_session)]
):
    """
    Logout user and revoke session.
    """
    # Find and revoke current session
    result = await db.execute(
        select(UserSession)
        .where(UserSession.user_id == current_user.id)
        .where(UserSession.is_active == True)
    )
    
    for session in result.scalars():
        session.is_active = False
        session.revoked_at = datetime.now(timezone.utc)
    
    await db.commit()
    
    await log_audit(
        db, "logout", current_user.id, True,
        None, request
    )
    
    return {"message": "Logged out successfully"}


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: Request,
    refresh_data: RefreshTokenRequest,
    db: Annotated[AsyncSession, Depends(get_session)]
):
    """
    Refresh access token using refresh token.
    """
    try:
        # Verify refresh token
        claims = security.verify_token(refresh_data.refresh_token, token_type="refresh")
        user_id = UUID(claims["sub"])
        session_id = UUID(claims["session_id"])
        
        # Check session validity
        result = await db.execute(
            select(UserSession)
            .where(UserSession.id == session_id)
            .where(UserSession.user_id == user_id)
            .where(UserSession.is_active == True)
            .where(UserSession.expires_at > datetime.now(timezone.utc))
        )
        session = result.scalar_one_or_none()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session"
            )
        
        # Get user and permissions
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Get permissions (simplified)
        permissions = []
        result = await db.execute(
            select(Role)
            .join(UserRole)
            .where(UserRole.user_id == user.id)
        )
        for role in result.scalars():
            if role.name == "doctor":
                permissions.extend(["read_patient", "write_patient", "write_prescription"])
            elif role.name == "nurse":
                permissions.extend(["read_patient", "update_patient", "read_prescription"])
        
        # Create new access token
        access_token = security.create_access_token(
            user_id=user.id,
            permissions=permissions,
            mfa_verified=user.mfa_enabled  # Maintain MFA status
        )
        
        # Update session activity
        session.last_accessed_at = datetime.now(timezone.utc)
        await db.commit()
        
        await log_audit(
            db, "token_refresh", user.id, True,
            None, request
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_data.refresh_token,  # Return same refresh token
            token_type="bearer",
            expires_in=settings.access_token_expire_minutes * 60,
            mfa_required=False,
            mfa_setup_required=False
        )
        
    except HTTPException:
        raise
    except Exception as e:
        await log_audit(
            db, "token_refresh_failed", None, False,
            str(e), request
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


@router.get("/me", response_model=CurrentUser)
async def get_current_user_info(
    current_user: Annotated[CurrentUser, Depends(get_current_user)]
):
    """Get current user information."""
    return current_user


@router.get("/sessions", response_model=list[SessionInfo])
async def get_user_sessions(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_session)]
):
    """Get all active sessions for current user."""
    result = await db.execute(
        select(UserSession)
        .where(UserSession.user_id == current_user.id)
        .where(UserSession.is_active == True)
        .order_by(UserSession.created_at.desc())
    )
    
    sessions = []
    for session in result.scalars():
        sessions.append(SessionInfo(
            session_id=session.id,
            created_at=session.created_at,
            last_accessed_at=session.last_accessed_at,
            ip_address=session.ip_address,
            user_agent=session.user_agent,
            expires_at=session.expires_at
        ))
    
    return sessions


@router.post("/change-password")
async def change_password(
    request: Request,
    password_data: PasswordChangeRequest,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_session)]
):
    """Change user password."""
    # Get user
    result = await db.execute(
        select(User).where(User.id == current_user.id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify current password
    if not security.verify_password(password_data.current_password, user.hashed_password):
        await log_audit(
            db, "password_change_failed", current_user.id, False,
            "Invalid current password", request
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid current password"
        )
    
    # Validate new password strength
    errors = security.validate_password_strength(password_data.new_password)
    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="; ".join(errors)
        )
    
    # TODO: Check password history
    
    # Update password
    user.hashed_password = security.hash_password(password_data.new_password)
    user.password_changed_at = datetime.now(timezone.utc)
    
    # Revoke all sessions except current
    result = await db.execute(
        select(UserSession)
        .where(UserSession.user_id == current_user.id)
        .where(UserSession.is_active == True)
    )
    
    for session in result.scalars():
        if session.id != current_user.current_session_id:
            session.is_active = False
            session.revoked_at = datetime.now(timezone.utc)
    
    await db.commit()
    
    await log_audit(
        db, "password_change_success", current_user.id, True,
        None, request
    )
    
    return {"message": "Password changed successfully"}