'use client';

import { motion } from 'framer-motion';
import { User, Phone, Mail, MapPin, Calendar, Heart, Clock, AlertTriangle, Shield, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import type { Patient } from '@/types/patient';

interface PatientCardProps {
  patient: Patient;
  onClick?: (patient: Patient) => void;
  variant?: 'vertical' | 'horizontal';
}

export function PatientCard({ patient, onClick }: PatientCardProps) {
  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'male':
        return '👨';
      case 'female':
        return '👩';
      default:
        return '👤';
    }
  };



  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="group"
    >
      <Card 
        glass 
        hover 
        className="cursor-pointer h-full overflow-hidden border-l-4 border-l-transparent group-hover:border-l-apple-blue transition-all duration-300"
        onClick={() => onClick?.(patient)}
      >
        <CardContent className="p-0">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-system-gray-50/50 to-white p-6 border-b border-system-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-apple-blue/10 to-apple-purple/10 
                               flex items-center justify-center text-2xl shadow-sm">
                    {getGenderIcon(patient.gender)}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${
                    patient.is_active ? 'bg-medical-success' : 'bg-system-gray-400'
                  }`}>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-system-gray-900 dark:text-white group-hover:text-apple-blue transition-colors">
                    {patient.full_name}
                  </h3>
                  {patient.full_name_kana && (
                    <p className="text-sm text-system-gray-600 dark:text-system-gray-400 mt-0.5">
                      {patient.full_name_kana}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-system-gray-400" />
                    <span className="text-xs text-system-gray-500">
                      最終来院: {new Date(patient.updated_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={patient.is_active ? 'success' : 'inactive'} size="sm">
                  {patient.is_active ? 'アクティブ' : '非アクティブ'}
                </StatusBadge>
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3 text-apple-blue" />
                  <span className="text-xs text-system-gray-500">カルテ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Patient Info */}
          <div className="p-6 space-y-4">

            {/* Enhanced Patient Number & Age */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-apple-blue/5 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-apple-blue" />
                  <span className="text-xs font-medium text-apple-blue">患者番号</span>
                </div>
                <span className="font-bold text-system-gray-900 dark:text-white">
                  {patient.patient_number}
                </span>
              </div>
              <div className="bg-medical-success/5 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-medical-success" />
                  <span className="text-xs font-medium text-medical-success">年齢</span>
                </div>
                <span className="font-bold text-system-gray-900 dark:text-white">
                  {patient.age}歳
                </span>
              </div>
            </div>

            {/* Enhanced Blood Type */}
            {patient.blood_type && patient.blood_type !== 'unknown' && (
              <div className="bg-medical-error/5 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-medical-error" />
                    <span className="text-xs font-medium text-medical-error">血液型</span>
                  </div>
                  <span className="font-bold text-medical-error">
                    {patient.blood_type.replace('_', '')}
                  </span>
                </div>
              </div>
            )}

            {/* Enhanced Contact Info Grid */}
            <div className="space-y-3">
              {patient.phone_number && (
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-system-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-apple-orange/10 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-apple-orange" />
                  </div>
                  <div>
                    <div className="text-xs text-system-gray-500">電話番号</div>
                    <div className="font-medium text-system-gray-900">{patient.phone_number}</div>
                  </div>
                </div>
              )}

              {patient.email && (
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-system-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-apple-blue/10 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-apple-blue" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-system-gray-500">メールアドレス</div>
                    <div className="font-medium text-system-gray-900 truncate">{patient.email}</div>
                  </div>
                </div>
              )}

              {/* Address with improved layout */}
              {patient.full_address && (
                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-system-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-apple-purple/10 flex items-center justify-center mt-0.5">
                    <MapPin className="h-4 w-4 text-apple-purple" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-system-gray-500 mb-1">住所</div>
                    <div className="text-sm text-system-gray-700 leading-relaxed">
                      {patient.full_address}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Medical Info */}
            {patient.allergies && (
              <div className="p-4 rounded-xl bg-medical-warning/5 border border-medical-warning/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-medical-warning/5 rounded-full -mr-8 -mt-8"></div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-medical-warning" />
                    <span className="text-sm font-semibold text-medical-warning">
                      アレルギー情報
                    </span>
                  </div>
                  <p className="text-sm text-system-gray-700 dark:text-system-gray-300 leading-relaxed">
                    {patient.allergies}
                  </p>
                </div>
              </div>
            )}

            {/* Enhanced Insurance */}
            {patient.insurance_type && (
              <div className="p-3 rounded-xl bg-apple-green/5 border border-apple-green/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-apple-green" />
                    <span className="text-xs font-medium text-apple-green">保険情報</span>
                  </div>
                  <span className="font-medium text-system-gray-700">
                    {patient.insurance_type}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Footer */}
          <div className="mt-6 pt-4 border-t border-system-gray-200 dark:border-system-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-system-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>登録: {new Date(patient.created_at).toLocaleDateString('ja-JP')}</span>
                </div>
                {patient.updated_at !== patient.created_at && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>更新: {new Date(patient.updated_at).toLocaleDateString('ja-JP')}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-apple-blue font-medium group-hover:text-apple-blue/80 transition-colors">
                <span>詳細を表示</span>
                <motion.div
                  initial={{ x: 0 }}
                  whileHover={{ x: 2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  →
                </motion.div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}