import React from 'react';
import { Bot } from 'lucide-react';

interface ChatHeaderProps {
  onBack: () => void;
}

export function ChatHeader({ onBack }: ChatHeaderProps) {
  return (
    <header className="relative z-10 h-16 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-8 h-8 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
            <Bot className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">مساعد البحوث والتقارير الجامعية</span>
            <span className="text-[10px] text-slate-400">
              اكتب موضوعك ودع المساعد يقترح لك بنية بحث متكاملة
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-xs sm:text-sm font-medium text-slate-200 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700/80 bg-slate-900/70 hover:bg-slate-800 transition-colors"
        >
          العودة للرئيسية
        </button>
      </div>
    </header>
  );
}

