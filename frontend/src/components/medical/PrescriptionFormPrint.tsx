"use client";

import React from 'react';
import { PrescriptionFormOutput } from '../../types/prescription';

interface PrescriptionFormPrintProps {
  prescription: PrescriptionFormOutput;
  className?: string;
}

export function PrescriptionFormPrint({ 
  prescription, 
  className = '' 
}: PrescriptionFormPrintProps) {
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`max-w-4xl mx-auto bg-white ${className}`}>
      {/* Print Button - Hidden in print */}
      <div className="no-print mb-6 flex justify-end">
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          印刷する
        </button>
      </div>

      {/* Prescription Form */}
      <div className="prescription-form bg-white p-8 border-2 border-gray-800">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
          <h1 className="text-2xl font-bold mb-2">処方箋</h1>
          <div className="text-sm">
            <div>{prescription.clinic_name || '医療法人オープン電カル'}</div>
            {prescription.clinic_address && <div>{prescription.clinic_address}</div>}
            {prescription.clinic_phone && <div>TEL: {prescription.clinic_phone}</div>}
          </div>
        </div>

        {/* Patient Information */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 border-b border-gray-400">患者情報</h2>
            <div className="space-y-2">
              <div className="flex">
                <span className="w-20 font-medium">氏名:</span>
                <span className="flex-1">{prescription.patient_name}</span>
              </div>
              <div className="flex">
                <span className="w-20 font-medium">患者番号:</span>
                <span className="flex-1">{prescription.patient_number}</span>
              </div>
              <div className="flex">
                <span className="w-20 font-medium">生年月日:</span>
                <span className="flex-1">
                  {new Date(prescription.patient_birth_date).toLocaleDateString('ja-JP')}
                  （{prescription.patient_age}歳）
                </span>
              </div>
              <div className="flex">
                <span className="w-20 font-medium">性別:</span>
                <span className="flex-1">{prescription.patient_gender}</span>
              </div>
              <div className="flex">
                <span className="w-20 font-medium">住所:</span>
                <span className="flex-1">{prescription.patient_address}</span>
              </div>
              {prescription.patient_phone && (
                <div className="flex">
                  <span className="w-20 font-medium">電話:</span>
                  <span className="flex-1">{prescription.patient_phone}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 border-b border-gray-400">保険情報</h2>
            <div className="space-y-2">
              {prescription.insurance_type && (
                <div className="flex">
                  <span className="w-20 font-medium">保険種別:</span>
                  <span className="flex-1">{prescription.insurance_type}</span>
                </div>
              )}
              {prescription.insurance_number && (
                <div className="flex">
                  <span className="w-20 font-medium">保険証番号:</span>
                  <span className="flex-1">{prescription.insurance_number}</span>
                </div>
              )}
            </div>

            <h2 className="text-lg font-semibold mt-6 mb-3 border-b border-gray-400">処方情報</h2>
            <div className="space-y-2">
              <div className="flex">
                <span className="w-20 font-medium">処方日:</span>
                <span className="flex-1">
                  {new Date(prescription.prescribed_date).toLocaleDateString('ja-JP')}
                </span>
              </div>
              <div className="flex">
                <span className="w-20 font-medium">有効期限:</span>
                <span className="flex-1">
                  {new Date(prescription.valid_until).toLocaleDateString('ja-JP')}
                </span>
              </div>
              <div className="flex">
                <span className="w-20 font-medium">処方医:</span>
                <span className="flex-1">{prescription.prescribed_by}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        {(prescription.diagnosis || prescription.clinical_info) && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 border-b border-gray-400">医療情報</h2>
            {prescription.diagnosis && (
              <div className="flex mb-2">
                <span className="w-20 font-medium">診断名:</span>
                <span className="flex-1">{prescription.diagnosis}</span>
              </div>
            )}
            {prescription.clinical_info && (
              <div className="flex">
                <span className="w-20 font-medium">臨床情報:</span>
                <span className="flex-1">{prescription.clinical_info}</span>
              </div>
            )}
          </div>
        )}

        {/* Medications Table */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 border-b border-gray-400">処方薬剤</h2>
          <table className="w-full border-collapse border border-gray-800">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-800 p-2 text-left w-1/4">薬剤名</th>
                <th className="border border-gray-800 p-2 text-center w-1/8">用量</th>
                <th className="border border-gray-800 p-2 text-center w-1/8">頻度</th>
                <th className="border border-gray-800 p-2 text-center w-1/8">日数</th>
                <th className="border border-gray-800 p-2 text-center w-1/8">総量</th>
                <th className="border border-gray-800 p-2 text-left w-1/4">用法・注意</th>
              </tr>
            </thead>
            <tbody>
              {prescription.medications.map((medication, index) => (
                <tr key={index}>
                  <td className="border border-gray-800 p-2">
                    <div className="font-medium">{medication.name}</div>
                    {medication.generic_name && (
                      <div className="text-sm text-gray-600">
                        一般名: {medication.generic_name}
                      </div>
                    )}
                    {medication.manufacturer && (
                      <div className="text-xs text-gray-500">
                        {medication.manufacturer}
                      </div>
                    )}
                  </td>
                  <td className="border border-gray-800 p-2 text-center">
                    {medication.dosage}{medication.dosage_unit}
                  </td>
                  <td className="border border-gray-800 p-2 text-center">
                    {medication.frequency}
                  </td>
                  <td className="border border-gray-800 p-2 text-center">
                    {medication.duration_days}日分
                  </td>
                  <td className="border border-gray-800 p-2 text-center">
                    {medication.total_amount}{medication.dosage_unit}
                  </td>
                  <td className="border border-gray-800 p-2">
                    {medication.instructions || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            {prescription.notes && (
              <>
                <h3 className="font-semibold mb-2">備考</h3>
                <div className="text-sm border border-gray-400 p-2 min-h-[60px]">
                  {prescription.notes}
                </div>
              </>
            )}
          </div>
          <div>
            {prescription.pharmacy_name && (
              <>
                <h3 className="font-semibold mb-2">調剤薬局</h3>
                <div className="text-sm border border-gray-400 p-2">
                  {prescription.pharmacy_name}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-800 pt-4">
          <div className="grid grid-cols-3 gap-8 text-sm">
            <div>
              <div className="font-medium mb-2">処方箋番号</div>
              <div className="border-b border-gray-400 pb-1">
                #{prescription.prescription_id.toString().padStart(8, '0')}
              </div>
            </div>
            <div>
              <div className="font-medium mb-2">薬剤総数</div>
              <div className="border-b border-gray-400 pb-1">
                {prescription.total_medications}品目
              </div>
            </div>
            <div>
              <div className="font-medium mb-2">処方医師サイン</div>
              <div className="border-b border-gray-400 pb-1 h-8">
                {/* 実際の運用では医師のデジタル署名が入る */}
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 mt-4 text-center">
            発行日時: {new Date(prescription.generated_at).toLocaleString('ja-JP')}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .prescription-form {
            margin: 0;
            padding: 20mm;
            border: none;
            box-shadow: none;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          table {
            page-break-inside: avoid;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          .page-break {
            page-break-before: always;
          }
        }
        
        .prescription-form {
          font-family: 'MS Gothic', 'Osaka', monospace;
          line-height: 1.4;
        }
        
        table {
          font-size: 12px;
        }
        
        th, td {
          vertical-align: top;
        }
      `}</style>
    </div>
  );
}