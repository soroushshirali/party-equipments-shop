import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';

let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export async function getFirebaseServices() {
  if (typeof window === 'undefined') return { db: null, storage: null };
  if (db && storage) return { db, storage };

  try {
    const { initFirebase } = await import('./initFirebase');
    const app = await initFirebase();
    
    if (!app) return { db: null, storage: null };

    const { getFirestore } = await import('firebase/firestore');
    const { getStorage } = await import('firebase/storage');

    db = getFirestore(app);
    storage = getStorage(app);

    return { db, storage };
  } catch (error) {
    console.error('Error initializing Firebase services:', error);
    return { db: null, storage: null };
  }
}

export { db, storage }; 