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
debugger
        const querySnapshot = await getDocs(q);
        const fetchedProducts: Product[] = [];

        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          fetchedProducts.push(doc.data() as Product); // Add each product to the array
        });

        setProducts(fetchedProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
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