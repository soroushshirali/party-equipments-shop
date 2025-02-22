"use client";

import { Card, CardContent, Button } from '@mui/material';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/types/types';
import { Header } from '@/components/Header/Header';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { FirebaseWrapper } from '@/components/FirebaseWrapper';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Select, ListSubheader, MenuItem } from '@mui/material';

export default function ProductsPage() {
  const categoryId = useParams()?.categoryId as string;
  const { cart, addToCart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, loadingItemId, isLoading } = useCart();
  const { products, loading: productsLoading, error } = useProducts(categoryId);

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  if (productsLoading || isLoading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  const categoryProducts = products || [];
  const categoryTitle = categoryProducts[0]?.categoryTitle || '';

  return (
    <FirebaseWrapper>
      <div dir="rtl">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-4">
            <Link href="/" className="text-blue-500 hover:underline">
              بازگشت به دسته‌بندی‌ها
            </Link>
          </div>
          <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">
              {categoryTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryProducts.map((product) => (
                <Card key={`product-${product.id}`} className="bg-white rounded-lg shadow-md p-4 flex flex-col h-full">
                  <CardContent>
                    <div className="mb-4 text-center">
                      <Link 
                        href={`/products/${categoryId}/${product.id}`}
                        className="text-xl font-bold text-blue-600 hover:text-blue-800 block"
                      >
                        {product.name}
                      </Link>
                    </div>

                    <Link 
                      href={`/products/${categoryId}/${product.id}`} 
                      className="block group mb-4"
                    >
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-48 object-cover rounded-lg transition-transform group-hover:scale-105"
                      />
                    </Link>

                    <div className="space-y-2 mb-4 flex-grow">
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">مشخصات محصول:</h3>
                        <div className="space-y-2">
                          <div className="flex">
                            <span className="w-24 text-gray-600">ابعاد:</span>
                            <span>{`${product.specs.length} × ${product.specs.width} × ${product.specs.height} سانتی‌متر`}</span>
                          </div>
                          <div className="flex">
                            <span className="w-24 text-gray-600">وزن:</span>
                            <span>{`${product.specs.weight} کیلوگرم`}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="text-right">
                        <span className="text-xl font-bold">
                          {product.price.toLocaleString()} تومان
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Link href={`/products/${categoryId}/${product.id}`} className="block">
                          <Button 
                            variant="outlined" 
                            size="small"
                            fullWidth
                          >
                            مشاهده جزئیات
                          </Button>
                        </Link>
                        <Button
                          variant="contained"
                          onClick={() => handleAddToCart(product)}
                          disabled={loadingItemId === product.id}
                          size="small"
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </FirebaseWrapper>
  );
} 