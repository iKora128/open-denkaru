"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  SparklesIcon,
  MagnifyingGlassIcon,
  BeakerIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Pill } from 'lucide-react';

interface AIAssistantProps {
  className?: string;
}

interface AIRequest {
  type: 'diagnose' | 'drug-interactions' | 'lab-tests' | 'lab-analysis' | 'soap-note';
  data: any;
}

interface AIResponse {
  type: string;
  response: string;
  timestamp: string;
  metadata: any;
}

const AI_FEATURES = [
  {
    id: 'diagnose',
    title: '診断支援',
    description: '症状から考えられる疾患を提案',
    icon: MagnifyingGlassIcon,
    color: 'bg-blue-500'
  },
  {
    id: 'drug-interactions',
    title: '薬物相互作用',
    description: '処方薬の相互作用をチェック',
    icon: Pill,
    color: 'bg-red-500'
  },
  {
    id: 'lab-tests',
    title: '検査提案',
    description: '症状に応じた検査を提案',
    icon: BeakerIcon,
    color: 'bg-green-500'
  },
  {
    id: 'soap-note',
    title: 'SOAP記録',
    description: 'カルテ記録の作成支援',
    icon: DocumentTextIcon,
    color: 'bg-purple-500'
  }
];

export function AIAssistant({ className = '' }: AIAssistantProps) {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states for different features
  const [diagnosisForm, setDiagnosisForm] = useState({
    symptoms: '',
    patient_age: '',
    patient_gender: 'male',
    medical_history: '',
    lab_results: ''
  });

  const [drugInteractionForm, setDrugInteractionForm] = useState({
    medications: [''],
    patient_age: '',
    allergies: ''
  });

  const [labTestForm, setLabTestForm] = useState({
    symptoms: '',
    diagnosis: '',
    purpose: '診断'
  });

  const [soapForm, setSoapForm] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });

  const handleAIRequest = async (request: AIRequest) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const endpoints = {
        'diagnose': '/api/ai/diagnose',
        'drug-interactions': '/api/ai/drug-interactions',
        'lab-tests': '/api/ai/suggest-lab-tests',
        'soap-note': '/api/ai/generate-soap'
      } as const;
      const endpoint = endpoints[request.type as keyof typeof endpoints];

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request.data)
      });

      if (!response.ok) {
        throw new Error(`AI API Error: ${response.status}`);
      }

      const data: AIResponse = await response.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI処理中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiagnosisSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAIRequest({
      type: 'diagnose',
      data: {
        ...diagnosisForm,
        patient_age: parseInt(diagnosisForm.patient_age)
      }
    });
  };

  const handleDrugInteractionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAIRequest({
      type: 'drug-interactions',
      data: {
        medications: drugInteractionForm.medications.filter(med => med.trim()),
        patient_age: parseInt(drugInteractionForm.patient_age),
        allergies: drugInteractionForm.allergies || null
      }
    });
  };

  const handleLabTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAIRequest({
      type: 'lab-tests',
      data: labTestForm
    });
  };

  const handleSoapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAIRequest({
      type: 'soap-note',
      data: soapForm
    });
  };

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-blue-600" />
            AI医療アシスタント
          </CardTitle>
          <p className="text-gray-600">
            オンプレミスAIによる診療支援ツール（データは外部に送信されません）
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Feature Selection */}
          {!selectedFeature && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {AI_FEATURES.map((feature) => (
                <motion.div
                  key={feature.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="cursor-pointer"
                  onClick={() => setSelectedFeature(feature.id)}
                >
                  <Card className="h-full border-2 border-transparent hover:border-blue-300 transition-colors">
                    <CardContent className="p-6 text-center space-y-3">
                      <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mx-auto`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Selected Feature Form */}
          <AnimatePresence>
            {selectedFeature && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {AI_FEATURES.find(f => f.id === selectedFeature)?.title}
                  </h3>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedFeature(null);
                      setResponse(null);
                      setError(null);
                    }}
                  >
                    戻る
                  </Button>
                </div>

                {/* Diagnosis Support Form */}
                {selectedFeature === 'diagnose' && (
                  <form onSubmit={handleDiagnosisSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          年齢 *
                        </label>
                        <Input
                          type="number"
                          value={diagnosisForm.patient_age}
                          onChange={(e) => setDiagnosisForm({...diagnosisForm, patient_age: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          性別 *
                        </label>
                        <select
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={diagnosisForm.patient_gender}
                          onChange={(e) => setDiagnosisForm({...diagnosisForm, patient_gender: e.target.value})}
                        >
                          <option value="male">男性</option>
                          <option value="female">女性</option>
                          <option value="other">その他</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        主訴・症状 *
                      </label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        value={diagnosisForm.symptoms}
                        onChange={(e) => setDiagnosisForm({...diagnosisForm, symptoms: e.target.value})}
                        placeholder="患者の症状を詳細に記入"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        既往歴
                      </label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        value={diagnosisForm.medical_history}
                        onChange={(e) => setDiagnosisForm({...diagnosisForm, medical_history: e.target.value})}
                        placeholder="関連する既往歴があれば記入"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        検査結果
                      </label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        value={diagnosisForm.lab_results}
                        onChange={(e) => setDiagnosisForm({...diagnosisForm, lab_results: e.target.value})}
                        placeholder="既存の検査結果があれば記入"
                      />
                    </div>
                    
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? '分析中...' : 'AI診断支援を実行'}
                    </Button>
                  </form>
                )}

                {/* Drug Interaction Form */}
                {selectedFeature === 'drug-interactions' && (
                  <form onSubmit={handleDrugInteractionSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        年齢 *
                      </label>
                      <Input
                        type="number"
                        value={drugInteractionForm.patient_age}
                        onChange={(e) => setDrugInteractionForm({...drugInteractionForm, patient_age: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        薬剤リスト *
                      </label>
                      {drugInteractionForm.medications.map((med, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <Input
                            value={med}
                            onChange={(e) => {
                              const newMeds = [...drugInteractionForm.medications];
                              newMeds[index] = e.target.value;
                              setDrugInteractionForm({...drugInteractionForm, medications: newMeds});
                            }}
                            placeholder="薬剤名を入力"
                          />
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                const newMeds = drugInteractionForm.medications.filter((_, i) => i !== index);
                                setDrugInteractionForm({...drugInteractionForm, medications: newMeds});
                              }}
                            >
                              削除
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setDrugInteractionForm({
                            ...drugInteractionForm,
                            medications: [...drugInteractionForm.medications, '']
                          });
                        }}
                      >
                        薬剤追加
                      </Button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        アレルギー
                      </label>
                      <Input
                        value={drugInteractionForm.allergies}
                        onChange={(e) => setDrugInteractionForm({...drugInteractionForm, allergies: e.target.value})}
                        placeholder="既知のアレルギーがあれば記入"
                      />
                    </div>
                    
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? 'チェック中...' : '薬物相互作用をチェック'}
                    </Button>
                  </form>
                )}

                {/* Lab Test Suggestion Form */}
                {selectedFeature === 'lab-tests' && (
                  <form onSubmit={handleLabTestSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        症状 *
                      </label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        value={labTestForm.symptoms}
                        onChange={(e) => setLabTestForm({...labTestForm, symptoms: e.target.value})}
                        placeholder="患者の症状を記入"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        疑い診断
                      </label>
                      <Input
                        value={labTestForm.diagnosis}
                        onChange={(e) => setLabTestForm({...labTestForm, diagnosis: e.target.value})}
                        placeholder="疑われる診断があれば記入"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        検査目的
                      </label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={labTestForm.purpose}
                        onChange={(e) => setLabTestForm({...labTestForm, purpose: e.target.value})}
                      >
                        <option value="診断">診断</option>
                        <option value="経過観察">経過観察</option>
                        <option value="治療効果判定">治療効果判定</option>
                        <option value="スクリーニング">スクリーニング</option>
                      </select>
                    </div>
                    
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? '提案中...' : '検査提案を取得'}
                    </Button>
                  </form>
                )}

                {/* SOAP Note Form */}
                {selectedFeature === 'soap-note' && (
                  <form onSubmit={handleSoapSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        S (Subjective - 主観的情報) *
                      </label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        value={soapForm.subjective}
                        onChange={(e) => setSoapForm({...soapForm, subjective: e.target.value})}
                        placeholder="患者の主訴、現病歴など"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        O (Objective - 客観的情報) *
                      </label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        value={soapForm.objective}
                        onChange={(e) => setSoapForm({...soapForm, objective: e.target.value})}
                        placeholder="身体所見、検査結果など"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        A (Assessment - 評価)
                      </label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        value={soapForm.assessment}
                        onChange={(e) => setSoapForm({...soapForm, assessment: e.target.value})}
                        placeholder="診断、病状評価など"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        P (Plan - 計画)
                      </label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        value={soapForm.plan}
                        onChange={(e) => setSoapForm({...soapForm, plan: e.target.value})}
                        placeholder="治療計画、フォローアップなど"
                      />
                    </div>
                    
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? '作成中...' : 'SOAP記録を改善'}
                    </Button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center p-8"
            >
              <div className="flex items-center gap-3 text-blue-600">
                <ClockIcon className="h-5 w-5 animate-spin" />
                <span>AI処理中...</span>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4"
            >
              <div className="flex items-start gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <div className="font-medium text-red-800">エラーが発生しました</div>
                  <div className="text-sm text-red-700 mt-1">{error}</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* AI Response */}
          {response && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-6"
            >
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-green-800 mb-2">
                    AI分析結果
                  </div>
                  <div className="text-sm text-green-700 whitespace-pre-wrap">
                    {response.response}
                  </div>
                  <div className="text-xs text-green-600 mt-3">
                    生成時刻: {new Date(response.timestamp).toLocaleString('ja-JP')}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}