import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Auth() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.55_0.15_275/0.18),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.55_0.12_275/0.25),transparent)]" />
      <div className="absolute end-4 top-4 z-10 flex items-center gap-2">
        <ThemeToggle />
        <Link
          to="/"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          الرئيسية
        </Link>
      </div>
      <div className="relative z-[1] mb-8 flex items-center gap-2 text-2xl font-bold text-foreground">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
          <BookOpen className="h-6 w-6" />
        </span>
        مونالاب
      </div>
      <Card className="relative z-[1] w-full max-w-md border-border/80 shadow-xl shadow-primary/5">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">يصدر قريبا</CardTitle>
          <CardDescription className="text-center">
            حالياً لا يتوفر تسجيل الدخول أو إنشاء الحساب. يمكنك البدء بالمحادثة وكتابة أبحاثك مباشرة.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border border-border/80 bg-muted/30 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">تجربة سريعة بدون تسجيل</p>
              <p className="text-sm text-muted-foreground">
                ابدأ مباشرة من صفحة المحادثة، ثم افتح المحرر لاحقاً عندما يتم تفعيل الحسابات.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              className="w-full rounded-full"
              onClick={() => navigate("/chat")}
            >
              ابدأ المحادثة الآن
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full"
              onClick={() => navigate("/")}
            >
              العودة للرئيسية
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            إذا رغبت، تواصل معنا لاحقاً عند تفعيل هذه الخدمة.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
