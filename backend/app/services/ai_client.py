"""
AI Client Service for Ollama integration.
"""
import asyncio
import json
import aiohttp
from typing import Dict, List, Optional, AsyncGenerator
from datetime import datetime

from ..core.config import settings


class OllamaClient:
    """Client for interacting with Ollama LLM."""
    
    def __init__(self, base_url: str = "http://ollama:11434"):
        self.base_url = base_url
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _get_session(self) -> aiohttp.ClientSession:
        if not self.session:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def list_models(self) -> List[Dict]:
        """List available models."""
        session = await self._get_session()
        async with session.get(f"{self.base_url}/api/tags") as response:
            if response.status == 200:
                data = await response.json()
                return data.get("models", [])
            return []
    
    async def pull_model(self, model_name: str) -> bool:
        """Pull a model from Ollama registry."""
        session = await self._get_session()
        payload = {"name": model_name}
        
        try:
            async with session.post(
                f"{self.base_url}/api/pull", 
                json=payload
            ) as response:
                return response.status == 200
        except Exception:
            return False
    
    async def generate(
        self, 
        model: str, 
        prompt: str, 
        system: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        stream: bool = False
    ) -> Dict:
        """Generate completion from Ollama."""
        session = await self._get_session()
        
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": stream,
            "options": {
                "temperature": temperature,
            }
        }
        
        if system:
            payload["system"] = system
        
        if max_tokens:
            payload["options"]["num_predict"] = max_tokens
        
        async with session.post(
            f"{self.base_url}/api/generate",
            json=payload
        ) as response:
            if response.status == 200:
                if stream:
                    return {"stream": response}
                else:
                    return await response.json()
            else:
                raise Exception(f"Ollama API error: {response.status}")
    
    async def chat(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        stream: bool = False
    ) -> Dict:
        """Chat completion with conversation history."""
        session = await self._get_session()
        
        payload = {
            "model": model,
            "messages": messages,
            "stream": stream,
            "options": {
                "temperature": temperature,
            }
        }
        
        if max_tokens:
            payload["options"]["num_predict"] = max_tokens
        
        async with session.post(
            f"{self.base_url}/api/chat",
            json=payload
        ) as response:
            if response.status == 200:
                if stream:
                    return {"stream": response}
                else:
                    return await response.json()
            else:
                raise Exception(f"Ollama API error: {response.status}")


class MedicalAIAssistant:
    """Medical AI Assistant using Ollama."""
    
    def __init__(self, model_name: str = "llama2:7b-chat"):
        self.model_name = model_name
        self.ollama = OllamaClient()
    
    async def ensure_model_available(self) -> bool:
        """Ensure the model is available, pull if needed."""
        models = await self.ollama.list_models()
        model_names = [model.get("name", "") for model in models]
        
        if not any(self.model_name in name for name in model_names):
            print(f"Pulling model {self.model_name}...")
            return await self.ollama.pull_model(self.model_name)
        
        return True
    
    def _get_medical_system_prompt(self) -> str:
        """Get system prompt for medical AI assistant."""
        return """あなたは日本の医療機関で働く医療AIアシスタントです。以下の役割を担います:

1. 診断支援: 症状や検査結果から考えられる疾患を提案
2. 薬物相互作用チェック: 処方薬の相互作用を確認
3. 検査提案: 症状に応じた適切な検査を提案
4. 治療指針: エビデンスに基づいた治療方針を提案
5. 医学文献検索: 最新の医学情報を提供

重要な注意事項:
- 医師の判断を補助するツールであり、最終診断は医師が行う
- 日本の医療制度、薬事法、診療ガイドラインに準拠
- 患者の安全を最優先に考慮
- 不確実な場合は専門医への相談を推奨
- 個人情報の保護を徹底

回答は簡潔で分かりやすく、医師が迅速に判断できるよう構造化して提供してください。"""
    
    async def diagnose_support(
        self, 
        symptoms: str, 
        patient_age: int, 
        patient_gender: str,
        medical_history: Optional[str] = None,
        lab_results: Optional[str] = None
    ) -> Dict:
        """Provide diagnostic support based on symptoms and patient data."""
        
        await self.ensure_model_available()
        
        prompt = f"""
患者情報:
- 年齢: {patient_age}歳
- 性別: {patient_gender}
- 主訴・症状: {symptoms}
"""
        
        if medical_history:
            prompt += f"- 既往歴: {medical_history}\n"
        
        if lab_results:
            prompt += f"- 検査結果: {lab_results}\n"
        
        prompt += """
上記の患者情報に基づいて、以下の形式で診断支援を提供してください:

1. 考えられる疾患(確率順):
2. 追加で必要な検査:
3. 鑑別診断のポイント:
4. 緊急度の評価:
5. 推奨される初期治療:
"""
        
        async with self.ollama:
            response = await self.ollama.chat(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": self._get_medical_system_prompt()},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,  # Lower temperature for medical accuracy
                max_tokens=2000
            )
            
            return {
                "type": "diagnostic_support",
                "patient_age": patient_age,
                "patient_gender": patient_gender,
                "symptoms": symptoms,
                "response": response.get("message", {}).get("content", ""),
                "timestamp": datetime.now().isoformat()
            }
    
    async def check_drug_interactions(
        self, 
        medications: List[str],
        patient_age: int,
        allergies: Optional[str] = None
    ) -> Dict:
        """Check for drug interactions and contraindications."""
        
        await self.ensure_model_available()
        
        medications_list = "\n".join([f"- {med}" for med in medications])
        
        prompt = f"""
処方薬リスト:
{medications_list}

患者情報:
- 年齢: {patient_age}歳
- アレルギー: {allergies or "なし"}

上記の薬剤について、以下の点を確認してください:

1. 薬物相互作用の有無と重要度:
2. 年齢に応じた用量調整の必要性:
3. アレルギーとの関連:
4. 副作用の注意点:
5. 服用タイミングの推奨:
"""
        
        async with self.ollama:
            response = await self.ollama.chat(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": self._get_medical_system_prompt()},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,  # Very low temperature for safety
                max_tokens=1500
            )
            
            return {
                "type": "drug_interaction_check",
                "medications": medications,
                "patient_age": patient_age,
                "allergies": allergies,
                "response": response.get("message", {}).get("content", ""),
                "timestamp": datetime.now().isoformat()
            }
    
    async def suggest_lab_tests(
        self, 
        symptoms: str, 
        diagnosis: Optional[str] = None,
        purpose: str = "診断"
    ) -> Dict:
        """Suggest appropriate lab tests based on symptoms and diagnosis."""
        
        await self.ensure_model_available()
        
        prompt = f"""
患者の症状: {symptoms}
疑い診断: {diagnosis or "未確定"}
検査目的: {purpose}

上記の情報に基づいて、以下の検査提案を行ってください:

1. 必須検査項目:
2. 推奨検査項目:
3. 各検査の目的と意義:
4. 検査の優先順位:
5. 緊急度の評価:
6. 検査前の注意事項:
"""
        
        async with self.ollama:
            response = await self.ollama.chat(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": self._get_medical_system_prompt()},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                max_tokens=1500
            )
            
            return {
                "type": "lab_test_suggestion",
                "symptoms": symptoms,
                "diagnosis": diagnosis,
                "purpose": purpose,
                "response": response.get("message", {}).get("content", ""),
                "timestamp": datetime.now().isoformat()
            }
    
    async def analyze_lab_results(
        self, 
        lab_results: str,
        patient_age: int,
        patient_gender: str,
        clinical_context: Optional[str] = None
    ) -> Dict:
        """Analyze lab results and provide clinical interpretation."""
        
        await self.ensure_model_available()
        
        prompt = f"""
検査結果:
{lab_results}

患者情報:
- 年齢: {patient_age}歳
- 性別: {patient_gender}
- 臨床状況: {clinical_context or "詳細不明"}

上記の検査結果について、以下の分析を提供してください:

1. 異常値の解釈:
2. 臨床的意義:
3. 考えられる疾患:
4. 追加検査の提案:
5. 経過観察のポイント:
6. 治療方針への示唆:
"""
        
        async with self.ollama:
            response = await self.ollama.chat(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": self._get_medical_system_prompt()},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            return {
                "type": "lab_result_analysis",
                "lab_results": lab_results,
                "patient_age": patient_age,
                "patient_gender": patient_gender,
                "clinical_context": clinical_context,
                "response": response.get("message", {}).get("content", ""),
                "timestamp": datetime.now().isoformat()
            }
    
    async def generate_soap_note(
        self,
        subjective: str,
        objective: str,
        assessment: Optional[str] = None,
        plan: Optional[str] = None
    ) -> Dict:
        """Generate or improve SOAP note format."""
        
        await self.ensure_model_available()
        
        prompt = f"""
SOAP記録の作成支援:

S (Subjective - 主観的情報):
{subjective}

O (Objective - 客観的情報):
{objective}

A (Assessment - 評価):
{assessment or "未記入"}

P (Plan - 計画):
{plan or "未記入"}

上記のSOAP記録について:
1. 各項目の充実化提案
2. 医学的に重要な情報の追加提案
3. 記録の改善点
4. 診療継続性のための留意点
5. 構造化された完成版SOAP記録

を提供してください。
"""
        
        async with self.ollama:
            response = await self.ollama.chat(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": self._get_medical_system_prompt()},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                max_tokens=2000
            )
            
            return {
                "type": "soap_note_generation",
                "input_soap": {
                    "subjective": subjective,
                    "objective": objective,
                    "assessment": assessment,
                    "plan": plan
                },
                "response": response.get("message", {}).get("content", ""),
                "timestamp": datetime.now().isoformat()
            }