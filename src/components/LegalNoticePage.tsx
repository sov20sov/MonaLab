import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import SecondaryPageLayout from './SecondaryPageLayout';

interface LegalNoticePageProps {
  onBack: () => void;
}

export default function LegalNoticePage({ onBack }: LegalNoticePageProps) {
  return (
    <SecondaryPageLayout title="التنبيهات القانونية" subtitle="حدود المسؤولية والاستخدام القانوني" onBack={onBack}>
      <div className="space-y-8">
        <section className="rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-[#050814] to-red-500/10 p-8 flex gap-6 items-start">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-7 h-7 text-amber-300" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-bold">التنبيهات القانونية والشروط التنظيمية</h1>
            <p className="text-gray-200 text-sm leading-relaxed">
              تهدف هذه الصفحة إلى توضيح الحدود القانونية لاستخدام منصة MonaLab، وبيان مسؤولية كل
              من مطوّري المنصة والمستخدم النهائي تجاه المحتوى الناتج عن استخدام الأداة.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#050814]/90 p-8 space-y-5">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            أولاً: عدم تقديم استشارات قانونية أو أكاديمية رسمية
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            المخرجات النصية التي تنتج عن استخدام المنظومة تُعد محتوى تجريبياً بهدف المساندة في إعداد
            البحوث، ولا تُعتبر بأي حال من الأحوال استشارة قانونية أو فتوى شرعية أو رأياً علمياً رسمياً من
            جهة معتمدة.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#050814]/90 p-8 space-y-5">
          <h2 className="text-xl font-semibold">ثانياً: حقوق الملكية الفكرية</h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            أنت مسؤول عن التأكد من أن طريقة استخدامك للمحتوى الناتج لا تنتهك حقوق الملكية الفكرية لأي جهة
            أخرى، بما في ذلك حقوق المؤلفين والناشرين والجهات الأكاديمية. يجب عليك دائماً توثيق المصادر
            والاستشهاد بالمراجع وفقاً للأنظمة المتّبعة في مؤسستك.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#050814]/90 p-8 space-y-5">
          <h2 className="text-xl font-semibold">ثالثاً: مسؤولية دقة المعلومات</h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            لا يضمن مطوّرو المنظومة أو مشغلوها دقة أو اكتمال أو حداثة المعلومات الناتجة عن النموذج، وقد
            تحتوي المخرجات على أخطاء أو معلومات غير محدثة. تقع عليك وحدك مسؤولية التحقق من صحة المعلومات
            قبل الاعتماد عليها في أي سياق علمي أو عملي.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#050814]/90 p-8 space-y-5">
          <h2 className="text-xl font-semibold">رابعاً: حدود المسؤولية القانونية</h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            لا يتحمل مطوّرو المنظومة أو أي من الجهات المرتبطة بها أي مسؤولية عن أي أضرار مباشرة أو غير
            مباشرة أو تبعية قد تنشأ نتيجة استخدام الأداة، بما في ذلك — على سبيل المثال لا الحصر — النتائج
            الأكاديمية، أو القرارات المهنية، أو أي استخدام يخالف الأنظمة والقوانين المعمول بها.
          </p>
        </section>
      </div>
    </SecondaryPageLayout>
  );
}

