"use client";
import { useEffect, useState } from 'react';
import { Providers } from './Providers';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { getFirebaseServices } from '@/lib/firebase';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function init() {
      if (typeof window === 'undefined') return;

      try {
        const { db, storage } = await getFirebaseServices();
        if (db && storage) {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Firebase initialization error:', error);
      }
    }

    init();
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