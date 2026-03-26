import * as React from "react";
import { Plus, Mic, ArrowUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type ChatPromptVariant = "welcome" | "conversation";

export interface ChatGPTPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  variant?: ChatPromptVariant;
  quickSuggestion?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
}

export function ChatGPTPromptInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = "Message ChatGPT...",
  className,
  variant = "welcome",
  quickSuggestion,
}: ChatGPTPromptInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const isConversation = variant === "conversation";
  const [isRecording, setIsRecording] = React.useState(false);
  const recognitionRef = React.useRef<{
    start: () => void;
    stop: () => void;
  } | null>(null);
  const valueRef = React.useRef(value);

  React.useEffect(() => {
    valueRef.current = value;
  }, [value]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const Win = window as unknown as {
      SpeechRecognition?: new () => {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        start: () => void;
        stop: () => void;
        onresult: ((e: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
        onerror: (() => void) | null;
        onend: (() => void) | null;
      };
      webkitSpeechRecognition?: new () => {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        start: () => void;
        stop: () => void;
        onresult: ((e: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
        onerror: (() => void) | null;
        onend: (() => void) | null;
      };
    };
    const SR = Win.SpeechRecognition || Win.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "ar-SA";
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const currentValue = valueRef.current;
      onChange(currentValue ? `${currentValue} ${transcript}` : transcript);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
  }, [onChange]);

  const toggleRecording = () => {
    const r = recognitionRef.current;
    if (!r) return;
    if (isRecording) r.stop();
    else {
      r.start();
      setIsRecording(true);
    }
  };

  React.useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const maxPx = isConversation ? Math.min(window.innerHeight * 0.36, 188) : 140;
    ta.style.maxHeight = `${maxPx}px`;
    ta.style.height = "0";
    ta.style.height = `${Math.min(Math.max(ta.scrollHeight, 40), maxPx)}px`;
  }, [value, isConversation]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.key === "Enter" || e.key === "NumpadEnter") && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) onSubmit();
    }
  };

  const iconBtn =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground";

  const textareaConversationClass = cn(
    "min-h-10 min-w-0 flex-1 resize-none border-0 !bg-transparent px-2 py-2 text-[0.92rem] leading-relaxed text-foreground antialiased dark:[color-scheme:dark]",
    "shadow-none outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none",
    "caret-primary placeholder:text-muted-foreground/65",
    "overflow-y-auto overflow-x-hidden",
    "[&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/10 [&::-webkit-scrollbar-thumb]:hover:bg-foreground/20",
    "[scrollbar-width:thin] [scrollbar-color:var(--border)_transparent]",
    "min-[481px]:px-2.5 min-[1025px]:text-[0.95rem]"
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-full border border-white/10 bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-violet-500/10",
          "backdrop-blur-xl shadow-[0_8px_28px_rgba(2,6,23,0.35)] transition-[box-shadow,border-color,background-color]",
          "focus-within:border-white/20 focus-within:shadow-[0_10px_34px_rgba(56,189,248,0.16)]",
          className
        )}
      >
        <div
          className={cn(
            "flex items-end gap-1 px-2 py-1.5 max-[480px]:gap-0.5 min-[481px]:gap-1.5 min-[481px]:px-2.5 min-[481px]:py-2"
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className={iconBtn} aria-label="إضافة — قريباً">
                <Plus className="h-5 w-5" strokeWidth={2} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">المرفقات والوسائط ستدعم لاحقاً</TooltipContent>
          </Tooltip>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            dir="auto"
            spellCheck
            autoComplete="off"
            className={cn(textareaConversationClass, "text-right")}
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleRecording}
                className={cn(
                  iconBtn,
                  isRecording && "bg-red-500/15 text-red-500 hover:bg-red-500/25 hover:text-red-600"
                )}
              >
                <Mic className={cn("h-5 w-5", isRecording && "animate-pulse")} />
                <span className="sr-only">{isRecording ? "إيقاف التسجيل" : "تحدث الآن"}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">{isRecording ? "إيقاف التسجيل" : "تحدث الآن"}</TooltipContent>
          </Tooltip>

          <button
            type="button"
            onClick={onSubmit}
            disabled={!value.trim() || isLoading}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
              !value.trim() || isLoading
                ? "cursor-not-allowed bg-white/10 text-muted-foreground"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
            <span className="sr-only">إرسال</span>
          </button>
        </div>

        {quickSuggestion && !isConversation && (
          <div className="border-t border-white/10 px-3 pb-1.5 pt-1 sm:px-4">
            <button
              type="button"
              onClick={quickSuggestion.onClick}
              disabled={quickSuggestion.disabled}
              className="text-[11px] text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-45"
            >
              {quickSuggestion.label}
            </button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
