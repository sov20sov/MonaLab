"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type AuthUser = {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem('mona_auth_user');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as AuthUser;
      if (parsed && typeof parsed.id === 'string') {
        setUser(parsed);
      }
    } catch {
      // ignore invalid stored data
    }
  }, []);

  const handleSetUser = (value: AuthUser | null) => {
    setUser(value);
    if (typeof window === 'undefined') return;
    if (value) {
      window.localStorage.setItem('mona_auth_user', JSON.stringify(value));
    } else {
      window.localStorage.removeItem('mona_auth_user');
    }
  };

  const signOut = () => {
    handleSetUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: handleSetUser,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

