"""
Authentication dependencies for FastAPI endpoints.
"""
from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from sqlmodel import Session, select

from .database import get_session
from .security import security
from ..models import User, UserSession


bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    request: Request = None,
    session: Session = Depends(get_session)
) -> User:
    """
    Get current authenticated user from JWT token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify the JWT token
        token_data = security.verify_token(credentials.credentials, "access")
        user_id = UUID(token_data.get("sub"))
        
        if user_id is None:
            raise credentials_exception
            
    except (JWTError, ValueError):
        raise credentials_exception
    
    # Get user from database
    user = session.get(User, user_id)
    if user is None:
        raise credentials_exception
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current authenticated and active user.
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User email not verified"
        )
    
    return current_user


async def get_current_medical_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Get current user that has medical credentials.
    """
    if not current_user.medical_license_number:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Medical license required"
        )
    
    return current_user


def require_permission(permission: str):
    """
    Dependency factory to require specific permission.
    """
    async def permission_checker(
        current_user: User = Depends(get_current_active_user),
        session: Session = Depends(get_session)
    ) -> User:
        from ..models import Permission, RolePermission, UserRole
        
        # Check if user has the required permission through their roles
        permission_query = (
            select(Permission)
            .join(RolePermission)
            .join(UserRole, UserRole.role_id == RolePermission.role_id)
            .where(
                UserRole.user_id == current_user.id,
                Permission.name == permission
            )
        )
        
        user_permission = session.exec(permission_query).first()
        
        if not user_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required: {permission}"
            )
        
        return current_user
    
    return permission_checker


def require_role(role_name: str):
    """
    Dependency factory to require specific role.
    """
    async def role_checker(
        current_user: User = Depends(get_current_active_user),
        session: Session = Depends(get_session)
    ) -> User:
        from ..models import Role, UserRole
        
        # Check if user has the required role
        role_query = (
            select(Role)
            .join(UserRole)
            .where(
                UserRole.user_id == current_user.id,
                Role.name == role_name
            )
        )
        
        user_role = session.exec(role_query).first()
        
        if not user_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {role_name}"
            )
        
        return current_user
    
    return role_checker