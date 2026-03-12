"use client";

import type { ReactNode } from 'react';
import { NavigationProvider } from '../contexts/NavigationContext';
import RouteLoaderOverlay from './RouteLoaderOverlay';

export default function NavigationShell({ children }: { children: ReactNode }) {
  return (
    <NavigationProvider>
      <RouteLoaderOverlay />
      {children}
    </NavigationProvider>
  );
}
