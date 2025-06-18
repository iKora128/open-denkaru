export enum LabTestCategory {
  BLOOD_CHEMISTRY = "血液生化学",
  HEMATOLOGY = "血液学", 
  IMMUNOLOGY = "免疫学",
  MICROBIOLOGY = "微生物学",
  PATHOLOGY = "病理学",
  RADIOLOGY = "放射線学",
  CARDIOLOGY = "循環器検査",
  RESPIRATORY = "呼吸機能検査",
  NEUROLOGY = "神経検査",
  GASTROENTEROLOGY = "消化器検査",
  ENDOCRINOLOGY = "内分泌学",
  URINE = "尿検査",
  OTHER = "その他"
}

export enum LabOrderStatus {
  DRAFT = "下書き",
  ORDERED = "オーダー済み",
  IN_PROGRESS = "検査中",
  COMPLETED = "完了",
  CANCELLED = "取消"
}

export enum LabOrderPriority {
  ROUTINE = "通常",
  URGENT = "緊急",
  STAT = "至急"
}

export interface LabTest {
  id: number;
  name: string;
  code?: string;
  category: LabTestCategory;
  description?: string;
  sample_type?: string;
  normal_range?: string;
  unit?: string;
  preparation_notes?: string;
  estimated_duration?: number;
  cost?: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface LabOrderItem {
  id: number;
  lab_test_id: number;
  lab_test: LabTest;
  notes?: string;
  urgent: boolean;
  fasting_required: boolean;
  special_instructions?: string;
}

export interface LabOrder {
  id: number;
  patient_id: string;
  ordered_date: string;
  scheduled_date?: string;
  status: LabOrderStatus;
  priority: LabOrderPriority;
  clinical_info?: string;
  diagnosis?: string;
  purpose?: string;
  ordered_by: string;
  department?: string;
  notes?: string;
  fasting_hours?: number;
  preparation_instructions?: string;
  lab_department?: string;
  technician_notes?: string;
  created_at: string;
  updated_at: string;
  items: LabOrderItem[];
}

export interface LabOrderCreate {
  patient_id: string;
  ordered_date: string;
  scheduled_date?: string;
  status?: LabOrderStatus;
  priority?: LabOrderPriority;
  clinical_info?: string;
  diagnosis?: string;
  purpose?: string;
  ordered_by: string;
  department?: string;
  notes?: string;
  fasting_hours?: number;
  preparation_instructions?: string;
  lab_department?: string;
  items: LabOrderItemCreate[];
}

export interface LabOrderItemCreate {
  lab_test_id: number;
  notes?: string;
  urgent?: boolean;
  fasting_required?: boolean;
  special_instructions?: string;
}

export interface LabResult {
  id: number;
  lab_order_item_id: number;
  value?: string;
  unit?: string;
  reference_range?: string;
  abnormal_flag?: string;
  status: string;
  notes?: string;
  performed_date?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LabOrderStats {
  total_orders: number;
  draft_orders: number;
  ordered_orders: number;
  in_progress_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  completion_rate: number;
}