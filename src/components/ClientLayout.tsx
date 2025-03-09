"use client";
import { ReactNode, useEffect, useState } from 'react';
import { Header } from '@/components/Header/Header';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { 
  selectCartItems, 
  selectCartIsOpen, 
  setIsCartOpen,
  updateQuantity,
  removeFromCart
} from '@/store/cartSlice';
import { Product } from '@/types/types';
import axios from 'axios';
import { SessionProvider } from 'next-auth/react';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const isCartOpen = useAppSelector(selectCartIsOpen);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productIds = Object.keys(cartItems || {});
        if (!productIds || productIds.length === 0) {
          setProducts([]);
          return;
        }

        const promises = productIds.map(id => 
          axios.get(`/api/products/${id}`)
            .then(response => {
              const product = response.data;
              return product && typeof product === 'object' && 'id' in product ? 
                { ...product, quantity: cartItems[id] } : 
                null;
            })
            .catch(error => {
              console.error(`Failed to fetch product ${id}:`, error);
              return null;
            })
        );

        const productsData = await Promise.all(promises);
        const validProducts = productsData.filter((product): product is Product => 
          product !== null && 
          typeof product === 'object' && 
          'id' in product && 
          'price' in product
        );
        setProducts(validProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, [cartItems]);

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    try {
      await dispatch(updateQuantity({ productId, quantity })).unwrap();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveFromCart = async (productId: string) => {
    try {
      await dispatch(removeFromCart(productId)).unwrap();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  return (
    <SessionProvider>
      <Header
        cart={products}
        onRemoveFromCart={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
        isCartOpen={isCartOpen}
        setIsCartOpen={(isOpen) => dispatch(setIsCartOpen(isOpen))}
      />
      <main className="pt-6">
        {children}
      </main>
    </SessionProvider>
  );
} 