"use client";

import HowItWorksPage from '../../src/components/HowItWorksPage';
import { useNavigation } from '../../src/contexts/NavigationContext';

export default function HowItWorks() {
  const { navigate } = useNavigation();

  return <HowItWorksPage onBack={() => navigate('/')} />;
}

