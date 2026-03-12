import React, { RefObject } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, Download, FileText, Loader2, User } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Message } from './ChatAppTypes';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  streamingContent?: string | null;
  pendingRequestLength?: number;
  lastErrorMessageId: string | null;
  onRetry: () => void;
  exportToWord: (index: number) => void;
  exportToPDF: (index: number) => void;
  messagesEndRef: RefObject<HTMLDivElement>;
}

const SHORT_REQUEST_MAX_LENGTH = 50;

export function ChatMessages({
  messages,
  isLoading,
  streamingContent = null,
  pendingRequestLength = 0,
  lastErrorMessageId,
  onRetry,
  exportToWord,
  exportToPDF,
  messagesEndRef,
}: ChatMessagesProps) {
  const isShortRequest = pendingRequestLength <= SHORT_REQUEST_MAX_LENGTH;
  const loadingHint = isShortRequest
    ? 'جاري الرد... (عادةً سريع)'
    : 'جاري إعداد البحث... (قد يستغرق دقيقة أو أكثر)';
  return (
    <div className="relative flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
      <div className="pointer-events-none absolute inset-0 opacity-40 bg-gradient-to-b from-blue-500/5 via-transparent to-emerald-500/5" />
      <div className="relative max-w-4xl mx-auto space-y-8 pb-24">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full mt-16 text-center space-y-6">
            <div className="w-20 h-20 bg-blue-500/10 border border-blue-400/30 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.45)]">
              <FileText className="w-10 h-10 text-blue-300" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-50">
                ابدأ أول بحث أكاديمي لك الآن
              </h2>
              <p className="text-slate-300 max-w-md text-sm sm:text-base mx-auto">
                اكتب موضوع بحثك أو تقريرك، وحدد التخصص والمستوى الدراسي، وسيساعدك المساعد في اقتراح بنية
                ومحتوى متكاملين قابلين للتعديل والتصدير.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3 sm:gap-4',
                msg.role === 'user' ? 'flex-row-reverse group' : 'group',
              )}
            >
              <div
                className={cn(
                  'w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 border',
                  msg.role === 'user'
                    ? 'bg-blue-600/80 border-blue-500/70 text-white shadow-[0_0_25px_rgba(37,99,235,0.55)]'
                    : 'bg-emerald-600/80 border-emerald-500/70 text-white shadow-[0_0_25px_rgba(16,185,129,0.55)]',
                )}
              >
                {msg.role === 'user' ? (
                  <User className="w-6 h-6" />
                ) : (
                  <Bot className="w-6 h-6" />
                )}
              </div>

              <div
                className={cn(
                  'flex flex-col gap-2 max-w-[85%] sm:max-w-[75%]',
                  msg.role === 'user' ? 'items-end' : 'items-start',
                )}
              >
                <div
                  className={cn(
                    'p-4 rounded-3xl shadow-sm border transition-all duration-200',
                    msg.role === 'user'
                      ? 'bg-blue-600/90 border-blue-500/80 text-white rounded-tr-none shadow-[0_18px_45px_rgba(37,99,235,0.55)]'
                      : 'bg-slate-950/70 border-slate-800/80 text-slate-50 rounded-tl-none shadow-[0_18px_45px_rgba(15,23,42,0.75)] group-hover:border-blue-500/60',
                  )}
                >
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  ) : (
                    <div
                      id={`message-content-${index}`}
                      className="prose prose-invert prose-slate max-w-none prose-p:leading-relaxed prose-headings:text-slate-50 prose-a:text-blue-300 prose-strong:text-slate-50 rtl:text-right"
                      dir="rtl"
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>

                {msg.role === 'model' && (
                  <div className="flex flex-wrap items-center gap-2 mt-2 pt-2">
                    {msg.id === lastErrorMessageId && (
                      <button
                        onClick={onRetry}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        إعادة المحاولة
                      </button>
                    )}
                    {msg.id !== lastErrorMessageId && (
                      <>
                        <span className="text-[11px] text-slate-400 font-medium px-1">تصدير:</span>
                        <button
                          onClick={() => exportToWord(index)}
                          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors px-2 py-1.5 rounded-md hover:bg-blue-50 border border-transparent hover:border-blue-100"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Word
                        </button>
                        <button
                          onClick={() => exportToPDF(index)}
                          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 transition-colors px-2 py-1.5 rounded-md hover:bg-red-50 border border-transparent hover:border-red-100"
                        >
                          <Download className="w-3.5 h-3.5" />
                          PDF
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-600/90 border border-emerald-400/80 text-white flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(16,185,129,0.7)]">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            {streamingContent ? (
              <div
                className={cn(
                  'flex flex-col gap-2 max-w-[85%] sm:max-w-[75%] items-start',
                )}
              >
                <div className="bg-slate-950/70 border border-slate-800/80 text-slate-50 rounded-3xl rounded-tl-none shadow-[0_18px_45px_rgba(15,23,42,0.75)] p-4 border-emerald-500/50">
                  <div
                    className="prose prose-invert prose-slate max-w-none prose-p:leading-relaxed prose-headings:text-slate-50 prose-a:text-blue-300 prose-strong:text-slate-50 rtl:text-right"
                    dir="rtl"
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingContent}</ReactMarkdown>
                  </div>
                  <span className="inline-block w-2 h-4 bg-emerald-400 rounded-sm animate-pulse mt-1" />
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/80 border border-emerald-500/50 p-5 rounded-3xl rounded-tl-none shadow-[0_22px_50px_rgba(15,23,42,0.85)] flex flex-col gap-4 w-full max-w-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-blue-500/10" />
                <div className="relative flex items-center gap-3">
                  <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
                    <Loader2 className="w-6 h-6 text-emerald-400 animate-spin absolute" />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-emerald-100 text-sm font-semibold">
                    {loadingHint}
                  </span>
                </div>

                <div className="relative space-y-3 mt-1">
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-l from-emerald-400 to-blue-400 rounded-full animate-pulse w-3/4"></div>
                  </div>

                  <div className="space-y-2">
                    <div className="h-2 bg-slate-800 rounded-full w-full animate-pulse"></div>
                    <div
                      className="h-2 bg-slate-800 rounded-full w-5/6 animate-pulse"
                      style={{ animationDelay: '150ms' }}
                    ></div>
                    <div
                      className="h-2 bg-slate-800 rounded-full w-4/6 animate-pulse"
                      style={{ animationDelay: '300ms' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

