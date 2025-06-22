export const DosageUnit = {
  MG: "mg",
  G: "g",
  ML: "ml",
  L: "l",
  TABLET: "錠",
  CAPSULE: "カプセル",
  PACKET: "包",
  BOTTLE: "本",
  TUBE: "管",
  SHEET: "シート"
} as const;

export const DosageFrequency = {
  ONCE_DAILY: "1日1回",
  TWICE_DAILY: "1日2回", 
  THREE_TIMES_DAILY: "1日3回",
  FOUR_TIMES_DAILY: "1日4回",
  AS_NEEDED: "頓服",
  BEFORE_MEALS: "食前",
  AFTER_MEALS: "食後",
  BETWEEN_MEALS: "食間",
  BEDTIME: "就寝前"
} as const;

export const PrescriptionStatus = {
  DRAFT: "下書き",
  ACTIVE: "有効",
  COMPLETED: "完了",
  CANCELLED: "取消",
  EXPIRED: "期限切れ"
} as const;

export type DosageUnitType = typeof DosageUnit[keyof typeof DosageUnit];
export type DosageFrequencyType = typeof DosageFrequency[keyof typeof DosageFrequency];
export type PrescriptionStatusType = typeof PrescriptionStatus[keyof typeof PrescriptionStatus];

export interface Medication {
  id: number;
  name: string;
  generic_name?: string;
  code?: string;
  unit: DosageUnitType;
  manufacturer?: string;
  contraindications?: string;
  side_effects?: string;
  interactions?: string;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionItem {
  id: number;
  medication_id: number;
  medication: Medication;
  dosage: number;
  dosage_unit: DosageUnitType;
  frequency: DosageFrequencyType;
  duration_days: number;
  total_amount: number;
  instructions?: string;
}

export interface Prescription {
  id: number;
  patient_id: string;
  prescribed_date: string;
  valid_until: string;
  status: PrescriptionStatusType;
  clinical_info?: string;
  diagnosis?: string;
  notes?: string;
  prescribed_by: string;
  pharmacy_name?: string;
  created_at: string;
  updated_at: string;
  items: PrescriptionItem[];
}

export interface PrescriptionCreate {
  patient_id: string;
  prescribed_date: string;
  valid_until: string;
  status?: PrescriptionStatusType;
  clinical_info?: string;
  diagnosis?: string;
  notes?: string;
  prescribed_by: string;
  pharmacy_name?: string;
  items: PrescriptionItemCreate[];
}

export interface PrescriptionItemCreate {
  medication_id: number;
  dosage: number;
  dosage_unit: DosageUnitType;
  frequency: DosageFrequencyType;
  duration_days: number;
  total_amount: number;
  instructions?: string;
}

export interface DrugInteractionCheck {
  medication_a: string;
  medication_b: string;
  interaction_level: "minor" | "moderate" | "major" | "contraindicated";
  description: string;
  recommendation?: string;
}

export interface PrescriptionValidation {
  prescription_id: number;
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  drug_interactions: DrugInteractionCheck[];
}

export interface PrescriptionFormOutput {
  // Patient Information
  patient_name: string;
  patient_number: string;
  patient_birth_date: string;
  patient_age: number;
  patient_gender: string;
  patient_address: string;
  patient_phone?: string;
  
  // Insurance Information
  insurance_type?: string;
  insurance_number?: string;
  
  // Prescription Information
  prescription_id: number;
  prescribed_date: string;
  valid_until: string;
  prescribed_by: string;
  clinic_name?: string;
  clinic_address?: string;
  clinic_phone?: string;
  
  // Medical Information
  diagnosis?: string;
  clinical_info?: string;
  
  // Medications
  medications: Array<{
    name: string;
    generic_name?: string;
    dosage: number;
    dosage_unit: DosageUnitType;
    frequency: DosageFrequencyType;
    duration_days: number;
    total_amount: number;
    instructions?: string;
    manufacturer?: string;
  }>;
  
  // Additional Information
  notes?: string;
  pharmacy_name?: string;
  
  // Generated Information
  total_medications: number;
  generated_at: string;
}