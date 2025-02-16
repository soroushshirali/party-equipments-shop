"use client";

import { Card, CardContent, Button } from '@mui/material';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/types/types';
import { Header } from '@/components/Header';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { FirebaseWrapper } from '@/components/FirebaseWrapper';
import { LoadingSpinner } from '@/components/LoadingSpinner';

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
        <Header
          cart={cart}
          onRemoveFromCart={removeFromCart}
          onUpdateQuantity={updateQuantity}
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
        />
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
                <div key={product.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col h-full">
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
                    <p className="text-sm">طول: {product.length || '-'} سانتی‌متر</p>
                    <p className="text-sm">عرض: {product.width || '-'} سانتی‌متر</p>
                    <p className="text-sm">ارتفاع: {product.height || '-'} سانتی‌متر</p>
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-bold">{product.price} تومان</span>
                      <Button
                        variant="contained"
                        onClick={() => handleAddToCart(product)}
                        disabled={loadingItemId === product.id}
                      >
                        افزودن به سبد خرید
                      </Button>
                    </div>
                    <Link 
                      href={`/products/${categoryId}/${product.id}`}
                      className="w-full block"
                    >
                      <Button
                        variant="outlined"
                        fullWidth
                      >
                        مشاهده جزئیات
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FirebaseWrapper>
  );
} 