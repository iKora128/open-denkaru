'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Phone,
  Mail,
  RefreshCw,
  Eye,
  Edit,
  Download,
  MoreVertical
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { animations } from '@/lib/utils';
import { auditService } from '@/lib/audit';
import type { 
  Appointment, 
  AppointmentFilter, 
  AppointmentStats,
  AppointmentStatus,
  AppointmentType
} from '@/types/appointment';
import { useRouter } from 'next/navigation';

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  // フィルター状態
  const [filter, setFilter] = useState<AppointmentFilter>({
    page: 1,
    limit: 20,
    sort_by: 'appointment_date',
    sort_order: 'asc'
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<AppointmentType | ''>('');
  const [dateFilter, setDateFilter] = useState('today');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // データ取得
  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 実際の実装では API から取得
      // 開発中はモックデータを使用
      const mockAppointments: Appointment[] = [
        {
          id: 1,
          patient_id: 123,
          patient_name: '山田太郎',
          patient_number: 'P00123',
          doctor_id: 1,
          doctor_name: '田中医師',
          appointment_date: new Date().toISOString().split('T')[0] as string,
          appointment_time: '09:00',
          duration_minutes: 30,
          appointment_type: 'consultation',
          status: 'scheduled',
          priority: 'normal',
          department: '内科',
          chief_complaint: '頭痛、めまい',
          notes: '高血圧の既往歴あり',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 1,
          is_first_visit: false,
          insurance_type: '社会保険',
          contact_phone: '03-1234-5678',
          reminder_sent: true
        },
        {
          id: 2,
          patient_id: 124,
          patient_name: '佐藤花子',
          patient_number: 'P00124',
          doctor_id: 1,
          doctor_name: '田中医師',
          appointment_date: new Date().toISOString().split('T')[0] as string,
          appointment_time: '10:30',
          duration_minutes: 45,
          appointment_type: 'follow_up',
          status: 'confirmed',
          priority: 'high',
          department: '内科',
          chief_complaint: '糖尿病定期検査',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 2,
          confirmed_at: new Date(Date.now() - 86400000).toISOString(),
          is_first_visit: false,
          insurance_type: '国民健康保険',
          contact_phone: '090-1234-5678',
          contact_email: 'sato@example.com',
          reminder_sent: true
        },
        {
          id: 3,
          patient_id: 125,
          patient_name: '鈴木一郎',
          patient_number: 'P00125',
          doctor_id: 2,
          doctor_name: '中村医師',
          appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0] as string,
          appointment_time: '14:00',
          duration_minutes: 60,
          appointment_type: 'examination',
          status: 'scheduled',
          priority: 'urgent',
          department: '外科',
          chief_complaint: '腹痛、発熱',
          notes: '緊急性あり。優先的に診察',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 1,
          is_first_visit: true,
          insurance_type: '社会保険',
          contact_phone: '080-1234-5678',
          reminder_sent: false
        }
      ];

      const mockStats: AppointmentStats = {
        total_appointments: 45,
        today_appointments: 12,
        upcoming_appointments: 28,
        completed_appointments: 15,
        cancelled_appointments: 2,
        no_show_rate: 3.2,
        average_wait_time: 15,
        appointments_by_status: [
          { status: 'scheduled', count: 20 },
          { status: 'confirmed', count: 8 },
          { status: 'completed', count: 15 },
          { status: 'cancelled', count: 2 }
        ],
        appointments_by_type: [
          { type: 'consultation', count: 25 },
          { type: 'follow_up', count: 12 },
          { type: 'examination', count: 8 }
        ],
        appointments_by_department: [
          { department: '内科', count: 20 },
          { department: '外科', count: 15 },
          { department: '小児科', count: 10 }
        ]
      };

      setAppointments(mockAppointments);
      setStats(mockStats);

      // 監査ログに記録
      await auditService.log({
        action: 'page_view',
        resource_type: 'appointment',
        details: {
          filter_applied: filter,
          result_count: mockAppointments.length
        },
        severity: 'low'
      });
      
    } catch (err: any) {
      setError(err.message || '予約情報の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    const newFilter: AppointmentFilter = {
      ...filter,
      search_query: searchQuery || undefined,
      status: statusFilter || undefined,
      appointment_type: typeFilter || undefined,
      department: departmentFilter || undefined,
      page: 1
    };

    // 日付フィルターの処理
    const today = new Date();
    switch (dateFilter) {
      case 'today':
        newFilter.date_from = today.toISOString().split('T')[0];
        newFilter.date_to = today.toISOString().split('T')[0];
        break;
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        newFilter.date_from = tomorrow.toISOString().split('T')[0];
        newFilter.date_to = tomorrow.toISOString().split('T')[0];
        break;
      case 'week':
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        newFilter.date_from = today.toISOString().split('T')[0];
        newFilter.date_to = weekEnd.toISOString().split('T')[0];
        break;
    }

    setFilter(newFilter);
  };

  const handleReset = () => {
    setSearchQuery('');
    setStatusFilter('');
    setTypeFilter('');
    setDateFilter('today');
    setDepartmentFilter('');
    setFilter({ page: 1, limit: 20, sort_by: 'appointment_date', sort_order: 'asc' });
  };

  const handleAppointmentAction = async (appointmentId: number, action: string) => {
    try {
      const appointment = appointments.find(a => a.id === appointmentId);
      if (!appointment) return;

      let newStatus: AppointmentStatus = appointment.status;
      
      switch (action) {
        case 'confirm':
          newStatus = 'confirmed';
          break;
        case 'checkin':
          newStatus = 'checked_in';
          break;
        case 'start':
          newStatus = 'in_progress';
          break;
        case 'complete':
          newStatus = 'completed';
          break;
        case 'cancel':
          newStatus = 'cancelled';
          break;
        case 'no_show':
          newStatus = 'no_show';
          break;
      }

      // API 呼び出し（実際の実装では）
      setAppointments(appointments.map(a => 
        a.id === appointmentId ? { ...a, status: newStatus } : a
      ));

      // 監査ログに記録
      await auditService.log({
        action: 'appointment_update',
        resource_type: 'appointment',
        resource_id: appointmentId,
        details: {
          action_type: action,
          patient_name: appointment.patient_name,
          previous_status: appointment.status,
          new_status: newStatus,
          appointment_date: appointment.appointment_date,
          appointment_time: appointment.appointment_time
        },
        severity: 'medium'
      });

    } catch (error) {
      console.error(`Failed to ${action} appointment:`, error);
    }
  };

  const getStatusColor = (status: AppointmentStatus) => {
    const colors = {
      scheduled: 'text-blue-600 bg-blue-100',
      confirmed: 'text-green-600 bg-green-100',
      checked_in: 'text-yellow-600 bg-yellow-100',
      in_progress: 'text-purple-600 bg-purple-100',
      completed: 'text-green-700 bg-green-200',
      cancelled: 'text-red-600 bg-red-100',
      no_show: 'text-gray-600 bg-gray-100',
      rescheduled: 'text-orange-600 bg-orange-100'
    };
    return colors[status] || colors.scheduled;
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    const labels = {
      scheduled: '予約済み',
      confirmed: '確認済み',
      checked_in: '受付済み',
      in_progress: '診察中',
      completed: '完了',
      cancelled: 'キャンセル',
      no_show: '無断キャンセル',
      rescheduled: '変更済み'
    };
    return labels[status] || status;
  };


  const getTypeLabel = (type: AppointmentType) => {
    const labels = {
      consultation: '診察',
      follow_up: '再診',
      emergency: '緊急',
      surgery: '手術',
      examination: '検査',
      vaccination: '予防接種',
      health_check: '健康診断',
      therapy: '治療',
      other: 'その他'
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-apple-blue" />
          <span className="text-lg">予約情報を読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard requiredPermission="read_appointment">
      <div className="min-h-screen bg-gradient-to-br from-system-gray-50 via-white to-apple-blue/5">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-system-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <motion.div 
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
              {...animations.slideInUp}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-apple-blue" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-system-gray-900">
                      予約管理
                    </h1>
                    <p className="text-lg text-system-gray-600">
                      診療予約の管理とスケジュール調整
                    </p>
                  </div>
                </div>
                
                {/* 今日の統計 */}
                {stats && (
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-apple-blue rounded-full"></div>
                      <span className="text-system-gray-600">
                        今日の予約: {stats.today_appointments}件
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-medical-success rounded-full"></div>
                      <span className="text-system-gray-600">
                        完了: {stats.completed_appointments}件
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-medical-warning rounded-full"></div>
                      <span className="text-system-gray-600">
                        待機中: {stats.upcoming_appointments}件
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    リスト
                  </Button>
                  <Button
                    variant={viewMode === 'calendar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('calendar')}
                  >
                    カレンダー
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={fetchAppointments}
                  leftIcon={<RefreshCw className="w-5 h-5" />}
                >
                  更新
                </Button>
                <Button 
                  size="lg" 
                  leftIcon={<Plus className="w-5 h-5" />}
                  onClick={() => router.push('/appointments/new')}
                >
                  新規予約
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
                      <Calendar className="w-6 h-6 text-apple-blue" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-system-gray-900">
                        {stats.today_appointments}
                      </div>
                      <div className="text-sm text-system-gray-600">今日の予約</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card glass>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-medical-success/10 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-medical-success" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-system-gray-900">
                        {stats.completed_appointments}
                      </div>
                      <div className="text-sm text-system-gray-600">完了</div>
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
                        {stats.average_wait_time}分
                      </div>
                      <div className="text-sm text-system-gray-600">平均待ち時間</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card glass>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-medical-error/10 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-medical-error" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-system-gray-900">
                        {stats.no_show_rate}%
                      </div>
                      <div className="text-sm text-system-gray-600">無断キャンセル率</div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="患者名、診断、メモで検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 glass-input rounded-xl"
                      />
                    </div>
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus)}
                    className="px-3 py-2 glass-input rounded-xl"
                  >
                    <option value="">全ステータス</option>
                    <option value="scheduled">予約済み</option>
                    <option value="confirmed">確認済み</option>
                    <option value="checked_in">受付済み</option>
                    <option value="in_progress">診察中</option>
                    <option value="completed">完了</option>
                  </select>

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as AppointmentType)}
                    className="px-3 py-2 glass-input rounded-xl"
                  >
                    <option value="">全タイプ</option>
                    <option value="consultation">診察</option>
                    <option value="follow_up">再診</option>
                    <option value="examination">検査</option>
                    <option value="emergency">緊急</option>
                  </select>

                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2 glass-input rounded-xl"
                  >
                    <option value="today">今日</option>
                    <option value="tomorrow">明日</option>
                    <option value="week">今週</option>
                    <option value="all">全期間</option>
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

          {/* 予約リスト */}
          <motion.div
            {...animations.slideInUp}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <Card glass>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>予約一覧</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                      エクスポート
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-system-gray-200 rounded-lg hover:bg-system-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-apple-blue to-apple-purple rounded-full flex items-center justify-center text-white font-medium">
                            {appointment.patient_name[0]}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-medium text-system-gray-900">
                                {appointment.patient_name}
                              </span>
                              <span className="text-sm text-system-gray-600">
                                ({appointment.patient_number})
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                {getStatusLabel(appointment.status)}
                              </span>
                              {appointment.priority === 'urgent' && (
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                            <div className="text-sm text-system-gray-600">
                              {appointment.appointment_date} {appointment.appointment_time} 
                              ({appointment.duration_minutes}分) • {appointment.doctor_name} • {appointment.department}
                            </div>
                            <div className="text-sm text-system-gray-600">
                              {getTypeLabel(appointment.appointment_type)} • {appointment.chief_complaint}
                            </div>
                            {appointment.contact_phone && (
                              <div className="flex items-center gap-2 text-xs text-system-gray-500 mt-1">
                                <Phone className="w-3 h-3" />
                                <span>{appointment.contact_phone}</span>
                                {appointment.contact_email && (
                                  <>
                                    <Mail className="w-3 h-3 ml-2" />
                                    <span>{appointment.contact_email}</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* アクションボタン */}
                          {appointment.status === 'scheduled' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAppointmentAction(appointment.id, 'confirm')}
                            >
                              確認
                            </Button>
                          )}
                          
                          {appointment.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAppointmentAction(appointment.id, 'checkin')}
                            >
                              受付
                            </Button>
                          )}
                          
                          {appointment.status === 'checked_in' && (
                            <Button
                              size="sm"
                              onClick={() => handleAppointmentAction(appointment.id, 'start')}
                            >
                              診察開始
                            </Button>
                          )}
                          
                          {appointment.status === 'in_progress' && (
                            <Button
                              size="sm"
                              onClick={() => handleAppointmentAction(appointment.id, 'complete')}
                            >
                              完了
                            </Button>
                          )}

                          <div className="relative group">
                            <Button variant="outline" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                            
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-system-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => router.push(`/appointments/${appointment.id}`)}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-system-gray-50 flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  詳細表示
                                </button>
                                <button
                                  onClick={() => router.push(`/appointments/${appointment.id}/edit`)}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-system-gray-50 flex items-center gap-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  編集
                                </button>
                                <button
                                  onClick={() => handleAppointmentAction(appointment.id, 'cancel')}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-system-gray-50 flex items-center gap-2 text-red-600"
                                >
                                  <XCircle className="w-4 h-4" />
                                  キャンセル
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {appointments.length === 0 && (
                  <div className="text-center py-8 text-system-gray-500">
                    予約が見つかりません
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