"""
AI Assistant API endpoints.
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from ...services.ai_client import MedicalAIAssistant


router = APIRouter()


# Request/Response Models
class DiagnosisRequest(BaseModel):
    symptoms: str
    patient_age: int
    patient_gender: str
    medical_history: Optional[str] = None
    lab_results: Optional[str] = None


class DrugInteractionRequest(BaseModel):
    medications: List[str]
    patient_age: int
    allergies: Optional[str] = None


class LabTestSuggestionRequest(BaseModel):
    symptoms: str
    diagnosis: Optional[str] = None
    purpose: str = "診断"


class LabResultAnalysisRequest(BaseModel):
    lab_results: str
    patient_age: int
    patient_gender: str
    clinical_context: Optional[str] = None


class SOAPNoteRequest(BaseModel):
    subjective: str
    objective: str
    assessment: Optional[str] = None
    plan: Optional[str] = None


class AIResponse(BaseModel):
    type: str
    response: str
    timestamp: str
    metadata: dict = {}


@router.post("/diagnose", response_model=AIResponse)
async def get_diagnostic_support(request: DiagnosisRequest):
    """Get AI-powered diagnostic support."""
    
    try:
        ai_assistant = MedicalAIAssistant()
        result = await ai_assistant.diagnose_support(
            symptoms=request.symptoms,
            patient_age=request.patient_age,
            patient_gender=request.patient_gender,
            medical_history=request.medical_history,
            lab_results=request.lab_results
        )
        
        return AIResponse(
            type=result["type"],
            response=result["response"],
            timestamp=result["timestamp"],
            metadata={
                "patient_age": result["patient_age"],
                "patient_gender": result["patient_gender"],
                "symptoms": result["symptoms"]
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI診断支援エラー: {str(e)}"
        )


@router.post("/drug-interactions", response_model=AIResponse)
async def check_drug_interactions(request: DrugInteractionRequest):
    """Check for drug interactions using AI."""
    
    try:
        ai_assistant = MedicalAIAssistant()
        result = await ai_assistant.check_drug_interactions(
            medications=request.medications,
            patient_age=request.patient_age,
            allergies=request.allergies
        )
        
        return AIResponse(
            type=result["type"],
            response=result["response"],
            timestamp=result["timestamp"],
            metadata={
                "medications": result["medications"],
                "patient_age": result["patient_age"],
                "allergies": result["allergies"]
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"薬物相互作用チェックエラー: {str(e)}"
        )


@router.post("/suggest-lab-tests", response_model=AIResponse)
async def suggest_lab_tests(request: LabTestSuggestionRequest):
    """Get AI suggestions for appropriate lab tests."""
    
    try:
        ai_assistant = MedicalAIAssistant()
        result = await ai_assistant.suggest_lab_tests(
            symptoms=request.symptoms,
            diagnosis=request.diagnosis,
            purpose=request.purpose
        )
        
        return AIResponse(
            type=result["type"],
            response=result["response"],
            timestamp=result["timestamp"],
            metadata={
                "symptoms": result["symptoms"],
                "diagnosis": result["diagnosis"],
                "purpose": result["purpose"]
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"検査提案エラー: {str(e)}"
        )


@router.post("/analyze-lab-results", response_model=AIResponse)
async def analyze_lab_results(request: LabResultAnalysisRequest):
    """Analyze lab results using AI."""
    
    try:
        ai_assistant = MedicalAIAssistant()
        result = await ai_assistant.analyze_lab_results(
            lab_results=request.lab_results,
            patient_age=request.patient_age,
            patient_gender=request.patient_gender,
            clinical_context=request.clinical_context
        )
        
        return AIResponse(
            type=result["type"],
            response=result["response"],
            timestamp=result["timestamp"],
            metadata={
                "patient_age": result["patient_age"],
                "patient_gender": result["patient_gender"],
                "clinical_context": result["clinical_context"]
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"検査結果分析エラー: {str(e)}"
        )


@router.post("/generate-soap", response_model=AIResponse)
async def generate_soap_note(request: SOAPNoteRequest):
    """Generate or improve SOAP notes using AI."""
    
    try:
        ai_assistant = MedicalAIAssistant()
        result = await ai_assistant.generate_soap_note(
            subjective=request.subjective,
            objective=request.objective,
            assessment=request.assessment,
            plan=request.plan
        )
        
        return AIResponse(
            type=result["type"],
            response=result["response"],
            timestamp=result["timestamp"],
            metadata=result["input_soap"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"SOAP記録生成エラー: {str(e)}"
        )


@router.get("/models", response_model=List[dict])
async def list_available_models():
    """List available AI models."""
    
    try:
        ai_assistant = MedicalAIAssistant()
        models = await ai_assistant.ollama.list_models()
        
        return models
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"モデル一覧取得エラー: {str(e)}"
        )


@router.post("/pull-model")
async def pull_model(model_name: str):
    """Pull a new model for use."""
    
    try:
        ai_assistant = MedicalAIAssistant()
        success = await ai_assistant.ollama.pull_model(model_name)
        
        if success:
            return {"message": f"モデル {model_name} の取得が完了しました"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"モデル {model_name} の取得に失敗しました"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"モデル取得エラー: {str(e)}"
        )


@router.get("/health")
async def check_ai_health():
    """Check AI service health."""
    
    try:
        ai_assistant = MedicalAIAssistant()
        models = await ai_assistant.ollama.list_models()
        
        return {
            "status": "healthy",
            "available_models": len(models),
            "default_model": ai_assistant.model_name,
            "service": "ollama"
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "service": "ollama"
        }