'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Users, 
  Calendar, 
  Activity, 
  TrendingUp, 
  Search, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Bell,
  Heart,
  Stethoscope,
  Thermometer,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, VitalCard } from '@/components/ui/card';
import { PatientCard } from '@/components/medical/PatientCard';
import { animations } from '@/lib/utils';
import type { Patient } from '@/types/patient';

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch patients from API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('http://localhost:8001/api/v1/patients/');
        if (response.ok) {
          const data = await response.json();
          setPatients(data);
        }
      } catch (error) {
        console.error('Failed to fetch patients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Filter patients based on search query
  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.patient_number.includes(searchQuery) ||
    (patient.full_name_kana && patient.full_name_kana.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-apple-blue/5 via-white to-apple-purple/5 border-b border-system-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div 
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
            {...animations.slideInUp}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center">
                  <Heart className="w-6 h-6 text-medical-error" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-system-gray-900 dark:text-white">
                    おはようございます、田中医師
                  </h1>
                  <p className="text-lg text-system-gray-600 dark:text-system-gray-400">
                    今日も患者様の健康をサポートしましょう
                  </p>
                </div>
              </div>
              
              {/* Quick Status */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-medical-success rounded-full animate-pulse"></div>
                  <span className="text-system-gray-600">システム正常動作中</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-apple-blue" />
                  <span className="text-system-gray-600">
                    最終更新: {new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 min-w-fit">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="患者名、患者番号、カナで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-80 pl-10 pr-4 py-3 glass-input rounded-xl text-gray-900 placeholder-gray-500 
                           focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30
                           transition-all duration-200"
                />
              </div>
              <Button 
                size="lg" 
                leftIcon={<Plus className="w-5 h-5" />}
                className="whitespace-nowrap"
              >
                新規患者登録
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Enhanced Quick Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          {...animations.slideInUp}
          transition={{ delay: 0.1 }}
        >
          <VitalCard
            value={24}
            label="今日の予約"
            status="normal"
            trend="up"
          />
          <VitalCard
            value={patients.length}
            label="総患者数"
            status="normal"
            trend="up"
          />
          <VitalCard
            value={3}
            label="緊急対応"
            status="warning"
            trend="stable"
          />
          <VitalCard
            value="98.5%"
            label="システム稼働率"
            status="normal"
            trend="stable"
          />
        </motion.div>

        {/* Critical Alerts Banner */}
        <motion.div
          {...animations.slideInUp}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-l-4 border-l-medical-warning bg-medical-warning/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-medical-warning" />
                  <div>
                    <h3 className="font-medium text-system-gray-900">重要な通知</h3>
                    <p className="text-sm text-system-gray-600">2件の緊急アラートがあります</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  詳細を確認
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Enhanced Today's Schedule */}
          <motion.div 
            className="lg:col-span-2"
            {...animations.slideInUp}
            transition={{ delay: 0.2 }}
          >
            <Card hover elevated className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-apple-blue/5 to-apple-purple/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-apple-blue" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">今日のスケジュール</h3>
                      <p className="text-sm text-system-gray-600 font-normal">
                        {new Date().toLocaleDateString('ja-JP', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          weekday: 'long'
                        })}
                      </p>
                    </div>
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    全て表示
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-system-gray-100">
                  {[
                    { time: '09:00', patient: '田中 太郎', type: '定期検診', status: 'confirmed', urgency: 'normal' },
                    { time: '09:30', patient: '佐藤 花子', type: '初診', status: 'confirmed', urgency: 'normal' },
                    { time: '10:00', patient: '山田 次郎', type: 'フォローアップ', status: 'waiting', urgency: 'high' },
                    { time: '10:30', patient: '鈴木 美咲', type: '定期検診', status: 'pending', urgency: 'normal' },
                    { time: '11:00', patient: '伊藤 健一', type: '緊急診察', status: 'confirmed', urgency: 'critical' },
                  ].map((appointment, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="p-6 hover:bg-system-gray-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center">
                            <div className="text-lg font-bold text-apple-blue font-mono">
                              {appointment.time}
                            </div>
                            <div className="w-8 h-0.5 bg-apple-blue/20 rounded-full"></div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              appointment.urgency === 'critical' ? 'bg-medical-error/10' :
                              appointment.urgency === 'high' ? 'bg-medical-warning/10' :
                              'bg-medical-success/10'
                            }`}>
                              <Stethoscope className={`w-5 h-5 ${
                                appointment.urgency === 'critical' ? 'text-medical-error' :
                                appointment.urgency === 'high' ? 'text-medical-warning' :
                                'text-medical-success'
                              }`} />
                            </div>
                            
                            <div>
                              <div className="font-semibold text-system-gray-900 group-hover:text-apple-blue transition-colors">
                                {appointment.patient}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-system-gray-600">
                                <span>{appointment.type}</span>
                                {appointment.urgency === 'critical' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-medical-error/10 text-medical-error text-xs font-medium">
                                    <AlertTriangle className="w-3 h-3" />
                                    緊急
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                            appointment.status === 'confirmed' ? 'bg-medical-success/10 text-medical-success' :
                            appointment.status === 'waiting' ? 'bg-medical-warning/10 text-medical-warning' :
                            'bg-system-gray-100 text-system-gray-600'
                          }`}>
                            {appointment.status === 'confirmed' && <CheckCircle className="w-3 h-3" />}
                            {appointment.status === 'waiting' && <Clock className="w-3 h-3" />}
                            <span>
                              {appointment.status === 'confirmed' ? '確認済み' :
                               appointment.status === 'waiting' ? '待機中' : '保留'}
                            </span>
                          </div>
                          <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Sidebar */}
          <motion.div 
            className="space-y-6"
            {...animations.slideInUp}
            transition={{ delay: 0.3 }}
          >
            {/* Quick Actions Card */}
            <Card glass className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-apple-purple/5 to-apple-blue/5">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
                    <Activity className="w-5 h-5 text-apple-purple" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">クイックアクション</h3>
                    <p className="text-sm text-system-gray-600 font-normal">よく使用する機能</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-6">
                <Button variant="secondary" className="w-full justify-start h-12" leftIcon={<Users className="w-5 h-5" />}>
                  <div className="text-left">
                    <div className="font-medium">患者一覧</div>
                    <div className="text-xs opacity-70">患者情報の確認・編集</div>
                  </div>
                </Button>
                <Button variant="secondary" className="w-full justify-start h-12" leftIcon={<Plus className="w-5 h-5" />}>
                  <div className="text-left">
                    <div className="font-medium">新規カルテ</div>
                    <div className="text-xs opacity-70">診療記録の作成</div>
                  </div>
                </Button>
                <Button variant="secondary" className="w-full justify-start h-12" leftIcon={<Calendar className="w-5 h-5" />}>
                  <div className="text-left">
                    <div className="font-medium">予約管理</div>
                    <div className="text-xs opacity-70">スケジュール調整</div>
                  </div>
                </Button>
                <Button variant="secondary" className="w-full justify-start h-12" leftIcon={<TrendingUp className="w-5 h-5" />}>
                  <div className="text-left">
                    <div className="font-medium">統計レポート</div>
                    <div className="text-xs opacity-70">診療データ分析</div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Enhanced Recent Activity */}
            <Card glass className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-medical-info/5 to-medical-success/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
                      <Bell className="w-5 h-5 text-medical-info" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">最近のアクティビティ</h3>
                      <p className="text-sm text-system-gray-600 font-normal">直近の医療記録</p>
                    </div>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-system-gray-100">
                  {[
                    { action: 'カルテ更新', patient: '田中 太郎', time: '5分前', type: 'update' },
                    { action: '新規登録', patient: '佐藤 花子', time: '15分前', type: 'create' },
                    { action: '検査結果入力', patient: '山田 次郎', time: '1時間前', type: 'test' },
                    { action: '処方箋発行', patient: '鈴木 美咲', time: '2時間前', type: 'prescription' },
                  ].map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="p-4 hover:bg-system-gray-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'update' ? 'bg-medical-info/10' :
                          activity.type === 'create' ? 'bg-medical-success/10' :
                          activity.type === 'test' ? 'bg-medical-warning/10' :
                          'bg-apple-purple/10'
                        }`}>
                          {activity.type === 'update' && <Activity className="w-4 h-4 text-medical-info" />}
                          {activity.type === 'create' && <Plus className="w-4 h-4 text-medical-success" />}
                          {activity.type === 'test' && <Thermometer className="w-4 h-4 text-medical-warning" />}
                          {activity.type === 'prescription' && <Heart className="w-4 h-4 text-apple-purple" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-system-gray-900 group-hover:text-apple-blue transition-colors">
                            {activity.action}
                          </div>
                          <div className="text-sm text-system-gray-600 truncate">
                            {activity.patient}
                          </div>
                        </div>
                        <div className="text-xs text-system-gray-500 flex-shrink-0">
                          {activity.time}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-4 border-t border-system-gray-100">
                  <Button variant="ghost" className="w-full text-sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    全てのアクティビティを表示
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Patients Section */}
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-system-gray-900 dark:text-white">
              検索結果 ({filteredPatients.length}名)
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPatients.map((patient, index) => (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PatientCard
                      patient={patient}
                      onClick={(patient) => {
                        console.log('Patient clicked:', patient);
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}

          {!isLoading && filteredPatients.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-12 text-center"
            >
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                患者が見つかりません
              </h3>
              <p className="text-gray-600 mb-6">
                検索条件に一致する患者がいません。
              </p>
              <Button>
                <Plus className="h-5 w-5 mr-2" />
                新規患者登録
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}

        {/* Enhanced System Status Footer */}
        <motion.div 
          className="bg-gradient-to-r from-system-gray-50 to-white rounded-2xl border border-system-gray-200 p-6"
          {...animations.slideInUp}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-medical-success rounded-full animate-pulse"></div>
                <span className="font-medium text-system-gray-800">システム正常動作中</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-system-gray-600">
                <Clock className="w-4 h-4" />
                <span>最終更新: {new Date().toLocaleTimeString('ja-JP')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-system-gray-600">
                <Users className="w-4 h-4" />
                <span>接続中ユーザー: 12名</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-system-gray-500">
              <span>Open Denkaru EMR v0.1.0</span>
              <div className="w-1 h-1 bg-system-gray-300 rounded-full"></div>
              <span>© 2025 Open Source Medical Records</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}