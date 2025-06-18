export interface SOAPRecord {
  id?: number;
  patient_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  
  // SOAP Structure
  subjective: string;    // S: 主観的情報 (患者の主訴、現病歴)
  objective: string;     // O: 客観的情報 (身体所見、検査結果)
  assessment: string;    // A: 評価 (診断、病状評価)
  plan: string;         // P: 計画 (治療計画、フォローアップ)
  
  // Additional fields
  visit_date: string;
  visit_type: 'initial' | 'follow_up' | 'emergency' | 'consultation';
  chief_complaint: string;
  vital_signs?: {
    blood_pressure?: string;
    heart_rate?: number;
    temperature?: number;
    respiratory_rate?: number;
    oxygen_saturation?: number;
    weight?: number;
    height?: number;
  };
  
  // Medical coding
  icd10_codes?: string[];
  severity?: 'mild' | 'moderate' | 'severe' | 'critical';
  
  // Follow-up
  next_visit_date?: string;
  follow_up_instructions?: string;
  
  // Attachments and references
  lab_orders?: number[];
  prescriptions?: number[];
  imaging_orders?: number[];
  
  // Status
  status: 'draft' | 'signed' | 'amended' | 'archived';
  signed_by?: string;
  signed_at?: string;
  
  // Notes
  private_notes?: string;
  billing_notes?: string;
}

export interface MedicalRecordCreate {
  patient_id: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  visit_date: string;
  visit_type: 'initial' | 'follow_up' | 'emergency' | 'consultation';
  chief_complaint: string;
  vital_signs?: {
    blood_pressure?: string;
    heart_rate?: number;
    temperature?: number;
    respiratory_rate?: number;
    oxygen_saturation?: number;
    weight?: number;
    height?: number;
  };
  icd10_codes?: string[];
  severity?: 'mild' | 'moderate' | 'severe' | 'critical';
  next_visit_date?: string;
  follow_up_instructions?: string;
  private_notes?: string;
  billing_notes?: string;
}

export interface VitalSigns {
  blood_pressure?: string;
  heart_rate?: number;
  temperature?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  weight?: number;
  height?: number;
}

export interface ICD10Code {
  code: string;
  description: string;
  category: string;
}