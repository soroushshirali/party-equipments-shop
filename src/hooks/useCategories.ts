import { useState, useEffect } from 'react';
import { CategoryGroup } from '@/types/types';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export function useCategories() {
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        if (!db) {
          throw new Error('Database not initialized');
        }

        const categoriesCol = collection(db, 'categories');
        const snapshot = await getDocs(categoriesCol);
        const fetchedCategories = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CategoryGroup[];

        setCategories(fetchedCategories);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading, error };
} 