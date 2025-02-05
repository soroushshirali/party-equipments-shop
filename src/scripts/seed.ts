require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, writeBatch, doc } = require('firebase/firestore');
const path = require('path');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log('Initializing Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const categoriesData = require(path.join(__dirname, '../data/categories')).categories;
const productsData = require(path.join(__dirname, '../data/productData')).productData;

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Seed categories
    console.log('Seeding categories...');
    const categoriesRef = collection(db, 'categories');
    
    for (const category of categoriesData) {
      console.log(`Adding category: ${category.title}`);
      await addDoc(categoriesRef, category);
    }

    // Seed products - store each product as a separate document
    console.log('Seeding products...');
    const productsRef = collection(db, 'products');
    const batch = writeBatch(db);

    Object.entries(productsData).forEach(([categoryId, data]) => {
      console.log(`Adding products for category: ${(data as any).title}`);
      (data as any).products.forEach((product: any) => {
        const docRef = doc(productsRef);
        batch.set(docRef, {
          ...product,
          categoryId,
          categoryTitle: (data as any).title
        });
      });
    });

    await batch.commit();
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seed function
seedDatabase(); 