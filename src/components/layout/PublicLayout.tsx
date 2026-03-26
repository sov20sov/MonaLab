import { Suspense } from "react";
import { Link, NavLink, useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { BookOpen, Instagram, Send, Mail, Menu, X, LogIn, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { buttonVariants } from "@/components/ui/button";

export default function PublicLayout() {
  const location = useLocation();
  const outlet = useOutlet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "الرئيسية", path: "/" },
    { name: "المحادثة الذكية", path: "/chat" },
    { name: "من نحن", path: "/about" },
    { name: "كيف يعمل", path: "/how-it-works" },
  ];

  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "text-base font-medium transition-colors rounded-full px-4 py-2",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
    );

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-sm ring-1 ring-primary/20">
              <BookOpen className="h-5 w-5" />
            </span>
            مونالاب
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                className={navClass}
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Link
              to="/auth"
              className={cn(
                buttonVariants({ size: "sm" }),
                "hidden rounded-full px-4 sm:inline-flex"
              )}
            >
              <LogIn className="ml-1.5 h-4 w-4" />
              يصدر قريبا
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[57px] z-40 flex flex-col gap-1 border-b border-border bg-background/95 p-4 shadow-lg backdrop-blur-md animate-in slide-in-from-top-2 md:hidden">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/"}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  "rounded-xl px-4 py-3 text-lg font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )
              }
            >
              {link.name}
            </NavLink>
          ))}
          <Link
            to="/auth"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(buttonVariants(), "mt-2 justify-center rounded-full")}
          >
            <LogIn className="ml-2 h-4 w-4" />
            يصدر قريبا
          </Link>
        </div>
      )}

      <main className="flex min-h-0 flex-1 flex-col overflow-x-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            className="flex min-h-0 flex-1 flex-col"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Suspense
              fallback={
                <div className="flex min-h-[40vh] flex-1 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
                  <span className="sr-only">جاري التحميل…</span>
                </div>
              }
            >
              {outlet}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {location.pathname !== "/chat" && (
        <footer className="border-t border-border bg-muted/30 pb-10 pt-16">
          <div className="mx-auto mb-12 grid max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-3">
            <div className="flex flex-col gap-4">
              <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-foreground">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <BookOpen className="h-6 w-6" />
                </span>
                مونالاب
              </Link>
              <p className="text-sm leading-relaxed text-muted-foreground">
                مساعدك الذكي للبحث العلمي والأكاديمي. أدوات تعتمد على الذكاء الاصطناعي لتسهيل كتابة الأبحاث، تلخيص النصوص، وتوليد الأفكار.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-foreground">أقسام الموقع</h3>
              <ul className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-foreground">تواصل معنا</h3>
              <p className="text-sm text-muted-foreground">
                تابعنا للاطلاع على آخر التحديثات والأخبار.
              </p>
              <div className="mt-2 flex items-center gap-3">
                <a
                  href="https://t.me/husTh1"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all hover:bg-primary hover:text-primary-foreground"
                  aria-label="تلغرام"
                >
                  <Send className="h-5 w-5" />
                </a>
                <a
                  href="https://www.instagram.com/1husth"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all hover:bg-primary hover:text-primary-foreground"
                  aria-label="إنستغرام"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="mailto:ha3140465@gmail.com"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all hover:bg-primary hover:text-primary-foreground"
                  aria-label="البريد"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-border px-6 pt-8 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} مونالاب. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="transition-colors hover:text-primary">
                سياسة الخصوصية
              </Link>
              <Link to="/terms" className="transition-colors hover:text-primary">
                شروط الاستخدام
              </Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
