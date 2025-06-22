"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { Block } from "@blocknote/core";
import { 
  ArrowLeft,
  Edit,
  Download,
  Share,
  Clock,
  User,
  Stethoscope,
  Heart,
  FileText,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function RecordViewPage() {
  const router = useRouter();
  const params = useParams();
  const recordId = params.id as string;
  
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        signed_by: 1,
        signed_at: '2024-06-22T09:30:00Z',
        is_final: true
      };

      setRecord(mockRecord);

      // 監査ログに記録
      await auditService.logPatientAccess(
        'record_view',
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

  const handleEdit = () => {
    router.push(`/records/${recordId}/edit`);
  };

  const handleDownload = async () => {
    try {
      // PDF出力の実装
      console.log('TODO: Implement PDF export for record', recordId);
      
      // 監査ログに記録
      if (record) {
        await auditService.log({
          action: 'data_export',
          resource_type: 'record',
          resource_id: parseInt(recordId),
          details: {
            export_type: 'pdf',
            patient_name: record.patient.full_name,
            record_date: record.visit_date
          },
          severity: 'medium'
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const formatVitalSigns = (vitals: any) => {
    if (!vitals) return '記録なし';
    
    const parts = [];
    if (vitals.blood_pressure_systolic && vitals.blood_pressure_diastolic) {
      parts.push(`血圧: ${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic} mmHg`);
    }
    if (vitals.heart_rate) {
      parts.push(`心拍数: ${vitals.heart_rate} bpm`);
    }
    if (vitals.temperature) {
      parts.push(`体温: ${vitals.temperature}°C`);
    }
    if (vitals.weight) {
      parts.push(`体重: ${vitals.weight}kg`);
    }
    if (vitals.height) {
      parts.push(`身長: ${vitals.height}cm`);
    }
    if (vitals.oxygen_saturation) {
      parts.push(`SpO2: ${vitals.oxygen_saturation}%`);
    }
    
    return parts.join(', ');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'severe': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'mild': return '軽症';
      case 'moderate': return '中等症';
      case 'severe': return '重症';
      case 'critical': return '最重症';
      default: return '不明';
    }
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

  if (error || !record) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="border-medical-error bg-medical-error/5 max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-medical-error mx-auto mb-4" />
            <h2 className="text-xl font-bold text-medical-error mb-2">
              カルテの取得に失敗しました
            </h2>
            <p className="text-medical-error mb-4">
              {error || 'カルテが見つかりません'}
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

  return (
    <AuthGuard requiredPermission="read_record">
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
                    <Stethoscope className="w-6 h-6 text-apple-blue" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-system-gray-900">
                      診療記録詳細
                    </h1>
                    <p className="text-lg text-system-gray-600">
                      {record.patient.full_name} 様 - {new Date(record.visit_date).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(record.severity)}`}>
                  {getSeverityText(record.severity)}
                </div>
                
                {record.is_final && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                    <CheckCircle className="w-4 h-4" />
                    確定済み
                  </div>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  PDF出力
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Share className="w-4 h-4" />}
                >
                  共有
                </Button>
                
                <Button
                  size="sm"
                  onClick={handleEdit}
                  leftIcon={<Edit className="w-4 h-4" />}
                >
                  編集
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Patient Information */}
          <motion.div
            {...animations.slideInUp}
            className="mb-8"
          >
            <Card className="glass-card border-l-4 border-l-apple-blue">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
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
                  
                  <div className="text-right text-sm text-system-gray-600">
                    <div>診療日: {new Date(record.visit_date).toLocaleDateString('ja-JP')}</div>
                    <div>担当医: {record.attending_physician}</div>
                    <div>診療科: {record.department}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Record Metadata */}
          <motion.div
            {...animations.slideInUp}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-apple-blue/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-apple-blue" />
                    </div>
                    <div>
                      <div className="text-sm text-system-gray-600">診療区分</div>
                      <div className="text-lg font-semibold text-system-gray-900">
                        {record.visit_type === 'initial' && '初診'}
                        {record.visit_type === 'follow_up' && '再診'}
                        {record.visit_type === 'emergency' && '救急'}
                        {record.visit_type === 'consultation' && 'コンサルト'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-medical-success/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-medical-success" />
                    </div>
                    <div>
                      <div className="text-sm text-system-gray-600">主訴</div>
                      <div className="text-lg font-semibold text-system-gray-900">
                        {record.chief_complaint}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-apple-purple/10 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-apple-purple" />
                    </div>
                    <div>
                      <div className="text-sm text-system-gray-600">作成日時</div>
                      <div className="text-lg font-semibold text-system-gray-900">
                        {new Date(record.created_at).toLocaleString('ja-JP')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Vital Signs */}
          {record.vital_signs && (
            <motion.div
              {...animations.slideInUp}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-red-500" />
                    バイタルサイン
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-system-gray-700">
                    {formatVitalSigns(record.vital_signs)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* BlockNote Editor (Read-only) */}
          <motion.div
            {...animations.slideInUp}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <MedicalBlockEditor
              patient={record.patient}
              initialContent={record.blocks_data}
              readOnly={true}
              className="w-full"
            />
          </motion.div>

          {/* Additional Information */}
          {(record.private_notes || record.billing_notes) && (
            <motion.div
              {...animations.slideInUp}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-apple-blue" />
                    追加情報
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {record.private_notes && (
                      <div>
                        <div className="font-medium text-system-gray-700 mb-2">
                          プライベートメモ
                        </div>
                        <div className="text-system-gray-600 p-3 bg-system-gray-50 rounded-lg">
                          {record.private_notes}
                        </div>
                      </div>
                    )}
                    
                    {record.billing_notes && (
                      <div>
                        <div className="font-medium text-system-gray-700 mb-2">
                          請求メモ
                        </div>
                        <div className="text-system-gray-600 p-3 bg-system-gray-50 rounded-lg">
                          {record.billing_notes}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Record History */}
          <motion.div
            {...animations.slideInUp}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-apple-blue" />
                  更新履歴
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-system-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-system-gray-900">
                        カルテ作成
                      </div>
                      <div className="text-sm text-system-gray-600">
                        作成者: {record.attending_physician}
                      </div>
                    </div>
                    <div className="text-sm text-system-gray-600">
                      {new Date(record.created_at).toLocaleString('ja-JP')}
                    </div>
                  </div>
                  
                  {record.signed_at && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium text-green-900">
                          カルテ確定・署名
                        </div>
                        <div className="text-sm text-green-600">
                          署名者: {record.attending_physician}
                        </div>
                      </div>
                      <div className="text-sm text-green-600">
                        {new Date(record.signed_at).toLocaleString('ja-JP')}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
}