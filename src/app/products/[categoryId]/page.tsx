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

export default function ProductsPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;
  const { cart, addToCart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, loadingItemId, isLoading } = useCart();
  const { products, loading: productsLoading, error } = useProducts(categoryId);

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  if (productsLoading || isLoading) return <div>Loading...</div>;
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
                <Card key={product.id} className="overflow-hidden">
                  <Image 
                    src={product.image}
                    alt={product.name}
                    width={215}
                    height={215}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-2">{product.name}</h3>
                    <p className="text-lg mb-2">{product.price}</p>
                    <div className="space-y-2 text-sm">
                      {Object.entries(product.specs).map(([key, value]) => (
                        <p key={key}>{key}: {value}</p>
                      ))}
                    </div>
                    <Button 
                      className="w-full mt-4"
                      onClick={() => handleAddToCart(product)}
                      disabled={loadingItemId !== null || isLoading}
                    >
                      {loadingItemId === product.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        'افزودن به سبد سفارش'
                      )}
                    </Button>
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