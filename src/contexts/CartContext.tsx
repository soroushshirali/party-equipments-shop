"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types/types';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';

interface CartContextType {
  cart: Product[];
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  isLoading: boolean;
  loadingItemId: number | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingItemId, setLoadingItemId] = useState<number | null>(null);

  useEffect(() => {
    async function loadCart() {
      setIsLoading(true);
      try {
        const cartRef = collection(db, 'cart');
        const snapshot = await getDocs(cartRef);
        const cartItems = snapshot.docs.map(doc => ({ ...doc.data() as Product }));
        setCart(cartItems);
      } catch (error) {
        console.error('Failed to load cart:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadCart();
  }, []);

  const addToCart = async (product: Product) => {
    setLoadingItemId(product.id);
    try {
      const cartRef = collection(db, 'cart');
      const existingItem = cart.find(item => item.id === product.id);

      if (existingItem) {
        const newQuantity = (existingItem.quantity || 1) + 1;
        await setDoc(doc(cartRef, product.id.toString()), {
          ...product,
          quantity: newQuantity
        });
        setCart(prevCart => prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        ));
      } else {
        await setDoc(doc(cartRef, product.id.toString()), {
          ...product,
          quantity: 1
        });
        setCart(prev => [...prev, { ...product, quantity: 1 }]);
      }
    } finally {
      setLoadingItemId(null);
    }
  };

  const removeFromCart = async (id: number) => {
    setLoadingItemId(id);
    try {
      const cartRef = collection(db, 'cart');
      await deleteDoc(doc(cartRef, id.toString()));
      setCart(prev => prev.filter(item => item.id !== id));
    } finally {
      setLoadingItemId(null);
    }
  };

  const updateQuantity = async (id: number, quantity: number) => {
    setLoadingItemId(id);
    try {
      const cartRef = collection(db, 'cart');
      const item = cart.find(item => item.id === id);
      if (item) {
        await setDoc(doc(cartRef, id.toString()), {
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