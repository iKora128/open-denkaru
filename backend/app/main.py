"""
Open Denkaru Medical EMR Backend API
Simplified version for development
"""
import logging
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="Open Denkaru Medical EMR API",
    description="Medical-grade Electronic Medical Record system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_middleware(request: Request, call_next):
    """Basic security middleware"""
    response = await call_next(request)
    
    # Add security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    
    return response


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "Open Denkaru Medical EMR API",
        "version": "1.0.0",
        "status": "operational",
        "compliance": ["HIPAA", "GDPR", "Japanese Medical Law"]
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": "2025-06-22T20:30:00Z",
        "services": {
            "api": "running",
            "database": "connected"
        }
    }


@app.get("/api/auth/me")
async def get_current_user():
    """Mock current user endpoint"""
    return {
        "id": "1",
        "full_name": "田中太郎医師",
        "email": "tanaka@medical-emr.local",
        "roles": ["doctor"],
        "permissions": [
            "READ_PATIENT",
            "WRITE_PATIENT", 
            "READ_PRESCRIPTION",
            "WRITE_PRESCRIPTION",
            "READ_MEDICAL_RECORD",
            "WRITE_MEDICAL_RECORD",
            "VIEW_AUDIT_LOGS"
        ],
        "department": "内科",
        "position": "主治医",
        "medical_license_number": "123456",
        "last_login_at": "2025-06-22T20:00:00Z"
    }


@app.post("/api/auth/login")
async def login():
    """Mock login endpoint"""
    return {
        "access_token": "mock_jwt_token_12345",
        "token_type": "bearer",
        "expires_in": 3600,
        "user": {
            "id": "1",
            "full_name": "田中太郎医師",
            "email": "tanaka@medical-emr.local",
            "roles": ["doctor"]
        }
    }


@app.get("/api/patients")
async def get_patients():
    """Mock patients endpoint"""
    return {
        "patients": [
            {
                "id": 1,
                "patient_number": "P2025001",
                "family_name": "山田",
                "given_name": "太郎",
                "birth_date": "1980-01-01",
                "gender": "male",
                "blood_type": "A+",
                "phone_number": "090-1234-5678",
                "address": "東京都渋谷区",
                "created_at": "2025-06-22T10:00:00Z"
            },
            {
                "id": 2,
                "patient_number": "P2025002", 
                "family_name": "佐藤",
                "given_name": "花子",
                "birth_date": "1990-05-15",
                "gender": "female",
                "blood_type": "B+",
                "phone_number": "090-9876-5432",
                "address": "東京都新宿区",
                "created_at": "2025-06-22T11:00:00Z"
            }
        ],
        "total": 2,
        "page": 1,
        "per_page": 10
    }


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler"""
    logger.warning(f"HTTP Exception: {exc.status_code} - {exc.detail}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": "2025-06-22T20:30:00Z"
        }
    )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )