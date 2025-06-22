'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Shield, 
  Bell, 
  Database,
  Lock,
  Activity,
  Monitor,
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AuditLogViewer } from '@/components/audit/AuditLogViewer';
import { animations } from '@/lib/utils';
import { auditService } from '@/lib/audit';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'audit' | 'system'>('general');
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 設定状態
  const [settings, setSettings] = useState({
    // 一般設定
    clinic_name: '医療法人 田中クリニック',
    timezone: 'Asia/Tokyo',
    language: 'ja',
    date_format: 'YYYY-MM-DD',
    
    // セキュリティ設定
    session_timeout: 30,
    password_policy: 'strong',
    mfa_required: true,
    audit_retention_days: 365,
    
    // 通知設定
    email_notifications: true,
    security_alerts: true,
    system_maintenance: true,
    
    // システム設定
    backup_enabled: true,
    backup_frequency: 'daily',
    debug_mode: false,
    performance_monitoring: true
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // 実際の実装では API に送信
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 監査ログに記録
      await auditService.log({
        action: 'setting_update',
        resource_type: 'system',
        details: {
          updated_settings: Object.keys(settings),
          setting_count: Object.keys(settings).length
        },
        severity: 'medium'
      });

      setMessage({ type: 'success', text: '設定が正常に保存されました' });
    } catch (error) {
      setMessage({ type: 'error', text: '設定の保存に失敗しました' });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: '一般設定', icon: Settings },
    { id: 'security', label: 'セキュリティ', icon: Shield },
    { id: 'audit', label: '監査ログ', icon: Activity },
    { id: 'system', label: 'システム', icon: Monitor }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <Card glass>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-system-gray-700 mb-2">
              クリニック名
            </label>
            <input
              type="text"
              value={settings.clinic_name}
              onChange={(e) => handleSettingChange('clinic_name', e.target.value)}
              className="w-full px-4 py-3 glass-input rounded-xl"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-system-gray-700 mb-2">
                タイムゾーン
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => handleSettingChange('timezone', e.target.value)}
                className="w-full px-4 py-3 glass-input rounded-xl"
              >
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-system-gray-700 mb-2">
                言語
              </label>
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="w-full px-4 py-3 glass-input rounded-xl"
              >
                <option value="ja">日本語</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-apple-blue" />
            通知設定
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">メール通知</div>
              <div className="text-sm text-system-gray-600">重要な更新をメールで受信</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.email_notifications}
                onChange={(e) => handleSettingChange('email_notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-apple-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-apple-blue"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">セキュリティアラート</div>
              <div className="text-sm text-system-gray-600">不審なアクティビティの通知</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security_alerts}
                onChange={(e) => handleSettingChange('security_alerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-apple-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-apple-blue"></div>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-apple-blue" />
            セキュリティポリシー
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-system-gray-700 mb-2">
              セッションタイムアウト（分）
            </label>
            <input
              type="number"
              min="5"
              max="480"
              value={settings.session_timeout}
              onChange={(e) => handleSettingChange('session_timeout', parseInt(e.target.value))}
              className="w-full px-4 py-3 glass-input rounded-xl"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-system-gray-700 mb-2">
              パスワードポリシー
            </label>
            <select
              value={settings.password_policy}
              onChange={(e) => handleSettingChange('password_policy', e.target.value)}
              className="w-full px-4 py-3 glass-input rounded-xl"
            >
              <option value="basic">基本（8文字以上）</option>
              <option value="strong">強力（12文字以上、記号必須）</option>
              <option value="enterprise">企業レベル（16文字以上、複雑性必須）</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">多要素認証（MFA）必須</div>
              <div className="text-sm text-system-gray-600">全ユーザーにMFAを強制</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.mfa_required}
                onChange={(e) => handleSettingChange('mfa_required', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-apple-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-apple-blue"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card glass>
        <CardHeader>
          <CardTitle>監査ログ設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-system-gray-700 mb-2">
              ログ保存期間（日）
            </label>
            <input
              type="number"
              min="30"
              max="2555"
              value={settings.audit_retention_days}
              onChange={(e) => handleSettingChange('audit_retention_days', parseInt(e.target.value))}
              className="w-full px-4 py-3 glass-input rounded-xl"
            />
            <div className="text-sm text-system-gray-600 mt-1">
              法的要件に従い、最低365日の保存を推奨
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAuditSettings = () => (
    <div className="space-y-6">
      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-apple-blue" />
              監査ログ管理
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAuditLogs(!showAuditLogs)}
              leftIcon={showAuditLogs ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            >
              {showAuditLogs ? 'ログを非表示' : 'ログを表示'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-system-gray-50 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-apple-blue" />
              <span className="font-medium">監査ログについて</span>
            </div>
            <p className="text-sm text-system-gray-700">
              監査ログは、システム内でのすべての重要な操作を記録し、セキュリティと
              コンプライアンスを確保するために使用されます。患者データへのアクセス、
              処方箋の作成、設定変更などがすべて記録されます。
            </p>
          </div>

          {showAuditLogs && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <AuditLogViewer showStats={true} pageSize={20} />
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Database className="w-5 h-5 text-apple-blue" />
            バックアップ設定
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">自動バックアップ</div>
              <div className="text-sm text-system-gray-600">定期的なデータバックアップを有効化</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.backup_enabled}
                onChange={(e) => handleSettingChange('backup_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-apple-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-apple-blue"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-system-gray-700 mb-2">
              バックアップ頻度
            </label>
            <select
              value={settings.backup_frequency}
              onChange={(e) => handleSettingChange('backup_frequency', e.target.value)}
              disabled={!settings.backup_enabled}
              className="w-full px-4 py-3 glass-input rounded-xl disabled:opacity-50"
            >
              <option value="hourly">1時間ごと</option>
              <option value="daily">毎日</option>
              <option value="weekly">毎週</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card glass>
        <CardHeader>
          <CardTitle>開発者設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">デバッグモード</div>
              <div className="text-sm text-system-gray-600">開発用の詳細ログを出力</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.debug_mode}
                onChange={(e) => handleSettingChange('debug_mode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-apple-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-apple-blue"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">パフォーマンス監視</div>
              <div className="text-sm text-system-gray-600">システムパフォーマンスを追跡</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.performance_monitoring}
                onChange={(e) => handleSettingChange('performance_monitoring', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-apple-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-apple-blue"></div>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <AuthGuard requiredPermission="manage_settings">
      <div className="min-h-screen bg-gradient-to-br from-system-gray-50 via-white to-apple-blue/5">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-system-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <motion.div 
              className="flex items-center gap-6"
              {...animations.slideInUp}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center">
                  <Settings className="w-6 h-6 text-apple-blue" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-system-gray-900">
                    システム設定
                  </h1>
                  <p className="text-lg text-system-gray-600">
                    セキュリティ、監査、システム設定の管理
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* タブナビゲーション */}
            <motion.div
              {...animations.slideInUp}
              transition={{ delay: 0.1 }}
              className="lg:w-64"
            >
              <Card glass>
                <CardContent className="p-4">
                  <nav className="space-y-1">
                    {tabs.map((tab) => {
                      const isActive = activeTab === tab.id;
                      const Icon = tab.icon;
                      
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`
                            w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all
                            ${isActive 
                              ? 'bg-apple-blue text-white shadow-sm' 
                              : 'text-system-gray-700 hover:bg-system-gray-100'
                            }
                          `}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </motion.div>

            {/* メインコンテンツ */}
            <motion.div
              {...animations.slideInUp}
              transition={{ delay: 0.2 }}
              className="flex-1"
            >
              {/* メッセージ表示 */}
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                    message.type === 'success' 
                      ? 'bg-medical-success/10 text-medical-success border border-medical-success/20'
                      : 'bg-medical-error/10 text-medical-error border border-medical-error/20'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                  <span>{message.text}</span>
                </motion.div>
              )}

              {/* 設定コンテンツ */}
              {activeTab === 'general' && renderGeneralSettings()}
              {activeTab === 'security' && renderSecuritySettings()}
              {activeTab === 'audit' && renderAuditSettings()}
              {activeTab === 'system' && renderSystemSettings()}

              {/* 保存ボタン */}
              {activeTab !== 'audit' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 flex justify-end"
                >
                  <Button
                    size="lg"
                    loading={isLoading}
                    onClick={handleSaveSettings}
                    leftIcon={<Save className="w-5 h-5" />}
                  >
                    {isLoading ? '保存中...' : '設定を保存'}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}