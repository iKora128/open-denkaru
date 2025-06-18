'use client';

import { motion } from 'framer-motion';
import { User, Phone, Mail, MapPin, Calendar, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import type { Patient } from '@/types/patient';

interface PatientCardProps {
  patient: Patient;
  onClick?: (patient: Patient) => void;
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

  const getBloodTypeColor = (bloodType?: string) => {
    if (!bloodType || bloodType === 'unknown') return 'text-gray-400';
    return 'text-red-500';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card 
        glass 
        hover 
        className="cursor-pointer h-full"
        onClick={() => onClick?.(patient)}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-apple-blue/10 to-apple-purple/10 
                           flex items-center justify-center text-xl">
                {getGenderIcon(patient.gender)}
              </div>
              <div>
                <h3 className="font-bold text-lg text-system-gray-900 dark:text-white">
                  {patient.full_name}
                </h3>
                {patient.full_name_kana && (
                  <p className="text-sm text-system-gray-600 dark:text-system-gray-400">
                    {patient.full_name_kana}
                  </p>
                )}
              </div>
            </div>
            <StatusBadge status={patient.is_active ? 'success' : 'inactive'} size="sm">
              {patient.is_active ? 'アクティブ' : '非アクティブ'}
            </StatusBadge>
          </div>

          {/* Patient Info */}
          <div className="space-y-3">
            {/* Patient Number & Age */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-apple-blue" />
                <span className="text-system-gray-600 dark:text-system-gray-400">
                  患者番号:
                </span>
                <span className="font-medium text-system-gray-900 dark:text-white">
                  {patient.patient_number}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-apple-green" />
                <span className="font-medium text-system-gray-900 dark:text-white">
                  {patient.age}歳
                </span>
              </div>
            </div>

            {/* Blood Type */}
            {patient.blood_type && patient.blood_type !== 'unknown' && (
              <div className="flex items-center gap-2 text-sm">
                <Heart className={`h-4 w-4 ${getBloodTypeColor(patient.blood_type)}`} />
                <span className="text-system-gray-600 dark:text-system-gray-400">
                  血液型:
                </span>
                <span className={`font-medium ${getBloodTypeColor(patient.blood_type)}`}>
                  {patient.blood_type}
                </span>
              </div>
            )}

            {/* Contact Info */}
            {patient.phone_number && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-apple-orange" />
                <span className="text-system-gray-600 dark:text-system-gray-400 truncate">
                  {patient.phone_number}
                </span>
              </div>
            )}

            {patient.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-apple-blue" />
                <span className="text-system-gray-600 dark:text-system-gray-400 truncate">
                  {patient.email}
                </span>
              </div>
            )}

            {/* Address */}
            {patient.full_address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-apple-purple mt-0.5 flex-shrink-0" />
                <span className="text-system-gray-600 dark:text-system-gray-400 text-xs leading-relaxed">
                  {patient.full_address}
                </span>
              </div>
            )}

            {/* Medical Info */}
            {patient.allergies && (
              <div className="p-3 rounded-lg bg-medical-warning/5 border border-medical-warning/20">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-medical-warning"></div>
                  <span className="text-xs font-medium text-medical-warning">
                    アレルギー
                  </span>
                </div>
                <p className="text-xs text-system-gray-700 dark:text-system-gray-300">
                  {patient.allergies}
                </p>
              </div>
            )}

            {/* Insurance */}
            {patient.insurance_type && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded bg-apple-green/20 flex items-center justify-center">
                  <span className="text-apple-green text-xs font-bold">保</span>
                </div>
                <span className="text-system-gray-600 dark:text-system-gray-400">
                  {patient.insurance_type}
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-system-gray-200 dark:border-system-gray-700">
            <div className="flex items-center justify-between text-xs text-system-gray-500">
              <span>
                登録日: {new Date(patient.created_at).toLocaleDateString('ja-JP')}
              </span>
              {patient.updated_at !== patient.created_at && (
                <span>
                  更新: {new Date(patient.updated_at).toLocaleDateString('ja-JP')}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}