"use client";

import LegalNoticePage from '../../src/components/LegalNoticePage';
import { useNavigation } from '../../src/contexts/NavigationContext';

export default function Legal() {
  const { navigate } = useNavigation();

  return <LegalNoticePage onBack={() => navigate('/')} />;
}

