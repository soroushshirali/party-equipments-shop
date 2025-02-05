import { useState, useEffect } from 'react';
import { Product } from '@/types/types';

export function useProducts() {
  const [products, setProducts] = useState<{ [key: string]: { title: string, products: Product[] } }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        
        // Group products by categoryId
        const groupedProducts = data.reduce((acc: any, product: Product & { categoryId: string, categoryTitle: string }) => {
          if (!acc[product.categoryId]) {
            acc[product.categoryId] = {
              title: product.categoryTitle,
              products: []
            };
          }
          acc[product.categoryId].products.push(product);
          return acc;
        }, {});
        
        setProducts(groupedProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return { products, loading, error };
} 