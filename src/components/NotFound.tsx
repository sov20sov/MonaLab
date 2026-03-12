import React from 'react';
import SecondaryPageLayout from './SecondaryPageLayout';

export default function NotFound() {
  return (
    <SecondaryPageLayout
      title="الصفحة غير موجودة"
      subtitle="تحقق من الرابط أو عد إلى الرئيسية"
      onBack={() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }}
    >
      <div className="max-w-md text-right space-y-4">
        <p className="text-gray-400">
          يبدو أنك وصلت إلى مسار غير صحيح داخل منصة MonaLab. يمكنك العودة للصفحة الرئيسية للبدء
          في إعداد بحث جديد.
        </p>
      </div>
    </SecondaryPageLayout>
  );
}

