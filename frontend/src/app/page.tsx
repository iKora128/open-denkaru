'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // ルートページにアクセスした場合は自動的にダッシュボードにリダイレクト
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-system-gray-50 via-white to-apple-blue/5">
      <div className="text-center">
        <div className="animate-pulse text-lg text-system-gray-600">
          Open Denkaru を起動中...
        </div>
      </div>
    </div>
  );
}