'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Shield,
  UserCheck,
  Eye,
  MoreVertical,
  Download,
  RefreshCw,
  Clock
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { animations } from '@/lib/utils';
import { auditService } from '@/lib/audit';
import type { 
  User, 
  UserFilter, 
  UserStats, 
  UserRole
} from '@/types/user';
import { RolePermissions } from '@/types/user';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  
  // フィルター状態
  const [filter, setFilter] = useState<UserFilter>({
    page: 1,
    limit: 20,
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'unverified'>('all');
  
  // Modal states - TODO: Implement user detail modal and create user modal
  // const [showCreateModal, setShowCreateModal] = useState(false);
  // const [selectedUser, setSelectedUser] = useState<User | null>(null);
  // const [showUserDetail, setShowUserDetail] = useState(false);

  // データ取得
  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 実際の実装では API から取得
      // 開発中はモックデータを使用
      const mockUsers: User[] = [
        {
          id: 1,
          username: 'dr.tanaka',
          email: 'tanaka@clinic.com',
          full_name: '田中 一郎',
          full_name_kana: 'タナカ イチロウ',
          role: 'doctor',
          department: '内科',
          position: '主任医師',
          medical_license_number: 'MD123456',
          phone_number: '03-1234-5678',
          is_active: true,
          is_verified: true,
          mfa_enabled: true,
          last_login_at: new Date().toISOString(),
          created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
          updated_at: new Date().toISOString(),
          permissions: RolePermissions.doctor,
          session_count: 2,
          password_changed_at: new Date(Date.now() - 86400000 * 15).toISOString()
        },
        {
          id: 2,
          username: 'nurse.sato',
          email: 'sato@clinic.com',
          full_name: '佐藤 花子',
          full_name_kana: 'サトウ ハナコ',
          role: 'nurse',
          department: '看護部',
          position: '主任看護師',
          phone_number: '03-1234-5679',
          is_active: true,
          is_verified: true,
          mfa_enabled: false,
          last_login_at: new Date(Date.now() - 3600000).toISOString(),
          created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
          updated_at: new Date().toISOString(),
          permissions: RolePermissions.nurse,
          session_count: 1,
          password_changed_at: new Date(Date.now() - 86400000 * 45).toISOString()
        },
        {
          id: 3,
          username: 'admin.yamada',
          email: 'yamada@clinic.com',
          full_name: '山田 太郎',
          full_name_kana: 'ヤマダ タロウ',
          role: 'admin',
          department: '管理部',
          position: 'システム管理者',
          phone_number: '03-1234-5680',
          is_active: true,
          is_verified: true,
          mfa_enabled: true,
          last_login_at: new Date(Date.now() - 7200000).toISOString(),
          created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
          updated_at: new Date().toISOString(),
          permissions: RolePermissions.admin,
          session_count: 0,
          password_changed_at: new Date(Date.now() - 86400000 * 10).toISOString()
        }
      ];

      const mockStats: UserStats = {
        total_users: 12,
        active_users: 10,
        verified_users: 11,
        mfa_enabled_users: 8,
        users_by_role: [
          { role: 'doctor', count: 4 },
          { role: 'nurse', count: 5 },
          { role: 'admin', count: 2 },
          { role: 'receptionist', count: 1 }
        ],
        recent_logins: 8,
        never_logged_in: 1
      };

      setUsers(mockUsers);
      setStats(mockStats);

      // 監査ログに記録
      await auditService.log({
        action: 'page_view',
        resource_type: 'user',
        details: {
          filter_applied: filter,
          result_count: mockUsers.length
        },
        severity: 'low'
      });
      
    } catch (err: any) {
      setError(err.message || 'ユーザー情報の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    const newFilter: UserFilter = {
      ...filter,
      search_query: searchQuery || undefined,
      role: roleFilter || undefined,
      is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
      is_verified: statusFilter === 'unverified' ? false : undefined,
      page: 1
    };
    setFilter(newFilter);
  };

  const handleReset = () => {
    setSearchQuery('');
    setRoleFilter('');
    setStatusFilter('all');
    setFilter({ page: 1, limit: 20, sort_by: 'created_at', sort_order: 'desc' });
  };

  const handleUserAction = async (userId: number, action: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      switch (action) {
        case 'activate':
        case 'deactivate':
          // API 呼び出し
          setUsers(users.map(u => 
            u.id === userId ? { ...u, is_active: action === 'activate' } : u
          ));
          break;
        case 'reset_password':
          // パスワードリセット処理
          break;
        case 'toggle_mfa':
          setUsers(users.map(u => 
            u.id === userId ? { ...u, mfa_enabled: !u.mfa_enabled } : u
          ));
          break;
      }

      // 監査ログに記録
      await auditService.log({
        action: 'user_management',
        resource_type: 'user',
        resource_id: userId,
        details: {
          action_type: action,
          target_user: user.full_name,
          action_performed: action
        },
        severity: 'medium'
      });

    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    }
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      super_admin: 'text-purple-600 bg-purple-100',
      admin: 'text-red-600 bg-red-100',
      doctor: 'text-blue-600 bg-blue-100',
      nurse: 'text-green-600 bg-green-100',
      pharmacist: 'text-yellow-600 bg-yellow-100',
      technician: 'text-indigo-600 bg-indigo-100',
      receptionist: 'text-pink-600 bg-pink-100',
      guest: 'text-gray-600 bg-gray-100'
    };
    return colors[role] || colors.guest;
  };

  const getRoleLabel = (role: UserRole) => {
    const labels = {
      super_admin: 'スーパー管理者',
      admin: '管理者',
      doctor: '医師',
      nurse: '看護師',
      pharmacist: '薬剤師',
      technician: '技師',
      receptionist: '受付',
      guest: 'ゲスト'
    };
    return labels[role] || role;
  };

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'ログイン履歴なし';
    
    const now = new Date();
    const loginDate = new Date(lastLogin);
    const diffMs = now.getTime() - loginDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return '1時間以内';
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 30) return `${diffDays}日前`;
    return loginDate.toLocaleDateString('ja-JP');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-apple-blue" />
          <span className="text-lg">ユーザー情報を読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard requiredPermission="read_user">
      <div className="min-h-screen bg-gradient-to-br from-system-gray-50 via-white to-apple-blue/5">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-system-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <motion.div 
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
              {...animations.slideInUp}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center">
                    <Users className="w-6 h-6 text-apple-blue" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-system-gray-900">
                      ユーザー管理
                    </h1>
                    <p className="text-lg text-system-gray-600">
                      システムユーザーの管理と権限設定
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={fetchUsers}
                  leftIcon={<RefreshCw className="w-5 h-5" />}
                >
                  更新
                </Button>
                <Button 
                  size="lg" 
                  leftIcon={<Plus className="w-5 h-5" />}
                  onClick={() => console.log('TODO: Implement create user modal')}
                >
                  新規ユーザー
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* 統計情報 */}
          {stats && (
            <motion.div
              {...animations.slideInUp}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <Card glass>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-apple-blue/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-apple-blue" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-system-gray-900">
                        {stats.total_users}
                      </div>
                      <div className="text-sm text-system-gray-600">総ユーザー数</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card glass>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-medical-success/10 flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-medical-success" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-system-gray-900">
                        {stats.active_users}
                      </div>
                      <div className="text-sm text-system-gray-600">アクティブユーザー</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card glass>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-apple-purple/10 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-apple-purple" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-system-gray-900">
                        {stats.mfa_enabled_users}
                      </div>
                      <div className="text-sm text-system-gray-600">MFA有効</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card glass>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-medical-warning/10 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-medical-warning" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-system-gray-900">
                        {stats.recent_logins}
                      </div>
                      <div className="text-sm text-system-gray-600">24時間以内ログイン</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 検索とフィルター */}
          <motion.div
            {...animations.slideInUp}
            transition={{ delay: 0.1 }}
          >
            <Card glass>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Filter className="w-5 h-5 text-apple-blue" />
                  検索・フィルター
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="名前、メールアドレス、ユーザー名で検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 glass-input rounded-xl"
                      />
                    </div>
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as UserRole)}
                    className="px-3 py-2 glass-input rounded-xl"
                  >
                    <option value="">全ロール</option>
                    <option value="doctor">医師</option>
                    <option value="nurse">看護師</option>
                    <option value="admin">管理者</option>
                    <option value="pharmacist">薬剤師</option>
                    <option value="technician">技師</option>
                    <option value="receptionist">受付</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 glass-input rounded-xl"
                  >
                    <option value="all">全ステータス</option>
                    <option value="active">アクティブ</option>
                    <option value="inactive">非アクティブ</option>
                    <option value="unverified">未認証</option>
                  </select>

                  <div className="flex gap-2">
                    <Button onClick={handleSearch} size="sm">
                      検索
                    </Button>
                    <Button onClick={handleReset} variant="outline" size="sm">
                      リセット
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ユーザーリスト */}
          <motion.div
            {...animations.slideInUp}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <Card glass>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>ユーザー一覧</span>
                  <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                    エクスポート
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-system-gray-200 rounded-lg hover:bg-system-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-apple-blue to-apple-purple rounded-full flex items-center justify-center text-white font-medium">
                            {user.full_name[0]}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-system-gray-900">
                                {user.full_name}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                {getRoleLabel(user.role)}
                              </span>
                              {!user.is_active && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium text-red-600 bg-red-100">
                                  非アクティブ
                                </span>
                              )}
                              {user.mfa_enabled && (
                                <Shield className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                            <div className="text-sm text-system-gray-600">
                              {user.email} • {user.department}
                              {user.position && ` • ${user.position}`}
                            </div>
                            <div className="text-xs text-system-gray-500">
                              最終ログイン: {formatLastLogin(user.last_login_at)}
                              {user.session_count > 0 && (
                                <span className="ml-2">
                                  • アクティブセッション: {user.session_count}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => console.log('TODO: Show user detail for', user.full_name)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          <div className="relative group">
                            <Button variant="outline" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                            
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-system-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleUserAction(user.id, user.is_active ? 'deactivate' : 'activate')}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-system-gray-50"
                                >
                                  {user.is_active ? '非アクティブ化' : 'アクティブ化'}
                                </button>
                                <button
                                  onClick={() => handleUserAction(user.id, 'reset_password')}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-system-gray-50"
                                >
                                  パスワードリセット
                                </button>
                                <button
                                  onClick={() => handleUserAction(user.id, 'toggle_mfa')}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-system-gray-50"
                                >
                                  MFA {user.mfa_enabled ? '無効化' : '有効化'}
                                </button>
                                <button
                                  onClick={() => router.push(`/users/${user.id}/edit`)}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-system-gray-50"
                                >
                                  編集
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {users.length === 0 && (
                  <div className="text-center py-8 text-system-gray-500">
                    ユーザーが見つかりません
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
}