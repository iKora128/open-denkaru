import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Open Denkaru EMR',
  description: 'Modern Electronic Medical Record system for Japanese healthcare',
  keywords: ['EMR', 'Electronic Medical Records', 'Healthcare', 'Japan', 'Medical'],
  authors: [{ name: 'Open Denkaru Team' }],
  creator: 'Open Denkaru Team',
  publisher: 'Open Denkaru',
  robots: 'noindex, nofollow', // Medical data should not be indexed
  viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1c1c1e' },
  ],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Open Denkaru',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-gradient-to-br from-system-gray-50 via-white to-system-gray-100 font-sans antialiased">
        <Providers>
          <div className="relative min-h-screen">
            {/* Background Liquid Glass Effect */}
            <div className="fixed inset-0 -z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-apple-blue/5 via-transparent to-apple-purple/5" />
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-apple-blue/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-apple-purple/10 rounded-full blur-3xl" />
            </div>
            
            {/* Main Content */}
            <main className="relative z-10">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}