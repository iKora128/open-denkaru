'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Users, 
  RefreshCw,
  Grid,
  List
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PatientCard } from '@/components/medical/PatientCard';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { animations } from '@/lib/utils';
import { medicalApi } from '@/lib/api';
import type { Patient } from '@/types/patient';
import { useRouter } from 'next/navigation';

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'age' | 'created_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'male' | 'female'>('all');

  // Fetch patients from API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoading(true);
        const data = await medicalApi.patients.list();
        setPatients(data || []);
      } catch (error) {
        console.error('Failed to fetch patients:', error);
        setPatients([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Filter and sort patients
  const filteredPatients = patients
    .filter((patient) => {
      // Search filter - safely handle full_name
      const fullName = patient.full_name || `${patient.family_name || ''} ${patient.given_name || ''}`.trim();
      const searchMatch = 
        fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.patient_number.includes(searchQuery) ||
        (patient.full_name_kana && patient.full_name_kana.toLowerCase().includes(searchQuery.toLowerCase()));

      // Gender filter
      const genderMatch = selectedFilter === 'all' || patient.gender === selectedFilter;

      return searchMatch && genderMatch;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          const aFullName = a.full_name || `${a.family_name || ''} ${a.given_name || ''}`.trim();
          const bFullName = b.full_name || `${b.family_name || ''} ${b.given_name || ''}`.trim();
          comparison = aFullName.localeCompare(bFullName, 'ja');
          break;
        case 'age':
          const ageA = a.birth_date ? new Date().getFullYear() - new Date(a.birth_date).getFullYear() : 0;
          const ageB = b.birth_date ? new Date().getFullYear() - new Date(b.birth_date).getFullYear() : 0;
          comparison = ageA - ageB;
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handlePatientClick = (patient: Patient) => {
    router.push(`/patients/${patient.id}`);
  };

  const handleNewPatient = () => {
    router.push('/patients/new');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <AuthGuard requiredPermission="read_patient">
      <div className="min-h-screen pt-16 bg-gradient-to-br from-system-gray-50 via-white to-apple-blue/5">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-system-gray-200 sticky top-16 z-10">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <motion.div 
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
              {...animations.slideInUp}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center">
                    <Users className="w-6 h-6 text-apple-blue" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-system-gray-900">
                      患者管理
                    </h1>
                    <p className="text-lg text-system-gray-600">
                      患者情報の確認・編集・管理
                    </p>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-medical-success rounded-full"></div>
                    <span className="text-system-gray-600">
                      総患者数: {patients.length}名
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-apple-blue rounded-full"></div>
                    <span className="text-system-gray-600">
                      表示中: {filteredPatients.length}名
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleRefresh}
                  leftIcon={<RefreshCw className="w-5 h-5" />}
                >
                  更新
                </Button>
                <Button 
                  size="lg" 
                  leftIcon={<Plus className="w-5 h-5" />}
                  onClick={handleNewPatient}
                >
                  新規患者登録
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <motion.div
            className="glass-card p-6 space-y-4"
            {...animations.slideInUp}
            transition={{ delay: 0.1 }}
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="患者名、患者番号、カナで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 glass-input rounded-xl text-gray-900 placeholder-gray-500 
                           focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30
                           transition-all duration-200"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value as any)}
                  className="px-4 py-3 glass-input rounded-xl text-gray-900 focus:ring-2 focus:ring-apple-blue/20"
                >
                  <option value="all">全て</option>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                </select>

                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field as any);
                    setSortOrder(order as any);
                  }}
                  className="px-4 py-3 glass-input rounded-xl text-gray-900 focus:ring-2 focus:ring-apple-blue/20"
                >
                  <option value="name-asc">名前 (昇順)</option>
                  <option value="name-desc">名前 (降順)</option>
                  <option value="age-asc">年齢 (若い順)</option>
                  <option value="age-desc">年齢 (高い順)</option>
                  <option value="created_at-desc">登録日 (新しい順)</option>
                  <option value="created_at-asc">登録日 (古い順)</option>
                </select>

                <div className="flex border border-system-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-apple-blue text-white' 
                        : 'bg-white hover:bg-system-gray-50'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-apple-blue text-white' 
                        : 'bg-white hover:bg-system-gray-50'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            className="mt-8"
            {...animations.slideInUp}
            transition={{ delay: 0.2 }}
          >
            {isLoading ? (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
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
                {filteredPatients.length > 0 ? (
                  <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
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
                          onClick={handlePatientClick}
                          variant={viewMode === 'list' ? 'horizontal' : 'vertical'}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
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
                      {searchQuery ? '検索条件に一致する患者がいません。' : '登録された患者がいません。'}
                    </p>
                    <Button onClick={handleNewPatient}>
                      <Plus className="h-5 w-5 mr-2" />
                      新規患者登録
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
}