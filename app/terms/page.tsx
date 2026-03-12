"use client";

import TermsOfUsePage from '../../src/components/TermsOfUsePage';
import { useNavigation } from '../../src/contexts/NavigationContext';

export default function Terms() {
  const { navigate } = useNavigation();

  return <TermsOfUsePage onBack={() => navigate('/')} />;
}

