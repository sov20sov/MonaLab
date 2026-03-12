import React from 'react';
import { LayoutGrid, FileText, Edit3, Download, Sparkles } from 'lucide-react';
import SecondaryPageLayout from './SecondaryPageLayout';

interface HowItWorksPageProps {
  onBack: () => void;
}

export default function HowItWorksPage({ onBack }: HowItWorksPageProps) {
  return (
    <SecondaryPageLayout title="دليل آلية العمل" subtitle="كيف تستخدم MonaLab في إعداد بحوثك" onBack={onBack}>
      <div className="space-y-12">
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/10 via-transparent to-emerald-500/5 p-8">
          <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
            <div className="space-y-4 max-w-xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">كيف يعمل MonaLab في الخلفية؟</h1>
              <p className="text-gray-300 leading-relaxed">
                تم تصميم المنظومة لتقودك في رحلة واضحة من الفكرة الأولية إلى بحث أكاديمي منسق جاهز
                للطباعة. التركيز هنا على تبسيط مهمة الباحث دون المساس بالمعايير العلمية.
              </p>
              <ul className="text-gray-300 text-sm space-y-2 list-disc pr-5">
                <li>كل خطوة واضحة ومحددة حتى لا تضيع في التفاصيل التقنية.</li>
                <li>يمكنك التوقف أو التعديل أو إعادة التوليد في أي مرحلة.</li>
                <li>الناتج النهائي يبقى تحت سيطرتك الكاملة للمراجعة والتحرير.</li>
              </ul>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="rounded-2xl border border-blue-500/30 bg-[#050814]/80 px-6 py-4 text-sm text-gray-200 max-w-xs">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold">نصيحة سريعة</span>
                </div>
                <p>
                  كلما كان وصفك لموضوع البحث أوضح وأكثر تحديداً، كانت بنية البحث المقترحة أدق وأقرب لما
                  تحتاجه فعلاً.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center mb-1">
              <LayoutGrid className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold">١. جمع معطيات البحث</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              في هذه الخطوة تكتب وصف الموضوع، المجال العلمي، المستوى الدراسي، وأي تعليمات خاصة مثل حجم
              البحث أو عدد الفصول المطلوبة.
            </p>
            <ul className="text-gray-400 text-xs list-disc pr-5 space-y-1">
              <li>حدد بوضوح: ما المشكلة أو السؤال البحثي؟</li>
              <li>اذكر إن كنت تحتاج إلى أمثلة تطبيقية أو دراسات حالة.</li>
              <li>يمكنك حفظ هذه المدخلات كجلسة مستقلة للعودة إليها لاحقاً.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center mb-1">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold">٢. توليد المسودة الأكاديمية</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              يقوم الأكاديمي الذكي بتحويل معطياتك إلى بحث متكامل بهيكل علمي (مقدمة، فصول، خاتمة، مراجع)
              وبأسلوب لغوي رصين.
            </p>
            <ul className="text-gray-400 text-xs list-disc pr-5 space-y-1">
              <li>يمكنك طلب توسيع فصل معيّن أو إعادة صياغته.</li>
              <li>يتم تنظيم العناوين الفرعية تلقائياً وفق منطق محتوى البحث.</li>
              <li>تُضاف قائمة مراجع مبدئية يمكنك تطويرها لاحقاً.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mb-1">
              <Edit3 className="w-5 h-5 text-amber-300" />
            </div>
            <h2 className="text-xl font-semibold">٣. المراجعة والتنسيق والتصدير</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              بعد الاطلاع على المسودة يمكنك إدخال التعديلات اللازمة ثم تصدير العمل النهائي كملف Word أو
              PDF جاهز للطباعة أو الإرسال.
            </p>
            <ul className="text-gray-400 text-xs list-disc pr-5 space-y-1">
              <li>استخدم خيارات التصدير بنقرة واحدة.</li>
              <li>يمكنك حفظ أكثر من نسخة من نفس البحث داخل سجل الجلسات.</li>
              <li>المحتوى يبقى على جهازك ولا يتم حفظه في خوادم خارجية افتراضياً.</li>
            </ul>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#050814]/80 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">جاهز لتجربة الآلية عملياً؟</h2>
            <p className="text-gray-300 text-sm leading-relaxed max-w-xl">
              انتقل الآن إلى واجهة الأكاديمي الذكي واكتب موضوع بحثك الأول. يمكنك دائماً العودة إلى هذه
              الصفحة لقراءة توضيحات إضافية حول كل خطوة.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-medium shadow-[0_0_25px_rgba(37,99,235,0.35)] transition-colors"
            >
              العودة للرئيسية
            </button>
            <button
              type="button"
              onClick={() => {
                const content = [
                  'دليل مختصر لاستخدام الأكاديمي الذكي',
                  '===================================',
                  '',
                  '1) من الصفحة الرئيسية اضغط «ابدأ الآن».',
                  '2) في مربع الإدخال في الأسفل اكتب:',
                  '   - موضوع البحث أو التقرير.',
                  '   - المستوى الدراسي (جامعة / ثانوي / ...).',
                  '   - المطلوب: عدد الفصول أو الصفحات، ونوع المخرجات.',
                  '',
                  '3) اضغط زر الإرسال أو استخدم زر الميكروفون للإملاء الصوتي.',
                  '4) بعد ظهور النتيجة يمكنك:',
                  '   - مراجعة المحتوى وتعديله من داخل المربع.',
                  '   - تصدير النتيجة إلى Word أو PDF من أزرار التصدير أسفل كل إجابة.',
                  '',
                  '5) يتم حفظ كل جلسة تلقائياً في «سجل الأبحاث» على يمين الشاشة، ويمكنك العودة لها لاحقاً.',
                ].join('\n');

                const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'دليل_مختصر_الأكاديمي.txt';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              عرض دليل مختصر (تحميل ملف نصي)
            </button>
          </div>
        </section>
      </div>
    </SecondaryPageLayout>
  );
}

