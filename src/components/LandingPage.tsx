import React, { useState } from 'react';
import LightRays from './LightRays';
import { LandingNavbar } from './landing/LandingNavbar';
import { LandingHero } from './landing/LandingHero';
import { LandingWhySection } from './landing/LandingWhySection';
import { LandingCtaBanner } from './landing/LandingCtaBanner';
import { LandingFooter } from './landing/LandingFooter';

interface LandingPageProps {
  onGetStarted: () => void;
  onShowHow: () => void;
  onShowAbout: () => void;
  onShowExample: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToTerms?: () => void;
  onNavigateToLegal?: () => void;
}

export default function LandingPage({
  onGetStarted,
  onShowHow,
  onShowAbout,
  onShowExample,
  onNavigateToPrivacy,
  onNavigateToTerms,
  onNavigateToLegal,
}: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className="relative min-h-screen bg-[#0A0F1E] text-white font-sans selection:bg-blue-500/30 overflow-hidden"
      dir="rtl"
    >
      {/* Light rays background effect */}
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <LightRays
          raysOrigin="top-center"
          raysColor="#3B82F6"
          raysSpeed={1}
          lightSpread={1.2}
          rayLength={2.5}
          pulsating
          fadeDistance={1.0}
          saturation={1.0}
          followMouse
          mouseInfluence={0.15}
          noiseAmount={0.05}
          distortion={0.15}
        />
      </div>

      {/* Background decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl animate-pulse"></div>
      <div className="pointer-events-none absolute top-1/3 -right-32 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl animate-[pulse_6s_ease-in-out_infinite]"></div>
      <div className="pointer-events-none absolute bottom-[-6rem] left-1/4 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl"></div>

      <LandingNavbar
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((o) => !o)}
        onShowHow={onShowHow}
        onShowAbout={onShowAbout}
        onGetStarted={onGetStarted}
      />

      <main className="max-w-7xl mx-auto px-6 pt-20 pb-24 scroll-smooth">
        <LandingHero onGetStarted={onGetStarted} />
        <LandingWhySection />
        <LandingCtaBanner onGetStarted={onGetStarted} />
      </main>

      <LandingFooter
        onNavigateToPrivacy={onNavigateToPrivacy}
        onNavigateToTerms={onNavigateToTerms}
        onNavigateToLegal={onNavigateToLegal}
      />
    </div>
  );
}

