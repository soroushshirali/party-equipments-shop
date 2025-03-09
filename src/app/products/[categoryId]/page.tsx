"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CircularProgress, Typography, Card, CardContent, Button, Grid } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart, selectLoadingItemId } from '@/store/cartSlice';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { Product } from '@/types/types';

export default function ProductsPage() {
  const { categoryId } = useParams();
  const dispatch = useAppDispatch();
  const loadingItemId = useAppSelector(selectLoadingItemId);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryTitle, setCategoryTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch products for this category
        const productsResponse = await axios.get(`/api/products?categoryId=${categoryId}`);
        setProducts(productsResponse.data);

        // Fetch all categories to find the matching one
        const categoriesResponse = await axios.get('/api/categories');
        const categories = categoriesResponse.data;
        
        // Find the category group that contains our categoryId
        for (const category of categories) {
          const matchingItem = category.items.find((item: any) => item.categoryId === categoryId);
          if (matchingItem) {
            setCategoryTitle(matchingItem.title);
            break;
          }
        }

      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.error || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchData();
    }
  }, [categoryId]);

  const handleAddToCart = async (product: Product) => {
    try {
      await dispatch(addToCart(product)).unwrap();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('خطا در افزودن به سبد خرید');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center" dir="rtl">
        <Typography color="error">{error}</Typography>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-4">
          <Link href="/" className="text-blue-500 hover:underline">
            بازگشت به دسته‌بندی‌ها
          </Link>
        </div>
        <div className="max-w-6xl mx-auto p-6">
          <Typography variant="h4" className="mb-6">
            {categoryTitle || 'محصولات'}
          </Typography>
          
          {products.length === 0 ? (
            <Typography variant="h6" className="text-center">
              محصولی در این دسته‌بندی یافت نشد
            </Typography>
          ) : (
            <Grid container spacing={4}>
              {products.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card className="h-full flex flex-col">
                    <div className="relative pt-[100%]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="flex-grow flex flex-col">
                      <Link 
                        href={`/products/${categoryId}/${product.id}`}
                        className="text-xl font-bold text-blue-600 hover:text-blue-800 mb-2 block"
                      >
                        {product.name}
                      </Link>

                      {product.description && (
                        <Typography variant="body2" color="text.secondary" className="mb-2">
                          {product.description}
                        </Typography>
                      )}

                      <div className="mt-auto">
                        <Typography variant="h6" className="mb-2">
                          {product.price.toLocaleString()} تومان
                        </Typography>

                        <div className="grid grid-cols-2 gap-2">
                          <Link href={`/products/${categoryId}/${product.id}`}>
                            <Button 
                              variant="outlined" 
                              fullWidth
                            >
                              مشاهده جزئیات
                            </Button>
                          </Link>
                          <Button
                            variant="contained"
                            onClick={() => handleAddToCart(product)}
                            disabled={loadingItemId === product.id}
                            fullWidth
                          >
                            {loadingItemId === product.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'افزودن به سبد'
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </div>
      </div>
    </div>
  );
} 