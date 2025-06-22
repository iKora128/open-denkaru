'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Activity,
  FileText,
  AlertTriangle,
  User,
  Shield,
  Clock,
  Stethoscope
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { animations } from '@/lib/utils';
import { medicalApi } from '@/lib/api';
import type { Patient } from '@/types/patient';
import { useRouter, useParams } from 'next/navigation';

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch patient data
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setIsLoading(true);
        const data = await medicalApi.patients.get(patientId);
        setPatient(data as Patient);
      } catch (error) {
        console.error('Failed to fetch patient:', error);
        setError('患者情報の取得に失敗しました。');
      } finally {
        setIsLoading(false);
      }
    };

    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  const handleBack = () => {
    router.push('/patients');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!patient) return;
    
    try {
      setIsSaving(true);
      const updatedPatient = await medicalApi.patients.update(patient.id, patient);
      setPatient(updatedPatient as Patient);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update patient:', error);
      setError('患者情報の更新に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Refresh patient data to revert changes
    window.location.reload();
  };

  const handleInputChange = (field: keyof Patient, value: string) => {
    if (!patient) return;
    
    setPatient(prev => prev ? {
      ...prev,
      [field]: value
    } : null);
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-system-gray-50 via-white to-apple-blue/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full glass-card">
            <User className="w-8 h-8 text-apple-blue animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-system-gray-700">
              患者情報を読み込み中...
            </h2>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-system-gray-50 via-white to-apple-blue/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 bg-medical-error/10 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-medical-error" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-system-gray-900 mb-2">
              患者情報が見つかりません
            </h2>
            <p className="text-system-gray-600 mb-6">
              {error || '指定された患者は存在しないか、アクセス権限がありません。'}
            </p>
            <Button onClick={handleBack}>
              患者一覧に戻る
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <AuthGuard requiredPermission="read_patient">
      <div className="min-h-screen bg-gradient-to-br from-system-gray-50 via-white to-apple-blue/5">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-system-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <motion.div 
              className="flex items-center justify-between"
              {...animations.slideInUp}
            >
              <div className="flex items-center gap-6">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleBack}
                  leftIcon={<ArrowLeft className="w-5 h-5" />}
                >
                  患者一覧
                </Button>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl glass-card flex items-center justify-center">
                    <User className="w-8 h-8 text-apple-blue" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-system-gray-900">
                      {patient.full_name}
                    </h1>
                    <div className="flex items-center gap-4 text-system-gray-600">
                      <span className="text-sm">
                        患者番号: {patient.patient_number}
                      </span>
                      <span className="text-sm">
                        {patient.birth_date && `${calculateAge(patient.birth_date)}歳`}
                      </span>
                      <span className="text-sm">
                        {patient.gender === 'male' ? '男性' : patient.gender === 'female' ? '女性' : 'その他'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={handleCancel}
                    >
                      キャンセル
                    </Button>
                    <Button 
                      size="lg"
                      onClick={handleSave}
                      loading={isSaving}
                      leftIcon={<Save className="w-5 h-5" />}
                    >
                      {isSaving ? '保存中...' : '保存'}
                    </Button>
                  </>
                ) : (
                  <Button 
                    size="lg"
                    onClick={handleEdit}
                    leftIcon={<Edit className="w-5 h-5" />}
                  >
                    編集
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Basic Information */}
              <motion.div
                {...animations.slideInUp}
                transition={{ delay: 0.1 }}
              >
                <Card glass elevated>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <User className="w-5 h-5 text-apple-blue" />
                      基本情報
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-system-gray-700">
                          氏名
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={patient.full_name}
                            onChange={(e) => handleInputChange('full_name', e.target.value)}
                            className="w-full px-4 py-3 glass-input rounded-xl text-system-gray-900
                                     focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30 transition-all duration-200"
                          />
                        ) : (
                          <p className="text-lg font-medium text-system-gray-900">
                            {patient.full_name}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-system-gray-700">
                          氏名（カナ）
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={patient.full_name_kana || ''}
                            onChange={(e) => handleInputChange('full_name_kana', e.target.value)}
                            className="w-full px-4 py-3 glass-input rounded-xl text-system-gray-900
                                     focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30 transition-all duration-200"
                          />
                        ) : (
                          <p className="text-lg text-system-gray-600">
                            {patient.full_name_kana || '-'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-system-gray-700">
                          生年月日
                        </label>
                        {isEditing ? (
                          <input
                            type="date"
                            value={patient.birth_date || ''}
                            onChange={(e) => handleInputChange('birth_date', e.target.value)}
                            className="w-full px-4 py-3 glass-input rounded-xl text-system-gray-900
                                     focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30 transition-all duration-200"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-apple-blue" />
                            <span className="text-system-gray-900">
                              {patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('ja-JP') : '-'}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-system-gray-700">
                          年齢
                        </label>
                        <p className="text-lg font-medium text-apple-blue">
                          {patient.birth_date ? `${calculateAge(patient.birth_date)}歳` : '-'}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-system-gray-700">
                          性別
                        </label>
                        {isEditing ? (
                          <select
                            value={patient.gender}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                            className="w-full px-4 py-3 glass-input rounded-xl text-system-gray-900
                                     focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30 transition-all duration-200"
                          >
                            <option value="male">男性</option>
                            <option value="female">女性</option>
                            <option value="other">その他</option>
                          </select>
                        ) : (
                          <p className="text-system-gray-900">
                            {patient.gender === 'male' ? '男性' : patient.gender === 'female' ? '女性' : 'その他'}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                {...animations.slideInUp}
                transition={{ delay: 0.2 }}
              >
                <Card glass elevated>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-apple-blue" />
                      連絡先情報
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-system-gray-700">
                          電話番号
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={patient.phone_number || ''}
                            onChange={(e) => handleInputChange('phone_number', e.target.value)}
                            className="w-full px-4 py-3 glass-input rounded-xl text-system-gray-900
                                     focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30 transition-all duration-200"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-apple-blue" />
                            <span className="text-system-gray-900">
                              {patient.phone_number || '-'}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-system-gray-700">
                          メールアドレス
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={patient.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-4 py-3 glass-input rounded-xl text-system-gray-900
                                     focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30 transition-all duration-200"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-apple-blue" />
                            <span className="text-system-gray-900">
                              {patient.email || '-'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-system-gray-700">
                        住所
                      </label>
                      {isEditing ? (
                        <textarea
                          value={patient.address || ''}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          rows={2}
                          className="w-full px-4 py-3 glass-input rounded-xl text-system-gray-900
                                   focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30 transition-all duration-200 resize-none"
                        />
                      ) : (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-apple-blue mt-0.5 flex-shrink-0" />
                          <span className="text-system-gray-900">
                            {patient.address || '-'}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Medical Notes */}
              <motion.div
                {...animations.slideInUp}
                transition={{ delay: 0.3 }}
              >
                <Card glass elevated>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-apple-blue" />
                      医療メモ・特記事項
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <textarea
                        value={patient.notes || ''}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        rows={4}
                        placeholder="アレルギー、既往歴、注意事項等を記載..."
                        className="w-full px-4 py-3 glass-input rounded-xl text-system-gray-900 placeholder-system-gray-500
                                 focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30 transition-all duration-200 resize-none"
                      />
                    ) : (
                      <div className="text-system-gray-900 whitespace-pre-wrap">
                        {patient.notes || 'メモがありません'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              
              {/* Quick Actions */}
              <motion.div
                {...animations.slideInUp}
                transition={{ delay: 0.1 }}
              >
                <Card glass elevated>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-apple-blue" />
                      クイックアクション
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="secondary" className="w-full justify-start" leftIcon={<Stethoscope className="w-4 h-4" />}>
                      診療記録作成
                    </Button>
                    <Button variant="secondary" className="w-full justify-start" leftIcon={<FileText className="w-4 h-4" />}>
                      処方箋発行
                    </Button>
                    <Button variant="secondary" className="w-full justify-start" leftIcon={<Activity className="w-4 h-4" />}>
                      検査オーダー
                    </Button>
                    <Button variant="secondary" className="w-full justify-start" leftIcon={<Calendar className="w-4 h-4" />}>
                      予約管理
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Patient Info Summary */}
              <motion.div
                {...animations.slideInUp}
                transition={{ delay: 0.2 }}
              >
                <Card glass elevated>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-apple-blue" />
                      保険・その他情報
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-system-gray-700">
                        保険証番号
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={patient.insurance_number || ''}
                          onChange={(e) => handleInputChange('insurance_number', e.target.value)}
                          className="w-full px-3 py-2 glass-input rounded-lg text-system-gray-900
                                   focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30 transition-all duration-200"
                        />
                      ) : (
                        <p className="text-sm text-system-gray-900">
                          {patient.insurance_number || '-'}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-system-gray-700">
                        登録日時
                      </label>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-apple-blue" />
                        <span className="text-sm text-system-gray-900">
                          {new Date(patient.created_at).toLocaleString('ja-JP')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}