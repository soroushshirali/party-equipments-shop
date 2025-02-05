"use client";

import { useState } from 'react';
import { Card, CardContent, Button } from '@mui/material';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/types/types';
import { Header } from '@/components/Header';
import { useProducts } from '@/hooks/useProducts';

export default function ProductsPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;
  const [cart, setCart] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(true);
  const { products, loading, error } = useProducts();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const categoryProducts = products[categoryId]?.products || [];

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  return (
    <div dir="rtl">
      <Header
        cart={cart}
        onRemoveFromCart={(id) => setCart(cart.filter(item => item.id !== id))}
        onUpdateQuantity={(id, quantity) => {
          setCart(cart.map(item =>
            item.id === id ? { ...item, quantity } : item
          ));
        }}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        showBackButton
      />
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">
          {products[categoryId]?.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
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
                  onClick={() => addToCart(product)}
                >
                  افزودن به سبد سفارش
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 