import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initFirebase } from './initFirebase';

let db = null;
let storage = null;

if (typeof window !== 'undefined') {
  const app = initFirebase();
  if (app) {
    db = getFirestore(app);
    storage = getStorage(app);
  }
}

export { db, storage }; 