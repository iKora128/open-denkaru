#!/usr/bin/env python3
"""
System verification script to check if all components are working
"""
import os
import sys
import asyncio
import requests
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.core.config import settings


def check_database():
    """Check database connectivity"""
    print("\n🔍 Checking Database Connection...")
    try:
        # Use sync engine for simplicity
        db_url = settings.DATABASE_URL.replace("+asyncpg", "")
        engine = create_engine(db_url)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ Database connected successfully")
            
            # Check if tables exist
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            tables = [row[0] for row in result]
            print(f"📊 Found {len(tables)} tables: {', '.join(tables[:5])}...")
            
            # Check users
            result = conn.execute(text("SELECT COUNT(*) FROM users"))
            user_count = result.scalar()
            print(f"👥 Users in database: {user_count}")
            
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
    return True


def check_backend():
    """Check backend API"""
    print("\n🔍 Checking Backend API...")
    backend_url = "http://localhost:8000"
    
    try:
        # Check health endpoint
        response = requests.get(f"{backend_url}/health", timeout=5)
        if response.status_code == 200:
            print(f"✅ Backend is running at {backend_url}")
            data = response.json()
            print(f"   Service: {data.get('service')}")
            print(f"   Version: {data.get('version')}")
            print(f"   Status: {data.get('status')}")
        else:
            print(f"⚠️  Backend returned status: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to backend at {backend_url}")
        print("   Is the backend server running?")
        print("   Try: cd backend && uv run uvicorn main:app --host 0.0.0.0 --port 8000")
        return False
    except Exception as e:
        print(f"❌ Backend check failed: {e}")
        return False
    return True


def check_frontend():
    """Check frontend"""
    print("\n🔍 Checking Frontend...")
    frontend_url = "http://localhost:3001"
    
    try:
        response = requests.get(frontend_url, timeout=5)
        if response.status_code == 200:
            print(f"✅ Frontend is running at {frontend_url}")
            # Check if it's Next.js
            if 'x-powered-by' in response.headers:
                print(f"   Powered by: {response.headers.get('x-powered-by')}")
        else:
            print(f"⚠️  Frontend returned status: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to frontend at {frontend_url}")
        print("   Is the frontend server running?")
        print("   Try: cd frontend && PORT=3001 npm run dev")
        return False
    except Exception as e:
        print(f"❌ Frontend check failed: {e}")
        return False
    return True


def check_docker():
    """Check Docker services"""
    print("\n🔍 Checking Docker Services...")
    try:
        import subprocess
        result = subprocess.run(
            ["docker", "compose", "ps", "--format", "table"],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            print("✅ Docker Compose services:")
            print(result.stdout)
        else:
            print("⚠️  Docker Compose not running or not installed")
    except Exception as e:
        print(f"⚠️  Cannot check Docker: {e}")


def check_ports():
    """Check if required ports are available"""
    print("\n🔍 Checking Required Ports...")
    ports_to_check = [
        (8000, "Backend API"),
        (3001, "Frontend"),
        (5432, "PostgreSQL"),
        (6379, "Redis")
    ]
    
    import socket
    for port, service in ports_to_check:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('localhost', port))
        sock.close()
        
        if result == 0:
            print(f"✅ Port {port} ({service}) is in use")
        else:
            print(f"⚠️  Port {port} ({service}) is not accessible")


def main():
    """Run all checks"""
    print("=" * 60)
    print("🏥 Open Denkaru System Verification")
    print(f"🕐 Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Check environment
    print(f"\n📁 Working Directory: {os.getcwd()}")
    print(f"🔧 Environment: {os.getenv('ENVIRONMENT', 'Not set')}")
    
    # Run checks
    check_docker()
    check_ports()
    db_ok = check_database()
    backend_ok = check_backend()
    frontend_ok = check_frontend()
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 SUMMARY")
    print("=" * 60)
    
    if db_ok and backend_ok and frontend_ok:
        print("✅ All systems operational!")
        print("\n🌐 You can access the application at: http://localhost:3001")
        print("📚 API documentation at: http://localhost:8000/api/docs")
    else:
        print("❌ Some systems are not running properly")
        print("\n🔧 Quick Start Commands:")
        print("1. Start Docker services:")
        print("   docker compose up -d")
        print("\n2. Start Backend:")
        print("   cd backend")
        print("   uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload")
        print("\n3. Start Frontend:")
        print("   cd frontend")
        print("   PORT=3001 npm run dev")


if __name__ == "__main__":
    main()