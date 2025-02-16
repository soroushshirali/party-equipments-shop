"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types/types';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface CartContextType {
  cart: Product[];
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  isLoading: boolean;
  loadingItemId: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  useEffect(() => {
    async function loadCart() {
      if (!user) {
        setCart([]);
        return;
      }

      setIsLoading(true);
      try {
        const cartRef = collection(db, `users/${user.uid}/cart`);
        const snapshot = await getDocs(cartRef);
        const cartItems = snapshot.docs.map(doc => ({ ...doc.data() as Product }));
        setCart(cartItems);
      } catch (error) {
        console.error('Failed to load cart:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      loadCart();
    }
  }, [user, authLoading]);

  const addToCart = async (product: Product) => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!product.id) {
      console.error('Product ID is missing');
      return;
    }
    
    setLoadingItemId(product.id);
    try {
      const cartRef = collection(db, `users/${user.uid}/cart`);
      const existingItem = cart.find(item => item.id === product.id);

      if (existingItem) {
        const newQuantity = (existingItem.quantity || 1) + 1;
        await setDoc(doc(cartRef, product.id), {
          ...product,
          quantity: newQuantity
        });
        setCart(prevCart => prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        ));
      } else {
        await setDoc(doc(cartRef, product.id), {
          ...product,
          quantity: 1
        });
        setCart(prev => [...prev, { ...product, quantity: 1 }]);
      }
    } finally {
      setLoadingItemId(null);
    }
  };

  const removeFromCart = async (id: string) => {
    if (!user || !id) return;

    setLoadingItemId(id);
    try {
      const cartRef = collection(db, `users/${user.uid}/cart`);
      await deleteDoc(doc(cartRef, id));
      setCart(prev => prev.filter(item => item.id !== id));
    } finally {
      setLoadingItemId(null);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (!user || !id) return;

    setLoadingItemId(id);
    try {
      const cartRef = collection(db, `users/${user.uid}/cart`);
      const item = cart.find(item => item.id === id);
      if (item) {
        await setDoc(doc(cartRef, id), {
          ...item,
          quantity
        });
        setCart(prev => prev.map(item =>
          item.id === id ? { ...item, quantity } : item
        ));
      }
    } finally {
      setLoadingItemId(null);
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity,
      isCartOpen,
      setIsCartOpen,
      isLoading,
      loadingItemId
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 