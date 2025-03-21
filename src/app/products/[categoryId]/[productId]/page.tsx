"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CircularProgress,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Box,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart, selectLoadingItemId } from '@/store/cartSlice';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { Product } from '@/types/types';
import { Header } from '@/components/Header';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ImageViewer } from '@/components/ImageViewer';

export default function ProductDetailsPage() {
  const params = useParams() as { categoryId: string; productId: string };
  const { categoryId, productId } = params;
  const dispatch = useAppDispatch();
  const loadingItemId = useAppSelector(selectLoadingItemId);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch product from MongoDB API
        const response = await axios.get(`/api/products/${productId}`);
        setProduct(response.data);
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.error || 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) return <LoadingSpinner />;

  if (!product) return <div>محصول یافت نشد</div>;

  const headerProps = {
    cart: [],
    onRemoveFromCart: () => {},
    onUpdateQuantity: () => {},
    isCartOpen: false,
    setIsCartOpen: () => {},
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await dispatch(addToCart(product)).unwrap();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('خطا در افزودن به سبد خرید');
    }
  };

  return (
    <div dir="rtl">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-4">
          <Link href={`/products/${categoryId}`} className="text-blue-500 hover:underline">
            بازگشت به محصولات
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <ImageViewer 
                thumbnailUrl={product.image}
                originalUrl={product.originalImage}
                alt={product.name}
              />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">{product.name}</h1>
              
              {product.specs && (
                <div className="space-y-4">
                  {/* Dimensions Section */}
                  {(product.specs.length > 0 || product.specs.width > 0 || product.specs.height > 0) && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-4">ابعاد محصول:</h3>
                      <div className="bg-white p-3 rounded-md space-y-2">
                        {product.specs.length > 0 && (
                          <p className="text-gray-600 flex justify-between">
                            <span>طول:</span>
                            <span className="text-black">{product.specs.length} سانتی‌متر</span>
                          </p>
                        )}
                        {product.specs.width > 0 && (
                          <p className="text-gray-600 flex justify-between">
                            <span>عرض:</span>
                            <span className="text-black">{product.specs.width} سانتی‌متر</span>
                          </p>
                        )}
                        {product.specs.height > 0 && (
                          <p className="text-gray-600 flex justify-between">
                            <span>ارتفاع:</span>
                            <span className="text-black">{product.specs.height} سانتی‌متر</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Weight Section */}
                  {product.specs.weight > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-4">وزن محصول:</h3>
                      <div className="bg-white p-3 rounded-md">
                        <p className="text-gray-600 flex justify-between">
                          <span>وزن خالص:</span>
                          <span className="text-black">{product.specs.weight} کیلوگرم</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{product.price.toLocaleString()} تومان</span>
                <Button
                  variant="contained"
                  onClick={() => handleAddToCart(product)}
                  disabled={loadingItemId === product.id}
                  size="large"
                >
                  افزودن به سبد خرید
                </Button>
              </div>
            </div>
          </div>
        </div>

        {product.description ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">توضیحات محصول:</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">توضیحات محصول:</h2>
            <p className="text-gray-500">توضیحاتی برای این محصول ثبت نشده است.</p>
          </div>
        )}
      </div>
    </div>
  );
} 