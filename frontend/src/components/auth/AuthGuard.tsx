'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Loader2, AlertTriangle } from 'lucide-react';
import { authService, routeGuard } from '@/lib/auth';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission, UserRole } from '@/types/user';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole | string;
  requiredPermission?: Permission | string;
  requiredRoles?: (UserRole | string)[];
  requiredPermissions?: (Permission | string)[];
  requireAll?: boolean; // If true, requires ALL permissions/roles. If false, requires ANY
  fallbackUrl?: string; // URL to redirect on access denied
}

export function AuthGuard({ 
  children, 
  requiredRole, 
  requiredPermission,
  requiredRoles = [],
  requiredPermissions = [],
  requireAll = false,
  fallbackUrl = '/dashboard'
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [denialReason, setDenialReason] = useState<string>('');

  const {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    hasAllRoles,
    isLoading: permissionsLoading,
    currentUser
  } = usePermissions();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if route requires authentication
        if (!routeGuard.requiresAuth(pathname)) {
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // Check basic authentication
        if (!authService.isAuthenticated()) {
          routeGuard.redirectToLogin();
          return;
        }

        // Wait for user data to load
        if (permissionsLoading) {
          return;
        }

        // Get current user data
        if (!currentUser) {
          routeGuard.redirectToLogin();
          return;
        }

        // Compile all required roles and permissions
        const allRequiredRoles = [
          ...(requiredRole ? [requiredRole] : []),
          ...requiredRoles
        ];
        
        const allRequiredPermissions = [
          ...(requiredPermission ? [requiredPermission] : []),
          ...requiredPermissions
        ];

        // Check role requirements
        if (allRequiredRoles.length > 0) {
          const hasRequiredRoles = requireAll
            ? hasAllRoles(allRequiredRoles)
            : hasAnyRole(allRequiredRoles);

          if (!hasRequiredRoles) {
            const rolesText = allRequiredRoles.join(', ');
            const message = requireAll 
              ? `すべてのロールが必要です: ${rolesText}`
              : `いずれかのロールが必要です: ${rolesText}`;
            
            setDenialReason(message);
            setAccessDenied(true);
            setIsLoading(false);
            return;
          }
        }

        // Check permission requirements
        if (allRequiredPermissions.length > 0) {
          const hasRequiredPermissions = requireAll
            ? hasAllPermissions(allRequiredPermissions)
            : hasAnyPermission(allRequiredPermissions);

          if (!hasRequiredPermissions) {
            const permissionsText = allRequiredPermissions.join(', ');
            const message = requireAll 
              ? `すべての権限が必要です: ${permissionsText}`
              : `いずれかの権限が必要です: ${permissionsText}`;
            
            setDenialReason(message);
            setAccessDenied(true);
            setIsLoading(false);
            return;
          }
        }

        setIsAuthenticated(true);
        setAccessDenied(false);
      } catch (error) {
        console.error('Authentication check failed:', error);
        routeGuard.redirectToLogin();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [
    pathname, 
    requiredRole, 
    requiredPermission, 
    requiredRoles,
    requiredPermissions,
    requireAll,
    router,
    permissionsLoading,
    currentUser,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    hasAllRoles
  ]);

  // Loading state
  if (isLoading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-system-gray-50 via-white to-apple-blue/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full glass-card">
            <Shield className="w-8 h-8 text-apple-blue animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-apple-blue" />
              <span className="text-lg font-medium text-system-gray-700">認証確認中...</span>
            </div>
            <p className="text-sm text-system-gray-500">
              セキュリティチェックを実行しています
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Access denied
  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-system-gray-50 via-white to-apple-blue/5 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass-card p-8 text-center space-y-6"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-system-red/10">
            <AlertTriangle className="w-8 h-8 text-system-red" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-system-gray-900">
              アクセス権限がありません
            </h2>
            <p className="text-sm text-system-gray-600">
              {denialReason || 'このページにアクセスする権限がありません。'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(fallbackUrl)}
              className="flex-1 px-4 py-2 bg-apple-blue text-white rounded-lg font-medium hover:bg-apple-blue/90 transition-colors"
            >
              ダッシュボードに戻る
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.back()}
              className="flex-1 px-4 py-2 bg-system-gray-100 text-system-gray-700 rounded-lg font-medium hover:bg-system-gray-200 transition-colors"
            >
              前のページに戻る
            </motion.button>
          </div>

          {currentUser && (
            <div className="pt-4 border-t border-system-gray-200">
              <p className="text-xs text-system-gray-500">
                ログイン中: {currentUser.full_name} ({currentUser.username})
              </p>
              {currentUser.department && (
                <p className="text-xs text-system-gray-500">
                  部署: {currentUser.department}
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Not authenticated - this should not happen as we redirect to login
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated and authorized - render children
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// Higher-order component for page protection
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requiredRole?: UserRole | string;
    requiredPermission?: Permission | string;
    requiredRoles?: (UserRole | string)[];
    requiredPermissions?: (Permission | string)[];
    requireAll?: boolean;
    fallbackUrl?: string;
  }
) {
  const AuthGuardedComponent = (props: P) => {
    return (
      <AuthGuard 
        requiredRole={options?.requiredRole}
        requiredPermission={options?.requiredPermission}
        requiredRoles={options?.requiredRoles}
        requiredPermissions={options?.requiredPermissions}
        requireAll={options?.requireAll}
        fallbackUrl={options?.fallbackUrl}
      >
        <Component {...props} />
      </AuthGuard>
    );
  };

  AuthGuardedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name})`;
  
  return AuthGuardedComponent;
}

export default AuthGuard;