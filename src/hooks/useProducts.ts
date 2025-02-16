import { useState, useEffect } from 'react';
import { Product } from '@/types/types';
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore"; // Import Firestore functions

export function useProducts(categoryId: string) { // Add categoryId as a parameter
  const [products, setProducts] = useState<Product[]>([]); // Products are now just an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const db = getFirestore(); // Get Firestore instance
        const productsCollection = collection(db, 'products'); // Reference to your products collection

        // Create a query to filter by categoryId
        const q = query(productsCollection, where('categoryId', '==', categoryId));
        const snapshot = await getDocs(q);
        
        // Debug: Log raw data from Firestore
        console.log('Raw Firestore data:', snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const productsData = snapshot.docs.map(doc => {
          const data = doc.data();
          // Debug: Log individual product data
          console.log('Processing product:', data);
          
          return {
            id: doc.id,
            name: data.name,
            price: data.price,
            image: data.image,
            originalImage: data.originalImage,
            categoryId: data.categoryId,
            categoryTitle: data.categoryTitle,
            description: data.description || '',  // اطمینان از وجود description
            specs: {
              length: data.specs?.length || 0,
              width: data.specs?.width || 0,
              height: data.specs?.height || 0,
              weight: data.specs?.weight || 0
            }
          };
        });

        // Debug: Log final processed data
        console.log('Processed products:', productsData);
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
        setError('خطا در بارگذاری محصولات');
      } finally {
        setLoading(false);
      }
    }

    if (categoryId) { // Only fetch if categoryId is provided
      fetchProducts();
    } else {
      setLoading(false); // If no categoryId, just set loading to false
    }
  }, [categoryId]); // Add categoryId to the dependency array

  return { products, loading, error };
}