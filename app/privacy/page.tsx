"use client";

import PrivacyPolicyPage from '../../src/components/PrivacyPolicyPage';
import { useNavigation } from '../../src/contexts/NavigationContext';

export default function Privacy() {
  const { navigate } = useNavigation();

  return <PrivacyPolicyPage onBack={() => navigate('/')} />;
}

