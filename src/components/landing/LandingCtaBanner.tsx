import React from 'react';

interface LandingCtaBannerProps {
  onGetStarted: () => void;
}

export function LandingCtaBanner({ onGetStarted }: LandingCtaBannerProps) {
  return (
    <section className="bg-blue-600 rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      ></div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          جاهز لبدء أول بحث أكاديمي مع المساعد الذكي؟
        </h2>
        <p className="text-blue-100 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
          اكتب موضوعك الآن ودع المنظومة تقترح لك هيكلاً ومواضيع فرعية وخاتمة احترافية يمكن تطويرها
          ومراجعتها.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors"
          >
            ابدأ باستخدام الأكاديمي الذكي
          </button>
          <a
            href="https://t.me/husTh1"
            className="inline-flex items-center justify-center bg-transparent border border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors"
          >
            تواصل معنا للاقتراحات
          </a>
        </div>
      </div>
    </section>
  );
}

