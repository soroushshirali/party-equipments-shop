"use client";
import { useEffect, useState } from 'react';
import { Providers } from './Providers';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { initFirebase } from '@/lib/initFirebase';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const app = initFirebase();
      if (app) {
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  }, []);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <Providers>
      <AuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </AuthProvider>
    </Providers>
  );
} 