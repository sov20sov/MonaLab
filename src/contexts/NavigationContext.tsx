"use client";

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type NavigationContextValue = {
  isNavigating: boolean;
  navigate: (href: string) => void;
};

export const NavigationContext = createContext<NavigationContextValue | null>(null);

const MIN_LOADING_MS = 350;
const POST_NAV_DELAY_MS = 150;

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPathnameRef = useRef(pathname);
  const navStartRef = useRef<number>(0);

  const clearPending = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsNavigating(false);
  }, []);

  React.useEffect(() => {
    if (pathname !== prevPathnameRef.current) {
      prevPathnameRef.current = pathname;
      const elapsed = Date.now() - navStartRef.current;
      const remaining = Math.max(0, MIN_LOADING_MS - elapsed);
      timeoutRef.current = setTimeout(clearPending, Math.max(remaining, POST_NAV_DELAY_MS));
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pathname, clearPending]);

  const navigate = useCallback(
    (href: string) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      navStartRef.current = Date.now();
      setIsNavigating(true);
      router.push(href);
    },
    [router],
  );

  return (
    <NavigationContext.Provider value={{ isNavigating, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  const router = useRouter();
  if (!ctx) {
    return {
      isNavigating: false,
      navigate: (href: string) => router.push(href),
    };
  }
  return ctx;
}
