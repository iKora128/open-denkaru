"""
Create test data for authentication system.
"""
import asyncio
from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.core.security import security
from app.models.user import User, Role, Permission, UserRole, RolePermission


async def create_test_data():
    """Create initial test data for authentication."""
    async with AsyncSessionLocal() as session:
        print("Creating test roles and permissions...")
        
        # Create permissions
        permissions_data = [
            {"name": "read_patient", "resource": "patient", "action": "read", "description": "患者情報を閲覧"},
            {"name": "write_patient", "resource": "patient", "action": "write", "description": "患者情報を作成・編集"},
            {"name": "delete_patient", "resource": "patient", "action": "delete", "description": "患者情報を削除"},
            {"name": "read_prescription", "resource": "prescription", "action": "read", "description": "処方箋を閲覧"},
            {"name": "write_prescription", "resource": "prescription", "action": "write", "description": "処方箋を作成・編集"},
            {"name": "delete_prescription", "resource": "prescription", "action": "delete", "description": "処方箋を削除"},
            {"name": "read_lab_order", "resource": "lab_order", "action": "read", "description": "検査オーダーを閲覧"},
            {"name": "write_lab_order", "resource": "lab_order", "action": "write", "description": "検査オーダーを作成・編集"},
            {"name": "manage_users", "resource": "user", "action": "manage", "description": "ユーザー管理"},
            {"name": "view_audit_logs", "resource": "audit", "action": "read", "description": "監査ログを閲覧"}
        ]
        
        permissions = {}
        for perm_data in permissions_data:
            permission = Permission(
                id=uuid4(),
                name=perm_data["name"],
                resource=perm_data["resource"],
                action=perm_data["action"],
                description=perm_data["description"],
                created_at=datetime.now(timezone.utc)
            )
            session.add(permission)
            permissions[perm_data["name"]] = permission
        
        # Create roles
        roles_data = [
            {
                "name": "doctor",
                "display_name": "医師",
                "description": "医師の役割",
                "permissions": ["read_patient", "write_patient", "read_prescription", "write_prescription", "read_lab_order", "write_lab_order"]
            },
            {
                "name": "nurse",
                "display_name": "看護師",
                "description": "看護師の役割",
                "permissions": ["read_patient", "write_patient", "read_prescription", "read_lab_order"]
            },
            {
                "name": "pharmacist",
                "display_name": "薬剤師",
                "description": "薬剤師の役割",
                "permissions": ["read_patient", "read_prescription"]
            },
            {
                "name": "receptionist",
                "display_name": "受付",
                "description": "受付の役割",
                "permissions": ["read_patient", "write_patient"]
            },
            {
                "name": "admin",
                "display_name": "システム管理者",
                "description": "システム管理者の役割",
                "permissions": list(permissions.keys())
            }
        ]
        
        roles = {}
        for role_data in roles_data:
            role = Role(
                id=uuid4(),
                name=role_data["name"],
                display_name=role_data["display_name"],
                description=role_data["description"],
                created_at=datetime.now(timezone.utc)
            )
            session.add(role)
            roles[role_data["name"]] = role
            
            # Add role-permission associations
            for perm_name in role_data["permissions"]:
                if perm_name in permissions:
                    role_permission = RolePermission(
                        role_id=role.id,
                        permission_id=permissions[perm_name].id
                    )
                    session.add(role_permission)
        
        await session.commit()
        print("Created roles and permissions successfully!")
        
        # Create test users
        print("Creating test users...")
        
        test_users = [
            {
                "username": "admin",
                "email": "admin@open-denkaru.local",
                "password": "AdminPassword123!",
                "full_name": "システム管理者",
                "role": "admin"
            },
            {
                "username": "doctor1",
                "email": "doctor1@open-denkaru.local",
                "password": "DoctorPassword123!",
                "full_name": "田中太郎医師",
                "medical_license_number": "DR001",
                "department": "内科",
                "position": "医師",
                "role": "doctor"
            },
            {
                "username": "nurse1",
                "email": "nurse1@open-denkaru.local",
                "password": "NursePassword123!",
                "full_name": "鈴木花子看護師",
                "medical_license_number": "NS001",
                "department": "内科",
                "position": "看護師",
                "role": "nurse"
            }
        ]
        
        for user_data in test_users:
            # Hash password
            hashed_password = security.hash_password(user_data["password"])
            
            user = User(
                id=uuid4(),
                username=user_data["username"],
                email=user_data["email"],
                hashed_password=hashed_password,
                full_name=user_data["full_name"],
                medical_license_number=user_data.get("medical_license_number"),
                department=user_data.get("department"),
                position=user_data.get("position"),
                is_active=True,
                is_verified=True,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
                password_changed_at=datetime.now(timezone.utc)
            )
            session.add(user)
            
            # Assign role
            if user_data["role"] in roles:
                user_role = UserRole(
                    user_id=user.id,
                    role_id=roles[user_data["role"]].id,
                    assigned_at=datetime.now(timezone.utc)
                )
                session.add(user_role)
        
        await session.commit()
        print("Created test users successfully!")
        
        print("\nTest users created:")
        print("- Username: admin, Password: AdminPassword123!")
        print("- Username: doctor1, Password: DoctorPassword123!")
        print("- Username: nurse1, Password: NursePassword123!")


if __name__ == "__main__":
    asyncio.run(create_test_data())