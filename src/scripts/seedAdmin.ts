require('dotenv').config();
const { initializeApp: initAdminApp } = require('firebase/app');
const { getAuth: getAdminAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore: getAdminDb, doc: adminDoc, setDoc } = require('firebase/firestore');

const adminFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const adminApp = initAdminApp(adminFirebaseConfig);
const adminAuth = getAdminAuth(adminApp);
const adminDb = getAdminDb(adminApp);

async function seedAdmin() {
  try {
    // Create admin user
    const userCredential = await createUserWithEmailAndPassword(
      adminAuth,
      'admin@example.com',
      'admin123'
    );

    // Set admin role
    await setDoc(adminDoc(adminDb, 'users', userCredential.user.uid), {
      role: 'admin',
      email: 'admin@example.com'
    });

    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin:', error);
  }
}

seedAdmin(); 