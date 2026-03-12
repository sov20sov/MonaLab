# MonaLab

منظومة أكاديمية عربية لمساعدة الطلاب والباحثين على إعداد البحوث والتقارير باستخدام الذكاء الاصطناعي.

## التشغيل

```bash
npm install
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000).

## المتغيرات البيئية

أنشئ ملف `.env.local` وضَع فيه (انظر `.env.example` إن وُجد):

- `GEMINI_API_KEY` أو `GOOGLE_API_KEY` — لاستخدام Gemini
- أو `Nivedi_api_key` — كبديل (NVIDIA)

## التقنيات

- Next.js 15
- React 18
- Tailwind CSS
- Prisma (اختياري)
- Gemini / NVIDIA للذكاء الاصطناعي
