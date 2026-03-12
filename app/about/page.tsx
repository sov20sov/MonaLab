"use client";

import AboutPage from '../../src/components/AboutPage';
import { useNavigation } from '../../src/contexts/NavigationContext';

export default function About() {
  const { navigate } = useNavigation();

  return <AboutPage onBack={() => navigate('/')} />;
}

