"use client";
import { useState } from 'react';
import { Button } from '@mui/material';
import { CartItem } from './CartItem';
import { Product } from '@/types/types';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Notification } from '@/components/Notification';
import { Loader2 } from 'lucide-react';
import axios from '@/lib/axios';

interface MobileCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onRemove: (id: string) => Promise<void>;
  onUpdateQuantity: (id: string, quantity: number) => Promise<void>;
}

export const MobileCart = ({ isOpen, onClose, items, onRemove, onUpdateQuantity }: MobileCartProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  if (!isOpen) return null;

  const totalPrice = items.reduce((total, item) => {
    return total + (item.price * (item.quantity || 1));
  }, 0).toLocaleString();

  const handleCheckout = async () => {
    if (status !== 'authenticated') {
      setNotification({
        open: true,
        message: 'لطفا ابتدا وارد حساب کاربری خود شوید',
        severity: 'error'
      });
      router.push('/login');
      return;
    }

    if (items.length === 0) {
      setNotification({
        open: true,
        message: 'سبد خرید خالی است',
        severity: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    try {
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
      
      onClose();
      
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
        message: 'خطا در ثبت سفارش',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">سبد سفارش</h2>
            <button onClick={onClose} className="text-gray-500">
              ✕
            </button>
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {items.length === 0 ? (
            <p className="p-4 text-center text-gray-500">سبد سفارش خالی است</p>
          ) : (
            <>
              {items.map(item => (
                <CartItem 
                  key={item.id} 
                  item={item}
                  onRemove={onRemove}
                  onUpdateQuantity={onUpdateQuantity}
                />
              ))}
            </>
          )}
        </div>
        {items.length > 0 && (
          <div className="p-4 border-t bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold">جمع کل:</span>
              <span className="font-bold">{totalPrice} تومان</span>
            </div>
            <Button 
              variant="contained" 
              fullWidth
              onClick={handleCheckout}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'ارسال سفارش'
              )}
            </Button>
          </div>
        )}
      </div>
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}; 