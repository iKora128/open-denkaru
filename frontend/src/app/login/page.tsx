'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Shield, Heart, Activity, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { authService, routeGuard } from '@/lib/auth';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Development mode: Allow direct login without backend
      if (process.env.NODE_ENV === 'development') {
        // 開発用の簡単な認証
        if (formData.username && formData.password) {
          // Mock successful authentication using proper token keys
          const mockUser = {
            id: '1',
            username: formData.username,
            full_name: formData.username === 'admin' ? '管理者' : '田中医師',
            roles: [formData.username === 'admin' ? 'admin' : 'doctor'],
            permissions: ['read_patient', 'create_patient', 'read_prescription', 'manage_settings'],
            department: formData.username === 'admin' ? '管理部' : '内科',
            position: formData.username === 'admin' ? 'システム管理者' : '主治医'
          };
          
          // Use the same token keys as the auth service
          localStorage.setItem('od_access_token', 'dev_token_' + Date.now());
          localStorage.setItem('od_refresh_token', 'dev_refresh_token_' + Date.now());
          localStorage.setItem('od_user_data', JSON.stringify(mockUser));
          
          // Redirect to dashboard
          window.location.href = '/dashboard';
          return;
        }
      }

      // Production mode: Call authentication service
      const { tokens } = await authService.login({
        username: formData.username,
        password: formData.password
      });

      // Check for MFA requirement
      if (tokens.mfa_required) {
        setError('MFA認証が必要です。現在未実装です。');
        return;
      }

      // Success - redirect to dashboard
      routeGuard.redirectToDashboard();
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(
        error.message?.includes('401') || error.message?.includes('Invalid credentials')
          ? 'ユーザー名またはパスワードが正しくありません。'
          : 'ログインに失敗しました。しばらく待ってから再試行してください。'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
    
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Background with Medical Theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-system-gray-50 via-white to-apple-blue/5" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-apple-blue/10 rounded-full blur-xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-apple-purple/10 rounded-full blur-xl"
          animate={{
            x: [0, -25, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-10 w-24 h-24 bg-medical-success/10 rounded-full blur-lg"
          animate={{
            x: [0, 20, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Medical Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-repeat bg-center" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23007AFF' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm-20-15a15 15 0 100 30 15 15 0 000-30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
             }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Title Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full glass-card mb-6">
            <div className="relative">
              <Heart className="w-8 h-8 text-medical-error" />
              <Activity className="w-4 h-4 text-apple-blue absolute -top-1 -right-1" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-system-gray-900 mb-2">
            Open Denkaru
          </h1>
          <p className="text-system-gray-600 text-lg">
            電子カルテシステム
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Shield className="w-4 h-4 text-medical-success" />
            <span className="text-sm text-system-gray-500">
              セキュアな医療情報管理
            </span>
          </div>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card glass elevated className="overflow-hidden">
            <CardHeader className="pb-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-system-gray-900 mb-2">
                  ログイン
                </h2>
                <p className="text-sm text-system-gray-600">
                  認証情報を入力してください
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-medical-error/10 border border-medical-error/20"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-medical-error mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-medical-error mb-1">
                          ログインエラー
                        </p>
                        <p className="text-xs text-medical-error/80">
                          {error}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Username Field */}
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium text-system-gray-700">
                    ユーザー名
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 glass-input rounded-xl text-system-gray-900 placeholder-system-gray-500
                             focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30
                             transition-all duration-200"
                    placeholder="医療従事者ID"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-system-gray-700">
                    パスワード
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pr-12 glass-input rounded-xl text-system-gray-900 placeholder-system-gray-500
                               focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue/30
                               transition-all duration-200"
                      placeholder="••••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg
                               text-system-gray-500 hover:text-system-gray-700 hover:bg-system-gray-100
                               transition-all duration-200"
                    >
                      {showPassword ? 
                        <EyeOff className="w-5 h-5" /> : 
                        <Eye className="w-5 h-5" />
                      }
                    </button>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="p-3 rounded-lg bg-apple-blue/5 border border-apple-blue/10">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-apple-blue mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-apple-blue mb-1">
                        セキュリティ通知
                      </p>
                      <p className="text-xs text-system-gray-600 leading-relaxed">
                        このシステムは医療情報を扱います。ログイン情報の共有は厳禁です。
                      </p>
                    </div>
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  size="lg"
                  loading={isLoading}
                  className="w-full text-base font-medium"
                  disabled={!formData.username || !formData.password}
                >
                  {isLoading ? 'ログイン中...' : 'ログイン'}
                </Button>

                {/* Development Mode Info */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <h4 className="text-sm font-medium text-green-800 mb-2">
                      開発モード - テスト用アカウント
                    </h4>
                    <div className="text-xs text-green-700 space-y-1">
                      <div>• ユーザー名: admin, doctor, nurse など</div>
                      <div>• パスワード: 任意（何でも可）</div>
                      <div>• 実際のバックエンド認証は不要</div>
                    </div>
                  </div>
                )}

                {/* Additional Links */}
                <div className="text-center space-y-3 pt-4 border-t border-system-gray-100">
                  <button
                    type="button"
                    className="text-sm text-apple-blue hover:text-apple-blue/80 transition-colors"
                  >
                    パスワードを忘れた場合
                  </button>
                  <div className="text-xs text-system-gray-500">
                    システム管理者にお問い合わせください
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8 space-y-2"
        >
          <p className="text-xs text-system-gray-500">
            Open Denkaru EMR v0.1.0
          </p>
          <p className="text-xs text-system-gray-400">
            © 2025 Open Source Medical Records
          </p>
        </motion.div>
      </div>
    </div>
  );
}