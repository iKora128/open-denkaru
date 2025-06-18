export interface Patient {
  id: string;
  patient_number: string;
  family_name: string;
  given_name: string;
  family_name_kana?: string;
  given_name_kana?: string;
  birth_date: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';
  postal_code?: string;
  prefecture?: string;
  city?: string;
  address?: string;
  phone_number?: string;
  email?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  allergies?: string;
  medical_history?: string;
  current_medications?: string;
  insurance_type?: string;
  insurance_number?: string;
  insurance_expiry_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  
  // Computed properties from backend
  full_name: string;
  full_name_kana: string;
  age: number;
  full_address: string;
}

export interface PatientCreate {
  patient_number: string;
  family_name: string;
  given_name: string;
  family_name_kana?: string;
  given_name_kana?: string;
  birth_date: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';
  postal_code?: string;
  prefecture?: string;
  city?: string;
  address?: string;
  phone_number?: string;
  email?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  allergies?: string;
  medical_history?: string;
  current_medications?: string;
  insurance_type?: string;
  insurance_number?: string;
  insurance_expiry_date?: string;
  notes?: string;
}

export interface PatientUpdate {
  family_name?: string;
  given_name?: string;
  family_name_kana?: string;
  given_name_kana?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';
  postal_code?: string;
  prefecture?: string;
  city?: string;
  address?: string;
  phone_number?: string;
  email?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  allergies?: string;
  medical_history?: string;
  current_medications?: string;
  insurance_type?: string;
  insurance_number?: string;
  insurance_expiry_date?: string;
  notes?: string;
}