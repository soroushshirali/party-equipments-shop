// src/app/page.tsx
"use client";

import { Header } from '@/components/Header';
import { CategorySection } from '@/components/CategorySection';
import { useCategories } from '@/hooks/useCategories';
import { useCart } from '@/contexts/CartContext';

export default function Home() {
  const { cart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen } = useCart();
  const { categories, loading, error } = useCategories();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <Header
        cart={cart}
        onRemoveFromCart={removeFromCart}
        onUpdateQuantity={updateQuantity}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
      />
      <div className="max-w-6xl mx-auto p-6 space-y-4" dir="rtl">
        {categories.map((group) => (
          <div key={group.groupTitle} className="space-y-3">
            <h1 className="text-3xl font-bold text-gray-800 text-center mt-6 mb-1">
              {group.groupTitle}
            </h1>
            <CategorySection 
              title={group.groupTitle}
              items={group.items}
              groupBorderColor={group.groupBorderColor}
            />
          </div>
        ))}
      </div>
    </>
  );
}
