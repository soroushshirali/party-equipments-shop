"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Order } from '@/types/types';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  addDoc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { selectPendingOrders } from '@/store/ordersSlice';
import { Notification } from '@/components/Notification';

interface CartContextType {
  cart: Product[];
  currentOrder: Order | null;
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  finalizeOrder: () => Promise<void>;
  returnOrderToCart: (orderId: string) => Promise<void>;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  isLoading: boolean;
  loadingItemId: string | null;
  updateOrders: (userId: string) => Promise<void>;
  notification: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  };
  setNotification: (notification: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<Product[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const pendingOrders = useAppSelector(selectPendingOrders);

  // Add helper function
  const calculateTotalPrice = (items: Product[]) => {
    return items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  };

  useEffect(() => {
    async function loadCurrentOrder() {
      if (!user) {
        setCart([]);
        setCurrentOrder(null);
        return;
      }

      setIsLoading(true);
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef, 
          where('userId', '==', user.uid),
          where('finalized', '==', false)
        );
        
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const orderData = {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data(),
            createdAt: snapshot.docs[0].data().createdAt.toDate().toISOString() // Convert to ISO string
          } as Order;
          setCurrentOrder(orderData);
          setCart(orderData.items);
        } else {
          const newOrder = {
            userId: user.uid,
            userEmail: user.email,
            userName: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || 'کاربر',
            items: [],
            totalPrice: 0,
            createdAt: new Date().toISOString(),
            status: 'pending' as const,
            finalized: false
          };
          
          const docRef = await addDoc(collection(db, 'orders'), {
            ...newOrder,
            createdAt: new Date()
          });
          setCurrentOrder({ ...newOrder, id: docRef.id } as Order);
          setCart([]);
        }
      } catch (error) {
        console.error('Failed to load order:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCurrentOrder();
  }, [user]);

  const addToCart = async (product: Product) => {
    if (!user) return;

    try {
      setLoadingItemId(product.id);

      // Check pending orders from Redux store
      if (pendingOrders.length > 0) {
        setNotification({
          open: true,
          message: 'شما یک سفارش در انتظار تایید دارید. می‌توانید از صفحه سفارش‌های من آن را به سبد خرید برگردانید.',
          severity: 'warning'
        });
        return;
      }

      // If no pending orders, proceed with adding to cart
      const existingItemIndex = cart.findIndex(item => item.id === product.id);

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        const updatedCart = [...cart];
        updatedCart[existingItemIndex].quantity = (updatedCart[existingItemIndex].quantity || 1) + 1;
        setCart(updatedCart);

        if (currentOrder) {
          await updateDoc(doc(db, 'orders', currentOrder.id), {
            items: updatedCart,
            totalPrice: calculateTotalPrice(updatedCart)
          });
        }
      } else {
        // Add new item
        const newItem = { ...product, quantity: 1 };
        const newCart = [...cart, newItem];
        setCart(newCart);

        if (currentOrder) {
          await updateDoc(doc(db, 'orders', currentOrder.id), {
            items: newCart,
            totalPrice: calculateTotalPrice(newCart)
          });
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setNotification({
        open: true,
        message: 'خطا در افزودن به سبد خرید',
        severity: 'error'
      });
    } finally {
      setLoadingItemId(null);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user || !currentOrder) return;

    setLoadingItemId(productId);
    try {
      const updatedItems = cart.filter(item => item.id !== productId);
      const totalPrice = updatedItems.reduce((sum, item) => 
        sum + (item.price * (item.quantity || 1)), 0
      );

      await updateDoc(doc(db, 'orders', currentOrder.id), {
        items: updatedItems,
        totalPrice
      });

      setCart(updatedItems);
    } finally {
      setLoadingItemId(null);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user || !currentOrder) return;

    setLoadingItemId(productId);
    try {
      const updatedItems = cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );

      const totalPrice = updatedItems.reduce((sum, item) => 
        sum + (item.price * (item.quantity || 1)), 0
      );

      await updateDoc(doc(db, 'orders', currentOrder.id), {
        items: updatedItems,
        totalPrice
      });

      setCart(updatedItems);
    } finally {
      setLoadingItemId(null);
    }
  };

  const finalizeOrder = async () => {
    if (!user || !currentOrder) return;

    try {
      await updateDoc(doc(db, 'orders', currentOrder.id), {
        finalized: true,
        status: 'pending' as const
      });

      // Create a new order for future cart items
      const newOrder = {
        userId: user.uid,
        userEmail: user.email,
        userName: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || 'کاربر',
        items: [],
        totalPrice: 0,
        createdAt: new Date().toISOString(),
        status: 'pending' as const,
        finalized: false
      };

      const docRef = await addDoc(collection(db, 'orders'), {
        ...newOrder,
        createdAt: new Date()
      });
      setCurrentOrder({ ...newOrder, id: docRef.id } as Order);
      setCart([]);
    } catch (error) {
      console.error('Error finalizing order:', error);
      throw error;
    }
  };

  const returnOrderToCart = async (orderId: string) => {
    if (!user) return;

    try {
      // Get the order to return
      const orderDoc = await getDoc(doc(db, 'orders', orderId));
      if (!orderDoc.exists()) return;

      const orderData = orderDoc.data() as Order;
      
      // Update current order with items from the returned order
      if (currentOrder) {
        await updateDoc(doc(db, 'orders', currentOrder.id), {
          items: orderData.items,
          totalPrice: orderData.totalPrice
        });

        // Update the returned order
        await updateDoc(doc(db, 'orders', orderId), {
          status: 'cancelled'
        });

        setCart(orderData.items);
      }
    } catch (error) {
      console.error('Error returning order to cart:', error);
      throw error;
    }
  };

  const updateOrders = async (userId: string) => {
    // Implementation of updateOrders function
  };

  return (
    <CartContext.Provider value={{
      cart,
      currentOrder,
      addToCart,
      removeFromCart,
      updateQuantity,
      finalizeOrder,
      returnOrderToCart,
      isCartOpen,
      setIsCartOpen,
      isLoading,
      loadingItemId,
      updateOrders,
      notification,
      setNotification
    }}>
      {children}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      />
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