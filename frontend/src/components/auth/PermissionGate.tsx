'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Lock } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission, UserRole } from '@/types/user';

interface PermissionGateProps {
  children: React.ReactNode;
  permissions?: (Permission | string)[];
  roles?: (UserRole | string)[];
  requireAll?: boolean; // If true, requires ALL permissions/roles. If false, requires ANY
  fallback?: React.ReactNode;
  showFallback?: boolean; // Whether to show fallback when access denied
  className?: string;
}

/**
 * PermissionGate component for conditionally rendering content based on user permissions
 */
export function PermissionGate({
  children,
  permissions = [],
  roles = [],
  requireAll = false,
  fallback,
  showFallback = false,
  className,
}: PermissionGateProps) {
  const {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    hasAllRoles,
    isLoading,
    isAuthenticated,
  } = usePermissions();

  // Show loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Shield className="w-5 h-5 text-apple-blue" />
        </motion.div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return showFallback ? (
      <AccessDeniedFallback 
        reason="authentication"
        fallback={fallback}
        className={className}
      />
    ) : null;
  }

  let hasAccess = true;

  // Check permissions
  if (permissions.length > 0) {
    if (requireAll) {
      hasAccess = hasAccess && hasAllPermissions(permissions);
    } else {
      hasAccess = hasAccess && hasAnyPermission(permissions);
    }
  }

  // Check roles
  if (roles.length > 0) {
    if (requireAll) {
      hasAccess = hasAccess && hasAllRoles(roles);
    } else {
      hasAccess = hasAccess && hasAnyRole(roles);
    }
  }

  // Render content or fallback
  if (hasAccess) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Access denied
  return showFallback ? (
    <AccessDeniedFallback 
      reason="permission"
      fallback={fallback}
      className={className}
      requiredPermissions={permissions}
      requiredRoles={roles}
    />
  ) : null;
}

/**
 * Simplified permission check component for single permission
 */
export function HasPermission({
  permission,
  children,
  fallback,
  showFallback = false,
  className,
}: {
  permission: Permission | string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  className?: string;
}) {
  return (
    <PermissionGate
      permissions={[permission]}
      fallback={fallback}
      showFallback={showFallback}
      className={className}
    >
      {children}
    </PermissionGate>
  );
}

/**
 * Simplified role check component for single role
 */
export function HasRole({
  role,
  children,
  fallback,
  showFallback = false,
  className,
}: {
  role: UserRole | string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  className?: string;
}) {
  return (
    <PermissionGate
      roles={[role]}
      fallback={fallback}
      showFallback={showFallback}
      className={className}
    >
      {children}
    </PermissionGate>
  );
}

/**
 * Medical staff only component
 */
export function MedicalStaffOnly({
  children,
  fallback,
  showFallback = false,
  className,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  className?: string;
}) {
  return (
    <PermissionGate
      roles={[UserRole.DOCTOR, UserRole.NURSE, UserRole.PHARMACIST, UserRole.TECHNICIAN]}
      fallback={fallback}
      showFallback={showFallback}
      className={className}
    >
      {children}
    </PermissionGate>
  );
}

/**
 * Admin staff only component
 */
export function AdminStaffOnly({
  children,
  fallback,
  showFallback = false,
  className,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  className?: string;
}) {
  return (
    <PermissionGate
      roles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}
      fallback={fallback}
      showFallback={showFallback}
      className={className}
    >
      {children}
    </PermissionGate>
  );
}

/**
 * Doctor or Nurse only component
 */
export function DoctorOrNurseOnly({
  children,
  fallback,
  showFallback = false,
  className,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  className?: string;
}) {
  return (
    <PermissionGate
      roles={[UserRole.DOCTOR, UserRole.NURSE]}
      fallback={fallback}
      showFallback={showFallback}
      className={className}
    >
      {children}
    </PermissionGate>
  );
}

/**
 * Access denied fallback component
 */
function AccessDeniedFallback({
  reason,
  fallback,
  className,
  requiredPermissions = [],
  requiredRoles = [],
}: {
  reason: 'authentication' | 'permission';
  fallback?: React.ReactNode;
  className?: string;
  requiredPermissions?: (Permission | string)[];
  requiredRoles?: (UserRole | string)[];
}) {
  // If custom fallback provided, use it
  if (fallback) {
    return <div className={className}>{fallback}</div>;
  }

  // Default access denied UI
  const icon = reason === 'authentication' ? AlertTriangle : Lock;
  const Icon = icon;
  
  const message = reason === 'authentication' 
    ? 'ログインが必要です'
    : 'アクセス権限がありません';

  const details = reason === 'permission' && (requiredPermissions.length > 0 || requiredRoles.length > 0)
    ? `必要な権限: ${[...requiredPermissions, ...requiredRoles].join(', ')}`
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`glass-card p-6 text-center space-y-3 ${className}`}
    >
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-system-red/10">
        <Icon className="w-6 h-6 text-system-red" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-system-gray-900">{message}</h3>
        {details && (
          <p className="text-sm text-system-gray-600">{details}</p>
        )}
      </div>
    </motion.div>
  );
}

export default PermissionGate;