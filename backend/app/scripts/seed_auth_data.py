"""
Seed authentication data: roles, permissions, and test users.
Run this script after database migration to set up initial authentication data.
"""
import asyncio
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.database import AsyncSessionLocal
from app.core.security import security

# Import all models to ensure proper SQLModel configuration
from app.models.user import (
    User, Role, Permission, UserRole, RolePermission,
    UserCreate
)
from app.models.patient import Patient
from app.models.prescription import Prescription
from app.models.lab_order import LabOrder


# Define roles and their permissions
ROLE_PERMISSIONS = {
    "doctor": {
        "display_name": "医師",
        "description": "医師の全権限",
        "permissions": [
            ("patient", "create"), ("patient", "read"), ("patient", "update"), ("patient", "delete"),
            ("prescription", "create"), ("prescription", "read"), ("prescription", "update"), ("prescription", "delete"),
            ("lab_order", "create"), ("lab_order", "read"), ("lab_order", "update"), ("lab_order", "delete"),
            ("medical_record", "create"), ("medical_record", "read"), ("medical_record", "update"),
            ("ai_assistant", "use"), ("reports", "read"), ("reports", "create")
        ]
    },
    "nurse": {
        "display_name": "看護師",
        "description": "看護師の権限",
        "permissions": [
            ("patient", "read"), ("patient", "update"),
            ("prescription", "read"), ("prescription", "execute"),
            ("lab_order", "read"), ("lab_order", "collect"),
            ("medical_record", "read"), ("medical_record", "update"),
            ("ai_assistant", "use"), ("reports", "read")
        ]
    },
    "pharmacist": {
        "display_name": "薬剤師", 
        "description": "薬剤師の権限",
        "permissions": [
            ("patient", "read"),
            ("prescription", "read"), ("prescription", "verify"), ("prescription", "dispense"),
            ("drug_interaction", "check"),
            ("reports", "read")
        ]
    },
    "receptionist": {
        "display_name": "受付",
        "description": "受付の権限", 
        "permissions": [
            ("patient", "create"), ("patient", "read"), ("patient", "update"),
            ("appointment", "create"), ("appointment", "read"), ("appointment", "update"),
            ("insurance", "check"), ("reports", "read")
        ]
    },
    "admin": {
        "display_name": "システム管理者",
        "description": "システム管理者の全権限",
        "permissions": [
            ("user", "create"), ("user", "read"), ("user", "update"), ("user", "delete"),
            ("role", "create"), ("role", "read"), ("role", "update"), ("role", "delete"),
            ("audit", "read"), ("system", "configure"), ("backup", "create"), ("backup", "restore")
        ]
    }
}

# Test users
TEST_USERS = [
    {
        "username": "admin",
        "email": "admin@opendenkaru.local",
        "password": "AdminPassword123!",
        "full_name": "システム管理者",
        "roles": ["admin"],
        "department": "システム管理",
        "position": "管理者"
    },
    {
        "username": "dr_tanaka",
        "email": "tanaka@opendenkaru.local",
        "password": "DoctorPassword123!",
        "full_name": "田中 健一",
        "roles": ["doctor"],
        "medical_license_number": "12345-67890",
        "department": "内科",
        "position": "主治医"
    },
    {
        "username": "nurse_sato",
        "email": "sato@opendenkaru.local", 
        "password": "NursePassword123!",
        "full_name": "佐藤 美智子",
        "roles": ["nurse"],
        "medical_license_number": "54321-09876",
        "department": "内科",
        "position": "看護師"
    },
    {
        "username": "pharmacy_yamada",
        "email": "yamada@opendenkaru.local",
        "password": "PharmPassword123!",
        "full_name": "山田 薬太郎",
        "roles": ["pharmacist"],
        "medical_license_number": "98765-43210",
        "department": "薬剤部",
        "position": "薬剤師"
    },
    {
        "username": "reception_suzuki",
        "email": "suzuki@opendenkaru.local",
        "password": "ReceptionPass123!",
        "full_name": "鈴木 花子",
        "roles": ["receptionist"],
        "department": "受付",
        "position": "受付担当"
    }
]


async def create_permissions(db: AsyncSession) -> dict:
    """Create all permissions and return mapping."""
    print("Creating permissions...")
    
    permissions_map = {}
    all_permissions = set()
    
    # Collect all unique permissions
    for role_data in ROLE_PERMISSIONS.values():
        for resource, action in role_data["permissions"]:
            all_permissions.add((resource, action))
    
    # Create permissions
    for resource, action in all_permissions:
        perm_name = f"{action}_{resource}"
        
        # Check if permission exists
        result = await db.execute(
            select(Permission).where(Permission.name == perm_name)
        )
        existing_perm = result.scalar_one_or_none()
        
        if not existing_perm:
            permission = Permission(
                name=perm_name,
                resource=resource,
                action=action,
                description=f"{action.title()} {resource} permission"
            )
            db.add(permission)
            await db.flush()
            permissions_map[perm_name] = permission
            print(f"  ✓ Created permission: {perm_name}")
        else:
            permissions_map[perm_name] = existing_perm
            print(f"  - Permission exists: {perm_name}")
    
    await db.commit()
    return permissions_map


async def create_roles(db: AsyncSession, permissions_map: dict) -> dict:
    """Create roles and assign permissions."""
    print("Creating roles...")
    
    roles_map = {}
    
    for role_name, role_data in ROLE_PERMISSIONS.items():
        # Check if role exists
        result = await db.execute(
            select(Role).where(Role.name == role_name)
        )
        existing_role = result.scalar_one_or_none()
        
        if not existing_role:
            role = Role(
                name=role_name,
                display_name=role_data["display_name"],
                description=role_data["description"]
            )
            db.add(role)
            await db.flush()
            roles_map[role_name] = role
            print(f"  ✓ Created role: {role_name} ({role_data['display_name']})")
        else:
            roles_map[role_name] = existing_role
            print(f"  - Role exists: {role_name}")
        
        # Assign permissions to role
        role_obj = roles_map[role_name]
        for resource, action in role_data["permissions"]:
            perm_name = f"{action}_{resource}"
            permission = permissions_map[perm_name]
            
            # Check if role-permission association exists
            result = await db.execute(
                select(RolePermission)
                .where(RolePermission.role_id == role_obj.id)
                .where(RolePermission.permission_id == permission.id)
            )
            existing_assoc = result.scalar_one_or_none()
            
            if not existing_assoc:
                role_permission = RolePermission(
                    role_id=role_obj.id,
                    permission_id=permission.id
                )
                db.add(role_permission)
    
    await db.commit()
    return roles_map


async def create_users(db: AsyncSession, roles_map: dict):
    """Create test users."""
    print("Creating test users...")
    
    for user_data in TEST_USERS:
        # Check if user exists
        result = await db.execute(
            select(User).where(User.username == user_data["username"])
        )
        existing_user = result.scalar_one_or_none()
        
        if not existing_user:
            # Hash password
            hashed_password = security.hash_password(user_data["password"])
            
            user = User(
                username=user_data["username"],
                email=user_data["email"],
                hashed_password=hashed_password,
                full_name=user_data["full_name"],
                medical_license_number=user_data.get("medical_license_number"),
                department=user_data.get("department"),
                position=user_data.get("position"),
                is_active=True,
                is_verified=True,  # Pre-verify test users
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                password_changed_at=datetime.utcnow()
            )
            db.add(user)
            await db.flush()
            
            # Assign roles to user
            for role_name in user_data["roles"]:
                role = roles_map[role_name]
                user_role = UserRole(
                    user_id=user.id,
                    role_id=role.id,
                    assigned_at=datetime.utcnow()
                )
                db.add(user_role)
            
            print(f"  ✓ Created user: {user_data['username']} ({user_data['full_name']})")
            print(f"    Email: {user_data['email']}")
            print(f"    Password: {user_data['password']}")
            print(f"    Roles: {', '.join(user_data['roles'])}")
        else:
            print(f"  - User exists: {user_data['username']}")
    
    await db.commit()


async def main():
    """Main seeding function."""
    print("🌱 Starting authentication data seeding...")
    print("=" * 50)
    
    try:
        async with AsyncSessionLocal() as db:
            # Create permissions
            permissions_map = await create_permissions(db)
            
            # Create roles and assign permissions
            roles_map = await create_roles(db, permissions_map)
            
            # Create test users
            await create_users(db, roles_map)
        
        print("=" * 50)
        print("✅ Authentication data seeding completed successfully!")
        print("\n📋 Test User Credentials:")
        print("-" * 30)
        for user in TEST_USERS:
            print(f"{user['full_name']} ({user['username']})")
            print(f"  Email: {user['email']}")
            print(f"  Password: {user['password']}")
            print(f"  Roles: {', '.join(user['roles'])}")
            print()
            
    except Exception as e:
        print(f"❌ Error during seeding: {str(e)}")
        raise


if __name__ == "__main__":
    asyncio.run(main())