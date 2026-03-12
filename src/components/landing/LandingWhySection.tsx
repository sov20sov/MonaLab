import React from 'react';
import { LayoutGrid, MousePointerClick, Palette } from 'lucide-react';

export function LandingWhySection() {
  return (
    <section className="mb-32">
      <div className="grid gap-10 lg:grid-cols-2 items-start">
        <div className="space-y-5">
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">لماذا MonaLab؟</h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            لأن إعداد بحث عربي متقن لا يجب أن يكون رحلة مرهقة مع التنسيق والهيكلة واللغة؛ بل مساحة
            للتركيز على الفكرة العلمية نفسها، بينما تساعدك الأدوات الذكية في الباقي.
          </p>
          <ul className="space-y-3 text-gray-300 text-sm leading-relaxed list-disc pr-5">
            <li>واجهة عربية بالكامل، مصممة خصيصاً لاحتياجات الطالب والباحث العربي.</li>
            <li>هيكل أكاديمي واضح للبحث (مقدمة، فصول، خاتمة، مراجع مقترحة).</li>
            <li>إمكانية حفظ أكثر من جلسة بحث والعودة إليها في أي وقت.</li>
          </ul>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-[#161922] border border-white/5 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold">تجربة استخدام مركزة</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              كل شيء مبني حول سيناريو واحد واضح: إعداد بحث أو تقرير أكاديمي قابل للتعديل والتطوير.
            </p>
          </div>

          <div className="bg-[#161922] border border-white/5 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Palette className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold">تنسيق جاهز للطباعة</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              تصدير مباشر إلى Word وPDF مع تنسيق مناسب للقراءة والمراجعة والعرض على المشرف.
            </p>
          </div>

          <div className="bg-[#161922] border border-white/5 rounded-2xl p-6 space-y-3 sm:col-span-2">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <MousePointerClick className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold">تحكم كامل بالمحتوى</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              يمكنك توجيه المساعد لتوسيع فصل معيّن، إعادة صياغة فقرة، أو تحسين لغة جزء معيّن من البحث متى
              شئت، مع تذكير دائم بأهمية المراجعة والتوثيق الصحيح.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

