'use client';

import { useState, useEffect, useMemo } from 'react';
import { authService } from '@/lib/auth';
import { Permission, UserRole, RolePermissions } from '@/types/user';

/**
 * Permission management hook for role-based access control
 */
export function usePermissions() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to get current user:', error);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  const permissions = useMemo(() => {
    if (!currentUser) return [];
    
    // Get permissions from user data (database) and role defaults
    const userPermissions = currentUser.permissions || [];
    const rolePermissions = currentUser.roles?.length > 0 
      ? RolePermissions[currentUser.roles[0] as UserRole] || []
      : [];
    
    // Combine and deduplicate permissions
    return [...new Set([...userPermissions, ...rolePermissions])];
  }, [currentUser]);

  const roles = useMemo(() => {
    return currentUser?.roles || [];
  }, [currentUser]);

  return {
    // User data
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    
    // Permission checks
    permissions,
    roles,
    
    // Permission check functions
    hasPermission: (permission: Permission | string) => permissions.includes(permission),
    hasAnyPermission: (permissionList: (Permission | string)[]) => 
      permissionList.some(permission => permissions.includes(permission)),
    hasAllPermissions: (permissionList: (Permission | string)[]) => 
      permissionList.every(permission => permissions.includes(permission)),
    
    // Role check functions
    hasRole: (role: UserRole | string) => roles.includes(role),
    hasAnyRole: (roleList: (UserRole | string)[]) => 
      roleList.some(role => roles.includes(role)),
    hasAllRoles: (roleList: (UserRole | string)[]) => 
      roleList.every(role => roles.includes(role)),
    
    // Medical staff checks
    isMedicalStaff: () => roles.some(role => [
      UserRole.DOCTOR,
      UserRole.NURSE,
      UserRole.PHARMACIST,
      UserRole.TECHNICIAN
    ].includes(role as UserRole)),
    
    isAdminStaff: () => roles.some(role => [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN
    ].includes(role as UserRole)),
    
    isDoctorOrNurse: () => roles.some(role => [
      UserRole.DOCTOR,
      UserRole.NURSE
    ].includes(role as UserRole)),
    
    // Patient data access checks
    canAccessPatientData: () => permissions.includes(Permission.READ_PATIENT),
    canModifyPatientData: () => permissions.includes(Permission.UPDATE_PATIENT),
    canCreatePatients: () => permissions.includes(Permission.CREATE_PATIENT),
    canDeletePatients: () => permissions.includes(Permission.DELETE_PATIENT),
    
    // Medical record access checks
    canAccessMedicalRecords: () => permissions.includes(Permission.READ_RECORD),
    canModifyMedicalRecords: () => permissions.includes(Permission.UPDATE_RECORD),
    canCreateMedicalRecords: () => permissions.includes(Permission.CREATE_RECORD),
    
    // Prescription access checks
    canAccessPrescriptions: () => permissions.includes(Permission.READ_PRESCRIPTION),
    canCreatePrescriptions: () => permissions.includes(Permission.CREATE_PRESCRIPTION),
    canModifyPrescriptions: () => permissions.includes(Permission.UPDATE_PRESCRIPTION),
    canPrintPrescriptions: () => permissions.includes(Permission.PRINT_PRESCRIPTION),
    
    // Admin access checks
    canManageUsers: () => permissions.includes(Permission.CREATE_USER),
    canViewAuditLogs: () => permissions.includes(Permission.VIEW_AUDIT_LOGS),
    canManageSettings: () => permissions.includes(Permission.MANAGE_SETTINGS),
    canUseAI: () => permissions.includes(Permission.USE_AI_ASSISTANT),
    
    // Department-specific checks
    isInDepartment: (department: string) => currentUser?.department === department,
    hasPosition: (position: string) => currentUser?.position === position,
    
    // Security checks
    hasMfaEnabled: () => currentUser?.mfa_enabled || false,
    hasValidMedicalLicense: () => !!currentUser?.medical_license_number,
    
    // Session info
    getUserInfo: () => ({
      id: currentUser?.id,
      username: currentUser?.username,
      fullName: currentUser?.full_name,
      email: currentUser?.email,
      department: currentUser?.department,
      position: currentUser?.position,
      medicalLicense: currentUser?.medical_license_number,
      lastLogin: currentUser?.last_login_at,
    }),
  };
}

/**
 * Simple permission check hook for specific permission
 */
export function useHasPermission(permission: Permission | string) {
  const { hasPermission, isLoading } = usePermissions();
  return { hasPermission: hasPermission(permission), isLoading };
}

/**
 * Simple role check hook for specific role
 */
export function useHasRole(role: UserRole | string) {
  const { hasRole, isLoading } = usePermissions();
  return { hasRole: hasRole(role), isLoading };
}

/**
 * Medical staff check hook
 */
export function useIsMedicalStaff() {
  const { isMedicalStaff, isLoading } = usePermissions();
  return { isMedicalStaff: isMedicalStaff(), isLoading };
}

/**
 * Admin staff check hook
 */
export function useIsAdminStaff() {
  const { isAdminStaff, isLoading } = usePermissions();
  return { isAdminStaff: isAdminStaff(), isLoading };
}