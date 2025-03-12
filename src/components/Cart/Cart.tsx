"use client";
import { useState } from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@mui/material';
import { Product } from '@/types/types';
import { CartItem } from './CartItem';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { finalizeOrder } from '@/store/cartSlice';
import { Notification } from '@/components/Notification';
import { useSession } from 'next-auth/react';
import axios from '@/lib/axios';

interface CartProps {
  items: Product[];
  onRemove: (id: string) => Promise<void>;
  onUpdateQuantity: (id: string, quantity: number) => Promise<void>;
  isOpen: boolean;
  onToggle: () => void;
}

export const Cart = ({ items, onRemove, onUpdateQuantity, isOpen, onToggle }: CartProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  const totalPrice = items.reduce((total, item) => {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    return total + (price * quantity);
  }, 0);

  const handleCheckout = async () => {
    if (status !== 'authenticated') {
      router.push('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post('/api/orders', {
        products: items.map(item => ({
          productId: item.id,
          quantity: item.quantity || 1,
          price: item.price
        }))
      });
      
      // Clear the cart after successful order
      for (const item of items) {
        await onRemove(item.id);
      }
      
      // Close the cart
      onToggle();
      
      // Show success message
      setNotification({
        open: true,
        message: 'سفارش شما با موفقیت ثبت شد. می‌توانید سفارش خود را در صفحه سفارش‌های من مشاهده کنید.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error submitting order:', error);
      setNotification({
        open: true,
        message: 'خطا در ثبت سفارش. لطفا دوباره تلاش کنید.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed top-4 left-4 z-50">
        <div className="bg-white rounded-lg shadow-lg w-80">
          <div 
            className="p-4 bg-gray-50 rounded-t-lg flex justify-between items-center cursor-pointer"
            onClick={onToggle}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} />
              <span className="font-bold">سبد خرید</span>
              <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                {items.length}
              </span>
            </div>
            <span>{totalPrice.toLocaleString()} تومان</span>
          </div>
          {isOpen && (
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <p className="p-4 text-center text-gray-500">سبد خرید خالی است</p>
              ) : (
                <>
                  {items.map(item => (
                    <CartItem 
                      key={item.id} 
                      item={item}
                    />
                  ))}
                  <div className="p-4">
                    <Button 
                      variant="contained" 
                      className="w-full"
                      onClick={handleCheckout}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'ثبت سفارش'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      />
    </>
  );
}; 