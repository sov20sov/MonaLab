import {
  PenTool,
  Cpu,
  FileOutput,
  ArrowLeft,
  CheckCircle,
  BookOpenCheck,
  CornerDownLeft,
  ClipboardCheck,
  LayoutTemplate,
  MessageSquareText,
} from "lucide-react";
import { motion } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";

export default function HowItWorks() {
  const location = useLocation();
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
  const steps = [
    {
      icon: <PenTool className="h-8 w-8 text-primary" />,
      title: "1. ابدأ الكتابة أو اطرح سؤالاً",
      description: "افتح المحرر وابدأ في تدوين أفكارك أو طرح سؤالك البحثي. واجهتنا البسيطة والخالية من المشتتات تضمن لك تركيزاً عميقاً. لا حاجة لإنشاء حساب أو تسجيل الدخول.",
      image: "/image/pic1.png",
      features: ["واجهة خالية من المشتتات", "بدون تسجيل دخول", "دعم كامل للغة العربية"]
    },
    {
      icon: <Cpu className="h-8 w-8 text-primary" />,
      title: "2. دع الذكاء الاصطناعي يساعدك",
      description: "اطلب من المساعد الذكي إعادة صياغة النصوص، تلخيصها، أو حتى تصحيح أخطائها اللغوية. يمكنك أيضاً توليد مخططات كاملة لأبحاثك بنقرة واحدة.",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop",
      features: ["إعادة صياغة وتلخيص", "توليد أفكار ومخططات", "تصحيح لغوي وإملائي"]
    },
    {
      icon: <FileOutput className="h-8 w-8 text-primary" />,
      title: "3. صدّر وشارك",
      description: "بعد الانتهاء من مسودتك، قم بتصدير المستند بصيغة PDF أو Word مع الحفاظ على التنسيق الأكاديمي والمراجع بشكل سليم وجاهز للتقديم.",
      image: "https://images.unsplash.com/photo-1618044733300-9472054094ee?q=80&w=2071&auto=format&fit=crop",
      features: ["تصدير إلى Word", "تصدير إلى PDF", "تنسيق جاهز للطباعة"]
    }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header Section */}
      <section className="border-b border-border bg-muted/30 py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
              كيف يعمل مونالاب؟
            </h1>
            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-muted-foreground">
              ثلاث خطوات بسيطة تفصلك عن كتابة بحثك الأكاديمي القادم باحترافية وسرعة فائقة. صممنا التجربة لتكون سلسة وبديهية.
            </p>
            {returnTo === "/chat" && (
              <div className="mt-10 flex justify-center">
                <Link
                  to="/chat"
                  className={buttonVariants({
                    variant: "default",
                    size: "lg",
                    className: "rounded-full px-8 h-12",
                  })}
                >
                  العودة إلى المساعد الذكي
                  <CornerDownLeft className="mr-2 h-5 w-5" />
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="bg-background py-24">
        <div className="max-w-6xl mx-auto px-6 space-y-32">
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, x: 28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.55 }}
              className={`flex flex-col lg:flex-row gap-16 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
            >
              <div className="flex-1 space-y-8">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                  {step.icon}
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-foreground md:text-4xl">{step.title}</h2>
                  <p className="text-xl leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                
                <ul className="space-y-3 pt-4">
                  {step.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 font-medium text-foreground/90">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex-1 w-full">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-[3rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10 aspect-[4/3] overflow-hidden rounded-[2.5rem] border border-border bg-muted shadow-2xl">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      width={800}
                      height={600}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Academic Guide Section */}
      <section className="relative border-t border-border bg-background py-24 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/18 via-blue-500/10 to-transparent blur-3xl" />
          <div className="absolute -bottom-32 right-[-120px] h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-violet-500/10 via-primary/10 to-transparent blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.10),transparent_55%)]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-6xl"
          >
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/12 ring-1 ring-primary/20">
                  <BookOpenCheck className="h-4.5 w-4.5 text-primary" />
                </span>
                آلية عمل مختصرة — من الفكرة إلى ملف جاهز للتسليم
              </div>
              <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
                كيف تُخرج تقريرًا/بحثًا <span className="text-primary">مفصّلًا وقويًا</span> في النهاية؟
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                اتبع هذه الخطة لتضمن أن المستخدم يخرج بنتيجة واضحة: هيكل مضبوط، حجج مترابطة، وصياغة أكاديمية جاهزة للتصدير.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
              {/* Main timeline */}
              <div className="rounded-[2.25rem] border border-border bg-card/65 shadow-xl backdrop-blur-xl">
                <div className="border-b border-border/70 px-6 py-5 md:px-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/20">
                        <LayoutTemplate className="h-5.5 w-5.5 text-primary" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">مسار كتابة قوي</p>
                        <p className="text-xs text-muted-foreground">اقرأه مرة واحدة ثم طبّقه داخل المساعد خطوة بخطوة</p>
                      </div>
                    </div>
                    <Link
                      to="/chat"
                      state={{ returnTo: "/how-it-works" }}
                      className={buttonVariants({
                        size: "sm",
                        className: "rounded-full h-10 px-4",
                      })}
                    >
                      ابدأ من المساعد
                      <ArrowLeft className="mr-2 h-4.5 w-4.5" />
                    </Link>
                  </div>
                </div>

                <div className="px-6 py-6 md:px-8 md:py-7">
                  <ol className="relative space-y-6">
                    <div className="absolute bottom-2 right-[18px] top-2 hidden w-px bg-gradient-to-b from-primary/40 via-border to-transparent md:block" />

                    <li className="relative rounded-3xl border border-border/70 bg-background/55 p-5 shadow-sm md:p-6">
                      <div className="mb-3 flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                          1
                        </span>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">حدد الهدف والمتطلبات</h3>
                          <p className="text-sm text-muted-foreground">ما الذي تريد تسليمه بالضبط؟ ولماذا؟</p>
                        </div>
                      </div>
                      <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4.5 w-4.5 text-green-500" />
                          موضوع البحث + سؤال/إشكالية + أهداف
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4.5 w-4.5 text-green-500" />
                          جمهور/مستوى: جامعي، تقرير، مقال…
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4.5 w-4.5 text-green-500" />
                          القيود: صفحات، منهج، مراجع
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4.5 w-4.5 text-green-500" />
                          اللغة: عربية أكاديمية، بدون حشو
                        </li>
                      </ul>
                    </li>

                    <li className="relative rounded-3xl border border-border/70 bg-background/55 p-5 shadow-sm md:p-6">
                      <div className="mb-3 flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/20 text-primary font-extrabold">
                          2
                        </span>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">ابنِ مخططًا ثم اكتب “قسمًا قسمًا”</h3>
                          <p className="text-sm text-muted-foreground">المخطط يقلل الأخطاء ويرفع الجودة بسرعة.</p>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                          <p className="mb-2 text-sm font-semibold text-foreground">قالب مخطط جاهز</p>
                          <ul className="list-decimal space-y-1 ps-6 text-sm text-muted-foreground">
                            <li>مقدمة</li>
                            <li>الإطار النظري</li>
                            <li>الدراسات السابقة</li>
                            <li>المنهجية</li>
                            <li>التحليل/المناقشة</li>
                            <li>الخلاصة والتوصيات</li>
                          </ul>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                          <p className="mb-2 text-sm font-semibold text-foreground">طريقة التنفيذ داخل المساعد</p>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>اطلب مخططًا أولًا.</li>
                            <li>ثبّت المنهج والنبرة الأكاديمية.</li>
                            <li>اطلب كتابة كل قسم بمخرجات: نقاط + أمثلة + خلاصة.</li>
                          </ul>
                        </div>
                      </div>
                    </li>

                    <li className="relative rounded-3xl border border-border/70 bg-background/55 p-5 shadow-sm md:p-6">
                      <div className="mb-3 flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/20 text-primary font-extrabold">
                          3
                        </span>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">ارفع قوة المحتوى (حجج + تنظيم + أدلة)</h3>
                          <p className="text-sm text-muted-foreground">لا تترك النص “سردًا” فقط — اجعله مُقنعًا.</p>
                        </div>
                      </div>
                      <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4.5 w-4.5 text-green-500" />
                          حوّل الفقرات الطويلة إلى نقاط
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4.5 w-4.5 text-green-500" />
                          المقارنات/الأرقام: جدول واضح
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4.5 w-4.5 text-green-500" />
                          في نهاية كل قسم: خلاصة + 3 نتائج
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4.5 w-4.5 text-green-500" />
                          مناقشة: أسباب + آثار + توصيات
                        </li>
                      </ul>
                    </li>

                    <li className="relative rounded-3xl border border-border/70 bg-background/55 p-5 shadow-sm md:p-6">
                      <div className="mb-3 flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/20 text-primary font-extrabold">
                          4
                        </span>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">مراجعة نهائية ثم تصدير</h3>
                          <p className="text-sm text-muted-foreground">قبل PDF/Word: تأكد من الجودة والاتساق.</p>
                        </div>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/30 p-3 text-sm text-muted-foreground">
                          <ClipboardCheck className="h-5 w-5 text-primary" />
                          عناوين واضحة وتسلسل منطقي
                        </div>
                        <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/30 p-3 text-sm text-muted-foreground">
                          <ClipboardCheck className="h-5 w-5 text-primary" />
                          لغة أكاديمية بدون تكرار
                        </div>
                        <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/30 p-3 text-sm text-muted-foreground">
                          <ClipboardCheck className="h-5 w-5 text-primary" />
                          فقرات قصيرة وتباعد مريح
                        </div>
                        <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/30 p-3 text-sm text-muted-foreground">
                          <ClipboardCheck className="h-5 w-5 text-primary" />
                          خلاصة وتوصيات قوية
                        </div>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="border-t border-border/70 px-6 py-5 md:px-8">
                  <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                    <div className="text-center sm:text-right">
                      <p className="text-sm font-semibold text-foreground">جاهز تطبّق الخطة؟</p>
                      <p className="text-xs text-muted-foreground">انتقل للمساعد وابدأ بسؤال: “اعمل لي مخطط بحث حول …”</p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Link
                        to="/chat"
                        state={{ returnTo: "/how-it-works" }}
                        className={buttonVariants({ size: "lg", className: "rounded-full px-8 h-12" })}
                      >
                        اذهب إلى المساعد الآن
                        <ArrowLeft className="mr-2 h-5 w-5" />
                      </Link>
                      {returnTo === "/chat" && (
                        <Link
                          to="/chat"
                          className={buttonVariants({ variant: "secondary", size: "lg", className: "rounded-full px-8 h-12" })}
                        >
                          العودة لإكمال تقريرك
                          <CornerDownLeft className="mr-2 h-5 w-5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <aside className="lg:sticky lg:top-24 lg:h-fit">
                <div className="rounded-[2.25rem] border border-border bg-card/65 p-6 shadow-xl backdrop-blur-xl">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/20">
                      <MessageSquareText className="h-5.5 w-5.5 text-primary" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-foreground">أسئلة جاهزة للمساعد</p>
                      <p className="text-xs text-muted-foreground">انسخ الفكرة وابدأ مباشرة</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                      <p className="mb-2 text-xs font-semibold text-muted-foreground">للبداية</p>
                      <p className="text-sm text-foreground/90">
                        “اكتب لي مخطط بحث أكاديمي حول (…)، مع أهداف، أسئلة، ومنهجية مقترحة.”
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                      <p className="mb-2 text-xs font-semibold text-muted-foreground">لقسم محدد</p>
                      <p className="text-sm text-foreground/90">
                        “اكتب قسم (الإطار النظري/الدراسات السابقة) بأسلوب أكاديمي مع نقاط وخلاصة.”
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                      <p className="mb-2 text-xs font-semibold text-muted-foreground">للمراجعة</p>
                      <p className="text-sm text-foreground/90">
                        “راجع النص التالي: اختصر الحشو، قوِّ الترابط المنطقي، واقترح تحسينات.”
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-border/70 bg-gradient-to-br from-primary/10 via-blue-500/8 to-transparent p-4">
                    <p className="text-sm font-semibold text-foreground">ملاحظة سريعة</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      الأفضل أن تعمل “قسمًا قسمًا” بدل طلب بحث كامل مرة واحدة — ستحصل على جودة أعلى وتعديلات أدق.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-muted/30 py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-primary rounded-[3rem] p-12 md:p-16 relative overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                هل أنت مستعد للبدء؟
              </h2>
              <p className="text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto">
                لا تضيع المزيد من الوقت في التنسيق والبحث اليدوي. دع الذكاء الاصطناعي يقوم بالعمل الشاق بينما تركز أنت على الإبداع.
              </p>
              <Link
                to="/chat"
                state={{ returnTo: "/how-it-works" }}
                className={buttonVariants({ variant: "secondary", size: "lg", className: "text-lg px-10 h-14 rounded-full text-primary hover:scale-105 transition-transform shadow-xl" })}
              >
                ابدأ تجربتك الآن
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
