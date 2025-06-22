// 予約管理システムの型定義

export interface Appointment {
  id: number;
  patient_id: number;
  patient_name: string;
  patient_number: string;
  doctor_id: number;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  appointment_type: AppointmentType;
  status: AppointmentStatus;
  priority: AppointmentPriority;
  department: string;
  chief_complaint: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  confirmed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  is_first_visit: boolean;
  insurance_type?: string;
  contact_phone?: string;
  contact_email?: string;
  reminder_sent: boolean;
  check_in_time?: string;
  check_out_time?: string;
}

// 予約タイプ
export const AppointmentType = {
  CONSULTATION: 'consultation',
  FOLLOW_UP: 'follow_up',
  EMERGENCY: 'emergency',
  SURGERY: 'surgery',
  EXAMINATION: 'examination',
  VACCINATION: 'vaccination',
  HEALTH_CHECK: 'health_check',
  THERAPY: 'therapy',
  OTHER: 'other'
} as const;

export type AppointmentType = typeof AppointmentType[keyof typeof AppointmentType];

// 予約ステータス
export const AppointmentStatus = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
  RESCHEDULED: 'rescheduled'
} as const;

export type AppointmentStatus = typeof AppointmentStatus[keyof typeof AppointmentStatus];

// 予約優先度
export const AppointmentPriority = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

export type AppointmentPriority = typeof AppointmentPriority[keyof typeof AppointmentPriority];

// 予約作成用の型
export interface AppointmentCreate {
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  appointment_type: AppointmentType;
  priority?: AppointmentPriority;
  department: string;
  chief_complaint: string;
  notes?: string;
  is_first_visit?: boolean;
  insurance_type?: string;
  contact_phone?: string;
  contact_email?: string;
}

// 予約更新用の型
export interface AppointmentUpdate {
  appointment_date?: string;
  appointment_time?: string;
  duration_minutes?: number;
  appointment_type?: AppointmentType;
  status?: AppointmentStatus;
  priority?: AppointmentPriority;
  department?: string;
  chief_complaint?: string;
  notes?: string;
  cancellation_reason?: string;
}

// 予約検索フィルター
export interface AppointmentFilter {
  patient_id?: number;
  doctor_id?: number;
  department?: string;
  appointment_type?: AppointmentType;
  status?: AppointmentStatus;
  priority?: AppointmentPriority;
  date_from?: string;
  date_to?: string;
  is_first_visit?: boolean;
  search_query?: string;
  page?: number;
  limit?: number;
  sort_by?: 'appointment_date' | 'created_at' | 'patient_name' | 'status';
  sort_order?: 'asc' | 'desc';
}

// 予約統計
export interface AppointmentStats {
  total_appointments: number;
  today_appointments: number;
  upcoming_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  no_show_rate: number;
  average_wait_time: number;
  appointments_by_status: Array<{
    status: AppointmentStatus;
    count: number;
  }>;
  appointments_by_type: Array<{
    type: AppointmentType;
    count: number;
  }>;
  appointments_by_department: Array<{
    department: string;
    count: number;
  }>;
}

// 診療スケジュール
export interface DoctorSchedule {
  doctor_id: number;
  doctor_name: string;
  department: string;
  date: string;
  time_slots: Array<{
    start_time: string;
    end_time: string;
    is_available: boolean;
    is_blocked: boolean;
    appointment_id?: number;
    patient_name?: string;
  }>;
  total_slots: number;
  available_slots: number;
  blocked_slots: number;
}

// 予約確認メール/SMS用の型
export interface AppointmentReminder {
  appointment_id: number;
  patient_email?: string;
  patient_phone?: string;
  reminder_type: 'email' | 'sms' | 'both';
  send_time: string; // 送信予定時刻
  template_type: 'confirmation' | 'reminder_24h' | 'reminder_1h';
  message_content: string;
  sent_at?: string;
  delivery_status: 'pending' | 'sent' | 'delivered' | 'failed';
}

// カレンダー表示用の型
export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  color: string;
  appointment: Appointment;
}

// 予約可能時間枠
export interface AvailableSlot {
  date: string;
  time: string;
  duration_minutes: number;
  doctor_id: number;
  doctor_name: string;
  department: string;
  is_available: boolean;
  conflict_reason?: string;
}

// 待機リスト
export interface WaitingList {
  id: number;
  patient_id: number;
  patient_name: string;
  preferred_date_from: string;
  preferred_date_to: string;
  preferred_time: string;
  appointment_type: AppointmentType;
  priority: AppointmentPriority;
  notes?: string;
  created_at: string;
  notified_at?: string;
  assigned_appointment_id?: number;
}