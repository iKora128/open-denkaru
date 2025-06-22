// ユーザー管理システムの型定義

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  full_name_kana?: string;
  role: UserRole;
  department?: string;
  position?: string;
  medical_license_number?: string;
  phone_number?: string;
  is_active: boolean;
  is_verified: boolean;
  mfa_enabled: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: number;
  profile_image_url?: string;
  permissions: string[];
  session_count: number;
  password_changed_at?: string;
  password_expires_at?: string;
}

// ユーザーロール定義
export const UserRole = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  PHARMACIST: 'pharmacist',
  TECHNICIAN: 'technician',
  RECEPTIONIST: 'receptionist',
  GUEST: 'guest'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

// ユーザー作成用の型
export interface UserCreate {
  username: string;
  email: string;
  full_name: string;
  full_name_kana?: string;
  role: UserRole;
  department?: string;
  position?: string;
  medical_license_number?: string;
  phone_number?: string;
  password: string;
  permissions?: string[];
}

// ユーザー更新用の型
export interface UserUpdate {
  email?: string;
  full_name?: string;
  full_name_kana?: string;
  role?: UserRole;
  department?: string;
  position?: string;
  medical_license_number?: string;
  phone_number?: string;
  is_active?: boolean;
  permissions?: string[];
}

// パスワード変更用の型
export interface PasswordChangeRequest {
  current_password?: string; // 管理者による変更時は不要
  new_password: string;
  confirm_password: string;
}

// ユーザー検索フィルター
export interface UserFilter {
  search_query?: string;
  role?: UserRole;
  department?: string;
  is_active?: boolean;
  is_verified?: boolean;
  mfa_enabled?: boolean;
  last_login_days?: number; // N日以内のログイン
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'last_login_at' | 'full_name' | 'role';
  sort_order?: 'asc' | 'desc';
}

// 権限定義
export const Permission = {
  // 患者管理
  READ_PATIENT: 'read_patient',
  CREATE_PATIENT: 'create_patient',
  UPDATE_PATIENT: 'update_patient',
  DELETE_PATIENT: 'delete_patient',
  
  // 処方箋管理
  READ_PRESCRIPTION: 'read_prescription',
  CREATE_PRESCRIPTION: 'create_prescription',
  UPDATE_PRESCRIPTION: 'update_prescription',
  DELETE_PRESCRIPTION: 'delete_prescription',
  PRINT_PRESCRIPTION: 'print_prescription',
  
  // 医療記録
  READ_RECORD: 'read_record',
  CREATE_RECORD: 'create_record',
  UPDATE_RECORD: 'update_record',
  DELETE_RECORD: 'delete_record',
  
  // 予約管理
  READ_APPOINTMENT: 'read_appointment',
  CREATE_APPOINTMENT: 'create_appointment',
  UPDATE_APPOINTMENT: 'update_appointment',
  DELETE_APPOINTMENT: 'delete_appointment',
  
  // ユーザー管理
  READ_USER: 'read_user',
  CREATE_USER: 'create_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  MANAGE_PERMISSIONS: 'manage_permissions',
  
  // システム管理
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  MANAGE_BACKUP: 'manage_backup',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  
  // レポート・分析
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',
  
  // AI機能
  USE_AI_ASSISTANT: 'use_ai_assistant',
  CONFIGURE_AI: 'configure_ai'
} as const;

export type Permission = typeof Permission[keyof typeof Permission];

// ロール別デフォルト権限
export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  
  [UserRole.ADMIN]: [
    Permission.READ_PATIENT,
    Permission.CREATE_PATIENT,
    Permission.UPDATE_PATIENT,
    Permission.READ_PRESCRIPTION,
    Permission.CREATE_PRESCRIPTION,
    Permission.UPDATE_PRESCRIPTION,
    Permission.READ_RECORD,
    Permission.CREATE_RECORD,
    Permission.UPDATE_RECORD,
    Permission.READ_APPOINTMENT,
    Permission.CREATE_APPOINTMENT,
    Permission.UPDATE_APPOINTMENT,
    Permission.READ_USER,
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.MANAGE_SETTINGS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.VIEW_REPORTS,
    Permission.USE_AI_ASSISTANT
  ],
  
  [UserRole.DOCTOR]: [
    Permission.READ_PATIENT,
    Permission.CREATE_PATIENT,
    Permission.UPDATE_PATIENT,
    Permission.READ_PRESCRIPTION,
    Permission.CREATE_PRESCRIPTION,
    Permission.UPDATE_PRESCRIPTION,
    Permission.PRINT_PRESCRIPTION,
    Permission.READ_RECORD,
    Permission.CREATE_RECORD,
    Permission.UPDATE_RECORD,
    Permission.READ_APPOINTMENT,
    Permission.CREATE_APPOINTMENT,
    Permission.UPDATE_APPOINTMENT,
    Permission.VIEW_REPORTS,
    Permission.USE_AI_ASSISTANT
  ],
  
  [UserRole.NURSE]: [
    Permission.READ_PATIENT,
    Permission.UPDATE_PATIENT,
    Permission.READ_PRESCRIPTION,
    Permission.READ_RECORD,
    Permission.CREATE_RECORD,
    Permission.UPDATE_RECORD,
    Permission.READ_APPOINTMENT,
    Permission.CREATE_APPOINTMENT,
    Permission.UPDATE_APPOINTMENT,
    Permission.USE_AI_ASSISTANT
  ],
  
  [UserRole.PHARMACIST]: [
    Permission.READ_PATIENT,
    Permission.READ_PRESCRIPTION,
    Permission.UPDATE_PRESCRIPTION,
    Permission.PRINT_PRESCRIPTION,
    Permission.READ_RECORD,
    Permission.READ_APPOINTMENT
  ],
  
  [UserRole.TECHNICIAN]: [
    Permission.READ_PATIENT,
    Permission.READ_RECORD,
    Permission.CREATE_RECORD,
    Permission.UPDATE_RECORD,
    Permission.READ_APPOINTMENT
  ],
  
  [UserRole.RECEPTIONIST]: [
    Permission.READ_PATIENT,
    Permission.CREATE_PATIENT,
    Permission.UPDATE_PATIENT,
    Permission.READ_APPOINTMENT,
    Permission.CREATE_APPOINTMENT,
    Permission.UPDATE_APPOINTMENT
  ],
  
  [UserRole.GUEST]: [
    Permission.READ_PATIENT,
    Permission.READ_APPOINTMENT
  ]
};

// ユーザー統計
export interface UserStats {
  total_users: number;
  active_users: number;
  verified_users: number;
  mfa_enabled_users: number;
  users_by_role: Array<{
    role: UserRole;
    count: number;
  }>;
  recent_logins: number; // 過去24時間
  never_logged_in: number;
}

// セッション情報
export interface UserSession {
  id: string;
  user_id: number;
  ip_address: string;
  user_agent: string;
  created_at: string;
  last_activity_at: string;
  is_current: boolean;
}

// アクティビティログ
export interface UserActivity {
  id: number;
  user_id: number;
  action: string;
  resource_type: string;
  resource_id?: number;
  timestamp: string;
  ip_address: string;
  details: Record<string, any>;
}