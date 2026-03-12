import React from 'react';
import { ArrowRight } from 'lucide-react';

interface LandingHeroProps {
  onGetStarted: () => void;
}

export function LandingHero({ onGetStarted }: LandingHeroProps) {
  return (
    <section className="grid lg:grid-cols-2 gap-16 items-center mb-32">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          إصدار تجريبي للأكاديميين والطلاب
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-[3.2rem] font-bold leading-[1.3] tracking-tight mb-6">
          أنجز أبحاثك وتقاريرك
          <br />
          الجامعية بالعربية
          <br />
          <span className="text-blue-500">باحترافية خلال دقائق</span>
        </h1>

        <p className="text-gray-400 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl">
          منظومة متكاملة لمساعدة الطلاب والباحثين على إعداد بحوث وتقارير أكاديمية عربية منسقة،
          بهيكل علمي واضح، مع إمكانية التصدير إلى ملفات Word وPDF جاهزة للطباعة.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={onGetStarted}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(37,99,235,0.25)] hover:shadow-[0_0_40px_rgba(37,99,235,0.4)]"
          >
            ابدأ بحثاً جديداً الآن
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>

      <div className="relative lg:h-[500px] flex items-center justify-center">
        <div className="group w-full max-w-lg aspect-[4/3] bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-2xl border border-white/10 shadow-[0_30px_80px_rgba(15,23,42,0.9)] overflow-hidden relative transition-transform duration-500 hover:-translate-y-1 hover:border-blue-400/60">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.25) 1px, transparent 0)',
              backgroundSize: '18px 18px',
            }}
          ></div>

          <div className="relative h-12 border-b border-white/10 flex items-center px-4 gap-2 justify-between bg-slate-900/70 backdrop-blur">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>
            <span className="text-xs text-gray-400">نموذج بحث جامعي</span>
          </div>

          <div className="relative p-6 flex flex-col gap-5">
            <div className="h-3 w-1/2 rounded-full bg-slate-700/70 overflow-hidden">
              <div className="h-full w-1/2 bg-gradient-to-l from-blue-400/70 to-sky-300/70 animate-[pulse_2.4s_ease-in-out_infinite]"></div>
            </div>

            <div className="flex gap-4">
              <div className="h-24 flex-1 rounded-xl bg-slate-900/80 border border-slate-700/80 shadow-[0_18px_45px_rgba(15,23,42,0.7)] transition-transform duration-500 group-hover:-translate-y-1"></div>
              <div className="h-24 flex-1 rounded-xl bg-slate-900/80 border border-slate-800 shadow-[0_18px_45px_rgba(15,23,42,0.7)] transition-transform duration-500 delay-75 group-hover:-translate-y-1"></div>
              <div className="h-24 flex-1 rounded-xl bg-gradient-to-br from-blue-600/40 via-blue-700/40 to-slate-900/90 border border-blue-400/60 shadow-[0_0_40px_rgba(59,130,246,0.65)] transition-transform duration-500 delay-150 group-hover:-translate-y-1.5"></div>
            </div>

            <div className="relative h-44 sm:h-48 w-full rounded-xl bg-slate-900/80 border border-slate-700/80 mt-1 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-950/80"></div>
              <div className="absolute inset-0 opacity-40">
                <div className="h-full w-2/3 bg-gradient-to-r from-blue-500/20 via-emerald-400/10 to-transparent translate-x-[-15%] group-hover:translate-x-[5%] transition-transform duration-[2000ms]"></div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-blue-500/15 via-transparent to-emerald-400/10"></div>
        </div>
      </div>
    </section>
  );
}

