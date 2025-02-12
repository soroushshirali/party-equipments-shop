import { FirebaseApp } from 'firebase/app';

let app: FirebaseApp | null = null;

export async function initFirebase() {
  if (typeof window === 'undefined') return null;
  if (app) return app;

  try {
    const { initializeApp, getApps } = await import('firebase/app');
    
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };

    app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    return app;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return null;
  }
} 