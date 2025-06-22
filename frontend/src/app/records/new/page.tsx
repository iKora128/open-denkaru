"use client";

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Block } from "@blocknote/core";
import { 
  Plus, 
  Search, 
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Calendar,
  Stethoscope
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { MedicalBlockEditor } from '@/components/medical/MedicalBlockEditor';
import { animations } from '@/lib/utils';

interface Patient {
  id: string;
  full_name: string;
  patient_number: string;
  age: number;
  gender: string;
  birth_date: string;
  phone_number?: string;
  emergency_contact_name?: string;
  allergies?: string;
  medical_history?: string;
}

interface SOAPData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface MedicalRecordCreate {
  patient_id: string;
  visit_date: string;
  visit_type: 'initial' | 'follow_up' | 'emergency' | 'consultation';
  chief_complaint: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  blocks_data: Block[];
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  department?: string;
  attending_physician?: string;
  vital_signs?: Record<string, any>;
  diagnosis_codes?: string[];
  private_notes?: string;
  billing_notes?: string;
}

export default function NewRecordPage() {
  const router = useRouter();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form fields
  const [visitType, setVisitType] = useState<'initial' | 'follow_up' | 'emergency' | 'consultation'>('follow_up');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe' | 'critical'>('mild');
  const [department, setDepartment] = useState('');
  const [attendingPhysician] = useState<string>('');
  const [privateNotes, setPrivateNotes] = useState('');
  const [billingNotes, setBillingNotes] = useState('');

  // Mock patient data - in real app this would come from API
  const mockPatients: Patient[] = [
    {
      id: '1',
      full_name: '山田太郎',
      patient_number: 'P00123',
      age: 45,
      gender: '男性',
      birth_date: '1978-05-15',
      phone_number: '090-1234-5678',
      allergies: 'ペニシリンアレルギー',
      medical_history: '高血圧、糖尿病'
    },
    {
      id: '2', 
      full_name: '佐藤花子',
      patient_number: 'P00124',
      age: 32,
      gender: '女性',
      birth_date: '1991-08-22',
      phone_number: '080-9876-5432',
      allergies: 'なし',
      medical_history: '特記事項なし'
    },
    {
      id: '3',
      full_name: '鈴木一郎',
      patient_number: 'P00125', 
      age: 67,
      gender: '男性',
      birth_date: '1956-12-03',
      phone_number: '070-5555-1234',
      allergies: '造影剤アレルギー',
      medical_history: '心房細動、慢性腎臓病'
    }
  ];

  // Search patients
  const searchPatients = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const results = mockPatients.filter(patient =>
        patient.full_name.includes(query) ||
        patient.patient_number.includes(query) ||
        patient.phone_number?.includes(query)
      );
      
      setSearchResults(results);
    } catch (err) {
      console.error('Patient search failed:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle patient search
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPatients(patientSearchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [patientSearchQuery, searchPatients]);

  // Handle patient selection
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientSearchQuery('');
    setSearchResults([]);
  };

  // Handle medical record save
  const handleSave = useCallback(async (blocks: Block[], soapData: SOAPData) => {
    if (!selectedPatient) {
      setError('患者を選択してください');
      return;
    }

    if (!chiefComplaint.trim()) {
      setError('主訴を入力してください');
      return;
    }

    setError(null);

    try {
      const recordData: MedicalRecordCreate = {
        patient_id: selectedPatient.id,
        visit_date: new Date().toISOString().split('T')[0] as string,
        visit_type: visitType,
        chief_complaint: chiefComplaint,
        subjective: soapData.subjective,
        objective: soapData.objective,
        assessment: soapData.assessment,
        plan: soapData.plan,
        blocks_data: blocks,
        severity,
        department,
        attending_physician: attendingPhysician,
        private_notes: privateNotes,
        billing_notes: billingNotes
      };

      // Simulate API call
      console.log('Creating medical record:', recordData);
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccess(true);
      
      // Redirect to records list after 2 seconds
      setTimeout(() => {
        router.push('/records');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'カルテの作成に失敗しました');
    }
  }, [selectedPatient, chiefComplaint, visitType, severity, department, attendingPhysician, privateNotes, billingNotes, router]);

  if (success) {
    return (
      <AuthGuard requiredPermission="create_record">
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-medical-success rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-system-gray-900 mb-2">
              カルテを作成しました
            </h2>
            <p className="text-system-gray-600">
              カルテ一覧ページに移動しています...
            </p>
          </motion.div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredPermission="create_record">
      <div>
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-system-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <motion.div 
              className="flex items-center justify-between"
              {...animations.slideInUp}
            >
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push('/records')}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center">
                    <Plus className="w-6 h-6 text-apple-blue" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-system-gray-900">
                      新規カルテ作成
                    </h1>
                    <p className="text-lg text-system-gray-600">
                      BlockNote医療記録エディタ
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-sm text-system-gray-500">
                  {new Date().toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="border-medical-error bg-medical-error/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-medical-error" />
                    <span className="text-medical-error font-medium">{error}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Patient Selection */}
          {!selectedPatient && (
            <motion.div
              {...animations.slideInUp}
              className="mb-8"
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-apple-blue" />
                    患者選択
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="患者名、患者番号、電話番号で検索..."
                        value={patientSearchQuery}
                        onChange={(e) => setPatientSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {isSearching && (
                      <div className="text-center py-4 text-system-gray-500">
                        検索中...
                      </div>
                    )}

                    {searchResults.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {searchResults.map((patient) => (
                          <motion.div
                            key={patient.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 border border-system-gray-200 rounded-lg hover:bg-system-gray-50 cursor-pointer transition-colors"
                            onClick={() => handlePatientSelect(patient)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-apple-blue to-apple-purple rounded-full flex items-center justify-center text-white font-medium">
                                {patient.full_name[0]}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="font-medium text-system-gray-900">
                                    {patient.full_name}
                                  </span>
                                  <span className="text-sm text-system-gray-600">
                                    ({patient.patient_number})
                                  </span>
                                  <span className="text-sm text-system-gray-600">
                                    {patient.age}歳 {patient.gender}
                                  </span>
                                </div>
                                <div className="text-sm text-system-gray-500">
                                  {patient.allergies && `アレルギー: ${patient.allergies}`}
                                  {patient.medical_history && ` | 既往歴: ${patient.medical_history}`}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {patientSearchQuery && !isSearching && searchResults.length === 0 && (
                      <div className="text-center py-4 text-system-gray-500">
                        該当する患者が見つかりません
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Selected Patient & Record Form */}
          {selectedPatient && (
            <>
              {/* Patient Summary */}
              <motion.div
                {...animations.slideInUp}
                className="mb-8"
              >
                <Card className="glass-card border-l-4 border-l-apple-blue">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-apple-blue to-apple-purple rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {selectedPatient.full_name[0]}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-system-gray-900">
                            {selectedPatient.full_name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-system-gray-600 mt-1">
                            <span>患者番号: {selectedPatient.patient_number}</span>
                            <span>{selectedPatient.age}歳 {selectedPatient.gender}</span>
                            <span>生年月日: {new Date(selectedPatient.birth_date).toLocaleDateString('ja-JP')}</span>
                          </div>
                          {selectedPatient.allergies && (
                            <div className="mt-2 text-sm">
                              <span className="font-medium text-medical-warning">アレルギー: </span>
                              <span className="text-medical-warning">{selectedPatient.allergies}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPatient(null)}
                      >
                        患者変更
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Basic Record Information */}
              <motion.div
                {...animations.slideInUp}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-apple-blue" />
                      診療情報
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          診療区分 *
                        </label>
                        <select
                          value={visitType}
                          onChange={(e) => setVisitType(e.target.value as any)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="initial">初診</option>
                          <option value="follow_up">再診</option>
                          <option value="emergency">救急</option>
                          <option value="consultation">コンサルト</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          重症度
                        </label>
                        <select
                          value={severity}
                          onChange={(e) => setSeverity(e.target.value as any)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="mild">軽症</option>
                          <option value="moderate">中等症</option>
                          <option value="severe">重症</option>
                          <option value="critical">最重症</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          診療科
                        </label>
                        <Input
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          placeholder="例: 内科"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        主訴 *
                      </label>
                      <Input
                        value={chiefComplaint}
                        onChange={(e) => setChiefComplaint(e.target.value)}
                        placeholder="患者の主な訴えを簡潔に記入"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* BlockNote Editor */}
              <motion.div
                {...animations.slideInUp}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <MedicalBlockEditor
                  patient={selectedPatient}
                  onSave={handleSave}
                  className="w-full"
                />
              </motion.div>

              {/* Additional Notes */}
              <motion.div
                {...animations.slideInUp}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Stethoscope className="w-5 h-5 text-apple-blue" />
                      追加情報
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          プライベートメモ
                        </label>
                        <textarea
                          rows={3}
                          value={privateNotes}
                          onChange={(e) => setPrivateNotes(e.target.value)}
                          placeholder="個人的なメモや観察事項"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          請求メモ
                        </label>
                        <textarea
                          rows={3}
                          value={billingNotes}
                          onChange={(e) => setBillingNotes(e.target.value)}
                          placeholder="請求に関する特記事項"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}