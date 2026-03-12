"use client";

import ChatApp from '../../src/components/ChatApp';
import { useNavigation } from '../../src/contexts/NavigationContext';

export default function ChatPage() {
  const { navigate } = useNavigation();

  return <ChatApp onBack={() => navigate('/')} />;
}

