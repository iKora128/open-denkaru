"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PrescriptionItem, DrugInteractionCheck } from '../../types/prescription';
import { 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';
import { Pill } from 'lucide-react';

interface MedicationCardProps {
  item: PrescriptionItem;
  interactions?: DrugInteractionCheck[];
  className?: string;
}

const interactionLevelColors = {
  minor: 'text-yellow-600 bg-yellow-50',
  moderate: 'text-orange-600 bg-orange-50',
  major: 'text-red-600 bg-red-50',
  contraindicated: 'text-red-800 bg-red-100'
};

export function MedicationCard({ 
  item, 
  interactions = [], 
  className = '' 
}: MedicationCardProps) {
  const { medication } = item;
  const hasInteractions = interactions.length > 0;
  const highRiskInteractions = interactions.filter(
    i => i.interaction_level === 'major' || i.interaction_level === 'contraindicated'
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Pill className="h-5 w-5 text-blue-600" />
                {medication.name}
              </CardTitle>
              {medication.generic_name && (
                <div className="text-sm text-gray-600">
                  一般名: {medication.generic_name}
                </div>
              )}
            </div>
            {hasInteractions && (
              <div className="flex items-center gap-1">
                <ExclamationTriangleIcon className={`h-5 w-5 ${
                  highRiskInteractions.length > 0 ? 'text-red-500' : 'text-amber-500'
                }`} />
                <span className="text-xs font-medium text-gray-600">
                  相互作用
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Dosage Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <ScaleIcon className="h-4 w-4 text-gray-500" />
                <span className="font-medium">用量</span>
              </div>
              <div className="text-lg font-semibold text-blue-600">
                {item.dosage}{item.dosage_unit}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <ClockIcon className="h-4 w-4 text-gray-500" />
                <span className="font-medium">頻度</span>
              </div>
              <div className="text-lg font-semibold text-green-600">
                {item.frequency}
              </div>
            </div>
          </div>

          {/* Duration and Total Amount */}
          <div className="grid grid-cols-2 gap-4 py-2 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {item.duration_days}
              </div>
              <div className="text-sm text-gray-600">日分</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {item.total_amount}
              </div>
              <div className="text-sm text-gray-600">{medication.unit}</div>
            </div>
          </div>

          {/* Instructions */}
          {item.instructions && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <InformationCircleIcon className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900 text-sm mb-1">
                    用法・注意事項
                  </div>
                  <div className="text-sm text-blue-800">
                    {item.instructions}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Drug Interactions */}
          {interactions.map((interaction, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg ${interactionLevelColors[interaction.interaction_level]}`}
            >
              <div className="flex items-start gap-2">
                <ExclamationTriangleIcon className="h-4 w-4 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-medium text-sm">
                    薬物相互作用 ({interaction.interaction_level})
                  </div>
                  <div className="text-sm">
                    {interaction.medication_a} × {interaction.medication_b}
                  </div>
                  <div className="text-sm">
                    {interaction.description}
                  </div>
                  {interaction.recommendation && (
                    <div className="text-sm font-medium mt-2">
                      推奨: {interaction.recommendation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Medication Details */}
          <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
            {medication.manufacturer && (
              <div className="flex justify-between">
                <span className="text-gray-600">製薬会社:</span>
                <span className="text-gray-900">{medication.manufacturer}</span>
              </div>
            )}
            {medication.code && (
              <div className="flex justify-between">
                <span className="text-gray-600">薬価コード:</span>
                <span className="text-gray-900 font-mono">{medication.code}</span>
              </div>
            )}
          </div>

          {/* Side Effects */}
          {medication.side_effects && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="font-medium text-gray-900 text-sm mb-1">
                副作用
              </div>
              <div className="text-sm text-gray-700">
                {medication.side_effects}
              </div>
            </div>
          )}

          {/* Contraindications */}
          {medication.contraindications && (
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="font-medium text-red-900 text-sm mb-1">
                禁忌・注意事項
              </div>
              <div className="text-sm text-red-800">
                {medication.contraindications}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}