"""
Security utilities for authentication and authorization.
Implements Argon2id password hashing and JWT RS256 token management.
"""
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
from uuid import UUID

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHashError
from jose import jwt, JWTError
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend
import pyotp

from app.core.config import settings


# Initialize Argon2id password hasher with OWASP recommended settings
ph = PasswordHasher(
    memory_cost=19456,  # 19 MiB
    time_cost=2,        # 2 iterations
    parallelism=1,      # 1 thread
    hash_len=32,        # 32 bytes output
    salt_len=16         # 16 bytes salt
)


class SecurityManager:
    """Manages all security operations for the application."""
    
    def __init__(self):
        """Initialize RSA keys for JWT signing."""
        # In production, load from secure key management service
        self._load_or_generate_keys()
    
    def _load_or_generate_keys(self):
        """Load or generate RSA key pair for JWT signing."""
        # TODO: In production, load from secure storage
        self.private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )
        self.public_key = self.private_key.public_key()
        
        # PEM encoding for key storage
        self.private_pem = self.private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption()
        )
        self.public_pem = self.public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
    
    # Password Management
    
    def hash_password(self, password: str) -> str:
        """
        Hash password using Argon2id.
        
        Args:
            password: Plain text password
            
        Returns:
            Argon2id hash string
        """
        return ph.hash(password)
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """
        Verify password against Argon2id hash.
        
        Args:
            password: Plain text password to verify
            hashed: Argon2id hash to verify against
            
        Returns:
            True if password matches, False otherwise
        """
        try:
            ph.verify(hashed, password)
            return True
        except (VerifyMismatchError, VerificationError, InvalidHashError):
            return False
    
    def needs_rehash(self, hashed: str) -> bool:
        """Check if password hash needs to be updated with new parameters."""
        try:
            return ph.check_needs_rehash(hashed)
        except Exception:
            return True
    
    def validate_password_strength(self, password: str) -> List[str]:
        """
        Validate password meets security requirements.
        
        Returns:
            List of validation errors, empty if valid
        """
        errors = []
        
        if len(password) < 14:
            errors.append("Password must be at least 14 characters long")
        
        if not any(c.isupper() for c in password):
            errors.append("Password must contain at least one uppercase letter")
        
        if not any(c.islower() for c in password):
            errors.append("Password must contain at least one lowercase letter")
        
        if not any(c.isdigit() for c in password):
            errors.append("Password must contain at least one number")
        
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            errors.append("Password must contain at least one special character")
        
        return errors
    
    # JWT Token Management
    
    def create_access_token(
        self, 
        user_id: UUID, 
        permissions: List[str],
        mfa_verified: bool = False,
        additional_claims: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Create JWT access token with RS256 signing.
        
        Args:
            user_id: User UUID
            permissions: List of user permissions
            mfa_verified: Whether MFA was verified
            additional_claims: Additional JWT claims
            
        Returns:
            Signed JWT token string
        """
        now = datetime.now(timezone.utc)
        expire = now + timedelta(minutes=settings.access_token_expire_minutes)
        
        claims = {
            "sub": str(user_id),
            "exp": expire,
            "iat": now,
            "nbf": now,
            "type": "access",
            "permissions": permissions,
            "mfa": mfa_verified,
            "jti": secrets.token_urlsafe(16),  # JWT ID for revocation
        }
        
        if additional_claims:
            claims.update(additional_claims)
        
        # Prevent 'none' algorithm vulnerability
        return jwt.encode(claims, self.private_pem, algorithm="RS256")
    
    def create_refresh_token(self, user_id: UUID, session_id: UUID) -> str:
        """
        Create JWT refresh token.
        
        Args:
            user_id: User UUID
            session_id: Session UUID for tracking
            
        Returns:
            Signed refresh token
        """
        now = datetime.now(timezone.utc)
        expire = now + timedelta(days=settings.refresh_token_expire_days)
        
        claims = {
            "sub": str(user_id),
            "exp": expire,
            "iat": now,
            "type": "refresh",
            "session_id": str(session_id),
            "jti": secrets.token_urlsafe(16),
        }
        
        return jwt.encode(claims, self.private_pem, algorithm="RS256")
    
    def verify_token(self, token: str, token_type: str = "access") -> Dict[str, Any]:
        """
        Verify and decode JWT token.
        
        Args:
            token: JWT token string
            token_type: Expected token type (access/refresh)
            
        Returns:
            Decoded token claims
            
        Raises:
            JWTError: If token is invalid
        """
        try:
            # Decode with RS256 algorithm only (prevent algorithm confusion)
            claims = jwt.decode(
                token, 
                self.public_pem, 
                algorithms=["RS256"],
                options={
                    "verify_signature": True,
                    "verify_exp": True,
                    "verify_nbf": True,
                    "verify_iat": True,
                    "verify_aud": False,  # We don't use audience
                    "require": ["exp", "iat", "sub", "type"]
                }
            )
            
            # Verify token type
            if claims.get("type") != token_type:
                raise JWTError(f"Invalid token type. Expected {token_type}")
            
            return claims
            
        except JWTError:
            raise
        except Exception as e:
            raise JWTError(f"Token verification failed: {str(e)}")
    
    # MFA Management
    
    def generate_mfa_secret(self) -> str:
        """Generate TOTP secret for MFA."""
        return pyotp.random_base32()
    
    def get_mfa_uri(self, secret: str, username: str) -> str:
        """Generate provisioning URI for MFA setup."""
        return pyotp.totp.TOTP(secret).provisioning_uri(
            name=username,
            issuer_name="Open Denkaru EMR"
        )
    
    def verify_mfa_token(self, secret: str, token: str) -> bool:
        """Verify TOTP token."""
        totp = pyotp.TOTP(secret)
        # Allow 1 window tolerance for clock skew
        return totp.verify(token, valid_window=1)
    
    def generate_backup_codes(self, count: int = 8) -> List[str]:
        """Generate backup codes for MFA recovery."""
        return [secrets.token_hex(4).upper() for _ in range(count)]
    
    # Session Security
    
    def generate_session_token(self) -> str:
        """Generate secure session token."""
        return secrets.token_urlsafe(32)
    
    def generate_csrf_token(self) -> str:
        """Generate CSRF protection token."""
        return secrets.token_urlsafe(32)
    
    # Risk Assessment
    
    def calculate_risk_score(
        self,
        ip_address: str,
        user_agent: str,
        failed_attempts: int,
        unusual_time: bool = False,
        new_device: bool = False
    ) -> int:
        """
        Calculate authentication risk score (0-100).
        
        Args:
            ip_address: Client IP
            user_agent: Client user agent
            failed_attempts: Recent failed login attempts
            unusual_time: Login at unusual time
            new_device: Login from new device
            
        Returns:
            Risk score from 0 (low) to 100 (high)
        """
        score = 0
        
        # Failed attempts increase risk
        score += min(failed_attempts * 10, 30)
        
        # Unusual login time
        if unusual_time:
            score += 20
        
        # New device
        if new_device:
            score += 25
        
        # TODO: Add IP reputation check
        # TODO: Add geolocation check
        # TODO: Add device fingerprint analysis
        
        return min(score, 100)


# Global security manager instance
security = SecurityManager()