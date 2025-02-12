"use client";
import { useEffect, useState } from 'react';
import { db, storage } from '@/lib/firebase';

interface FirebaseWrapperProps {
  children: React.ReactNode;
}

export function FirebaseWrapper({ children }: FirebaseWrapperProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (db && storage) {
      setIsInitialized(true);
    }
  }, []);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
} 