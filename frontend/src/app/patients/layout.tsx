import { Navigation } from '@/components/layout/Navigation';

export default function PatientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-system-gray-50 via-white to-system-gray-100">
      <Navigation currentPage="patients" />
      
      {/* Main Content with proper spacing for fixed navigation */}
      <main className="pt-20 min-h-screen">
        <div className="relative">
          {children}
        </div>
      </main>
    </div>
  );
}