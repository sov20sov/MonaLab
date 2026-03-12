import React from 'react';
import { Box } from 'lucide-react';

interface SecondaryPageLayoutProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  children: React.ReactNode;
}

export default function SecondaryPageLayout({
  title,
  subtitle,
  onBack,
  children,
}: SecondaryPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white font-sans" dir="rtl">
      <header className="border-b border-white/10 bg-[#0A0F1E]/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Box className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg">MonaLab</span>
              {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
            </div>
          </div>
          <button
            onClick={onBack}
            className="text-sm font-medium px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
        {children}
      </main>
    </div>
  );
}

