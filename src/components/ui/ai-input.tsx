'use client';

import { useEffect, useRef, useState } from 'react';
import { CornerRightUp, Mic, Square } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Textarea } from './textarea';
import { useAutoResizeTextarea } from '../hooks/use-auto-resize-textarea';

interface AIInputProps {
  id?: string;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onStop?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function AIInput({
  id = 'ai-input',
  placeholder = 'اكتب موضوع البحث أو التقرير...',
  minHeight = 52,
  maxHeight = 200,
  value: controlledValue,
  onChange,
  onSubmit,
  onStop,
  isLoading = false,
  disabled = false,
  className,
}: AIInputProps) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight,
    maxHeight,
  });

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : '';

  const [isListening, setIsListening] = useState(false);
  // نستخدم any لتفادي الحاجة لتعريف نوع SpeechRecognition في TypeScript
  const recognitionRef = useRef<any | null>(null);
  const latestValueRef = useRef(controlledValue ?? '');

  useEffect(() => {
    if (isControlled && !controlledValue?.trim()) adjustHeight(true);
  }, [isControlled, controlledValue, adjustHeight]);

  // حدّث القيمة الأخيرة دائماً من الـ prop المتحكم بها
  useEffect(() => {
    latestValueRef.current = controlledValue ?? '';
  }, [controlledValue]);

  const handleSubmit = () => {
    const v = (isControlled ? controlledValue : '').trim();
    if (!v || disabled || isLoading) return;
    onSubmit?.(v);
    if (!isControlled) {
      adjustHeight(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    if (!isControlled) return;
    onChange?.(v);
    adjustHeight();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // إعداد واجهة Web Speech API (مرة واحدة فقط)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const AnySpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!AnySpeechRecognition) return;
    const recognition = new AnySpeechRecognition();
    recognition.lang = 'ar-SA';
    // نستخدم النتائج النهائية فقط لتفادي تكرار الجمل
    recognition.interimResults = false;
    // يمكن أن يستمر الاستماع حتى يوقفه المستخدم
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result.isFinal) continue;
        transcript += result[0].transcript;
      }
      const addition = transcript.trim();
      if (!addition) return;
      if (!isControlled) return;
      const base = latestValueRef.current ?? '';
      const next =
        base + (base && addition ? (base.endsWith(' ') ? '' : ' ') : '') + addition;
      latestValueRef.current = next;
      onChange?.(next);
      adjustHeight();
    };

    recognitionRef.current = recognition;
    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adjustHeight]);

  const toggleMic = () => {
    if (!isControlled || disabled || isLoading) return;
    const recognition = recognitionRef.current;
    if (!recognition) {
      // المتصفح لا يدعم المايك
      alert('المتصفح الحالي لا يدعم التعرف على الصوت.');
      return;
    }
    if (!isListening) {
      try {
        recognition.start();
        setIsListening(true);
      } catch {
        // تجاهل أي خطأ في البدء
      }
    } else {
      recognition.stop();
      setIsListening(false);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="relative w-full flex flex-col items-end">
        <Textarea
          id={id}
          dir="rtl"
          placeholder={placeholder}
          className={cn(
            'w-full rounded-3xl pr-4 pl-14',
            'bg-transparent border-none',
            'placeholder:text-slate-500 dark:placeholder:text-white/50',
            'focus-visible:ring-0 focus-visible:border-0',
            'text-slate-50 dark:text-white text-wrap resize-none',
            'overflow-y-auto focus-visible:ring-offset-0 focus-visible:outline-none',
            'transition-[height] duration-100 ease-out leading-[1.2] py-4',
            '[&::-webkit-resizer]:hidden'
          )}
          style={{ minHeight: `${minHeight}px`, maxHeight: `${maxHeight}px` }}
          ref={textareaRef}
          value={isControlled ? value : undefined}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
        />

        {/* زر الميكروفون — بدء/إيقاف الاستماع */}
        <button
          type="button"
          onClick={toggleMic}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 rounded-xl py-1.5 px-1.5 transition-all duration-200',
            value?.trim() || isListening ? 'left-12' : 'left-3',
            isListening
              ? 'bg-emerald-600/90 text-white shadow-[0_0_18px_rgba(16,185,129,0.7)]'
              : 'bg-slate-800/80 dark:bg-white/5 text-slate-400 dark:text-white/70 hover:bg-slate-700/80'
          )}
          title={isListening ? 'إيقاف التسجيل' : 'التسجيل بالصوت'}
        >
          <Mic className={cn('w-4 h-4', isListening && 'animate-pulse')} />
        </button>

        {/* زر الإرسال أو الإيقاف */}
        <button
          type="button"
          onClick={isLoading ? onStop : handleSubmit}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 left-3 rounded-xl py-1.5 px-1.5 transition-all duration-200',
            isLoading
              ? 'bg-red-600/90 hover:bg-red-600 text-white'
              : 'bg-slate-800/80 dark:bg-white/5 hover:bg-slate-700/80 text-slate-400 dark:text-white/70',
            value?.trim() || isLoading
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-95 pointer-events-none'
          )}
          title={isLoading ? 'إيقاف التوليد' : 'إرسال'}
        >
          {isLoading ? (
            <Square className="w-4 h-4 fill-current" />
          ) : (
            <CornerRightUp className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
