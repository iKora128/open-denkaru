"""
FastAPI application entry point for Open Denkaru EMR system.
"""
import asyncio
import structlog
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.database import engine
from app.api.routes import api_router
from app.core.logging import setup_logging
from app.core.rate_limiter import RateLimitMiddleware
from app.core.input_sanitizer import sanitize_request_data


# Configure structured logging
setup_logging()
logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan context manager for startup and shutdown events."""
    # Startup
    logger.info("🚀 Starting Open Denkaru EMR", version="0.1.0")
    
    # Test database connection
    try:
        async with engine.connect() as conn:
            logger.info("✅ Database connection established")
    except Exception as e:
        logger.error("❌ Database connection failed", error=str(e))
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Open Denkaru EMR")
    await engine.dispose()


# Create FastAPI application
app = FastAPI(
    title="Open Denkaru EMR",
    description="Modern Electronic Medical Record system for Japanese healthcare",
    version="0.1.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan,
)

# Security middlewares - order matters!
# Rate limiting should be first to prevent abuse
app.add_middleware(RateLimitMiddleware)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.allowed_hosts_list,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)


# Global exception handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions with proper logging."""
    logger.warning(
        "HTTP exception occurred",
        status_code=exc.status_code,
        detail=exc.detail,
        path=request.url.path,
        method=request.method,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTP Error",
            "detail": exc.detail,
            "status_code": exc.status_code,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors."""
    logger.warning(
        "Validation error occurred",
        errors=exc.errors(),
        path=request.url.path,
        method=request.method,
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "detail": "Invalid request data",
            "validation_errors": exc.errors(),
        },
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    """Handle input sanitization and validation errors."""
    error_msg = str(exc)
    
    # Check if this is a security-related validation error
    if any(keyword in error_msg.lower() for keyword in ['dangerous', 'injection', 'invalid', 'security']):
        logger.warning(
            "Security validation error",
            error=error_msg,
            path=request.url.path,
            method=request.method,
            client_ip=request.client.host,
        )
        
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": "Input Validation Error",
                "detail": "Input contains invalid or potentially dangerous content",
                "security_note": "This incident has been logged for security review"
            },
        )
    
    # Regular value error
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": "Value Error",
            "detail": error_msg,
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions."""
    logger.error(
        "Unexpected error occurred",
        error=str(exc),
        error_type=type(exc).__name__,
        path=request.url.path,
        method=request.method,
        exc_info=True,
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "detail": "An unexpected error occurred. Please try again later.",
        },
    )


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "service": "Open Denkaru EMR",
        "version": "0.1.0",
    }


# Include API routes
app.include_router(api_router, prefix="/api/v1")


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with basic information."""
    return {
        "message": "Open Denkaru EMR API",
        "version": "0.1.0",
        "description": "Modern Electronic Medical Record system for Japanese healthcare",
        "docs_url": "/docs" if settings.DEBUG else "Disabled in production",
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info",
    )