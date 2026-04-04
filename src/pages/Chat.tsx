import React, { useState, useEffect, useRef, useMemo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, FileText, Download, Copy, Check, Loader2, Sparkles, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChatGPTPromptInput } from '@/components/ui/chatgpt-prompt-input';
import { Link } from "react-router-dom";
import { ExportCoverDialog } from "@/components/ui/export-cover-dialog";
import {
  sanitizeReportMarkdown,
  downloadReportPdfWithOptions,
  downloadReportWordWithOptions,
  printReportWithOptions,
} from '@/lib/report-exporter';
import type { AssistantUILang } from '@/lib/assistant-i18n';
import {
  assistantChatCopy,
  buildAssistantSystemInstruction,
  defaultExportLanguageForAssistant,
  persistAssistantLang,
  readStoredAssistantLang,
} from '@/lib/assistant-i18n';

type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
  isStreaming?: boolean;
};

function AssistantLangToggle({
  uiLang,
  onChange,
  copy,
}: {
  uiLang: AssistantUILang;
  onChange: (lang: AssistantUILang) => void;
  copy: (typeof assistantChatCopy)["ar"];
}) {
  return (
    <div
      role="group"
      aria-label={copy.langToggleAria}
      className="inline-flex shrink-0 rounded-full border border-border/80 bg-muted/40 p-0.5 text-[11px] font-semibold shadow-inner min-[481px]:text-xs"
    >
      <button
        type="button"
        onClick={() => onChange("ar")}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors min-[481px]:px-3",
          uiLang === "ar"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-pressed={uiLang === "ar"}
      >
        {copy.langArabic}
      </button>
      <button
        type="button"
        onClick={() => onChange("en")}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors min-[481px]:px-3",
          uiLang === "en"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-pressed={uiLang === "en"}
      >
        {copy.langEnglish}
      </button>
    </div>
  );
}

export default function Chat() {
  const [uiLang, setUiLang] = useState<AssistantUILang>(() => readStoredAssistantLang());
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportTarget, setExportTarget] = useState<null | { kind: "pdf" | "word" | "print"; markdown: string }>(null);

  const t = assistantChatCopy[uiLang];

  useEffect(() => {
    persistAssistantLang(uiLang);
  }, [uiLang]);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    // If user is close to bottom, keep auto-scroll enabled.
    shouldAutoScrollRef.current = distanceFromBottom < 120;
  };

  useEffect(() => {
    // Auto-scroll only if user hasn't scrolled away from bottom.
    if (!shouldAutoScrollRef.current) return;

    // During streaming, avoid smooth scrolling every chunk.
    const hasStreaming = messages.some((m) => m.isStreaming);
    const behavior: ScrollBehavior = hasStreaming ? "auto" : "smooth";

    // Let DOM paint before scrolling.
    requestAnimationFrame(() => scrollToBottom(behavior));
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMsg = text.trim();
    setInput('');
    
    const userMessageId = Date.now().toString();
    const modelMessageId = (Date.now() + 1).toString();

    setMessages((prev) => [
      ...prev,
      { id: userMessageId, role: 'user', content: userMsg },
      { id: modelMessageId, role: 'model', content: '', isStreaming: true },
    ]);
    setIsLoading(true);

    try {
      const systemInstruction = buildAssistantSystemInstruction(uiLang);

      // Keep a short history to reduce token usage.
      const maxHistory = 10;
      const history = [...messages, { id: userMessageId, role: 'user' as const, content: userMsg }]
        .slice(-maxHistory);

      const openAIMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemInstruction },
        ...history
          .filter((m) => !m.isStreaming)
          .map((m) => ({
            role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
            content: m.content,
          })),
      ];

      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: openAIMessages }),
      });

      if (!response.ok || !response.body) {
        const errText = await response.text().catch(() => "");
        throw new Error(errText || "AI request failed");
      }

      let fullText = "";
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const data = trimmed.replace(/^data:\s*/, "");
          if (data === "[DONE]") {
            break;
          }

          try {
            const payload = JSON.parse(data);
            const delta = payload?.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              fullText += delta;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === modelMessageId ? { ...msg, content: fullText } : msg
                )
              );
            }
          } catch {
            // ignore non-json lines
          }
        }
      }

      setMessages((prev) => prev.map((msg) => (msg.id === modelMessageId ? { ...msg, isStreaming: false } : msg)));
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === modelMessageId ? { ...msg, content: t.errorConnection, isStreaming: false } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const hasConversation = messages.length > 0;
  const exportDialogInitial = useMemo(
    () => ({ language: defaultExportLanguageForAssistant(uiLang) }),
    [uiLang]
  );

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-x-hidden bg-background"
      dir={uiLang === "ar" ? "rtl" : "ltr"}
      lang={uiLang}
    >
      <ExportCoverDialog
        open={exportDialogOpen}
        uiLang={uiLang}
        initial={exportDialogInitial}
        onClose={() => {
          setExportDialogOpen(false);
          setExportTarget(null);
        }}
        onConfirm={(options) => {
          const tgt = exportTarget;
          setExportDialogOpen(false);
          setExportTarget(null);
          if (!tgt) return;

          if (tgt.kind === "pdf") {
            void downloadReportPdfWithOptions({ markdown: tgt.markdown, options }).catch((err) => {
              console.error("PDF export failed", err);
              alert(err instanceof Error ? err.message : t.errPdf);
            });
          } else if (tgt.kind === "word") {
            void downloadReportWordWithOptions({ markdown: tgt.markdown, options }).catch((err) => {
              console.error("Word export failed", err);
              alert(err instanceof Error ? err.message : t.errWord);
            });
          } else {
            printReportWithOptions(tgt.markdown, options);
          }
        }}
        title={t.exportDialogTitle}
      />
      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-3 pt-2 max-[480px]:px-2.5 min-[481px]:max-[1024px]:px-4 min-[1025px]:px-6"
      >
        {messages.length === 0 ? (
          <div className="mx-auto flex w-full max-w-[880px] justify-center">
            <div className="flex w-full flex-col items-center justify-center px-2 pb-2 pt-3 text-center duration-300 animate-in fade-in slide-in-from-right-4 max-[480px]:pt-2 min-[481px]:max-[1024px]:max-w-[760px] min-[1025px]:max-w-[880px]">
              <div className="mb-4 flex w-full flex-wrap items-center justify-center gap-2">
                <AssistantLangToggle uiLang={uiLang} onChange={setUiLang} copy={t} />
                <Link
                  to="/how-it-works"
                  state={{ returnTo: "/chat" }}
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-medium text-foreground/90 shadow-sm backdrop-blur transition-colors hover:bg-card"
                >
                  {t.howItWorksLinkEmpty}
                </Link>
              </div>
              <div className="mb-4 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/20">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h2 className="mb-3 text-[1.35rem] font-bold text-foreground min-[481px]:text-[1.55rem] min-[1025px]:text-[1.85rem]">
                {t.welcomeTitle}
              </h2>
              <p className="mb-5 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground min-[481px]:text-[1rem] min-[1025px]:text-[1.05rem]">
                {t.welcomeSubtitle}
              </p>
              <div className="mx-auto grid w-full max-w-xl grid-cols-1 gap-2.5 min-[481px]:grid-cols-2">
                {t.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(suggestion)}
                    className={cn(
                      "w-full rounded-xl border border-border/70 bg-card/70 p-3 text-start text-[0.86rem] leading-relaxed text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5",
                      idx === 2 && "min-[481px]:col-span-2 min-[481px]:max-w-xl min-[481px]:justify-self-center"
                    )}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-[880px] space-y-4 pb-1 pt-1 min-[481px]:max-w-[760px] min-[1025px]:max-w-[880px] min-[1025px]:space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <AssistantLangToggle uiLang={uiLang} onChange={setUiLang} copy={t} />
              <div className="flex min-w-0 flex-1 items-center justify-end gap-2 min-[481px]:justify-between">
                <p className="hidden min-w-0 flex-1 text-xs text-muted-foreground min-[481px]:block">
                  {t.tipBanner}
                </p>
                <Link
                  to="/how-it-works"
                  state={{ returnTo: "/chat" }}
                  className="shrink-0 text-xs font-semibold text-primary hover:underline"
                >
                  {t.howItWorksShort}
                </Link>
              </div>
            </div>
            <p className="px-1 text-xs text-muted-foreground min-[481px]:hidden">{t.tipBanner}</p>
            {messages.map((msg) => {
              const modelDisplay =
                msg.role === "model" ? sanitizeReportMarkdown(msg.content) : msg.content;
              return (
              <div
                key={msg.id}
                className={cn(
                  "flex w-full min-w-0 gap-2.5 min-[481px]:gap-3.5",
                  msg.role === "user" ? "flex-row justify-end" : "flex-row justify-start"
                )}
              >
                {msg.role === "model" && (
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background shadow-sm min-[481px]:h-10 min-[481px]:w-10">
                    <Bot className="h-4.5 w-4.5 min-[481px]:h-5 min-[481px]:w-5" />
                  </div>
                )}

                <div
                  className={cn(
                    "flex min-w-0 max-w-[88%] flex-col gap-1.5 min-[481px]:max-w-[80%] min-[1025px]:max-w-[76%]",
                    msg.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "break-words rounded-2xl p-3.5 shadow-sm min-[481px]:p-4",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "rounded-tl-sm border border-border bg-card"
                    )}
                  >
                    {msg.role === "user" ? (
                      <p className="whitespace-pre-wrap break-words text-[0.92rem] leading-relaxed min-[481px]:text-[0.97rem]">
                        {msg.content}
                      </p>
                    ) : (
                      <div
                        dir="auto"
                        className="prose prose-zinc dark:prose-invert max-w-none break-words prose-p:my-2 prose-p:leading-relaxed prose-headings:font-bold prose-a:text-primary prose-pre:overflow-x-auto prose-pre:bg-zinc-100 prose-pre:text-zinc-900 dark:prose-pre:bg-zinc-800 dark:prose-pre:text-zinc-50"
                      >
                        {modelDisplay ? (
                          <div className="inline">
                            <Markdown remarkPlugins={[remarkGfm]}>{modelDisplay}</Markdown>
                            {msg.isStreaming && (
                              <span
                                aria-hidden="true"
                                className="ms-1 inline-block h-5 w-1 translate-y-[2px] rounded-full bg-foreground/70 animate-pulse"
                              />
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-zinc-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>{t.thinking}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {msg.role === 'model' && !msg.isStreaming && msg.content && (
                    <div className="mt-1 grid w-full grid-cols-2 gap-1.5 px-1.5 min-[390px]:grid-cols-4 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-2 sm:px-2">
                      <Button variant="ghost" size="sm" className="h-8 justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground" onClick={() => handleCopy(msg.id, modelDisplay)}>
                        {copiedId === msg.id ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedId === msg.id ? t.copied : t.copy}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setExportTarget({ kind: "word", markdown: msg.content });
                          setExportDialogOpen(true);
                        }}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Word
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setExportTarget({ kind: "pdf", markdown: msg.content });
                          setExportDialogOpen(true);
                        }}
                      >
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setExportTarget({ kind: "print", markdown: msg.content });
                          setExportDialogOpen(true);
                        }}
                      >
                        <Printer className="h-3.5 w-3.5" />
                        {t.print}
                      </Button>
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm min-[481px]:h-10 min-[481px]:w-10">
                    <User className="h-4.5 w-4.5 min-[481px]:h-5 min-[481px]:w-5" />
                  </div>
                )}
              </div>
            );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* منطقة الإدخال — التحذير أسفل المربع كنص خفيف دون صندوق */}
      <div
        className={cn(
          "border-t border-border/40 bg-background/70 px-2.5 pb-2 pt-2 backdrop-blur-xl min-[481px]:px-4 min-[481px]:pb-3 min-[1025px]:px-6",
          hasConversation && "bg-gradient-to-t from-background/95 via-background/90 to-transparent"
        )}
      >
        <div className="mx-auto w-full max-w-[880px] min-[481px]:max-w-[760px] min-[1025px]:max-w-[880px]">
          <ChatGPTPromptInput
            value={input}
            onChange={setInput}
            onSubmit={() => handleSend()}
            isLoading={isLoading}
            variant={hasConversation ? "conversation" : "welcome"}
            locale={uiLang}
            placeholder={
              hasConversation ? t.placeholderConversation : t.placeholderWelcome
            }
            quickSuggestion={undefined}
          />
          <div
            className="mx-auto mt-1.5 max-w-[840px] space-y-1 px-1 text-center text-[0.63rem] leading-relaxed text-muted-foreground/70 min-[481px]:text-[0.67rem]"
            aria-live="polite"
          >
            <p>{t.disclaimer1}</p>
            <p>{t.disclaimer2}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
