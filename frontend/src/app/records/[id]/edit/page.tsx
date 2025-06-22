"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { Block } from "@blocknote/core";
import { 
  ArrowLeft,
  Save,
  Eye,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Calendar,
  Stethoscope,
  User
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { MedicalBlockEditor } from '@/components/medical/MedicalBlockEditor';
import { animations } from '@/lib/utils';
import { auditService } from '@/lib/audit';

interface Patient {
  id: string;
  full_name: string;
  patient_number: string;
  age: number;
  gender: string;
  birth_date: string;
  phone_number?: string;
  allergies?: string;
  medical_history?: string;
}

interface SOAPData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface MedicalRecord {
  id: number;
  patient_id: string;
  patient: Patient;
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
  created_at: string;
  updated_at: string;
  created_by: number;
  signed_by?: number;
  signed_at?: string;
  is_final: boolean;
}

interface MedicalRecordUpdate {
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

export default function RecordEditPage() {
  const router = useRouter();
  const params = useParams();
  const recordId = params.id as string;
  
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form fields
  const [visitType, setVisitType] = useState<'initial' | 'follow_up' | 'emergency' | 'consultation'>('follow_up');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe' | 'critical'>('mild');
  const [department, setDepartment] = useState('');
  const [attendingPhysician, setAttendingPhysician] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');
  const [billingNotes, setBillingNotes] = useState('');

  useEffect(() => {
    fetchRecord();
  }, [recordId]);

  const fetchRecord = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 実際の実装では API から取得
      // 開発中はモックデータを使用
      await new Promise(resolve => setTimeout(resolve, 1000)); // シミュレート

      const mockRecord: MedicalRecord = {
        id: parseInt(recordId),
        patient_id: '1',
        patient: {
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
        visit_date: '2024-06-22',
        visit_type: 'follow_up',
        chief_complaint: '頭痛が3日間続いている',
        subjective: '頭痛が3日間続いている。朝方に特に強く、めまいも伴う。',
        objective: 'BP: 140/90 mmHg, HR: 80 bpm, 体温: 36.8°C, 顔面やや紅潮',
        assessment: '高血圧による頭痛の可能性。ストレス関連も考慮。',
        plan: 'ACE阻害薬処方。1週間後再診。生活習慣指導実施。',
        blocks_data: [
          {
            id: '1',
            type: 'heading',
            content: [{ type: 'text', text: '山田太郎 様の診療記録', styles: {} }]
          },
          {
            id: '2',
            type: 'paragraph',
            content: [{ type: 'text', text: '診療日: 2024年6月22日', styles: {} }]
          },
          {
            id: '3',
            type: 'heading',
            content: [{ type: 'text', text: 'S - Subjective (主観的情報)', styles: {} }]
          },
          {
            id: '4',
            type: 'paragraph',
            content: [{ type: 'text', text: '頭痛が3日間続いている。朝方に特に強く、めまいも伴う。服薬の効果は限定的。', styles: {} }]
          },
          {
            id: '5',
            type: 'heading',
            content: [{ type: 'text', text: 'O - Objective (客観的情報)', styles: {} }]
          },
          {
            id: '6',
            type: 'paragraph',
            content: [{ type: 'text', text: 'BP: 140/90 mmHg, HR: 80 bpm, 体温: 36.8°C, 顔面やや紅潮。神経学的異常所見なし。', styles: {} }]
          },
          {
            id: '7',
            type: 'heading',
            content: [{ type: 'text', text: 'A - Assessment (評価)', styles: {} }]
          },
          {
            id: '8',
            type: 'paragraph',
            content: [{ type: 'text', text: '高血圧による頭痛の可能性。ストレス関連も考慮。二次性頭痛は除外。', styles: {} }]
          },
          {
            id: '9',
            type: 'heading',
            content: [{ type: 'text', text: 'P - Plan (計画)', styles: {} }]
          },
          {
            id: '10',
            type: 'paragraph',
            content: [{ type: 'text', text: 'ACE阻害薬処方。1週間後再診。生活習慣指導実施。血圧手帳記録開始。', styles: {} }]
          }
        ] as Block[],
        severity: 'moderate',
        department: '内科',
        attending_physician: '田中医師',
        vital_signs: {
          blood_pressure_systolic: 140,
          blood_pressure_diastolic: 90,
          heart_rate: 80,
          temperature: 36.8,
          weight: 72,
          height: 170,
          oxygen_saturation: 98
        },
        diagnosis_codes: ['I10', 'R51'],
        private_notes: '患者は仕事のストレスが多い。生活習慣の改善が必要。',
        billing_notes: '再診料、血圧測定、生活指導料算定',
        created_at: '2024-06-22T09:00:00Z',
        updated_at: '2024-06-22T09:30:00Z',
        created_by: 1,
        is_final: false
      };

      setRecord(mockRecord);
      
      // フォームフィールドを設定
      setVisitType(mockRecord.visit_type);
      setChiefComplaint(mockRecord.chief_complaint);
      setSeverity(mockRecord.severity);
      setDepartment(mockRecord.department || '');
      setAttendingPhysician(mockRecord.attending_physician || '');
      setPrivateNotes(mockRecord.private_notes || '');
      setBillingNotes(mockRecord.billing_notes || '');

      // 監査ログに記録
      await auditService.logPatientAccess(
        'record_edit',
        parseInt(mockRecord.patient_id),
        {
          record_id: parseInt(recordId),
          patient_name: mockRecord.patient.full_name,
          record_date: mockRecord.visit_date,
          department: mockRecord.department
        }
      );

    } catch (err: any) {
      setError(err.message || 'カルテの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle medical record save
  const handleSave = useCallback(async (blocks: Block[], soapData: SOAPData) => {
    if (!record) {
      setError('カルテ情報が見つかりません');
      return;
    }

    if (!chiefComplaint.trim()) {
      setError('主訴を入力してください');
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const updateData: MedicalRecordUpdate = {
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
      console.log('Updating medical record:', updateData);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 監査ログに記録
      await auditService.log({
        action: 'record_update',
        resource_type: 'record',
        resource_id: parseInt(recordId),
        details: {
          patient_name: record.patient.full_name,
          record_date: record.visit_date,
          changes: updateData,
          updated_fields: Object.keys(updateData)
        },
        severity: 'medium'
      });

      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/records/${recordId}`);
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'カルテの更新に失敗しました');
    } finally {
      setIsSaving(false);
    }
  }, [record, chiefComplaint, visitType, severity, department, attendingPhysician, privateNotes, billingNotes, router, recordId]);

  const handlePreview = () => {
    router.push(`/records/${recordId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-apple-blue" />
          <span className="text-lg">カルテを読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error && !record) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="border-medical-error bg-medical-error/5 max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-medical-error mx-auto mb-4" />
            <h2 className="text-xl font-bold text-medical-error mb-2">
              カルテの取得に失敗しました
            </h2>
            <p className="text-medical-error mb-4">
              {error}
            </p>
            <Button
              variant="outline"
              onClick={() => router.push('/records')}
            >
              カルテ一覧に戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
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
            カルテを更新しました
          </h2>
          <p className="text-system-gray-600">
            カルテ詳細ページに移動しています...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!record) return null;

  return (
    <AuthGuard requiredPermission="update_record">
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
                  onClick={() => router.push(`/records/${recordId}`)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-apple-blue" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-system-gray-900">
                      カルテ編集
                    </h1>
                    <p className="text-lg text-system-gray-600">
                      {record.patient.full_name} 様 - {new Date(record.visit_date).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                  leftIcon={<Eye className="w-4 h-4" />}
                >
                  プレビュー
                </Button>
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

          {/* Patient Summary */}
          <motion.div
            {...animations.slideInUp}
            className="mb-8"
          >
            <Card className="glass-card border-l-4 border-l-apple-blue">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-apple-blue to-apple-purple rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {record.patient.full_name[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-system-gray-900">
                      {record.patient.full_name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-system-gray-600 mt-1">
                      <span>患者番号: {record.patient.patient_number}</span>
                      <span>{record.patient.age}歳 {record.patient.gender}</span>
                      <span>生年月日: {new Date(record.patient.birth_date).toLocaleDateString('ja-JP')}</span>
                    </div>
                    {record.patient.allergies && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium text-medical-warning">アレルギー: </span>
                        <span className="text-medical-warning">{record.patient.allergies}</span>
                      </div>
                    )}
                  </div>
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

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
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
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      担当医
                    </label>
                    <Input
                      value={attendingPhysician}
                      onChange={(e) => setAttendingPhysician(e.target.value)}
                      placeholder="担当医名"
                    />
                  </div>
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
              patient={record.patient}
              initialContent={record.blocks_data}
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
                  <User className="w-5 h-5 text-apple-blue" />
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

          {/* Save Actions */}
          <motion.div
            {...animations.slideInUp}
            transition={{ delay: 0.4 }}
            className="flex justify-end gap-4"
          >
            <Button
              variant="outline"
              onClick={() => router.push(`/records/${recordId}`)}
            >
              キャンセル
            </Button>
            
            <Button
              onClick={() => handleSave(record.blocks_data, {
                subjective: record.subjective,
                objective: record.objective,
                assessment: record.assessment,
                plan: record.plan
              })}
              disabled={isSaving}
              leftIcon={isSaving ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Save className="w-4 h-4" />
                </motion.div>
              ) : (
                <Save className="w-4 h-4" />
              )}
            >
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
}