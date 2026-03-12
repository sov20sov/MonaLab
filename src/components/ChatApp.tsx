import React, { useState, useRef, useEffect } from 'react';
import { AIInput } from './ui/ai-input';
import type { Message } from './ChatAppTypes';
import { ChatSidebar, type ChatSession } from './ChatSidebar';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { cn } from '../lib/utils';

interface ChatAppProps {
  onBack: () => void;
  initialPrompt?: string;
}

export default function ChatApp({ onBack, initialPrompt }: ChatAppProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSessionsCollapsed, setIsSessionsCollapsed] = useState(false);
  const [lastErrorMessageId, setLastErrorMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastFailedMessagesRef = useRef<Message[] | null>(null);
  const handleRetryRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const abortControllerRef = useRef<AbortController | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [exportToast, setExportToast] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const [pendingRequestLength, setPendingRequestLength] = useState(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // تحميل الجلسات من التخزين المحلي عند أول تحميل
    const storedSessions = localStorage.getItem('academic_assistant_sessions');
    const storedMessages = localStorage.getItem('academic_assistant_messages');
    const storedActiveSession = localStorage.getItem('academic_assistant_active_session');

    if (storedSessions) {
      setSessions(JSON.parse(storedSessions));
    }
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
    if (storedActiveSession) {
      setActiveSessionId(storedActiveSession);
    }
  }, []);

  useEffect(() => {
    if (!initialPrompt) return;
    if (messages.length === 0 && !input) {
      setInput(initialPrompt);
    }
  }, [initialPrompt, messages.length, input]);

  useEffect(() => {
    scrollToBottom();
    localStorage.setItem('academic_assistant_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('academic_assistant_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem('academic_assistant_active_session', activeSessionId);
    }
  }, [activeSessionId]);

  const startNewSession = () => {
    const newSession: ChatSession = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      title: 'بحث جديد',
      createdAt: new Date().toISOString(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setMessages([]);
  };

  const setInitialTitleIfNeeded = (firstUserMessage: string) => {
    if (!activeSessionId) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId && s.title === 'بحث جديد'
          ? {
              ...s,
              title:
                firstUserMessage.length > 60
                  ? firstUserMessage.slice(0, 57) + '...'
                  : firstUserMessage,
            }
          : s,
      ),
    );
  };

  const sendMessagesToAPI = async (
    messagesToSend: Message[],
    signal?: AbortSignal,
    options?: { stream?: boolean },
  ): Promise<{ ok: true; content: string; conversationId?: string; streamed?: boolean } | { ok: false; error: string; aborted?: boolean }> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesToSend.map((m) => ({ role: m.role, content: m.content })),
          userId: null,
          stream: options?.stream ?? true,
        }),
        signal,
      });
      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('ndjson') && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const obj = JSON.parse(line) as { delta?: string; done?: boolean; content?: string; conversationId?: string; error?: string };
              if (obj.error) {
                setStreamingContent(null);
                return { ok: false, error: obj.error };
              }
              if (typeof obj.delta === 'string') {
                fullContent += obj.delta;
                setStreamingContent(fullContent);
              }
              if (obj.done === true) {
                setStreamingContent(null);
                return { ok: true, content: obj.content ?? fullContent, conversationId: obj.conversationId, streamed: true };
              }
            } catch (_) {
              // ignore parse errors for partial lines
            }
          }
        }
        setStreamingContent(null);
        return { ok: true, content: fullContent, streamed: true };
      }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        let serverMessage =
          typeof data?.error === 'string'
            ? data.error
            : response.status === 429
              ? 'وصل حد الطلبات المجاني لـ Gemini. انتظر دقيقة ثم استخدم زر «إعادة المحاولة» (إعادة محاولة تلقائية خلال 60 ثانية).'
              : 'فشل الاتصال بالخادم. يرجى المحاولة لاحقاً.';
        if (typeof data?.detail === 'string' && data.detail) {
          serverMessage += ` (${data.detail})`;
        }
        return { ok: false, error: serverMessage };
      }
      return { ok: true, content: data.content ?? '', conversationId: data.conversationId };
    } catch (err: any) {
      setStreamingContent(null);
      if (err?.name === 'AbortError') {
        return { ok: false, error: '', aborted: true };
      }
      return { ok: false, error: err?.message ?? 'فشل الاتصال بالخادم.' };
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      role: 'user',
      content,
    };

    if (!activeSessionId) {
      startNewSession();
    }

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    if (messages.length === 0) {
      setInitialTitleIfNeeded(userMessage.content);
    }
    setInput('');
    setIsLoading(true);
    setPendingRequestLength(content.length);
    setStreamingContent('');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const result = await sendMessagesToAPI(nextMessages, controller.signal, {
      stream: supportsStreaming,
    });
    abortControllerRef.current = null;

    const newId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString());
    if (result.ok) {
      const aiMessage: Message = {
        id: newId(),
        role: 'model',
        content: result.content,
      };
      setMessages((prev) => [...prev, aiMessage]);
      if (activeSessionId) {
        localStorage.setItem(
          `academic_assistant_messages_${activeSessionId}`,
          JSON.stringify([...nextMessages, aiMessage]),
        );
      }
    } else if (result.aborted) {
      setStreamingContent(null);
      const stoppedMessage: Message = {
        id: newId(),
        role: 'model',
        content: 'تم إيقاف التوليد. يمكنك تعديل رسالتك أو إرسال رسالة جديدة.',
      };
      setMessages((prev) => [...prev, stoppedMessage]);
    } else {
      setStreamingContent(null);
      lastFailedMessagesRef.current = nextMessages;
      const errorMessage: Message = {
        id: newId(),
        role: 'model',
        content: result.error,
      };
      setLastErrorMessageId(errorMessage.id);
      setMessages((prev) => [...prev, errorMessage]);
    }
    setIsLoading(false);
  };

  const handleRetry = async () => {
    const msgs = lastFailedMessagesRef.current;
    if (!msgs?.length || isLoading) return;
    setMessages(msgs);
    setIsLoading(true);
    const lastUser = [...msgs].reverse().find((m) => m.role === 'user');
    setPendingRequestLength(lastUser?.content?.length ?? 0);
    setStreamingContent('');
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const result = await sendMessagesToAPI(msgs, controller.signal, { stream: supportsStreaming });
    abortControllerRef.current = null;
    const newId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString());
    if (result.ok) {
      const aiMessage: Message = {
        id: newId(),
        role: 'model',
        content: result.content,
      };
      setMessages((prev) => [...prev, aiMessage]);
      if (activeSessionId) {
        localStorage.setItem(
          `academic_assistant_messages_${activeSessionId}`,
          JSON.stringify([...msgs, aiMessage]),
        );
      }
      lastFailedMessagesRef.current = null;
      setLastErrorMessageId(null);
    } else if (result.aborted) {
      const stoppedMessage: Message = {
        id: newId(),
        role: 'model',
        content: 'تم إيقاف التوليد. يمكنك إعادة المحاولة أو إرسال رسالة جديدة.',
      };
      setMessages((prev) => [...prev, stoppedMessage]);
    } else {
      lastFailedMessagesRef.current = msgs;
      const errorMessage: Message = {
        id: newId(),
        role: 'model',
        content: result.error,
      };
      setLastErrorMessageId(errorMessage.id);
      setMessages((prev) => [...prev, errorMessage]);
    }
    setIsLoading(false);
  };
  handleRetryRef.current = handleRetry;

  // إعادة محاولة تلقائية بعد 60 ثانية عند ظهور خطأ (مثل 429) — حصة Gemini تُحدّث كل دقيقة
  useEffect(() => {
    if (!lastErrorMessageId || !lastFailedMessagesRef.current) return;
    const t = setTimeout(() => {
      if (lastFailedMessagesRef.current) handleRetryRef.current();
    }, 60000);
    return () => clearTimeout(t);
  }, [lastErrorMessageId]);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (!isSidebarOpen || !sidebarRef.current) return;
      const target = e.target as Node;
      if (sidebarRef.current.contains(target)) return;
      const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
      if (isMobile) setIsSidebarOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isSidebarOpen]);

  const exportToWord = (index: number) => {
    const messageElement = document.getElementById(`message-content-${index}`);
    if (!messageElement) {
      setExportToast('لا يوجد محتوى للتصدير لهذه الرسالة.');
      setTimeout(() => setExportToast(null), 3000);
      return;
    }

    const htmlContent = messageElement.innerHTML;

    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>بحث جامعي</title>
        <style>
          body { 
            font-family: 'Arial', 'Segoe UI', sans-serif; 
            direction: rtl; 
            text-align: right; 
            font-size: 14pt;
            line-height: 1.6;
          }
          h1 { color: #1e3a8a; font-size: 24pt; text-align: center; margin-bottom: 20px; }
          h2 { color: #2563eb; font-size: 18pt; margin-top: 20px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          h3 { color: #3b82f6; font-size: 16pt; }
          p { margin-bottom: 15px; text-align: justify; }
          ul, ol { margin-right: 20px; margin-bottom: 15px; }
          li { margin-bottom: 5px; }
          strong { color: #111827; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 15px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: right; }
          th { background-color: #f3f4f6; }
        </style>
      </head>
      <body>
    `;
    const footer = '</body></html>';
    const sourceHTML = header + htmlContent + footer;

    const blob = new Blob(['\ufeff', sourceHTML], {
      type: 'application/msword',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `بحث_جامعي_${new Date().getTime()}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportToast('تم تصدير Word بنجاح');
    setTimeout(() => setExportToast(null), 3000);
  };

  const exportToPDF = (index: number) => {
    const messageElement = document.getElementById(`message-content-${index}`);
    if (!messageElement) {
      setExportToast('لا يوجد محتوى للتصدير لهذه الرسالة.');
      setTimeout(() => setExportToast(null), 3000);
      return;
    }

    const htmlContent = messageElement.innerHTML;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setExportToast('الرجاء السماح بالنوافذ المنبثقة لطباعة/حفظ PDF.');
      setTimeout(() => setExportToast(null), 4000);
      return;
    }

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <meta charset="utf-8">
          <title>بحث جامعي</title>
          <style>
            body {
              font-family: 'Arial', 'Segoe UI', sans-serif;
              direction: rtl;
              text-align: right;
              padding: 20px;
              color: #000;
              line-height: 1.6;
            }
            h1, h2, h3, h4, h5, h6 { color: #111827; margin-top: 20px; margin-bottom: 10px; }
            p { margin-bottom: 15px; text-align: justify; }
            ul, ol { margin-right: 20px; margin-bottom: 15px; }
            li { margin-bottom: 5px; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 15px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: right; }
            th { background-color: #f3f4f6; }
            @media print {
              body { padding: 0; }
              @page { margin: 2cm; }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setExportToast('تم فتح نافذة الطباعة — اختر «حفظ كـ PDF» في نافذة الطباعة.');
    setTimeout(() => setExportToast(null), 4000);
  };

  return (
    <div
      className="relative flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-50 font-sans overflow-hidden"
      dir="rtl"
    >
      {/* Ambient background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.25) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        isSidebarOpen={isSidebarOpen}
        isSessionsCollapsed={isSessionsCollapsed}
        onToggleSidebar={setIsSidebarOpen}
        onToggleSessionsCollapsed={() => setIsSessionsCollapsed((c) => !c)}
        onStartNewSession={startNewSession}
        onSelectSession={(sessionId) => {
          setActiveSessionId(sessionId);
          const storedMessages = localStorage.getItem(
            `academic_assistant_messages_${sessionId}`,
          );
          if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
          }
        }}
        sidebarRef={sidebarRef}
      />

      <div className="relative flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <ChatHeader onBack={onBack} />
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          streamingContent={streamingContent}
          pendingRequestLength={pendingRequestLength}
          lastErrorMessageId={lastErrorMessageId}
          onRetry={handleRetry}
          exportToWord={exportToWord}
          exportToPDF={exportToPDF}
          messagesEndRef={messagesEndRef}
        />

        {/* Input Area — شريط إدخال ثابت في الأسفل بتصميم نظيف */}
        <div className="relative bg-slate-950/90 border-t border-slate-800/80 p-3 sm:p-4 flex flex-col justify-end">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent" />
          <div className="relative max-w-4xl mx-auto w-full flex flex-col items-end gap-2">
            <p className="w-full text-[11px] text-slate-400 text-right">
              تنبيه: قد يستغرق المساعد من دقيقة إلى بضع دقائق لإعداد التقرير أو الإجابة، وذلك حسب طول البحث
              والتفاصيل التي تطلبها.
            </p>
            <div className="w-full rounded-3xl bg-slate-900/85 border border-slate-800/80 shadow-[0_10px_35px_rgba(15,23,42,0.85)]">
              <AIInput
                value={input}
                onChange={setInput}
                onSubmit={(v) => handleSend(v)}
                onStop={handleStop}
                isLoading={isLoading}
                placeholder="اكتب موضوع البحث أو التقرير، وحدد المستوى الدراسي، وعدد الفصول أو الصفحات المطلوبة..."
                minHeight={52}
                maxHeight={200}
                className="py-2"
              />
            </div>
          </div>
          <div className="relative text-center mt-1 text-[11px] text-slate-500">
            يمكن للذكاء الاصطناعي ارتكاب أخطاء. راجع البحث، عدّل الصياغة، وتأكد من صحة المعلومات والمراجع قبل
            الاعتماد النهائي.
          </div>
        </div>
      </div>

      {/* Toast للتصدير */}
      {exportToast && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-emerald-600/95 text-white text-sm font-medium shadow-lg border border-emerald-500/50"
        >
          {exportToast}
        </div>
      )}
    </div>
  );
}

