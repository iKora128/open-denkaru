import { Navigation } from '@/components/layout/Navigation';

export default function RecordsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-system-gray-50 via-white to-system-gray-100">
      <Navigation currentPage="records" />
      
      {/* Main Content with proper spacing for fixed navigation */}
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}