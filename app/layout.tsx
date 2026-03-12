import type { ReactNode } from 'react';
import './globals.css';
import NavigationShell from '../src/components/NavigationShell';

export const metadata = {
  title: 'MonaLab الأكاديمي',
  description: 'منظومة أكاديمية عربية لمساعدة الطلاب والباحثين على إعداد البحوث والتقارير.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  icons: {
    icon: '/images/look-up-svgrepo-com.svg',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-[#0A0F1E] text-white overflow-x-hidden">
        <NavigationShell>{children}</NavigationShell>
      </body>
    </html>
  );
}

