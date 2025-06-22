'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Activity, 
  FileText, 
  Settings, 
  Bell, 
  Search,
  Heart,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Shield,
  Clock,
  Stethoscope
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/auth';
import type { CurrentUser } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission, UserRole } from '@/types/user';

interface NavigationProps {
  currentPage?: string;
}

export function Navigation({ currentPage }: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications] = useState(3); // Mock notification count
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use permissions hook for role-based navigation
  const {
    hasPermission,
    hasRole,
    isMedicalStaff,
    isAdminStaff,
    canAccessPatientData,
    canAccessPrescriptions,
    canAccessMedicalRecords,
    canManageUsers,
    canManageSettings,
    getUserInfo
  } = usePermissions();

  // Get current user information
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Auto-detect current page from pathname
  const getCurrentPage = () => {
    if (currentPage) return currentPage;
    
    if (pathname.startsWith('/patients')) return 'patients';
    if (pathname.startsWith('/prescriptions')) return 'prescriptions';
    if (pathname.startsWith('/appointments')) return 'appointments';
    if (pathname.startsWith('/records')) return 'records';
    if (pathname.startsWith('/settings')) return 'settings';
    if (pathname.startsWith('/dashboard')) return 'dashboard';
    
    return 'dashboard';
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect even if API call fails
      router.push('/login');
    }
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsMobileMenuOpen(false);
  };

  const getUserInitials = (fullName?: string) => {
    if (!fullName) return '?';
    const names = fullName.split(' ');
    if (names.length >= 2) {
      const first = names[0]?.[0] || '';
      const second = names[1]?.[0] || '';
      return (first + second).toUpperCase() || '?';
    }
    return fullName[0]?.toUpperCase() || '?';
  };

  const getUserDisplayName = (fullName?: string) => {
    if (!fullName) return 'ユーザー';
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0]} ${names[1]?.[0] || ''}医師`;
    }
    return fullName;
  };

  // Define all navigation items with permission requirements
  const allNavigationItems = [
    {
      id: 'dashboard',
      label: 'ダッシュボード',
      icon: Activity,
      href: '/dashboard',
      description: '概要とアクティビティ',
      // Dashboard is accessible to all authenticated users
      show: true
    },
    {
      id: 'patients',
      label: '患者管理',
      icon: Users,
      href: '/patients',
      description: '患者情報の管理',
      show: canAccessPatientData()
    },
    {
      id: 'prescriptions',
      label: '処方箋',
      icon: FileText,
      href: '/prescriptions',
      description: '処方箋の作成・管理',
      show: canAccessPrescriptions()
    },
    {
      id: 'appointments',
      label: '予約管理',
      icon: Calendar,
      href: '/appointments',
      description: '診療予約とスケジュール',
      show: hasPermission(Permission.READ_APPOINTMENT)
    },
    {
      id: 'records',
      label: 'カルテ',
      icon: Stethoscope,
      href: '/records',
      description: '診療記録の管理',
      show: canAccessMedicalRecords()
    },
    {
      id: 'users',
      label: 'ユーザー管理',
      icon: Shield,
      href: '/users',
      description: 'ユーザーとアクセス権限の管理',
      show: canManageUsers()
    },
    {
      id: 'settings',
      label: '設定',
      icon: Settings,
      href: '/settings',
      description: 'システム設定',
      show: canManageSettings() || isAdminStaff()
    }
  ];

  // Filter navigation items based on permissions
  const navigationItems = allNavigationItems.filter(item => item.show);

  const currentPageId = getCurrentPage();

  return (
    <>
      {/* Main Navigation Bar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo and Brand */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl glass-accent flex items-center justify-center">
                  <Heart className="w-5 h-5 text-medical-error" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-system-gray-900 dark:text-white">
                    Open Denkaru
                  </h1>
                  <p className="text-xs text-system-gray-600 dark:text-system-gray-400">
                    電子カルテシステム
                  </p>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? 
                  <X className="w-5 h-5" /> : 
                  <Menu className="w-5 h-5" />
                }
              </Button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const isActive = currentPageId === item.id;
                const Icon = item.icon;
                
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavigation(item.href)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'text-apple-blue bg-apple-blue/10 shadow-sm' 
                        : 'text-system-gray-600 hover:text-system-gray-900 hover:bg-white/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-apple-blue rounded-full"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              
              {/* Search */}
              <div className="hidden lg:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-system-gray-400" />
                <input
                  type="text"
                  placeholder="患者検索..."
                  className="w-64 pl-10 pr-4 py-2 glass-input rounded-xl text-sm
                           focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30
                           transition-all duration-200"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <Button variant="ghost" size="icon-sm" className="relative">
                  <Bell className="w-5 h-5" />
                  {notifications > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-medical-error text-white text-xs 
                               rounded-full flex items-center justify-center font-bold"
                    >
                      {notifications}
                    </motion.span>
                  )}
                </Button>
              </div>

              {/* User Profile Dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/50"
                  disabled={isLoading}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-apple-blue to-apple-purple 
                                flex items-center justify-center text-white font-medium text-sm">
                    {isLoading ? '...' : getUserInitials(user?.full_name)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-system-gray-900">
                      {isLoading ? '読み込み中...' : getUserDisplayName(user?.full_name)}
                    </div>
                    <div className="text-xs text-system-gray-600">
                      {isLoading ? '' : (user?.department || '医療従事者')}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                    isProfileOpen ? 'rotate-180' : ''
                  }`} />
                </Button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-64 glass-card rounded-xl shadow-xl border border-white/10 py-2"
                    >
                      <div className="px-4 py-3 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-apple-blue to-apple-purple 
                                        flex items-center justify-center text-white font-medium">
                            {getUserInitials(user?.full_name)}
                          </div>
                          <div>
                            <div className="font-medium text-system-gray-900">
                              {user?.full_name || 'ユーザー名なし'}
                            </div>
                            <div className="text-sm text-system-gray-600">
                              {user?.department ? `${user.department}・${user.position || ''}` : '医療従事者'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-2">
                        {user?.medical_license_number && (
                          <div className="px-4 py-2 flex items-center gap-3 text-sm text-system-gray-600">
                            <Shield className="w-4 h-4 text-medical-success" />
                            <span>医師免許: {user.medical_license_number}</span>
                          </div>
                        )}
                        <div className="px-4 py-2 flex items-center gap-3 text-sm text-system-gray-600">
                          <Clock className="w-4 h-4 text-apple-blue" />
                          <span>
                            最終ログイン: {user?.last_login_at 
                              ? new Date(user.last_login_at).toLocaleString('ja-JP', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : '情報なし'
                            }
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-white/10 pt-2">
                        <button 
                          className="w-full px-4 py-2 text-left text-sm text-system-gray-700 
                                   hover:bg-white/50 transition-colors"
                          onClick={() => {
                            setIsProfileOpen(false);
                            handleNavigation('/profile');
                          }}
                        >
                          プロフィール設定
                        </button>
                        <button 
                          className="w-full px-4 py-2 text-left text-sm text-system-gray-700 
                                   hover:bg-white/50 transition-colors"
                          onClick={() => {
                            setIsProfileOpen(false);
                            handleNavigation('/security');
                          }}
                        >
                          セキュリティ設定
                        </button>
                        <button 
                          className="w-full px-4 py-2 text-left text-sm text-medical-error 
                                   hover:bg-medical-error/10 transition-colors flex items-center gap-2"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4" />
                          ログアウト
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="absolute left-0 top-0 bottom-0 w-80 glass-card border-r border-white/10 p-4"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                  <div className="w-10 h-10 rounded-xl glass-accent flex items-center justify-center">
                    <Heart className="w-5 h-5 text-medical-error" />
                  </div>
                  <div>
                    <h2 className="font-bold text-system-gray-900">Open Denkaru</h2>
                    <p className="text-sm text-system-gray-600">電子カルテシステム</p>
                  </div>
                </div>

                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-system-gray-400" />
                  <input
                    type="text"
                    placeholder="患者検索..."
                    className="w-full pl-10 pr-4 py-3 glass-input rounded-xl
                             focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30"
                  />
                </div>

                {/* Mobile Navigation Items */}
                <div className="space-y-2">
                  {navigationItems.map((item) => {
                    const isActive = currentPageId === item.id;
                    const Icon = item.icon;
                    
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => handleNavigation(item.href)}
                        whileTap={{ scale: 0.98 }}
                        className={`
                          w-full text-left p-4 rounded-xl transition-all duration-200
                          ${isActive 
                            ? 'bg-apple-blue/10 text-apple-blue' 
                            : 'text-system-gray-700 hover:bg-white/50'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-sm opacity-70">{item.description}</div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close profile dropdown */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </>
  );
}