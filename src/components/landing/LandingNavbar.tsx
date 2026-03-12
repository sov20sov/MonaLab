import React from 'react';
import { Box, Menu, X } from 'lucide-react';

interface LandingNavbarProps {
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onShowHow: () => void;
  onShowAbout: () => void;
  onGetStarted: () => void;
}

export function LandingNavbar({
  mobileMenuOpen,
  onToggleMobileMenu,
  onShowHow,
  onShowAbout,
  onGetStarted,
}: LandingNavbarProps) {
  return (
    <nav className="relative flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-white/5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Box className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight">MonaLab</span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
        <button
          type="button"
          onClick={onShowHow}
          className="hover:text-white transition-colors"
        >
          آلية العمل
        </button>
        <button
          type="button"
          onClick={onShowAbout}
          className="hover:text-white transition-colors"
        >
          من نحن
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-6">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <a
          href=""
          className="text-sm text-gray-300 hover:text-white transition-colors hidden sm:block"
        >
          تسجيل الدخول (سيكون متاح قريباً)
        </a>
        <button
          onClick={onGetStarted}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
        >
          ابدأ الآن
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full right-6 left-6 mt-2 py-3 px-4 rounded-xl bg-slate-900/95 border border-white/10 shadow-xl z-50 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => {
              onToggleMobileMenu();
              onShowHow();
            }}
            className="text-right py-2 px-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white"
          >
            آلية العمل
          </button>
          <button
            type="button"
            onClick={() => {
              onToggleMobileMenu();
              onShowAbout();
            }}
            className="text-right py-2 px-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white"
          >
            من نحن
          </button>
        </div>
      )}
    </nav>
  );
}

