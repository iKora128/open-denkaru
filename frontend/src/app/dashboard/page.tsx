'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Calendar, Activity, TrendingUp, Search } from 'lucide-react';

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
        const response = await fetch('http://localhost:8000/api/v1/patients/');
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
    <div className="min-h-screen p-6 space-y-8">
      {/* Header Section */}
      <motion.div 
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
        {...animations.slideInUp}
      >
        <div>
          <h1 className="text-4xl font-bold text-system-gray-900 dark:text-white mb-2">
            おはようございます
          </h1>
          <p className="text-lg text-system-gray-600 dark:text-system-gray-400">
            今日も患者様の健康をサポートしましょう
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 min-w-fit">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="患者名、患者番号、カナで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-80 pl-10 pr-4 py-2 glass-input rounded-xl text-gray-900 placeholder-gray-500 
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

      {/* Quick Stats */}
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Schedule */}
        <motion.div 
          className="lg:col-span-2"
          {...animations.slideInUp}
          transition={{ delay: 0.2 }}
        >
          <Card hover elevated>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-apple-blue" />
                今日のスケジュール
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Schedule items would go here */}
              <div className="space-y-3">
                {[
                  { time: '09:00', patient: '田中 太郎', type: '定期検診', status: 'confirmed' },
                  { time: '09:30', patient: '佐藤 花子', type: '初診', status: 'confirmed' },
                  { time: '10:00', patient: '山田 次郎', type: 'フォローアップ', status: 'waiting' },
                  { time: '10:30', patient: '鈴木 美咲', type: '定期検診', status: 'pending' },
                ].map((appointment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-system-gray-200 dark:border-system-gray-700 hover:bg-system-gray-50 dark:hover:bg-system-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-mono text-apple-blue font-semibold w-12">
                        {appointment.time}
                      </div>
                      <div>
                        <div className="font-medium text-system-gray-900 dark:text-white">
                          {appointment.patient}
                        </div>
                        <div className="text-sm text-system-gray-600 dark:text-system-gray-400">
                          {appointment.type}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'confirmed' ? 'bg-medical-success/10 text-medical-success' :
                      appointment.status === 'waiting' ? 'bg-medical-warning/10 text-medical-warning' :
                      'bg-system-gray-100 text-system-gray-600'
                    }`}>
                      {appointment.status === 'confirmed' ? '確認済み' :
                       appointment.status === 'waiting' ? '待機中' : '保留'}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="space-y-6"
          {...animations.slideInUp}
          transition={{ delay: 0.3 }}
        >
          {/* Quick Actions Card */}
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-apple-purple" />
                クイックアクション
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="secondary" className="w-full justify-start" leftIcon={<Users className="w-4 h-4" />}>
                患者一覧
              </Button>
              <Button variant="secondary" className="w-full justify-start" leftIcon={<Plus className="w-4 h-4" />}>
                新規カルテ
              </Button>
              <Button variant="secondary" className="w-full justify-start" leftIcon={<Calendar className="w-4 h-4" />}>
                予約管理
              </Button>
              <Button variant="secondary" className="w-full justify-start" leftIcon={<TrendingUp className="w-4 h-4" />}>
                統計レポート
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card glass>
            <CardHeader>
              <CardTitle>最近のアクティビティ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {[
                  { action: 'カルテ更新', patient: '田中 太郎', time: '5分前' },
                  { action: '新規登録', patient: '佐藤 花子', time: '15分前' },
                  { action: '検査結果入力', patient: '山田 次郎', time: '1時間前' },
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex justify-between items-center py-2 border-b border-system-gray-100 dark:border-system-gray-800 last:border-0"
                  >
                    <div>
                      <div className="font-medium text-system-gray-900 dark:text-white">
                        {activity.action}
                      </div>
                      <div className="text-system-gray-600 dark:text-system-gray-400">
                        {activity.patient}
                      </div>
                    </div>
                    <div className="text-xs text-system-gray-500">
                      {activity.time}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
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

      {/* System Status Footer */}
      <motion.div 
        className="flex items-center justify-between p-4 rounded-xl glass-secondary text-sm"
        {...animations.slideInUp}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-medical-success rounded-full animate-pulse"></div>
            <span className="text-system-gray-600 dark:text-system-gray-400">システム正常動作中</span>
          </div>
          <div className="text-system-gray-500">
            最終更新: {new Date().toLocaleTimeString('ja-JP')}
          </div>
        </div>
        <div className="text-system-gray-500">
          Open Denkaru EMR v0.1.0
        </div>
      </motion.div>
    </div>
  );
}