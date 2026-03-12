import React from 'react';
import {
  Clock,
  ChevronDown,
  FileText,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Sparkles,
} from 'lucide-react';
import { cn } from '../lib/utils';

export type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
};

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isSidebarOpen: boolean;
  isSessionsCollapsed: boolean;
  onToggleSidebar(open: boolean): void;
  onToggleSessionsCollapsed(): void;
  onStartNewSession(): void;
  onSelectSession(sessionId: string): void;
  sidebarRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  isSidebarOpen,
  isSessionsCollapsed,
  onToggleSidebar,
  onToggleSessionsCollapsed,
  onStartNewSession,
  onSelectSession,
  sidebarRef,
}: ChatSidebarProps) {
  return (
    <>
      <div
        ref={sidebarRef}
        className={cn(
          'fixed inset-y-0 right-0 z-40 w-80 bg-slate-950/95 border-l border-slate-800/80 backdrop-blur-xl transition-transform duration-300 ease-in-out flex flex-col',
          isSidebarOpen ? 'translate-x-0 md:relative' : 'translate-x-full',
        )}
      >
        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shadow-[0_0_25px_rgba(37,99,235,0.35)] shrink-0">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold">سجل الأبحاث</span>
              <span className="text-[10px] text-slate-400 truncate">
                جلساتك المحفوظة على هذا الجهاز
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onToggleSidebar(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors shrink-0"
            title="طي السجل"
          >
            <PanelRightClose className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-800/80">
          <button
            onClick={onStartNewSession}
            className="w-full flex items-center justify-between gap-2 rounded-2xl bg-gradient-to-l from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-3 py-2.5 text-sm font-medium shadow-[0_10px_40px_rgba(37,99,235,0.45)] transition-all"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>بدء بحث جديد</span>
            </div>
            <Sparkles className="w-4 h-4 text-blue-100" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {sessions.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/60 px-4 py-5 text-center text-xs text-slate-400">
              لا توجد جلسات محفوظة بعد. ابدأ بحثاً جديداً وسيتم حفظه هنا تلقائياً.
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={onToggleSessionsCollapsed}
                className="flex items-center justify-between w-full mb-1 px-1 py-1 rounded-lg hover:bg-slate-800/50 transition-colors text-right"
              >
                <span className="text-[11px] font-semibold text-slate-400 tracking-wide">
                  جلسات سابقة
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {sessions.length} جلسة
                  <ChevronDown
                    className={cn(
                      'w-3.5 h-3.5 text-slate-500 transition-transform duration-200',
                      isSessionsCollapsed && '-rotate-90',
                    )}
                  />
                </span>
              </button>
              {!isSessionsCollapsed && (
                <div className="space-y-1.5">
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => onSelectSession(session.id)}
                      className={cn(
                        'w-full text-right text-xs px-3 py-2.5 rounded-2xl border transition-all flex flex-col gap-0.5 bg-slate-900/60 hover:bg-slate-900',
                        activeSessionId === session.id
                          ? 'border-blue-500/60 shadow-[0_0_30px_rgba(59,130,246,0.35)]'
                          : 'border-slate-800/80 hover:border-slate-700',
                      )}
                    >
                      <span className="font-medium text-slate-50 truncate">{session.title}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(session.createdAt).toLocaleString('ar-SA')}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {!isSidebarOpen && (
        <button
          type="button"
          onClick={() => onToggleSidebar(true)}
          className="fixed top-20 right-3 z-30 flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 hover:border-blue-500/50 text-slate-300 hover:text-white transition-all shadow-lg backdrop-blur-sm"
          title="فتح سجل الأبحاث"
        >
          <PanelRightOpen className="w-4 h-4" />
          <span className="text-xs font-medium">سجل الأبحاث</span>
        </button>
      )}
    </>
  );
}

