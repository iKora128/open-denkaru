#!/usr/bin/env python3
"""
Simple API test without relationship issues.
"""
import asyncio
from fastapi import FastAPI
from sqlalchemy import text
from app.core.database import engine

app = FastAPI()

@app.get("/api/v1/patients/")
async def get_patients_simple():
    """Get patients using raw SQL to avoid relationship issues."""
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("""
                SELECT 
                    id, patient_number, family_name, given_name, 
                    family_name_kana, given_name_kana, birth_date, gender,
                    phone_number, email, is_active, created_at
                FROM patient 
                WHERE is_active = true 
                ORDER BY created_at DESC 
                LIMIT 10
            """))
            
            patients = []
            for row in result:
                # Calculate age
                from datetime import date
                today = date.today()
                birth_date = row.birth_date
                age = today.year - birth_date.year
                if today < date(today.year, birth_date.month, birth_date.day):
                    age -= 1
                
                patient_dict = {
                    "id": str(row.id),
                    "patient_number": row.patient_number,
                    "family_name": row.family_name,
                    "given_name": row.given_name,
                    "family_name_kana": row.family_name_kana,
                    "given_name_kana": row.given_name_kana,
                    "full_name": f"{row.family_name} {row.given_name}",
                    "full_name_kana": f"{row.family_name_kana} {row.given_name_kana}" if row.family_name_kana and row.given_name_kana else "",
                    "birth_date": row.birth_date.isoformat(),
                    "age": age,
                    "gender": row.gender,
                    "phone_number": row.phone_number,
                    "email": row.email,
                    "is_active": row.is_active,
                    "created_at": row.created_at.isoformat(),
                    "updated_at": row.created_at.isoformat()  # Using created_at for both
                }
                patients.append(patient_dict)
            
            return patients
            
    except Exception as e:
        return {"error": str(e)}

@app.get("/health")
async def health_check():
    """Simple health check."""
    return {"status": "ok", "message": "Simple API working"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)