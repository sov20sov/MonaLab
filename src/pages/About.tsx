import { Users, Target, Lightbulb, Code2 } from "lucide-react";
import { motion } from "motion/react";

export default function About() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <section className="border-b border-border bg-muted/30 py-24">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">من نحن</h1>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-muted-foreground">
              نحن فريق شغوف من المطورين والباحثين نهدف إلى إحداث ثورة في طريقة كتابة الأبحاث والمقالات
              الأكاديمية في العالم العربي، من خلال دمج قوة الذكاء الاصطناعي مع بساطة الاستخدام.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
            <div className="space-y-12">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex gap-6"
              >
                <div className="mt-1 shrink-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                    <Target className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-foreground">رؤيتنا</h3>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    نسعى لبناء بيئة متكاملة تزيل عوائق التنسيق والتدقيق اللغوي، لتسمح للباحث بالتركيز على
                    جوهر المحتوى والإبداع العلمي دون القلق بشأن التفاصيل التقنية.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex gap-6"
              >
                <div className="mt-1 shrink-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                    <Lightbulb className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-foreground">مهمتنا</h3>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    توفير أدوات ذكية تعتمد على أحدث تقنيات الذكاء الاصطناعي لتسريع عملية الكتابة، تحسين
                    الجودة، وضمان دقة التوثيق الأكاديمي للجميع.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex gap-6"
              >
                <div className="mt-1 shrink-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-foreground">مجتمعنا</h3>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    تم تصميم مونالاب ليكون متاحاً للجميع دون تعقيدات تسجيل الدخول، إيماناً منا بحق كل باحث
                    وطالب في الوصول إلى أدوات احترافية مجانية وسريعة.
                  </p>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="relative aspect-square overflow-hidden rounded-[3rem] bg-muted shadow-2xl">
                <img
                  src="/image/pic2.png"
                  alt="فريق العمل"
                  className="h-full w-full object-cover"
                  width={800}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent mix-blend-overlay" />
              </div>
              <div className="absolute -bottom-8 -right-8 -z-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -left-8 -top-8 -z-10 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Code2 className="ml-2 h-4 w-4" />
              المطور
            </div>
            <h2 className="mb-16 text-3xl font-bold text-foreground md:text-4xl">تعرف على مطور المنصة</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="flex flex-col items-center gap-10 rounded-[2.5rem] border border-border bg-card p-8 text-center shadow-xl md:flex-row md:p-12 md:text-right"
          >
            <div className="relative mx-auto h-48 w-48 shrink-0 overflow-hidden rounded-full border-4 border-border shadow-lg md:mx-0 md:h-56 md:w-56">
              <img
                src="/image/forprofile.png"
                alt="صورة المطور"
                className="h-full w-full object-cover"
                width={224}
                height={224}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex flex-1 flex-col items-center space-y-4 md:items-start">
              <h3 className="text-3xl font-bold text-foreground">حسين محمد </h3>
              <p className="text-lg font-medium text-primary">مطور مواقع ومؤسس مونالاب</p>
              <p className="pt-2 text-lg leading-relaxed text-muted-foreground">
                &quot;بدأت فكرة مونالاب من الحاجة الشخصية لأداة تساعد في تسريع وتيرة البحث العلمي دون التضحية
                بالجودة. هدفي هو تمكين كل طالب وباحث عربي من الوصول إلى أحدث تقنيات الذكاء الاصطناعي في بيئة
                نظيفة، سريعة، ومجانية.&quot;
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
