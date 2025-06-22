"""
Rate limiting middleware for API endpoints.
Implements sliding window rate limiting with Redis backend.
"""
import json
import time
from typing import Dict, Optional, Tuple
from uuid import UUID

import redis
from fastapi import HTTPException, Request, status
from starlette.middleware.base import BaseHTTPMiddleware

from .config import settings


class RateLimiter:
    """Redis-based rate limiter with sliding window algorithm."""
    
    def __init__(self, redis_url: str = settings.REDIS_URL):
        """Initialize Redis connection."""
        self.redis = redis.from_url(redis_url, decode_responses=True)
        
        # Rate limit configurations
        self.limits = {
            # Authentication endpoints
            "auth:login": {"requests": 5, "window": 300},  # 5 attempts per 5 minutes
            "auth:register": {"requests": 3, "window": 3600},  # 3 attempts per hour
            "auth:password_reset": {"requests": 3, "window": 3600},
            
            # API endpoints by authentication level
            "api:authenticated": {"requests": 1000, "window": 3600},  # 1000 per hour for authenticated
            "api:unauthenticated": {"requests": 100, "window": 3600},  # 100 per hour for anonymous
            
            # Medical emergency bypass (higher limits)
            "emergency:access": {"requests": 2000, "window": 3600},  # 2000 per hour for emergencies
            
            # Admin operations
            "admin:operations": {"requests": 500, "window": 3600},  # 500 per hour for admin
        }
    
    def get_client_key(self, request: Request, user_id: Optional[UUID] = None) -> str:
        """Generate unique client key for rate limiting."""
        # Use user ID if authenticated, otherwise use IP
        if user_id:
            return f"rate_limit:user:{user_id}"
        
        # Get real IP from headers (behind proxy)
        client_ip = (
            request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
            or request.headers.get("X-Real-IP", "")
            or request.client.host
        )
        
        return f"rate_limit:ip:{client_ip}"
    
    def determine_limit_key(self, request: Request, user_id: Optional[UUID] = None) -> str:
        """Determine which rate limit to apply based on endpoint and user."""
        path = request.url.path
        
        # Authentication endpoints
        if path.startswith("/api/v1/auth/login"):
            return "auth:login"
        elif path.startswith("/api/v1/auth/register"):
            return "auth:register"
        elif path.startswith("/api/v1/auth/password"):
            return "auth:password_reset"
        
        # Emergency access (special header or role)
        if request.headers.get("X-Emergency-Access") == "true":
            return "emergency:access"
        
        # Admin operations
        if path.startswith("/api/v1/admin/"):
            return "admin:operations"
        
        # Authenticated vs unauthenticated API
        if user_id:
            return "api:authenticated"
        else:
            return "api:unauthenticated"
    
    def is_rate_limited(
        self, 
        request: Request, 
        user_id: Optional[UUID] = None
    ) -> Tuple[bool, Dict[str, int]]:
        """
        Check if request should be rate limited.
        
        Returns:
            Tuple of (is_limited, rate_limit_info)
        """
        client_key = self.get_client_key(request, user_id)
        limit_key = self.determine_limit_key(request, user_id)
        
        if limit_key not in self.limits:
            # No rate limit configured for this endpoint
            return False, {}
        
        limit_config = self.limits[limit_key]
        max_requests = limit_config["requests"]
        window_seconds = limit_config["window"]
        
        now = int(time.time())
        window_start = now - window_seconds
        
        # Redis key for this client and limit type
        redis_key = f"{client_key}:{limit_key}"
        
        try:
            # Use sliding window with sorted sets
            pipe = self.redis.pipeline()
            
            # Remove old entries outside the window
            pipe.zremrangebyscore(redis_key, 0, window_start)
            
            # Count current requests in window
            pipe.zcard(redis_key)
            
            # Add current request
            pipe.zadd(redis_key, {str(now): now})
            
            # Set expiration
            pipe.expire(redis_key, window_seconds + 1)
            
            results = pipe.execute()
            current_requests = results[1]
            
            # Calculate rate limit info
            rate_info = {
                "limit": max_requests,
                "remaining": max(0, max_requests - current_requests - 1),
                "reset": now + window_seconds,
                "window": window_seconds
            }
            
            # Check if rate limited
            if current_requests >= max_requests:
                return True, rate_info
            
            return False, rate_info
            
        except redis.RedisError:
            # If Redis is down, allow the request (fail open)
            return False, {}
    
    def get_retry_after(self, reset_time: int) -> int:
        """Calculate Retry-After header value."""
        return max(1, reset_time - int(time.time()))


class RateLimitMiddleware(BaseHTTPMiddleware):
    """FastAPI middleware for rate limiting."""
    
    def __init__(self, app, rate_limiter: Optional[RateLimiter] = None):
        super().__init__(app)
        self.rate_limiter = rate_limiter or RateLimiter()
    
    async def dispatch(self, request: Request, call_next):
        """Process request with rate limiting."""
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/docs", "/openapi.json"]:
            return await call_next(request)
        
        # Get user ID from request if authenticated
        user_id = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            try:
                # You might want to decode the JWT here to get user_id
                # For now, we'll use IP-based limiting for unauthenticated requests
                pass
            except Exception:
                pass
        
        # Check rate limit
        is_limited, rate_info = self.rate_limiter.is_rate_limited(request, user_id)
        
        if is_limited:
            # Return rate limit exceeded response
            retry_after = self.rate_limiter.get_retry_after(rate_info.get("reset", 0))
            
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "Rate limit exceeded",
                    "message": f"Too many requests. Try again in {retry_after} seconds.",
                    "retry_after": retry_after,
                    "limit": rate_info.get("limit"),
                    "window": rate_info.get("window")
                },
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Limit": str(rate_info.get("limit", 0)),
                    "X-RateLimit-Remaining": str(rate_info.get("remaining", 0)),
                    "X-RateLimit-Reset": str(rate_info.get("reset", 0))
                }
            )
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers to response
        if rate_info:
            response.headers["X-RateLimit-Limit"] = str(rate_info.get("limit", 0))
            response.headers["X-RateLimit-Remaining"] = str(rate_info.get("remaining", 0))
            response.headers["X-RateLimit-Reset"] = str(rate_info.get("reset", 0))
        
        return response


def create_rate_limiter() -> RateLimiter:
    """Factory function to create rate limiter instance."""
    return RateLimiter()


# Dependency for manual rate limit checking
async def check_rate_limit(request: Request, user_id: Optional[UUID] = None) -> None:
    """Dependency to manually check rate limits in endpoints."""
    rate_limiter = create_rate_limiter()
    is_limited, rate_info = rate_limiter.is_rate_limited(request, user_id)
    
    if is_limited:
        retry_after = rate_limiter.get_retry_after(rate_info.get("reset", 0))
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "Rate limit exceeded",
                "message": f"Too many requests. Try again in {retry_after} seconds.",
                "retry_after": retry_after
            },
            headers={
                "Retry-After": str(retry_after),
                "X-RateLimit-Limit": str(rate_info.get("limit", 0)),
                "X-RateLimit-Remaining": str(rate_info.get("remaining", 0)),
                "X-RateLimit-Reset": str(rate_info.get("reset", 0))
            }
        )