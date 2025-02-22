"use client";
import { Providers } from './Providers';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Header } from '@/components/Header/Header';
import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch } from '@/store/hooks';
import { fetchOrders } from '@/store/ordersSlice';

const HeaderWithCart = () => {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (user) {
      dispatch(fetchOrders(user.uid));
    }
  }, [user, dispatch]);

  return (
    <Header 
      cart={cart}
      onRemoveFromCart={removeFromCart}
      onUpdateQuantity={updateQuantity}
      isCartOpen={isCartOpen}
      setIsCartOpen={setIsCartOpen}
    />
  );
};

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AuthProvider>
        <CartProvider>
          <HeaderWithCart />
          <main className="pt-6">
            {children}
          </main>
        </CartProvider>
      </AuthProvider>
    </Providers>
  );
} 