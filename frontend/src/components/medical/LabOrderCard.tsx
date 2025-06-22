"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { StatusBadge } from './StatusBadge';
import { LabOrder, LabOrderStatus, LabOrderPriority } from '../../types/lab-order';
import { 
  CalendarIcon, 
  UserIcon, 
  ClockIcon,
  BeakerIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface LabOrderCardProps {
  labOrder: LabOrder;
  onClick?: () => void;
  className?: string;
}

const statusColors = {
  [LabOrderStatus.DRAFT]: 'warning',
  [LabOrderStatus.ORDERED]: 'normal',
  [LabOrderStatus.IN_PROGRESS]: 'warning',
  [LabOrderStatus.COMPLETED]: 'success',
  [LabOrderStatus.CANCELLED]: 'error'
} as const;


export function LabOrderCard({ 
  labOrder, 
  onClick, 
  className = '' 
}: LabOrderCardProps) {
  const isScheduled = labOrder.scheduled_date && new Date(labOrder.scheduled_date) >= new Date();
  const isPast = labOrder.scheduled_date && new Date(labOrder.scheduled_date) < new Date();
  const requiresFasting = labOrder.items.some(item => item.fasting_required);
  const hasUrgentTests = labOrder.items.some(item => item.urgent);

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
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BeakerIcon className="h-5 w-5 text-blue-600" />
                検査オーダー #{labOrder.id}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarIcon className="h-4 w-4" />
                オーダー日: {new Date(labOrder.ordered_date).toLocaleDateString('ja-JP')}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={statusColors[labOrder.status]}>
                {labOrder.status}
              </StatusBadge>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                labOrder.priority === LabOrderPriority.ROUTINE 
                  ? 'bg-gray-100 text-gray-700'
                  : labOrder.priority === LabOrderPriority.URGENT
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {labOrder.priority}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Doctor Information */}
          <div className="flex items-center gap-2 text-sm">
            <UserIcon className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">
              オーダー医: {labOrder.ordered_by}
              {labOrder.department && ` (${labOrder.department})`}
            </span>
          </div>

          {/* Scheduled Date */}
          {labOrder.scheduled_date && (
            <div className="flex items-center gap-2 text-sm">
              <ClockIcon className="h-4 w-4 text-gray-500" />
              <span className={`${
                isPast ? 'text-red-600' : 
                isScheduled ? 'text-blue-600' : 'text-gray-700'
              }`}>
                予定日: {new Date(labOrder.scheduled_date).toLocaleDateString('ja-JP')}
                {isPast && labOrder.status !== LabOrderStatus.COMPLETED && (
                  <span className="ml-1 text-red-600">(遅延)</span>
                )}
              </span>
            </div>
          )}

          {/* Test Count and Categories */}
          <div className="flex items-center gap-2 text-sm">
            <BeakerIcon className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">
              検査項目: {labOrder.items.length}項目
              {hasUrgentTests && (
                <span className="ml-2 inline-flex items-center gap-1 text-red-600">
                  <ExclamationTriangleIcon className="h-3 w-3" />
                  緊急項目含む
                </span>
              )}
            </span>
          </div>

          {/* Test Categories */}
          <div className="flex flex-wrap gap-1">
            {Array.from(new Set(labOrder.items.map(item => item.lab_test.category))).map(category => (
              <span 
                key={category}
                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
              >
                {category}
              </span>
            ))}
          </div>

          {/* Purpose/Diagnosis */}
          {labOrder.purpose && (
            <div className="flex items-start gap-2 text-sm">
              <DocumentIcon className="h-4 w-4 text-gray-500 mt-0.5" />
              <span className="text-gray-700">
                目的: {labOrder.purpose}
              </span>
            </div>
          )}

          {labOrder.diagnosis && (
            <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded-lg">
              <div className="font-medium text-blue-900 mb-1">診断</div>
              <div className="text-blue-800">{labOrder.diagnosis}</div>
            </div>
          )}

          {/* Clinical Info */}
          {labOrder.clinical_info && (
            <div className="text-sm text-gray-600 bg-green-50 p-2 rounded-lg">
              <div className="font-medium text-green-900 mb-1">臨床情報</div>
              <div className="text-green-800">{labOrder.clinical_info}</div>
            </div>
          )}

          {/* Preparation Instructions */}
          {(requiresFasting || labOrder.preparation_instructions) && (
            <div className="bg-amber-50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-medium text-amber-900 text-sm">
                    検査前準備
                  </div>
                  {requiresFasting && (
                    <div className="text-sm text-amber-800">
                      • 絶食が必要な項目があります
                      {labOrder.fasting_hours && ` (${labOrder.fasting_hours}時間)`}
                    </div>
                  )}
                  {labOrder.preparation_instructions && (
                    <div className="text-sm text-amber-800">
                      • {labOrder.preparation_instructions}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Lab Department */}
          {labOrder.lab_department && (
            <div className="text-sm text-gray-600 border-t pt-2">
              検査部門: {labOrder.lab_department}
            </div>
          )}

          {/* Technician Notes */}
          {labOrder.technician_notes && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
              <div className="font-medium text-gray-900 mb-1">技師メモ</div>
              <div>{labOrder.technician_notes}</div>
            </div>
          )}

          {/* Notes */}
          {labOrder.notes && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
              <div className="font-medium text-gray-900 mb-1">備考</div>
              <div>{labOrder.notes}</div>
            </div>
          )}

          {/* Status Indicators */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {labOrder.status === LabOrderStatus.COMPLETED && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircleIcon className="h-3 w-3" />
                  検査完了
                </div>
              )}
              {labOrder.status === LabOrderStatus.IN_PROGRESS && (
                <div className="flex items-center gap-1 text-blue-600">
                  <ClockIcon className="h-3 w-3" />
                  検査実施中
                </div>
              )}
            </div>
            
            {/* Updated timestamp */}
            <div className="text-xs text-gray-400">
              更新: {new Date(labOrder.updated_at).toLocaleString('ja-JP')}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}