"use client";

import LandingPage from '../src/components/LandingPage';
import { useNavigation } from '../src/contexts/NavigationContext';

export default function HomePage() {
  const { navigate } = useNavigation();

  return (
    <LandingPage
      onGetStarted={() => navigate('/chat')}
      onShowHow={() => navigate('/how-it-works')}
      onShowAbout={() => navigate('/about')}
      onShowExample={() => navigate('/chat?example=sample')}
      onNavigateToPrivacy={() => navigate('/privacy')}
      onNavigateToTerms={() => navigate('/terms')}
      onNavigateToLegal={() => navigate('/legal')}
    />
  );
}

