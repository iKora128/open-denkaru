'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Save, 
  ArrowLeft, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CheckCircle,
  User,
  Shield
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { animations } from '@/lib/utils';
import { medicalApi } from '@/lib/api';
import type { Patient } from '@/types/patient';
import { useRouter } from 'next/navigation';

interface PatientFormData {
  patient_number: string;
  full_name: string;
  full_name_kana: string;
  birth_date: string;
  gender: 'male' | 'female' | 'other';
  phone_number: string;
  email: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  insurance_number: string;
  medical_notes: string;
}

export default function NewPatientPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<PatientFormData>({
    patient_number: '',
    full_name: '',
    full_name_kana: '',
    birth_date: '',
    gender: 'male',
    phone_number: '',
    email: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    insurance_number: '',
    medical_notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!formData.full_name || !formData.full_name_kana || !formData.birth_date) {
        throw new Error('必須フィールドが入力されていません。');
      }

      // Generate patient number if not provided
      const patientData = {
        ...formData,
        patient_number: formData.patient_number || `P${Date.now().toString().slice(-8)}`
      };

      // Create patient
      const createdPatient = await medicalApi.patients.create(patientData) as Patient;
      
      setSuccess(true);
      
      // Redirect to patient detail page after short delay
      setTimeout(() => {
        router.push(`/patients/${createdPatient.id}`);
      }, 2000);
      
    } catch (error: any) {
      console.error('Failed to create patient:', error);
      setError(
        error.message?.includes('already exists') 
          ? '患者番号が既に存在します。別の番号を使用してください。'
          : error.message || '患者登録に失敗しました。入力内容を確認してください。'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-system-gray-50 via-white to-apple-blue/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-20 h-20 bg-medical-success/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-medical-success" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-system-gray-900 mb-2">
              患者登録完了
            </h2>
            <p className="text-system-gray-600">
              患者情報が正常に登録されました。患者詳細ページに移動します...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <AuthGuard requiredPermission="create_patient">
      <div className="min-h-screen bg-gradient-to-br from-system-gray-50 via-white to-apple-blue/5">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-system-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <motion.div 
              className="flex items-center gap-6"
              {...animations.slideInUp}
            >
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleBack}
                leftIcon={<ArrowLeft className="w-5 h-5" />}
              >
                戻る
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-apple-blue" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-system-gray-900">
                    新規患者登録
                  </h1>
                  <p className="text-lg text-system-gray-600">
                    新しい患者の基本情報を登録します
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <motion.div
            {...animations.slideInUp}
            transition={{ delay: 0.1 }}
          >
            <Card glass elevated>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <User className="w-6 h-6 text-apple-blue" />
                  患者基本情報
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg bg-medical-error/10 border border-medical-error/20"
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-medical-error mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-medical-error mb-1">
                            登録エラー
                          </p>
                          <p className="text-xs text-medical-error/80">
                            {error}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-system-gray-700">
                        患者番号
                      </label>
                      <input
                        type="text"
                        name="patient_number"
                        value={formData.patient_number}
                        onChange={handleInputChange}
                        placeholder="自動生成されます（任意）"
                        className="w-full px-4 py-3 glass-input rounded-xl text-system-gray-900 placeholder-system-gray-500
                                 focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30 transition-all duration-200"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-system-gray-700">
                        性別 <span className="text-medical-error">*</span>
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 glass-input rounded-xl text-system-gray-900
                                 focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30 transition-all duration-200"
                      >
                        <option value="male">男性</option>
                        <option value="female">女性</option>
                        <option value="other">その他</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-system-gray-700">
                        氏名 <span className="text-medical-error">*</span>
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        placeholder="田中 太郎"
                        required
                        className="w-full px-4 py-3 glass-input rounded-xl text-system-gray-900 placeholder-system-gray-500
                                 focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30 transition-all duration-200"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-system-gray-700">
                        氏名（カナ） <span className="text-medical-error">*</span>
                      </label>
                      <input
                        type="text"
                        name="full_name_kana"
                        value={formData.full_name_kana}
                        onChange={handleInputChange}
                        placeholder="タナカ タロウ"
                        required
                        className="w-full px-4 py-3 glass-input rounded-xl text-system-gray-900 placeholder-system-gray-500
                                 focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-system-gray-700">
                        生年月日 <span className="text-medical-error">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="date"
                          name="birth_date"
                          value={formData.birth_date}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-10 pr-4 py-3 glass-input rounded-xl text-system-gray-900
                                   focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30 transition-all duration-200"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-system-gray-700">
                        電話番号
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="tel"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleInputChange}
                          placeholder="03-1234-5678"
                          className="w-full pl-10 pr-4 py-3 glass-input rounded-xl text-system-gray-900 placeholder-system-gray-500
                                   focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-system-gray-700">
                        メールアドレス
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="example@example.com"
                          className="w-full pl-10 pr-4 py-3 glass-input rounded-xl text-system-gray-900 placeholder-system-gray-500
                                   focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30 transition-all duration-200"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-system-gray-700">
                        保険証番号
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          name="insurance_number"
                          value={formData.insurance_number}
                          onChange={handleInputChange}
                          placeholder="保険証番号"
                          className="w-full pl-10 pr-4 py-3 glass-input rounded-xl text-system-gray-900 placeholder-system-gray-500
                                   focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-system-gray-700">
                      住所
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="東京都渋谷区..."
                        rows={2}
                        className="w-full pl-10 pr-4 py-3 glass-input rounded-xl text-system-gray-900 placeholder-system-gray-500
                                 focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30 transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-system-gray-900 border-b border-system-gray-200 pb-2">
                      緊急連絡先
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-system-gray-700">
                          緊急連絡先氏名
                        </label>
                        <input
                          type="text"
                          name="emergency_contact_name"
                          value={formData.emergency_contact_name}
                          onChange={handleInputChange}
                          placeholder="田中 花子"
                          className="w-full px-4 py-3 glass-input rounded-xl text-system-gray-900 placeholder-system-gray-500
                                   focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30 transition-all duration-200"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-system-gray-700">
                          緊急連絡先電話番号
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="tel"
                            name="emergency_contact_phone"
                            value={formData.emergency_contact_phone}
                            onChange={handleInputChange}
                            placeholder="090-1234-5678"
                            className="w-full pl-10 pr-4 py-3 glass-input rounded-xl text-system-gray-900 placeholder-system-gray-500
                                     focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30 transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medical Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-system-gray-700">
                      医療メモ・アレルギー情報等
                    </label>
                    <textarea
                      name="medical_notes"
                      value={formData.medical_notes}
                      onChange={handleInputChange}
                      placeholder="アレルギー、既往歴、注意事項等を記載..."
                      rows={4}
                      className="w-full px-4 py-3 glass-input rounded-xl text-system-gray-900 placeholder-system-gray-500
                               focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30 transition-all duration-200 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-4 pt-6 border-t border-system-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={handleBack}
                    >
                      キャンセル
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      loading={isLoading}
                      leftIcon={<Save className="w-5 h-5" />}
                      disabled={!formData.full_name || !formData.full_name_kana || !formData.birth_date}
                    >
                      {isLoading ? '登録中...' : '患者登録'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
}