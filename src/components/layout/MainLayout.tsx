import { Suspense } from "react";
import { Link, useNavigate, useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { BookOpen, FileText, LogOut, User as UserIcon, MessageCircle, Menu, X, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "المستندات", icon: FileText },
  { to: "/chat", label: "المحادثة", icon: MessageCircle },
] as const;

function SidebarNav({
  pathname,
  onNavigate,
  className,
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav className={cn("flex flex-1 flex-col gap-1 px-3", className)}>
      {navItems.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === to || (to === "/dashboard" && pathname.startsWith("/editor"))
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Icon className="h-5 w-5 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const outlet = useOutlet();
  const [user, setUser] = useState<User | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const pageTitle = location.pathname.startsWith("/editor")
    ? "المحرر"
    : location.pathname === "/dashboard"
      ? "المستندات"
      : "مساحة العمل";

  if (!user) return null;

  const sidebarBrand = (
    <Link
      to="/dashboard"
      className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground"
      onClick={() => setMobileNavOpen(false)}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
        <BookOpen className="h-5 w-5" />
      </span>
      مونالاب
    </Link>
  );

  const userBlock = (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-xl p-2 text-start transition-colors hover:bg-muted">
        <Avatar className="h-9 w-9">
          <AvatarImage src={user.user_metadata?.avatar_url} />
          <AvatarFallback>
            <UserIcon className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.email}</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>الحساب</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer gap-2 text-destructive">
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="flex h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-e border-border bg-card lg:flex">
        <div className="p-5">{sidebarBrand}</div>
        <SidebarNav pathname={location.pathname} />
        <div className="border-t border-border p-3">{userBlock}</div>
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" aria-hidden>
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-label="إغلاق القائمة"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside
            className="absolute start-0 top-0 flex h-full w-[min(18rem,88vw)] flex-col border-e border-border bg-card shadow-xl"
          >
            <div className="flex items-center justify-between gap-2 border-b border-border p-4">
              {sidebarBrand}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-full"
                onClick={() => setMobileNavOpen(false)}
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarNav pathname={location.pathname} onNavigate={() => setMobileNavOpen(false)} className="pt-2" />
            <div className="mt-auto border-t border-border p-3">{userBlock}</div>
          </aside>
        </div>
      )}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-card/80 px-3 backdrop-blur-sm sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-full lg:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="فتح القائمة"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">{pageTitle}</h1>
          </div>
          <ThemeToggle />
        </header>
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              className="min-h-full"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Suspense
                fallback={
                  <div className="flex min-h-[40vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
                  </div>
                }
              >
                {outlet}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
