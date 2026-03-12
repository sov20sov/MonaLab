import React from 'react';
import { Bot, Loader2 } from 'lucide-react';

export default function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/90 backdrop-blur-sm">
      <div className="relative flex flex-col items-center gap-4 px-8 py-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 shadow-[0_30px_80px_rgba(15,23,42,0.9)]">
        <div className="relative w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/50 flex items-center justify-center">
          <Bot className="w-7 h-7 text-blue-300" />
          <div className="absolute inset-0 rounded-2xl border border-blue-400/40 animate-ping" />
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-100">
          <Loader2 className="w-4 h-4 animate-spin text-blue-300" />
          <span>جارٍ تحميل تجربة MonaLab...</span>
        </div>
        <p className="text-[11px] text-slate-400 max-w-xs text-center leading-relaxed">
          يتم تجهيز الواجهة الأكاديمية الخاصة بك. عادةً ما تستغرق هذه العملية ثوانٍ قليلة فقط.
        </p>
      </div>
    </div>
  );
}

