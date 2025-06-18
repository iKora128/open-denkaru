"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { StatusBadge } from './StatusBadge';
import { Prescription, PrescriptionStatus } from '../../types/prescription';
import { 
  CalendarIcon, 
  UserIcon, 
  ClockIcon,
  PillIcon,
  DocumentIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface PrescriptionCardProps {
  prescription: Prescription;
  onClick?: () => void;
  className?: string;
}

const statusColors = {
  [PrescriptionStatus.DRAFT]: 'warning',
  [PrescriptionStatus.ACTIVE]: 'normal',
  [PrescriptionStatus.COMPLETED]: 'normal',
  [PrescriptionStatus.CANCELLED]: 'critical',
  [PrescriptionStatus.EXPIRED]: 'critical'
} as const;

export function PrescriptionCard({ 
  prescription, 
  onClick, 
  className = '' 
}: PrescriptionCardProps) {
  const isExpired = new Date(prescription.valid_until) < new Date();
  const daysUntilExpiry = Math.ceil(
    (new Date(prescription.valid_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`cursor-pointer ${className}`}
      onClick={onClick}
    >
      <Card className="glass-card h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold text-gray-900">
                処方箋 #{prescription.id}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarIcon className="h-4 w-4" />
                {new Date(prescription.prescribed_date).toLocaleDateString('ja-JP')}
              </div>
            </div>
            <StatusBadge 
              status={statusColors[prescription.status]} 
              text={prescription.status}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Doctor Information */}
          <div className="flex items-center gap-2 text-sm">
            <UserIcon className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">
              処方医: {prescription.prescribed_by}
            </span>
          </div>

          {/* Validity Information */}
          <div className="flex items-center gap-2 text-sm">
            <ClockIcon className="h-4 w-4 text-gray-500" />
            <span className={`${
              isExpired ? 'text-red-600' : 
              daysUntilExpiry <= 7 ? 'text-amber-600' : 'text-gray-700'
            }`}>
              有効期限: {new Date(prescription.valid_until).toLocaleDateString('ja-JP')}
              {!isExpired && daysUntilExpiry <= 7 && (
                <span className="ml-1 text-amber-600">
                  (残り{daysUntilExpiry}日)
                </span>
              )}
              {isExpired && (
                <span className="ml-1 text-red-600">(期限切れ)</span>
              )}
            </span>
          </div>

          {/* Medication Count */}
          <div className="flex items-center gap-2 text-sm">
            <PillIcon className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">
              薬剤数: {prescription.items.length}品目
            </span>
          </div>

          {/* Diagnosis */}
          {prescription.diagnosis && (
            <div className="flex items-start gap-2 text-sm">
              <DocumentIcon className="h-4 w-4 text-gray-500 mt-0.5" />
              <span className="text-gray-700">
                診断: {prescription.diagnosis}
              </span>
            </div>
          )}

          {/* Clinical Info */}
          {prescription.clinical_info && (
            <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded-lg">
              <div className="font-medium text-blue-900 mb-1">臨床情報</div>
              <div className="text-blue-800">{prescription.clinical_info}</div>
            </div>
          )}

          {/* Warnings */}
          {(isExpired || daysUntilExpiry <= 3) && (
            <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg">
              <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm">
                {isExpired ? (
                  <span className="text-red-700 font-medium">
                    この処方箋は有効期限が切れています
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium">
                    有効期限が近づいています
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Pharmacy */}
          {prescription.pharmacy_name && (
            <div className="text-sm text-gray-600 border-t pt-2">
              調剤薬局: {prescription.pharmacy_name}
            </div>
          )}

          {/* Notes */}
          {prescription.notes && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
              <div className="font-medium text-gray-900 mb-1">備考</div>
              <div>{prescription.notes}</div>
            </div>
          )}

          {/* Updated timestamp */}
          <div className="text-xs text-gray-400 border-t pt-2">
            更新: {new Date(prescription.updated_at).toLocaleString('ja-JP')}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}