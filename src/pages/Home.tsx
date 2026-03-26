import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { Sparkles, FileText, Download, ArrowLeft, BrainCircuit, Zap, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import SoftAurora from "@/components/ui/soft-aurora";

export default function Home() {
  const features = [
    {
      icon: <BrainCircuit className="h-6 w-6 text-primary" />,
      title: "ذكاء اصطناعي متقدم",
      description: "نعتمد على أحدث النماذج اللغوية لفهم سياق بحثك وتقديم اقتراحات دقيقة وموثوقة تدعم عملك الأكاديمي."
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "سرعة فائقة",
      description: "وفر ساعات من البحث والتنسيق. احصل على ملخصات، مسودات، ومخططات تفصيلية في ثوانٍ معدودة."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: "خصوصية تامة",
      description: "بياناتك وأبحاثك مشفرة وآمنة. نحن لا نستخدم نصوصك لتدريب نماذجنا العامة، خصوصيتك هي أولويتنا."
    }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative isolate z-0 flex min-h-[min(92vh,820px)] flex-col items-center justify-center overflow-hidden px-4 pb-32 pt-24 text-center">
        {/* SoftAurora: طبقة z موجبة + isolate حتى لا يختفي خلف الجذر */}
        <div className="absolute inset-0 z-0 min-h-[min(92vh,520px)]">
          <SoftAurora themeAware enableMouseInteraction className="h-full min-h-[520px] w-full" />
        </div>
        {/* تدرجات شفافة — لا تخفي الشيدر بالكامل */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_100%_60%_at_50%_0%,oklch(0.55_0.16_275/0.18),transparent_60%)] dark:bg-[radial-gradient(ellipse_100%_60%_at_50%_0%,oklch(0.62_0.14_285/0.28),transparent_58%)]"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-background/15 to-background/92 dark:via-background/25 dark:to-background/95" />
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl space-y-8 relative z-10"
        >
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            <Sparkles className="h-4 w-4 ml-2" />
            مستقبل الكتابة الأكاديمية
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            بيئة الكتابة الذكية <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-blue-600">للباحثين والمبدعين</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            قم بإنشاء المخططات، إعادة صياغة النصوص، إدارة المراجع، وتصدير ملفاتك بسهولة تامة. ارتقِ بمستوى كتابتك الأكاديمية مع مونالاب.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link to="/chat" className={buttonVariants({ size: "lg", className: "text-lg px-8 h-14 rounded-full w-full sm:w-auto shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all" })}>
              ابدأ الكتابة الآن
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Link>
            <Link to="/how-it-works" className={buttonVariants({ variant: "outline", size: "lg", className: "text-lg px-8 h-14 rounded-full w-full sm:w-auto bg-background/60 backdrop-blur-sm" })}>
              كيف يعمل؟
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Main Features */}
      <section className="border-y border-border bg-card py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">كل ما تحتاجه في مكان واحد</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">أدوات متكاملة مصممة خصيصاً لتسهيل رحلتك البحثية والأكاديمية.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-right">
            {[
              { icon: <Sparkles className="h-7 w-7 text-primary" />, title: "مساعد ذكي", desc: "توليد تلقائي للمخططات، إعادة صياغة الجمل المعقدة، وتصحيح القواعد اللغوية في الوقت الفعلي." },
              { icon: <FileText className="h-7 w-7 text-primary" />, title: "مراجع ذكية", desc: "إنشاء وإدارة التوثيقات بصيغ متعددة مثل APA و MLA و Chicago تلقائياً من مصادرك." },
              { icon: <Download className="h-7 w-7 text-primary" />, title: "تصدير سلس", desc: "تصدير مستنداتك النهائية مباشرة إلى صيغ Word أو PDF بتنسيق مثالي وجاهز للطباعة." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="rounded-3xl border border-border bg-muted/40 p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background shadow-sm">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-background py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                لماذا يفضل الباحثون <span className="text-primary">مونالاب</span>؟
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                تم تصميم منصتنا بعناية لتلبية الاحتياجات الدقيقة للباحثين والطلاب الأكاديميين في العالم العربي، مع دعم كامل للغة العربية.
              </p>
              
              <div className="space-y-6">
                {features.map((feature, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        {feature.icon}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-foreground mb-2">{feature.title}</h4>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="relative aspect-square overflow-hidden rounded-[2.5rem] border border-border bg-muted shadow-2xl md:aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"
                  alt="باحث يستخدم حاسوب"
                  className="h-full w-full object-cover"
                  width={1200}
                  height={900}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent mix-blend-overlay"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            جاهز للارتقاء بمستوى أبحاثك؟
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            انضم إلى آلاف الباحثين والطلاب الذين يعتمدون على مونالاب يومياً لإنجاز مهامهم الأكاديمية بكفاءة عالية.
          </p>
          <Link to="/chat" className={buttonVariants({ variant: "secondary", size: "lg", className: "text-lg px-10 h-14 rounded-full text-primary hover:scale-105 transition-transform" })}>
            ابدأ محادثتك الأولى مجاناً
          </Link>
        </div>
      </section>
    </div>
  );
}
