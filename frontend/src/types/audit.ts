// 監査ログシステムの型定義
export interface AuditLog {
  id: number;
  user_id: number;
  user_name: string;
  user_role: string;
  action: AuditAction;
  resource_type: ResourceType;
  resource_id?: number;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  session_id: string;
  severity: AuditSeverity;
  status: 'success' | 'failure' | 'warning';
}

// 監査対象のアクション
export const AuditAction = {
  // 認証関連
  LOGIN: 'login',
  LOGOUT: 'logout',
  LOGIN_FAILED: 'login_failed',
  PASSWORD_CHANGE: 'password_change',
  
  // 患者関連
  PATIENT_VIEW: 'patient_view',
  PATIENT_CREATE: 'patient_create',
  PATIENT_UPDATE: 'patient_update',
  PATIENT_DELETE: 'patient_delete',
  PATIENT_SEARCH: 'patient_search',
  
  // 処方箋関連
  PRESCRIPTION_VIEW: 'prescription_view',
  PRESCRIPTION_CREATE: 'prescription_create',
  PRESCRIPTION_UPDATE: 'prescription_update',
  PRESCRIPTION_DELETE: 'prescription_delete',
  PRESCRIPTION_PRINT: 'prescription_print',
  PRESCRIPTION_REVIEW: 'prescription_review',
  
  // カルテ関連
  RECORD_VIEW: 'record_view',
  RECORD_CREATE: 'record_create',
  RECORD_UPDATE: 'record_update',
  RECORD_DELETE: 'record_delete',
  RECORD_EDIT: 'record_edit',
  
  // 予約関連
  APPOINTMENT_VIEW: 'appointment_view',
  APPOINTMENT_CREATE: 'appointment_create',
  APPOINTMENT_UPDATE: 'appointment_update',
  APPOINTMENT_DELETE: 'appointment_delete',
  
  // システム関連
  SETTING_VIEW: 'setting_view',
  SETTING_UPDATE: 'setting_update',
  USER_MANAGEMENT: 'user_management',
  PAGE_VIEW: 'page_view',
  SYSTEM_BACKUP: 'system_backup',
  SYSTEM_RESTORE: 'system_restore',
  
  // セキュリティ関連
  SECURITY_VIOLATION: 'security_violation',
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  DATA_EXPORT: 'data_export',
  DATA_IMPORT: 'data_import'
} as const;

export type AuditAction = typeof AuditAction[keyof typeof AuditAction];

// 監査対象のリソース
export const ResourceType = {
  USER: 'user',
  PATIENT: 'patient',
  PRESCRIPTION: 'prescription',
  RECORD: 'record',
  APPOINTMENT: 'appointment',
  SETTING: 'setting',
  SYSTEM: 'system',
  AUDIT_LOG: 'audit_log'
} as const;

export type ResourceType = typeof ResourceType[keyof typeof ResourceType];

// 監査ログの重要度
export const AuditSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

export type AuditSeverity = typeof AuditSeverity[keyof typeof AuditSeverity];

// 監査ログ作成用の型
export interface AuditLogCreate {
  action: AuditAction;
  resource_type: ResourceType;
  resource_id?: number;
  details?: Record<string, any>;
  severity?: AuditSeverity;
  status?: 'success' | 'failure' | 'warning';
}

// 監査ログ検索フィルター
export interface AuditLogFilter {
  user_id?: number;
  user_name?: string;
  action?: AuditAction;
  resource_type?: ResourceType;
  severity?: AuditSeverity;
  status?: 'success' | 'failure' | 'warning';
  date_from?: string;
  date_to?: string;
  search_query?: string;
  page?: number;
  limit?: number;
}

// 監査ログ統計
export interface AuditStats {
  total_logs: number;
  success_rate: number;
  critical_events: number;
  unique_users: number;
  top_actions: Array<{
    action: AuditAction;
    count: number;
  }>;
  recent_activity: AuditLog[];
}