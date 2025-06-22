"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MedicalRecordCreate, VitalSigns } from '../../types/medical-record';
import { Patient } from '../../types/patient';
import { 
  DocumentTextIcon,
  UserIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface SOAPRecordFormProps {
  patient: Patient;
  onSubmit: (record: MedicalRecordCreate) => void;
  onCancel: () => void;
  className?: string;
}

export function SOAPRecordForm({
  patient,
  onSubmit,
  onCancel,
  className = ''
}: SOAPRecordFormProps) {
  const [formData, setFormData] = useState<Omit<MedicalRecordCreate, 'patient_id'>>({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    visit_date: new Date().toISOString().split('T')[0] || '',
    visit_type: 'follow_up',
    chief_complaint: '',
    vital_signs: {},
    severity: 'mild',
    next_visit_date: '',
    follow_up_instructions: '',
    private_notes: '',
    billing_notes: ''
  });

  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isUsingAI, setIsUsingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string>('');

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.chief_complaint.trim()) {
      errors.push('主訴を入力してください');
    }
    
    if (!formData.subjective.trim()) {
      errors.push('S（主観的情報）を入力してください');
    }
    
    if (!formData.objective.trim()) {
      errors.push('O（客観的情報）を入力してください');
    }
    
    if (!formData.assessment.trim()) {
      errors.push('A（評価）を入力してください');
    }
    
    if (!formData.plan.trim()) {
      errors.push('P（計画）を入力してください');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const record: MedicalRecordCreate = {
      patient_id: patient.id,
      ...formData,
      vital_signs: Object.keys(vitalSigns).length > 0 ? vitalSigns : {}
    };
    
    onSubmit(record);
  };

  const handleAIAssist = async () => {
    setIsUsingAI(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/ai/generate-soap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjective: formData.subjective,
          objective: formData.objective,
          assessment: formData.assessment,
          plan: formData.plan
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiSuggestions(data.response);
      }
    } catch (error) {
      console.error('AI support error:', error);
    } finally {
      setIsUsingAI(false);
    }
  };

  const updateVitalSign = (field: keyof VitalSigns, value: string | number) => {
    setVitalSigns(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value
    }));
  };

  return (
    <div className={`max-w-5xl mx-auto ${className}`}>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            SOAP形式カルテ記録
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <UserIcon className="h-4 w-4" />
              {patient.full_name} ({patient.patient_number})
            </div>
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              {patient.age}歳 {patient.gender}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <div className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-red-800 mb-2">入力エラー</div>
                    <ul className="text-sm text-red-700 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  診療日 *
                </label>
                <Input
                  type="date"
                  value={formData.visit_date}
                  onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  診療区分 *
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.visit_type}
                  onChange={(e) => setFormData({ ...formData, visit_type: e.target.value as any })}
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
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                >
                  <option value="mild">軽症</option>
                  <option value="moderate">中等症</option>
                  <option value="severe">重症</option>
                  <option value="critical">最重症</option>
                </select>
              </div>
            </div>

            {/* Chief Complaint */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                主訴 *
              </label>
              <Input
                value={formData.chief_complaint}
                onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                placeholder="患者の主な訴えを簡潔に記入"
                required
              />
            </div>

            {/* Vital Signs */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <HeartIcon className="h-5 w-5" />
                  バイタルサイン
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">血圧</label>
                    <Input
                      placeholder="120/80"
                      value={vitalSigns.blood_pressure || ''}
                      onChange={(e) => updateVitalSign('blood_pressure', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">心拍数</label>
                    <Input
                      type="number"
                      placeholder="72"
                      value={vitalSigns.heart_rate || ''}
                      onChange={(e) => updateVitalSign('heart_rate', parseInt(e.target.value) || '')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">体温 (°C)</label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="36.5"
                      value={vitalSigns.temperature || ''}
                      onChange={(e) => updateVitalSign('temperature', parseFloat(e.target.value) || '')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">SpO2 (%)</label>
                    <Input
                      type="number"
                      placeholder="98"
                      value={vitalSigns.oxygen_saturation || ''}
                      onChange={(e) => updateVitalSign('oxygen_saturation', parseInt(e.target.value) || '')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">呼吸数</label>
                    <Input
                      type="number"
                      placeholder="16"
                      value={vitalSigns.respiratory_rate || ''}
                      onChange={(e) => updateVitalSign('respiratory_rate', parseInt(e.target.value) || '')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">体重 (kg)</label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="65.0"
                      value={vitalSigns.weight || ''}
                      onChange={(e) => updateVitalSign('weight', parseFloat(e.target.value) || '')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">身長 (cm)</label>
                    <Input
                      type="number"
                      placeholder="170"
                      value={vitalSigns.height || ''}
                      onChange={(e) => updateVitalSign('height', parseInt(e.target.value) || '')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SOAP Structure */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">SOAP記録</h3>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleAIAssist}
                  disabled={isUsingAI}
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                >
                  <SparklesIcon className="h-4 w-4" />
                  {isUsingAI ? 'AI支援中...' : 'AI記録支援'}
                </Button>
              </div>

              {/* S - Subjective */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-green-700">
                    S - Subjective (主観的情報)
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    患者の主訴、現病歴、症状の詳細など患者から得られる情報
                  </p>
                </CardHeader>
                <CardContent>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    rows={4}
                    value={formData.subjective}
                    onChange={(e) => setFormData({ ...formData, subjective: e.target.value })}
                    placeholder="例: 3日前から頭痛が持続している。ズキズキとした痛みで、朝起床時に最も強い。鎮痛剤で軽減するが完全には消失しない。吐き気や発熱はない。"
                    required
                  />
                </CardContent>
              </Card>

              {/* O - Objective */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-blue-700">
                    O - Objective (客観的情報)
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    身体所見、検査結果、観察可能な事実
                  </p>
                </CardHeader>
                <CardContent>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    value={formData.objective}
                    onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                    placeholder="例: 意識清明、一般状態良好。頭頸部：項部硬直なし、Kernig徴候陰性。神経学的異常所見なし。血液検査：WBC 6800/μL、CRP 0.3mg/dL"
                    required
                  />
                </CardContent>
              </Card>

              {/* A - Assessment */}
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-orange-700">
                    A - Assessment (評価)
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    診断、病状の評価、鑑別診断
                  </p>
                </CardHeader>
                <CardContent>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows={3}
                    value={formData.assessment}
                    onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
                    placeholder="例: 緊張型頭痛が最も考えられる。髄膜刺激症状なく、血液検査でも炎症反応を認めないため、二次性頭痛の可能性は低い。"
                    required
                  />
                </CardContent>
              </Card>

              {/* P - Plan */}
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-purple-700">
                    P - Plan (計画)
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    治療計画、フォローアップ、追加検査
                  </p>
                </CardHeader>
                <CardContent>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    rows={4}
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    placeholder="例: 1) NSAIDs投与（ロキソプロフェン60mg 1日3回）2) 生活指導（規則正しい睡眠、ストレス管理）3) 1週間後再診、症状改善なければCT検査を検討"
                    required
                  />
                </CardContent>
              </Card>
            </div>

            {/* AI Suggestions */}
            {aiSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-purple-50 border border-purple-200 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <SparklesIcon className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-purple-800 mb-2">AI記録改善提案</div>
                    <div className="text-sm text-purple-700 whitespace-pre-wrap">
                      {aiSuggestions}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Follow-up Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  次回診療予定日
                </label>
                <Input
                  type="date"
                  value={formData.next_visit_date}
                  onChange={(e) => setFormData({ ...formData, next_visit_date: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  フォローアップ指示
                </label>
                <Input
                  value={formData.follow_up_instructions}
                  onChange={(e) => setFormData({ ...formData, follow_up_instructions: e.target.value })}
                  placeholder="次回までの注意事項"
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  プライベートメモ
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={formData.private_notes}
                  onChange={(e) => setFormData({ ...formData, private_notes: e.target.value })}
                  placeholder="診療に関する個人的メモ"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  請求メモ
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={formData.billing_notes}
                  onChange={(e) => setFormData({ ...formData, billing_notes: e.target.value })}
                  placeholder="請求に関する特記事項"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                className="flex items-center gap-2"
              >
                <CheckCircleIcon className="h-4 w-4" />
                SOAP記録を保存
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}