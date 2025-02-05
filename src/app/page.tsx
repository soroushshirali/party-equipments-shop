// src/app/page.tsx
"use client";

import { useState } from 'react';
import { Product } from '@/types/types';
import { Header } from '@/components/Header';
import { CategorySection } from '@/components/CategorySection';
import { useCategories } from '@/hooks/useCategories';

export default function Home() {
  const [cart, setCart] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(true);
  const { categories, loading, error } = useCategories();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
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
      />
      <div className="max-w-6xl mx-auto p-6 space-y-8" dir="rtl">
        {categories.map((category, index) => (
          <CategorySection 
            key={index} 
            title={category.title}
            items={category.items}
          />
        ))}
      </div>
    </>
  );
}
