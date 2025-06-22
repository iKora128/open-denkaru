'use client';

import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Navigation } from '@/components/layout/Navigation';

interface ProtectedLayoutProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
}

export function ProtectedLayout({ 
  children, 
  requiredRole, 
  requiredPermission 
}: ProtectedLayoutProps) {
  return (
    <AuthGuard 
      requiredRole={requiredRole}
      requiredPermission={requiredPermission}
    >
      <div className="min-h-screen bg-gradient-to-br from-system-gray-50 via-white to-apple-blue/5">
        {/* Navigation */}
        <Navigation />
        
        {/* Main Content with proper top padding for fixed navigation */}
        <div className="pt-16">
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}

export default ProtectedLayout;