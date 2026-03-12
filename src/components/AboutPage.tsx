import React from 'react';
import { Users, Target, ShieldCheck } from 'lucide-react';
import SecondaryPageLayout from './SecondaryPageLayout';

interface AboutPageProps {
  onBack: () => void;
}

export default function AboutPage({ onBack }: AboutPageProps) {
  return (
    <SecondaryPageLayout title="من نحن ورؤيتنا" subtitle="تعرف على MonaLab الأكاديمي" onBack={onBack}>
      <div className="space-y-10">
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/15 via-[#050814] to-emerald-500/10 p-8">
          <div className="grid gap-8 md:grid-cols-[minmax(0,2fr),minmax(0,1.2fr)] items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">منظومة عربية للبحث الأكاديمي المعاصر</h1>
              <p className="text-gray-200 leading-relaxed mb-4">
                الأكاديمي الذكي هو محاولة جادة لسد فجوة أدوات البحث والكتابة الأكاديمية باللغة العربية. نهدف
                إلى تمكين الطالب والباحث من التركيز على الفكرة العلمية، بينما نتكفّل نحن بتنظيم المحتوى وصياغته
                الأولية بأسلوب أكاديمي رصين.
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">
                تم تصميم المنظومة بعناية لتخدم مختلف التخصصات، مع احترام التباينات بين العلوم الإنسانية
                والعلوم التطبيقية، وإتاحة مساحة كبيرة للتخصيص وفق متطلبات كل مؤسسة تعليمية أو مشرف أكاديمي.
              </p>
              <p className="text-gray-300 text-sm leading-relaxed mt-3">
                تم تطوير هذا الموقع والمنظومة بالكامل من قبل المطوّر
                <span className="font-semibold text-white mx-1">حسين محمد</span>
                بدافع دعم الأدوات التعليمية والبحثية العربية الحديثة.
              </p>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="relative flex flex-col items-center gap-3">
                {/* الحلقة المتوهجة حول الصورة */}
                <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-blue-500 via-emerald-400 to-indigo-500 p-[2px] shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl" />
                  <div className="relative w-full h-full rounded-full overflow-hidden border border-white/10 bg-slate-900">
                    <img
                      src="/images/developer-hussein.png"
                      alt="صورة المطوّر حسين محمد"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {/* نص تعريف المطوّر */}
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-white">حسين محمد</p>
                  <p className="text-[11px] text-gray-300">
                    مطوّر المنظومة ومهتم بتطوير أدوات
                    <br />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center mb-1">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold">رسالتنا</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              مساعدة المجتمع الأكاديمي العربي على إنتاج محتوى علمي منظم وعالي الجودة، دون أن يتحول الذكاء
              الاصطناعي إلى بديل عن الجهد البحثي الحقيقي.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center mb-1">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold">لمن صُمّمت المنظومة؟</h2>
            <ul className="text-gray-300 text-sm leading-relaxed space-y-2 list-disc pr-5">
              <li>طلاب المراحل الجامعية المختلفة الذين يبدؤون أولى تجاربهم البحثية.</li>
              <li>الباحثون الذين يحتاجون لتسريع مرحلة صياغة المسودات الأولى.</li>
              <li>المشرفون والمدرّسون الذين يرغبون في مساعدة طلابهم على تنظيم أعمالهم.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mb-1">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>
            <h2 className="text-xl font-semibold">مبادئنا</h2>
            <ul className="text-gray-300 text-sm leading-relaxed space-y-2 list-disc pr-5">
              <li>الالتزام بالأمانة العلمية وتشجيع التوثيق الصحيح للمصادر.</li>
              <li>حفظ خصوصية المستخدم وعدم استخدام بياناته في أي تدريب إضافي.</li>
              <li>وضوح حدود الذكاء الاصطناعي وتذكير المستخدم بأهمية المراجعة النقدية.</li>
            </ul>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#050814]/80 p-8 space-y-4">
          <h2 className="text-2xl font-semibold mb-2">كيف نتعامل مع البيانات والخصوصية؟</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            يتم تنفيذ توليد المحتوى عبر واجهات برمجة تطبيقات خارجية للذكاء الاصطناعي، مع الحرص قدر
            الإمكان على عدم الاحتفاظ بمحتوى البحوث بشكل مركزي. بشكل افتراضي، يتم تخزين سجل الأبحاث على
            جهاز المستخدم فقط، ويمكن لاحقاً دعم خيارات متقدمة للتخزين السحابي عند الرغبة وبشكل واضح وشفاف.
          </p>
          <p className="text-gray-400 text-xs leading-relaxed">
            تنبيه: لا تزال هذه النسخة تجريبية، لذلك ننصح بعدم استخدام بيانات حساسة أو سرّية ضمن النصوص
            التي تُرسل للمنظومة، إلى أن يتم توفير طبقات حماية وتشفير متقدمة في الإصدارات القادمة.
          </p>
        </section>
      </div>
    </SecondaryPageLayout>
  );
}

