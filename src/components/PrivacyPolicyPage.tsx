import React from 'react';
import { ShieldCheck, FileText } from 'lucide-react';
import SecondaryPageLayout from './SecondaryPageLayout';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export default function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
  return (
    <SecondaryPageLayout title="سياسة الخصوصية" subtitle="كيف يتعامل MonaLab مع بياناتك" onBack={onBack}>
      <div className="space-y-8">
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/15 via-[#050814] to-emerald-500/10 p-8 flex gap-6 items-start">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7 text-blue-300" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-bold">سياسة خصوصية MonaLab</h1>
          <p className="text-gray-200 text-sm leading-relaxed">
            نلتزم في MonaLab بحماية خصوصية مستخدمينا قدر الإمكان ضمن الإمكانات المتاحة في هذه النسخة التجريبية،
            ونوضح في هذه الصفحة كيفية التعامل مع بياناتك أثناء استخدام المنصة.
          </p>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#050814]/90 p-8 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold">أولاً: نوعية البيانات التي يتم التعامل معها</h2>
          </div>
          <ul className="list-disc pr-5 space-y-2 text-sm text-gray-300 leading-relaxed">
            <li>النصوص التي تقوم بإدخالها في واجهة المساعد (مواضيع البحوث، الأسئلة، التعليمات).</li>
            <li>النصوص الناتجة عن النموذج والمحفوظة في سجلات الجلسات على جهازك.</li>
            <li>بيانات تقنية أساسية لتشغيل المنظومة (مثل نوع المتصفح وبعض المعلومات التقنية العامة).</li>
          </ul>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/10 bg-[#050814]/90 p-7 space-y-3">
            <h3 className="text-lg font-semibold mb-1">ثانياً: مكان تخزين البيانات</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              يتم تخزين سجلات الأبحاث والجلسات افتراضياً داخل متصفحك فقط باستخدام التخزين المحلي
              <span className="mx-1 text-gray-400">(localStorage)</span>، ولا يتم إرسالها إلى قاعدة بيانات
              مركزية مخصّصة لهذا الغرض في هذه النسخة التجريبية.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#050814]/90 p-7 space-y-3">
            <h3 className="text-lg font-semibold mb-1">ثالثاً: مشاركة البيانات مع أطراف أخرى</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              يتم تمرير طلباتك إلى مزوّد خدمة الذكاء الاصطناعي لمعالجة النصوص وتوليد المخرجات. نحرص على عدم
              تضمين بيانات شخصية حسّاسة في هذه الطلبات قدر الإمكان، ونوصي بعدم إدخال أي معلومات سرّية أو
              تعريفية عن أشخاص حقيقيين.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#050814]/90 p-8 space-y-4">
          <h2 className="text-xl font-semibold">رابعاً: مسؤولية المستخدم</h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            أنت مسؤول عن مراجعة المحتوى الناتج والتأكد من خلوّه من المعلومات الحسّاسة أو المخالفة لسياسات
            المؤسسة التعليمية أو الجهة التي تنتمي إليها. كما تتحمل مسؤولية طريقة حفظ الملفات وتخزينها على
            أجهزتك الخاصة أو أي خدمات تخزين أخرى تستخدمها.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#050814]/90 p-8 space-y-4">
          <h2 className="text-xl font-semibold">خامساً: تحديثات سياسة الخصوصية</h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            قد يتم تحديث هذه السياسة مستقبلاً مع تطور المنظومة وإضافة مزايا جديدة (مثل إنشاء حسابات أو
            تخزين سحابي). سيتم توضيح أي تغييرات جوهرية بشكل صريح داخل المنصة، وننصح بالاطلاع الدوري على هذه
            الصفحة.
          </p>
        </section>
      </div>
    </SecondaryPageLayout>
  );
}

