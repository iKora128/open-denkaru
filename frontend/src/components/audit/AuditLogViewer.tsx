'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Search, 
  Filter,
  User,
  AlertTriangle,
  CheckCircle,
  Activity,
  Download,
  RefreshCw,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { animations } from '@/lib/utils';
import { auditService } from '@/lib/audit';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/types/user';
import type { 
  AuditLog, 
  AuditLogFilter, 
  AuditStats,
  AuditAction,
  AuditSeverity 
} from '@/types/audit';

interface AuditLogViewerProps {
  className?: string;
  showStats?: boolean;
  pageSize?: number;
}

export function AuditLogViewer({ 
  className = '', 
  showStats = true, 
  pageSize = 50 
}: AuditLogViewerProps) {
  // Permission check
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [autoRefresh] = useState(false);
  
  // フィルター状態
  const [filter, setFilter] = useState<AuditLogFilter>({
    page: 1,
    limit: pageSize
  });
  
  // 検索とフィルター
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<AuditAction | ''>('');
  const [severityFilter, setSeverityFilter] = useState<AuditSeverity | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'success' | 'failure' | 'warning' | ''>('');

  // fetchAuditData function
  const fetchAuditData = async () => {
    try {
      setIsLoading(true);

      // Prepare filter with current search parameters
      const searchFilter: AuditLogFilter = {
        ...filter,
        search_query: searchQuery || undefined,
        action: actionFilter || undefined,
        severity: severityFilter || undefined,
        user_name: userFilter || undefined,
        status: statusFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      };

      try {
        // Try to fetch from actual API
        const response = await auditService.getLogs(searchFilter);
        setLogs(response.logs);

        if (showStats) {
          const statsData = await auditService.getStats(
            dateFrom && dateTo ? { from: dateFrom, to: dateTo } : undefined
          );
          setStats(statsData);
        }
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError);
        
        // Fallback to mock data for development
        const mockLogs: AuditLog[] = [
          {
            id: 1,
            user_id: 1,
            user_name: '田中医師',
            user_role: 'doctor',
            action: 'patient_view',
            resource_type: 'patient',
            resource_id: 123,
            details: { patient_name: '山田太郎', view_type: 'full_record' },
            ip_address: '192.168.1.100',
            user_agent: 'Mozilla/5.0...',
            timestamp: new Date().toISOString(),
            session_id: 'session_123',
            severity: 'medium',
            status: 'success'
          },
          {
            id: 2,
            user_id: 1,
            user_name: '田中医師',
            user_role: 'doctor',
            action: 'prescription_create',
            resource_type: 'prescription',
            resource_id: 456,
            details: { medications: ['アスピリン', 'リピトール'], patient_id: 123 },
            ip_address: '192.168.1.100',
            user_agent: 'Mozilla/5.0...',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            session_id: 'session_123',
            severity: 'high',
            status: 'success'
          },
          {
            id: 3,
            user_id: 2,
            user_name: '佐藤看護師',
            user_role: 'nurse',
            action: 'unauthorized_access',
            resource_type: 'prescription',
            resource_id: 456,
            details: { attempted_action: 'prescription_delete', denied_reason: 'insufficient_permissions' },
            ip_address: '192.168.1.101',
            user_agent: 'Mozilla/5.0...',
            timestamp: new Date(Date.now() - 600000).toISOString(),
            session_id: 'session_456',
            severity: 'critical',
            status: 'failure'
          },
          {
            id: 4,
            user_id: 3,
            user_name: '鈴木薬剤師',
            user_role: 'pharmacist',
            action: 'prescription_review',
            resource_type: 'prescription',
            resource_id: 457,
            details: { review_status: 'approved', notes: '用法用量確認済み' },
            ip_address: '192.168.1.102',
            user_agent: 'Mozilla/5.0...',
            timestamp: new Date(Date.now() - 900000).toISOString(),
            session_id: 'session_789',
            severity: 'medium',
            status: 'success'
          },
          {
            id: 5,
            user_id: 4,
            user_name: '山田事務',
            user_role: 'receptionist',
            action: 'data_export',
            resource_type: 'patient',
            resource_id: undefined,
            details: { export_count: 50, export_format: 'csv', reason: '月次レポート' },
            ip_address: '192.168.1.103',
            user_agent: 'Mozilla/5.0...',
            timestamp: new Date(Date.now() - 1200000).toISOString(),
            session_id: 'session_101',
            severity: 'high',
            status: 'success'
          }
        ];

        const mockStats: AuditStats = {
          total_logs: 1250,
          success_rate: 98.5,
          critical_events: 3,
          unique_users: 15,
          top_actions: [
            { action: 'patient_view', count: 450 },
            { action: 'login', count: 280 },
            { action: 'prescription_create', count: 120 },
            { action: 'prescription_review', count: 85 },
            { action: 'data_export', count: 45 }
          ],
          recent_activity: mockLogs.slice(0, 5)
        };

        // Apply client-side filtering for mock data
        let filteredLogs = mockLogs;
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredLogs = filteredLogs.filter(log => 
            log.user_name.toLowerCase().includes(query) ||
            log.action.toLowerCase().includes(query) ||
            JSON.stringify(log.details).toLowerCase().includes(query)
          );
        }
        
        if (actionFilter) {
          filteredLogs = filteredLogs.filter(log => log.action === actionFilter);
        }
        
        if (severityFilter) {
          filteredLogs = filteredLogs.filter(log => log.severity === severityFilter);
        }
        
        if (userFilter) {
          filteredLogs = filteredLogs.filter(log => 
            log.user_name.toLowerCase().includes(userFilter.toLowerCase())
          );
        }
        
        if (statusFilter) {
          filteredLogs = filteredLogs.filter(log => log.status === statusFilter);
        }

        setLogs(filteredLogs);

        if (showStats) {
          setStats(mockStats);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch audit data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // データ取得
  useEffect(() => {
    if (!permissionsLoading) {
      fetchAuditData();
    }
  }, [filter, permissionsLoading, searchQuery, actionFilter, severityFilter, userFilter, statusFilter, dateFrom, dateTo, showStats]);


  // Auto-refresh functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        if (!permissionsLoading) {
          fetchAuditData();
        }
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, permissionsLoading]);

  const handleSearch = () => {
    fetchAuditData();
  };

  const handleReset = () => {
    setSearchQuery('');
    setActionFilter('');
    setSeverityFilter('');
    setDateFrom('');
    setDateTo('');
    setUserFilter('');
    setStatusFilter('');
    setFilter({ page: 1, limit: pageSize });
  };


  const getSeverityColor = (severity: AuditSeverity) => {
    switch (severity) {
      case 'critical': return 'text-medical-error bg-medical-error/10';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-system-gray-600 bg-system-gray-100';
      default: return 'text-system-gray-600 bg-system-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-medical-success bg-medical-success/10';
      case 'failure': return 'text-medical-error bg-medical-error/10';
      case 'warning': return 'text-medical-warning bg-medical-warning/10';
      default: return 'text-system-gray-600 bg-system-gray-100';
    }
  };

  const formatAction = (action: AuditAction) => {
    const actionMap: Record<string, string> = {
      login: 'ログイン',
      logout: 'ログアウト',
      patient_view: '患者閲覧',
      patient_create: '患者登録',
      prescription_create: '処方箋作成',
      unauthorized_access: '不正アクセス試行',
      // 他のアクションも追加
    };
    return actionMap[action] || action;
  };

  const exportLogs = async (format: 'csv' | 'json' | 'pdf' = 'csv') => {
    try {
      setIsExporting(true);
      
      // Log the export action for audit
      await auditService.logDataExport('audit_log', logs.length, {
        export_format: format,
        filters_applied: {
          search_query: searchQuery,
          action_filter: actionFilter,
          severity_filter: severityFilter,
          user_filter: userFilter,
          status_filter: statusFilter,
          date_range: dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : 'all'
        }
      });

      const timestamp = new Date().toISOString().split('T')[0];
      
      if (format === 'csv') {
        const csvHeaders = [
          'タイムスタンプ',
          'ユーザー名',
          'ロール',
          'アクション',
          'リソースタイプ',
          'リソースID',
          'IPアドレス',
          '重要度',
          'ステータス',
          '詳細'
        ].join(',');
        
        const csvContent = [
          csvHeaders,
          ...logs.map(log => [
            log.timestamp,
            log.user_name,
            log.user_role,
            formatAction(log.action),
            log.resource_type,
            log.resource_id || '',
            log.ip_address,
            log.severity,
            log.status,
            `"${JSON.stringify(log.details).replace(/"/g, '""')}"`
          ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${timestamp}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
      
      else if (format === 'json') {
        const jsonData = {
          export_info: {
            exported_at: new Date().toISOString(),
            total_logs: logs.length,
            filters_applied: {
              search_query: searchQuery,
              action_filter: actionFilter,
              severity_filter: severityFilter,
              user_filter: userFilter,
              status_filter: statusFilter,
              date_range: dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : 'all'
            }
          },
          logs: logs
        };
        
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${timestamp}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
      
      else if (format === 'pdf') {
        // PDF export would typically be handled server-side
        // For now, create a simple HTML version for printing
        const htmlContent = `
          <html>
            <head>
              <title>監査ログレポート - ${timestamp}</title>
              <style>
                body { font-family: 'Hiragino Sans', sans-serif; font-size: 12px; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .header { margin-bottom: 20px; }
                .critical { color: #dc3545; }
                .high { color: #fd7e14; }
                .medium { color: #ffc107; }
                .low { color: #6c757d; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>監査ログレポート</h1>
                <p>エクスポート日時: ${new Date().toLocaleString('ja-JP')}</p>
                <p>総ログ数: ${logs.length}</p>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>タイムスタンプ</th>
                    <th>ユーザー</th>
                    <th>アクション</th>
                    <th>リソース</th>
                    <th>重要度</th>
                    <th>ステータス</th>
                  </tr>
                </thead>
                <tbody>
                  ${logs.map(log => `
                    <tr>
                      <td>${new Date(log.timestamp).toLocaleString('ja-JP')}</td>
                      <td>${log.user_name} (${log.user_role})</td>
                      <td>${formatAction(log.action)}</td>
                      <td>${log.resource_type}${log.resource_id ? ` #${log.resource_id}` : ''}</td>
                      <td class="${log.severity}">${log.severity.toUpperCase()}</td>
                      <td>${log.status}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </body>
          </html>
        `;
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${timestamp}.html`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export logs:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Permission check and loading states
  if (permissionsLoading || isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-apple-blue" />
          <span className="text-lg">
            {permissionsLoading ? '権限確認中...' : '監査ログを読み込み中...'}
          </span>
        </div>
      </div>
    );
  }

  if (!hasPermission(Permission.VIEW_AUDIT_LOGS)) {
    return (
      <div className="glass-card p-8 text-center">
        <AlertTriangle className="w-16 h-16 text-medical-warning mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-system-gray-900 mb-2">
          アクセス権限がありません
        </h2>
        <p className="text-system-gray-600">
          監査ログを閲覧する権限がありません。管理者にお問い合わせください。
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 統計情報 */}
      {showStats && stats && (
        <motion.div
          {...animations.slideInUp}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card glass>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-apple-blue/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-apple-blue" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-system-gray-900">
                    {stats.total_logs.toLocaleString()}
                  </div>
                  <div className="text-sm text-system-gray-600">総ログ数</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-medical-success/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-medical-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-system-gray-900">
                    {stats.success_rate}%
                  </div>
                  <div className="text-sm text-system-gray-600">成功率</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-medical-error/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-medical-error" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-system-gray-900">
                    {stats.critical_events}
                  </div>
                  <div className="text-sm text-system-gray-600">重要イベント</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-apple-purple/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-apple-purple" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-system-gray-900">
                    {stats.unique_users}
                  </div>
                  <div className="text-sm text-system-gray-600">アクティブユーザー</div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ユーザー名、アクション、詳細で検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 glass-input rounded-xl"
                  />
                </div>
              </div>

              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value as AuditAction)}
                className="px-3 py-2 glass-input rounded-xl"
              >
                <option value="">全アクション</option>
                <option value="login">ログイン</option>
                <option value="patient_view">患者閲覧</option>
                <option value="prescription_create">処方箋作成</option>
                <option value="unauthorized_access">不正アクセス</option>
              </select>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as AuditSeverity)}
                className="px-3 py-2 glass-input rounded-xl"
              >
                <option value="">全重要度</option>
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="critical">重要</option>
              </select>

              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 glass-input rounded-xl"
              />

              <div className="flex gap-2">
                <Button onClick={handleSearch} size="sm">
                  検索
                </Button>
                <Button onClick={handleReset} variant="outline" size="sm">
                  リセット
                </Button>
                <Button 
                  onClick={() => exportLogs('csv')} 
                  variant="outline" 
                  size="sm"
                  disabled={isExporting}
                >
                  <Download className="w-4 h-4" />
                  {isExporting ? 'エクスポート中...' : 'エクスポート'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ログリスト */}
      <motion.div
        {...animations.slideInUp}
        transition={{ delay: 0.2 }}
      >
        <Card glass>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-apple-blue" />
              監査ログ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border border-system-gray-200 rounded-lg hover:bg-system-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedLog(log);
                    setShowDetails(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                          {log.severity.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </div>
                      
                      <div>
                        <div className="font-medium text-system-gray-900">
                          {formatAction(log.action)}
                        </div>
                        <div className="text-sm text-system-gray-600">
                          {log.user_name} • {log.resource_type}
                          {log.resource_id && ` #${log.resource_id}`}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-system-gray-600">
                        {new Date(log.timestamp).toLocaleString('ja-JP')}
                      </div>
                      <div className="text-xs text-system-gray-500">
                        {log.ip_address}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {logs.length === 0 && (
              <div className="text-center py-8 text-system-gray-500">
                監査ログが見つかりません
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* 詳細モーダル */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-2xl mx-4"
          >
            <Card glass>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>監査ログ詳細</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowDetails(false)}
                  >
                    <EyeOff className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-system-gray-700">アクション</label>
                      <div className="text-system-gray-900">{formatAction(selectedLog.action)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-system-gray-700">ユーザー</label>
                      <div className="text-system-gray-900">{selectedLog.user_name} ({selectedLog.user_role})</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-system-gray-700">タイムスタンプ</label>
                      <div className="text-system-gray-900">
                        {new Date(selectedLog.timestamp).toLocaleString('ja-JP')}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-system-gray-700">IPアドレス</label>
                      <div className="text-system-gray-900">{selectedLog.ip_address}</div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-system-gray-700">詳細情報</label>
                    <pre className="mt-1 p-3 bg-system-gray-50 rounded-lg text-xs overflow-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}