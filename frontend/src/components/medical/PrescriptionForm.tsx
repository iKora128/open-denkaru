"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  PrescriptionCreate, 
  PrescriptionItemCreate, 
  DosageUnit, 
  DosageFrequency,
  Medication 
} from '../../types/prescription';
import { Patient } from '../../types/patient';
import { 
  PlusIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface PrescriptionFormProps {
  patient: Patient;
  onSubmit: (prescription: PrescriptionCreate) => void;
  onCancel: () => void;
  medications: Medication[];
  className?: string;
}

interface MedicationFormItem extends PrescriptionItemCreate {
  id: string;
  medication?: Medication;
}

export function PrescriptionForm({
  patient,
  onSubmit,
  onCancel,
  medications,
  className = ''
}: PrescriptionFormProps) {
  const [formData, setFormData] = useState<Omit<PrescriptionCreate, 'items'>>({
    patient_id: patient.id,
    prescribed_date: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    prescribed_by: '',
    diagnosis: '',
    clinical_info: '',
    notes: '',
    pharmacy_name: ''
  });

  const [items, setItems] = useState<MedicationFormItem[]>([]);
  const [medicationSearch, setMedicationSearch] = useState<{ [key: string]: string }>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const addMedicationItem = () => {
    const newItem: MedicationFormItem = {
      id: Date.now().toString(),
      medication_id: 0,
      dosage: 0,
      dosage_unit: DosageUnit.MG,
      frequency: DosageFrequency.THREE_TIMES_DAILY,
      duration_days: 7,
      total_amount: 0,
      instructions: ''
    };
    setItems([...items, newItem]);
  };

  const removeMedicationItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateMedicationItem = (id: string, updates: Partial<MedicationFormItem>) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const selectMedication = (itemId: string, medication: Medication) => {
    updateMedicationItem(itemId, {
      medication_id: medication.id,
      medication: medication,
      dosage_unit: medication.unit
    });
    setMedicationSearch({ ...medicationSearch, [itemId]: '' });
  };

  const calculateTotalAmount = (item: MedicationFormItem) => {
    const dailyDoses = {
      [DosageFrequency.ONCE_DAILY]: 1,
      [DosageFrequency.TWICE_DAILY]: 2,
      [DosageFrequency.THREE_TIMES_DAILY]: 3,
      [DosageFrequency.FOUR_TIMES_DAILY]: 4,
      [DosageFrequency.AS_NEEDED]: 1,
      [DosageFrequency.BEFORE_MEALS]: 3,
      [DosageFrequency.AFTER_MEALS]: 3,
      [DosageFrequency.BETWEEN_MEALS]: 3,
      [DosageFrequency.BEDTIME]: 1
    };
    
    const dosesPerDay = dailyDoses[item.frequency] || 1;
    return item.dosage * dosesPerDay * item.duration_days;
  };

  React.useEffect(() => {
    setItems(items.map(item => ({
      ...item,
      total_amount: calculateTotalAmount(item)
    })));
  }, [items.map(item => `${item.dosage}-${item.frequency}-${item.duration_days}`).join(',')]);

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.prescribed_by.trim()) {
      errors.push('処方医師を入力してください');
    }
    
    if (items.length === 0) {
      errors.push('少なくとも1つの薬剤を追加してください');
    }
    
    items.forEach((item, index) => {
      if (!item.medication_id) {
        errors.push(`薬剤 ${index + 1}: 薬剤を選択してください`);
      }
      if (item.dosage <= 0) {
        errors.push(`薬剤 ${index + 1}: 用量を入力してください`);
      }
      if (item.duration_days <= 0) {
        errors.push(`薬剤 ${index + 1}: 日数を入力してください`);
      }
    });
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const prescription: PrescriptionCreate = {
      ...formData,
      items: items.map(item => ({
        medication_id: item.medication_id,
        dosage: item.dosage,
        dosage_unit: item.dosage_unit,
        frequency: item.frequency,
        duration_days: item.duration_days,
        total_amount: item.total_amount,
        instructions: item.instructions
      }))
    };
    
    onSubmit(prescription);
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            新規処方箋作成
          </CardTitle>
          <div className="text-sm text-gray-600">
            患者: {patient.full_name} ({patient.patient_number})
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  処方日
                </label>
                <Input
                  type="date"
                  value={formData.prescribed_date}
                  onChange={(e) => setFormData({ ...formData, prescribed_date: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  有効期限
                </label>
                <Input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  処方医師 *
                </label>
                <Input
                  value={formData.prescribed_by}
                  onChange={(e) => setFormData({ ...formData, prescribed_by: e.target.value })}
                  placeholder="医師名を入力"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  調剤薬局
                </label>
                <Input
                  value={formData.pharmacy_name}
                  onChange={(e) => setFormData({ ...formData, pharmacy_name: e.target.value })}
                  placeholder="薬局名を入力"
                />
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  診断名
                </label>
                <Input
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  placeholder="診断名を入力"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  臨床情報
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={formData.clinical_info}
                  onChange={(e) => setFormData({ ...formData, clinical_info: e.target.value })}
                  placeholder="症状、検査結果などの臨床情報"
                />
              </div>
            </div>

            {/* Medications */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">処方薬剤</h3>
                <Button
                  type="button"
                  onClick={addMedicationItem}
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  薬剤追加
                </Button>
              </div>

              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="border border-gray-200 rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">薬剤 {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedicationItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Medication Search */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      薬剤名 *
                    </label>
                    {item.medication ? (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium text-green-800">{item.medication.name}</div>
                          {item.medication.generic_name && (
                            <div className="text-sm text-green-600">
                              一般名: {item.medication.generic_name}
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => updateMedicationItem(item.id, { medication_id: 0, medication: undefined })}
                          className="ml-auto text-gray-500"
                        >
                          変更
                        </Button>
                      </div>
                    ) : (
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          value={medicationSearch[item.id] || ''}
                          onChange={(e) => setMedicationSearch({ ...medicationSearch, [item.id]: e.target.value })}
                          placeholder="薬剤名で検索..."
                          className="pl-10"
                        />
                        {medicationSearch[item.id] && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {medications
                              .filter(med => 
                                med.name.toLowerCase().includes(medicationSearch[item.id].toLowerCase()) ||
                                (med.generic_name && med.generic_name.toLowerCase().includes(medicationSearch[item.id].toLowerCase()))
                              )
                              .slice(0, 10)
                              .map(medication => (
                                <div
                                  key={medication.id}
                                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                  onClick={() => selectMedication(item.id, medication)}
                                >
                                  <div className="font-medium text-gray-900">{medication.name}</div>
                                  {medication.generic_name && (
                                    <div className="text-sm text-gray-600">一般名: {medication.generic_name}</div>
                                  )}
                                  {medication.manufacturer && (
                                    <div className="text-sm text-gray-500">{medication.manufacturer}</div>
                                  )}
                                </div>
                              ))
                            }
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Dosage Information */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">用量 *</label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        value={item.dosage || ''}
                        onChange={(e) => updateMedicationItem(item.id, { dosage: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">単位</label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={item.dosage_unit}
                        onChange={(e) => updateMedicationItem(item.id, { dosage_unit: e.target.value as DosageUnit })}
                      >
                        {Object.values(DosageUnit).map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">頻度 *</label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={item.frequency}
                        onChange={(e) => updateMedicationItem(item.id, { frequency: e.target.value as DosageFrequency })}
                      >
                        {Object.values(DosageFrequency).map(freq => (
                          <option key={freq} value={freq}>{freq}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">日数 *</label>
                      <Input
                        type="number"
                        min="1"
                        value={item.duration_days || ''}
                        onChange={(e) => updateMedicationItem(item.id, { duration_days: parseInt(e.target.value) || 0 })}
                        placeholder="7"
                      />
                    </div>
                  </div>

                  {/* Total Amount Display */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-800">
                      総量: <span className="font-semibold">{item.total_amount} {item.dosage_unit}</span>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">用法・注意事項</label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      value={item.instructions}
                      onChange={(e) => updateMedicationItem(item.id, { instructions: e.target.value })}
                      placeholder="服用方法や注意事項があれば記入"
                    />
                  </div>
                </motion.div>
              ))}

              {items.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  薬剤が追加されていません。「薬剤追加」ボタンをクリックして薬剤を追加してください。
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">備考</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="その他の備考があれば記入"
              />
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
                処方箋作成
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}