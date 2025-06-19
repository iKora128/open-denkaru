#!/usr/bin/env python3
import asyncio
from app.core.database import engine

async def test_db_connection():
    try:
        async with engine.connect() as conn:
            print("✅ Database connection successful!")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    asyncio.run(test_db_connection())