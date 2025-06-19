#!/usr/bin/env python3
"""
Create test patient data for development.
"""
import asyncio
from datetime import date, datetime
from app.core.database import get_session
from app.models.patient import Patient


async def create_test_patients():
    """Create test patient data."""
    async for session in get_session():
        # Test patient data
        test_patients = [
            {
                "patient_number": "P001",
                "family_name": "田中",
                "given_name": "太郎",
                "family_name_kana": "タナカ",
                "given_name_kana": "タロウ",
                "birth_date": date(1980, 5, 15),
                "gender": "male",
                "phone_number": "03-1234-5678",
                "email": "tanaka@example.com",
                "postal_code": "100-0001",
                "prefecture": "東京都",
                "city": "千代田区",
                "address_line": "丸の内1-1-1",
                "blood_type": "A",
                "allergies": "ペニシリン",
                "insurance_type": "国民健康保険",
                "insurance_number": "12345678901234567890",
                "emergency_contact_name": "田中 花子",
                "emergency_contact_phone": "03-1234-5679",
                "is_active": True
            },
            {
                "patient_number": "P002", 
                "family_name": "佐藤",
                "given_name": "花子",
                "family_name_kana": "サトウ",
                "given_name_kana": "ハナコ",
                "birth_date": date(1992, 8, 22),
                "gender": "female",
                "phone_number": "03-2345-6789",
                "email": "sato@example.com",
                "postal_code": "150-0001",
                "prefecture": "東京都",
                "city": "渋谷区",
                "address_line": "神宮前1-1-1",
                "blood_type": "B",
                "allergies": None,
                "insurance_type": "社会保険",
                "insurance_number": "09876543210987654321",
                "emergency_contact_name": "佐藤 次郎",
                "emergency_contact_phone": "03-2345-6790",
                "is_active": True
            },
            {
                "patient_number": "P003",
                "family_name": "山田",
                "given_name": "次郎", 
                "family_name_kana": "ヤマダ",
                "given_name_kana": "ジロウ",
                "birth_date": date(1975, 12, 10),
                "gender": "male",
                "phone_number": "03-3456-7890",
                "email": "yamada@example.com",
                "postal_code": "160-0023",
                "prefecture": "東京都",
                "city": "新宿区",
                "address_line": "西新宿1-1-1",
                "blood_type": "O",
                "allergies": "カニ、エビ",
                "insurance_type": "国民健康保険",
                "insurance_number": "11111111111111111111",
                "emergency_contact_name": "山田 美咲",
                "emergency_contact_phone": "03-3456-7891",
                "is_active": True
            }
        ]
        
        for patient_data in test_patients:
            patient = Patient(**patient_data)
            session.add(patient)
            
        await session.commit()
        print(f"✅ Created {len(test_patients)} test patients")
        break


if __name__ == "__main__":
    asyncio.run(create_test_patients())