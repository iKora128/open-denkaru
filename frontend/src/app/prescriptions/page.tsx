'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  FileText, 
  RefreshCw,
  Grid,
  List
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { animations } from '@/lib/utils';
import type { Prescription } from '@/types/prescription';
import { useRouter } from 'next/navigation';

export default function PrescriptionsPage() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'active' | 'completed'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch prescriptions from API (mock data for now)
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setIsLoading(true);
        // TODO: Implement actual API call when endpoint is ready
        // const data = await medicalApi.prescriptions.list();
        // For now, use empty array
        setPrescriptions([]);
      } catch (error) {
        console.error('Failed to fetch prescriptions:', error);
        setPrescriptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  const handleNewPrescription = () => {
    router.push('/prescriptions/new');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <AuthGuard requiredPermission="read_prescription">
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
                    <FileText className="w-6 h-6 text-apple-blue" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-system-gray-900">
                      処方箋管理
                    </h1>
                    <p className="text-lg text-system-gray-600">
                      処方箋の作成・管理・印刷
                    </p>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-medical-warning rounded-full"></div>
                    <span className="text-system-gray-600">
                      下書き: {prescriptions.filter(p => p.status.toString() === '下書き').length}件
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-apple-blue rounded-full"></div>
                    <span className="text-system-gray-600">
                      有効: {prescriptions.filter(p => p.status.toString() === '有効').length}件
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-medical-success rounded-full"></div>
                    <span className="text-system-gray-600">
                      完了: {prescriptions.filter(p => p.status.toString() === '完了').length}件
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
                  onClick={handleNewPrescription}
                >
                  新規処方箋
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
                  placeholder="患者名、診断名、薬剤名で検索..."
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-3 glass-input rounded-xl text-gray-900 focus:ring-2 focus:ring-apple-blue/20"
                >
                  <option value="all">全ステータス</option>
                  <option value="draft">下書き</option>
                  <option value="active">有効</option>
                  <option value="completed">完了</option>
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
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-12 text-center"
                >
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    処方箋機能は準備中です
                  </h3>
                  <p className="text-gray-600 mb-6">
                    処方箋管理機能は現在開発中です。まもなく利用可能になります。
                  </p>
                  <Button onClick={handleNewPrescription}>
                    <Plus className="h-5 w-5 mr-2" />
                    新規処方箋作成（準備中）
                  </Button>
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
}