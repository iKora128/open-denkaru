'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Plus, 
  Search, 
  Filter,
  FileText,
  User,
  Activity,
  RefreshCw,
  Eye,
  Edit,
  Download,
  MoreVertical,
  Clock,
  Heart
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { animations } from '@/lib/utils';
import { auditService } from '@/lib/audit';
// import type { MedicalRecord } from '@/types/medical-record';

// モック用の型定義
interface MedicalRecord {
  id: number;
  patient_id: number;
  patient_name: string;
  patient_number: string;
  doctor_id: number;
  doctor_name: string;
  appointment_id?: number;
  record_date: string;
  department: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  vital_signs?: any;
  diagnosis_codes?: string[];
  created_at: string;
  updated_at: string;
  created_by: number;
  is_final: boolean;
}
import { useRouter } from 'next/navigation';

// カルテ統計の型
interface RecordStats {
  total_records: number;
  today_records: number;
  this_week_records: number;
  pending_records: number;
  records_by_department: Array<{
    department: string;
    count: number;
  }>;
  records_by_type: Array<{
    type: string;
    count: number;
  }>;
  recent_activity: MedicalRecord[];
}

// カルテフィルターの型
interface RecordFilter {
  patient_id?: number;
  doctor_id?: number;
  department?: string;
  record_type?: string;
  date_from?: string;
  date_to?: string;
  search_query?: string;
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'patient_name' | 'department';
  sort_order?: 'asc' | 'desc';
}

export default function RecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [stats, setStats] = useState<RecordStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  
  // フィルター状態
  const [filter, setFilter] = useState<RecordFilter>({
    page: 1,
    limit: 20,
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  // データ取得
  useEffect(() => {
    fetchRecords();
  }, [filter]);

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 実際の実装では API から取得
      // 開発中はモックデータを使用
      const mockRecords: MedicalRecord[] = [
        {
          id: 1,
          patient_id: 123,
          patient_name: '山田太郎',
          patient_number: 'P00123',
          doctor_id: 1,
          doctor_name: '田中医師',
          appointment_id: 1,
          record_date: new Date().toISOString().split('T')[0] as string,
          department: '内科',
          subjective: '頭痛が3日間続いている。朝方に特に強く、めまいも伴う。',
          objective: 'BP: 140/90 mmHg, HR: 80 bpm, 体温: 36.8°C, 顔面やや紅潮',
          assessment: '高血圧による頭痛の可能性。ストレス関連も考慮。',
          plan: 'ACE阻害薬処方。1週間後再診。生活習慣指導実施。',
          vital_signs: {
            blood_pressure_systolic: 140,
            blood_pressure_diastolic: 90,
            heart_rate: 80,
            temperature: 36.8,
            weight: 72,
            height: 170,
            oxygen_saturation: 98
          },
          diagnosis_codes: ['I10', 'R51'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 1,
          is_final: true
        },
        {
          id: 2,
          patient_id: 124,
          patient_name: '佐藤花子',
          patient_number: 'P00124',
          doctor_id: 1,
          doctor_name: '田中医師',
          appointment_id: 2,
          record_date: new Date(Date.now() - 86400000).toISOString().split('T')[0] as string,
          department: '内科',
          subjective: '糖尿病定期検査。食後血糖値がやや高めで心配。',
          objective: 'HbA1c: 7.2%, 空腹時血糖: 126 mg/dl, 体重: 58kg',
          assessment: '2型糖尿病。血糖コントロール要改善。',
          plan: 'メトホルミン増量。栄養指導予約。3ヶ月後再検査。',
          vital_signs: {
            blood_pressure_systolic: 125,
            blood_pressure_diastolic: 78,
            heart_rate: 72,
            temperature: 36.5,
            weight: 58,
            height: 158,
            oxygen_saturation: 99
          },
          diagnosis_codes: ['E11.9'],
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          created_by: 1,
          is_final: true
        },
        {
          id: 3,
          patient_id: 125,
          patient_name: '鈴木一郎',
          patient_number: 'P00125',
          doctor_id: 2,
          doctor_name: '中村医師',
          appointment_id: 3,
          record_date: new Date().toISOString().split('T')[0] as string,
          department: '外科',
          subjective: '右下腹部痛、発熱38.5度。昨夜から症状出現。',
          objective: '右下腹部に圧痛、反跳痛あり。McBurney点圧痛陽性。',
          assessment: '急性虫垂炎疑い。緊急手術適応の可能性。',
          plan: '緊急CT撮影。外科コンサル。手術準備。',
          vital_signs: {
            blood_pressure_systolic: 130,
            blood_pressure_diastolic: 85,
            heart_rate: 95,
            temperature: 38.5,
            weight: 70,
            height: 175,
            oxygen_saturation: 97
          },
          diagnosis_codes: ['K35.9'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 2,
          is_final: false
        }
      ];

      const mockStats: RecordStats = {
        total_records: 245,
        today_records: 12,
        this_week_records: 67,
        pending_records: 3,
        records_by_department: [
          { department: '内科', count: 120 },
          { department: '外科', count: 65 },
          { department: '小児科', count: 35 },
          { department: '整形外科', count: 25 }
        ],
        records_by_type: [
          { type: '初診', count: 80 },
          { type: '再診', count: 145 },
          { type: '定期検査', count: 20 }
        ],
        recent_activity: mockRecords.slice(0, 5)
      };

      setRecords(mockRecords);
      setStats(mockStats);

      // 監査ログに記録
      await auditService.log({
        action: 'record_view',
        resource_type: 'record',
        details: {
          filter_applied: filter,
          result_count: mockRecords.length
        },
        severity: 'low'
      });
      
    } catch (err: any) {
      setError(err.message || 'カルテ情報の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    const newFilter: RecordFilter = {
      ...filter,
      search_query: searchQuery || undefined,
      department: departmentFilter || undefined,
      record_type: typeFilter || undefined,
      page: 1
    };

    // 日付フィルターの処理
    const today = new Date();
    switch (dateFilter) {
      case 'today':
        newFilter.date_from = today.toISOString().split('T')[0];
        newFilter.date_to = today.toISOString().split('T')[0];
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        newFilter.date_from = weekAgo.toISOString().split('T')[0];
        newFilter.date_to = today.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        newFilter.date_from = monthAgo.toISOString().split('T')[0];
        newFilter.date_to = today.toISOString().split('T')[0];
        break;
    }

    setFilter(newFilter);
  };

  const handleReset = () => {
    setSearchQuery('');
    setDepartmentFilter('');
    setTypeFilter('');
    setDateFilter('all');
    setFilter({ page: 1, limit: 20, sort_by: 'created_at', sort_order: 'desc' });
  };

  const handleRecordAccess = async (recordId: number, action: string) => {
    const record = records.find(r => r.id === recordId);
    if (!record) return;

    // 監査ログに記録
    await auditService.logPatientAccess(
      action as any,
      record.patient_id,
      {
        record_id: recordId,
        patient_name: record.patient_name,
        record_date: record.record_date,
        department: record.department
      }
    );

    // 実際のアクション実行
    switch (action) {
      case 'record_view':
        router.push(`/records/${recordId}`);
        break;
      case 'record_edit':
        router.push(`/records/${recordId}/edit`);
        break;
    }
  };

  const formatVitalSigns = (vitals: any) => {
    if (!vitals) return '記録なし';
    
    const parts = [];
    if (vitals.blood_pressure_systolic && vitals.blood_pressure_diastolic) {
      parts.push(`BP: ${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic}`);
    }
    if (vitals.heart_rate) {
      parts.push(`HR: ${vitals.heart_rate}`);
    }
    if (vitals.temperature) {
      parts.push(`体温: ${vitals.temperature}°C`);
    }
    if (vitals.weight) {
      parts.push(`体重: ${vitals.weight}kg`);
    }
    
    return parts.join(', ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-apple-blue" />
          <span className="text-lg">カルテ情報を読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard requiredPermission="read_record">
      <div>
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-system-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <motion.div 
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
              {...animations.slideInUp}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-apple-blue" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-system-gray-900">
                      電子カルテ
                    </h1>
                    <p className="text-lg text-system-gray-600">
                      診療記録の管理と閲覧
                    </p>
                  </div>
                </div>
                
                {/* 今日の統計 */}
                {stats && (
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-apple-blue rounded-full"></div>
                      <span className="text-system-gray-600">
                        今日の記録: {stats.today_records}件
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-medical-success rounded-full"></div>
                      <span className="text-system-gray-600">
                        今週: {stats.this_week_records}件
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-medical-warning rounded-full"></div>
                      <span className="text-system-gray-600">
                        未完了: {stats.pending_records}件
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={fetchRecords}
                  leftIcon={<RefreshCw className="w-5 h-5" />}
                >
                  更新
                </Button>
                <Button 
                  size="lg" 
                  leftIcon={<Plus className="w-5 h-5" />}
                  onClick={() => router.push('/records/new')}
                >
                  新規カルテ
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* 統計情報 */}
          {stats && (
            <motion.div
              {...animations.slideInUp}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <Card glass>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-apple-blue/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-apple-blue" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-system-gray-900">
                        {stats.today_records}
                      </div>
                      <div className="text-sm text-system-gray-600">今日の記録</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card glass>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-medical-success/10 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-medical-success" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-system-gray-900">
                        {stats.this_week_records}
                      </div>
                      <div className="text-sm text-system-gray-600">今週の記録</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card glass>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-apple-purple/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-apple-purple" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-system-gray-900">
                        {stats.total_records}
                      </div>
                      <div className="text-sm text-system-gray-600">総記録数</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card glass>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-medical-warning/10 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-medical-warning" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-system-gray-900">
                        {stats.pending_records}
                      </div>
                      <div className="text-sm text-system-gray-600">未完了記録</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 検索とフィルター */}
          <motion.div
            {...animations.slideInUp}
            transition={{ delay: 0.1 }}
          >
            <Card glass>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Filter className="w-5 h-5 text-apple-blue" />
                  検索・フィルター
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="患者名、診断、症状で検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 glass-input rounded-xl"
                      />
                    </div>
                  </div>

                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="px-3 py-2 glass-input rounded-xl"
                  >
                    <option value="">全診療科</option>
                    <option value="内科">内科</option>
                    <option value="外科">外科</option>
                    <option value="小児科">小児科</option>
                    <option value="整形外科">整形外科</option>
                  </select>

                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2 glass-input rounded-xl"
                  >
                    <option value="all">全期間</option>
                    <option value="today">今日</option>
                    <option value="week">今週</option>
                    <option value="month">今月</option>
                  </select>

                  <div className="flex gap-2">
                    <Button onClick={handleSearch} size="sm">
                      検索
                    </Button>
                    <Button onClick={handleReset} variant="outline" size="sm">
                      リセット
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* カルテリスト */}
          <motion.div
            {...animations.slideInUp}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <Card glass>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>診療記録一覧</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                      エクスポート
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {records.map((record) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-system-gray-200 rounded-lg hover:bg-system-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-apple-blue to-apple-purple rounded-full flex items-center justify-center text-white font-medium">
                            {record.patient_name[0]}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-medium text-system-gray-900">
                                {record.patient_name}
                              </span>
                              <span className="text-sm text-system-gray-600">
                                ({record.patient_number})
                              </span>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                                {record.department}
                              </span>
                              {!record.is_final && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-600">
                                  未完了
                                </span>
                              )}
                            </div>
                            
                            <div className="text-sm text-system-gray-600 mb-2">
                              {record.record_date} • {record.doctor_name}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="font-medium text-system-gray-700 mb-1">主訴・症状</div>
                                <div className="text-system-gray-600 line-clamp-2">
                                  {record.subjective}
                                </div>
                              </div>
                              
                              <div>
                                <div className="font-medium text-system-gray-700 mb-1">診断・治療方針</div>
                                <div className="text-system-gray-600 line-clamp-2">
                                  {record.assessment}
                                </div>
                              </div>
                            </div>
                            
                            {record.vital_signs && (
                              <div className="mt-3 p-3 bg-system-gray-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Heart className="w-4 h-4 text-red-500" />
                                  <span className="text-sm font-medium text-system-gray-700">バイタルサイン</span>
                                </div>
                                <div className="text-sm text-system-gray-600">
                                  {formatVitalSigns(record.vital_signs)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRecordAccess(record.id, 'record_view')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          <div className="relative group">
                            <Button variant="outline" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                            
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-system-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleRecordAccess(record.id, 'record_view')}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-system-gray-50 flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  詳細表示
                                </button>
                                <button
                                  onClick={() => handleRecordAccess(record.id, 'record_edit')}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-system-gray-50 flex items-center gap-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  編集
                                </button>
                                <button
                                  onClick={() => router.push(`/patients/${record.patient_id}`)}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-system-gray-50 flex items-center gap-2"
                                >
                                  <User className="w-4 h-4" />
                                  患者情報
                                </button>
                                <button
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-system-gray-50 flex items-center gap-2"
                                >
                                  <Download className="w-4 h-4" />
                                  PDF出力
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {records.length === 0 && (
                  <div className="text-center py-8 text-system-gray-500">
                    診療記録が見つかりません
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
}