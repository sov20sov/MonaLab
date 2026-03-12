"use client";

import { useContext } from 'react';
import { Loader2 } from 'lucide-react';
import { NavigationContext } from '../contexts/NavigationContext';

export default function RouteLoaderOverlay() {
  const ctx = useContext(NavigationContext);
  const isVisible = ctx?.isNavigating ?? false;

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/85 backdrop-blur-md transition-opacity duration-200"
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <div className="relative flex flex-col items-center gap-4 px-8 py-6 rounded-3xl border border-slate-700/80 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.95)]">
        <div className="relative w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.25)]">
          <Loader2 className="w-7 h-7 animate-spin text-blue-300" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-slate-100">جارٍ الانتقال...</p>
          <p className="text-xs text-slate-400">
            يتم تحميل الصفحة التالية
          </p>
        </div>
      </div>
    </div>
  );
}
