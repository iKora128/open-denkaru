"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Patient } from '@/types/patient';

interface SimpleSOAPEditorProps {
  patient: Patient;
  onSave: (data: any) => void;
  className?: string;
}

export function SimpleSOAPEditor({ patient, onSave, className }: SimpleSOAPEditorProps) {
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');

  const handleSave = () => {
    const soapData = {
      subjective,
      objective,
      assessment,
      plan,
      private_notes: privateNotes
    };
    onSave(soapData);
  };

  return (
    <div className={className}>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-system-gray-900">
            SOAP記録 - {patient.full_name || `${patient.family_name || ''} ${patient.given_name || ''}`.trim()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subjective */}
          <div>
            <label className="block text-sm font-medium text-system-gray-700 mb-2">
              S - Subjective (主観的情報)
            </label>
            <Textarea
              value={subjective}
              onChange={(e) => setSubjective(e.target.value)}
              placeholder="患者の訴え、症状の詳細を記入..."
              className="min-h-[100px] resize-y"
            />
          </div>

          {/* Objective */}
          <div>
            <label className="block text-sm font-medium text-system-gray-700 mb-2">
              O - Objective (客観的情報)
            </label>
            <Textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="バイタルサイン、検査所見、身体所見を記入..."
              className="min-h-[100px] resize-y"
            />
          </div>

          {/* Assessment */}
          <div>
            <label className="block text-sm font-medium text-system-gray-700 mb-2">
              A - Assessment (評価・診断)
            </label>
            <Textarea
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              placeholder="診断、病状の評価を記入..."
              className="min-h-[80px] resize-y"
            />
          </div>

          {/* Plan */}
          <div>
            <label className="block text-sm font-medium text-system-gray-700 mb-2">
              P - Plan (計画)
            </label>
            <Textarea
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="治療計画、処方、指導内容を記入..."
              className="min-h-[100px] resize-y"
            />
          </div>

          {/* Private Notes */}
          <div>
            <label className="block text-sm font-medium text-system-gray-700 mb-2">
              プライベートメモ
            </label>
            <Textarea
              value={privateNotes}
              onChange={(e) => setPrivateNotes(e.target.value)}
              placeholder="内部メモ（患者には表示されません）..."
              className="min-h-[60px] resize-y bg-system-gray-50"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} className="px-8">
              記録を保存
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}