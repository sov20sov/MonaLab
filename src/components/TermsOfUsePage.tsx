import React from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';
import SecondaryPageLayout from './SecondaryPageLayout';

interface TermsOfUsePageProps {
  onBack: () => void;
}

export default function TermsOfUsePage({ onBack }: TermsOfUsePageProps) {
  return (
    <SecondaryPageLayout title="شروط الاستخدام" subtitle="قواعد الاستخدام المسؤول للأداة" onBack={onBack}>
      <div className="space-y-8">
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/15 via-[#050814] to-purple-500/10 p-8 flex gap-6 items-start">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0">
            <FileText className="w-7 h-7 text-blue-300" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-bold">شروط استخدام MonaLab</h1>
            <p className="text-gray-200 text-sm leading-relaxed">
              باستخدامك لهذه المنظومة، فإنك توافق على الالتزام بالشروط التالية التي تهدف إلى ضمان استخدام
              مسؤول وعادل للأداة بما يتوافق مع الأنظمة والقوانين والمعايير الأكاديمية.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#050814]/90 p-8 space-y-5">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            أولاً: طبيعة الخدمة
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            المنظومة أداة مساعدة لإعداد وصياغة محتوى بحثي أولي باللغة العربية، وليست بديلاً عن الباحث أو
            المشرف الأكاديمي، ولا تُعد مصدراً رسمياً أو نهائياً للمعلومات العلمية.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#050814]/90 p-8 space-y-5">
          <h2 className="text-xl font-semibold">ثانياً: الاستخدام المسموح</h2>
          <ul className="list-disc pr-5 space-y-2 text-sm text-gray-300 leading-relaxed">
            <li>استخدام المنظومة لإعداد مسودات بحوث وتقارير وملخصات أكاديمية شخصية.</li>
            <li>استخدام المخرجات كأساس أولي يمكن تطويره وتعديله وإعادة صياغته.</li>
            <li>الاستفادة من المنظومة لتحسين أسلوب الكتابة وتنظيم الأفكار.</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#050814]/90 p-8 space-y-5">
          <h2 className="text-xl font-semibold">ثالثاً: الاستخدامات غير المسموح بها</h2>
          <ul className="list-disc pr-5 space-y-2 text-sm text-gray-300 leading-relaxed">
            <li>نسب المحتوى الناتج بالكامل إلى نفسك دون مراجعة أو تعديل أو توثيق مناسب للمصادر.</li>
            <li>استخدام المنظومة في أي أنشطة تتعارض مع الأمانة العلمية أو تشجّع على الغش أو الانتحال.</li>
            <li>إدخال بيانات سرّية أو معلومات شخصية حسّاسة عنك أو عن أي طرف آخر.</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#050814]/90 p-8 space-y-5">
          <h2 className="text-xl font-semibold">رابعاً: حدود المسؤولية</h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            بالرغم من السعي لتقديم مخرجات ذات جودة عالية، قد تحتوي النتائج على أخطاء أو معلومات غير دقيقة
            أو قديمة. أنت تتحمل المسؤولية الكاملة عن مراجعة المحتوى، والتأكد من توافقه مع متطلبات جهتك
            التعليمية، والالتزام بأنظمة النشر والاقتباس المعمول بها.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#050814]/90 p-8 space-y-5">
          <h2 className="text-xl font-semibold">خامساً: تحديث شروط الاستخدام</h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            قد يتم تحديث هذه الشروط مستقبلاً مع تطور المنظومة. استمرارك في استخدام الخدمة بعد نشر أي
            تحديثات يعني موافقتك الضمنية على الشروط المحدّثة، لذا ننصح بزيارة هذه الصفحة دورياً.
          </p>
        </section>
      </div>
    </SecondaryPageLayout>
  );
}

