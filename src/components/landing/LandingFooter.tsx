import React from 'react';
import { Box, Instagram, Send } from 'lucide-react';

interface LandingFooterProps {
  onNavigateToPrivacy?: () => void;
  onNavigateToTerms?: () => void;
  onNavigateToLegal?: () => void;
}

export function LandingFooter({
  onNavigateToPrivacy,
  onNavigateToTerms,
  onNavigateToLegal,
}: LandingFooterProps) {
  return (
    <footer className="border-t border-white/5 bg-[#050814] py-10 px-6 mt-8">
      <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-[2fr,1.5fr,1.5fr] items-start">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Box className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold tracking-tight text-lg">MonaLab</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed max-w-md">
            منصة عربية تجريبية لمساندة الطلاب والباحثين في إعداد البحوث والتقارير الأكاديمية بالعربية، مع
            التركيز على الجودة والالتزام بالمعايير العلمية.
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-white mb-1">روابط مهمة</h3>
          <div className="flex flex-col gap-2 text-gray-400">
            {onNavigateToPrivacy ? (
              <button
                type="button"
                onClick={onNavigateToPrivacy}
                className="hover:text-white transition-colors text-right"
              >
                سياسة الخصوصية
              </button>
            ) : (
              <a href="/privacy" className="hover:text-white transition-colors">
                سياسة الخصوصية
              </a>
            )}
            {onNavigateToTerms ? (
              <button
                type="button"
                onClick={onNavigateToTerms}
                className="hover:text-white transition-colors text-right"
              >
                شروط الاستخدام
              </button>
            ) : (
              <a href="/terms" className="hover:text-white transition-colors">
                شروط الاستخدام
              </a>
            )}
            {onNavigateToLegal ? (
              <button
                type="button"
                onClick={onNavigateToLegal}
                className="hover:text-white transition-colors text-right"
              >
                التنبيهات القانونية
              </button>
            ) : (
              <a href="/legal" className="hover:text-white transition-colors">
                التنبيهات القانونية
              </a>
            )}
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-white mb-1">تابعنا</h3>
          <p className="text-gray-400 text-xs">
            اطّلع على آخر التحديثات ونصائح الاستخدام عبر قنواتنا الرسمية.
          </p>
          <div className="flex items-center gap-4 mt-2">
            <a
              href="https://www.instagram.com/1husth"
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-100 text-xs transition-colors"
              aria-label="صفحة إنستغرام"
            >
              <Instagram className="w-4 h-4" />
              <span>Instagram</span>
            </a>
            <a
              href="https://t.me/husTh1"
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-100 text-xs transition-colors"
              aria-label="قناة تلغرام"
            >
              <Send className="w-4 h-4" />
              <span>Telegram</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-4 border-t border-white/5 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} MonaLab. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}

