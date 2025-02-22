"use client";
import { useState } from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@mui/material';
import { Product } from '@/types/types';
import { CartItem } from './CartItem';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Notification } from '@/components/Notification';
import { useAppDispatch } from '@/store/hooks';
import { fetchOrders } from '@/store/ordersSlice';
import { createPortal } from 'react-dom';

interface CartProps {
  items: Product[];
  onRemove: (id: string) => Promise<void>;
  onUpdateQuantity: (id: string, quantity: number) => Promise<void>;
  isOpen: boolean;
  onToggle: () => void;
}

export const Cart = ({ items, onRemove, onUpdateQuantity, isOpen, onToggle }: CartProps) => {
  const { user } = useAuth();
  const { finalizeOrder, updateOrders } = useCart();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  const totalPrice = items.reduce((total, item) => {
    return total + (item.price * (item.quantity || 1));
  }, 0);

  const handleSubmitOrder = async () => {
    if (!user) {
      setNotification({
        open: true,
        message: 'لطفا ابتدا وارد حساب کاربری خود شوید',
        severity: 'error'
      });
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
      await finalizeOrder();
      await updateOrders(user.uid);
      await dispatch(fetchOrders(user.uid));
      
      setNotification({
        open: true,
        message: 'سفارش شما با موفقیت ثبت شد، تیم خدمات ما جهت نهایی سازی و ارسال سفارش به زودی با شما تماس خواهد گرفت',
        severity: 'success'
      });

      onToggle();
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

  const MobileCart = () => {
    if (!isOpen || window.innerWidth >= 768) return null;  // Don't show on md and larger screens

    return createPortal(
      <>
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[9998] md:hidden" 
          onClick={onToggle}
        />
        <div className="fixed inset-x-0 bottom-0 z-[9999] md:hidden">
          <div className="bg-white rounded-t-2xl shadow-xl">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">سبد سفارش</h2>
                <button onClick={onToggle} className="text-gray-500">
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
            <div className="p-4 border-t bg-white">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold">جمع کل:</span>
                <span className="font-bold">{totalPrice.toLocaleString()} تومان</span>
              </div>
              <Button 
                variant="contained" 
                fullWidth
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'ارسال سفارش'
                )}
              </Button>
            </div>
          </div>
        </div>
      </>,
      document.body
    );
  };

  return (
    <>
      <div className="md:fixed md:top-4 md:left-4 z-50">
        {/* Mobile Cart Button */}
        <div className="fixed bottom-4 right-4 md:hidden">
          <button 
            onClick={onToggle}
            className="bg-blue-500 text-white p-3 rounded-full shadow-lg flex items-center gap-2"
          >
            <ShoppingCart size={24} />
            <span className="bg-white text-blue-500 px-2 py-1 rounded-full text-sm">
              {items.length}
            </span>
          </button>
        </div>

        {/* Desktop Cart */}
        <div className="hidden md:block">
          <div className="bg-white rounded-lg shadow-lg w-80">
            <div 
              className="p-4 bg-gray-50 rounded-t-lg flex justify-between items-center cursor-pointer"
              onClick={onToggle}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} />
                <span className="font-bold">سبد سفارش</span>
                <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                  {items.length}
                </span>
              </div>
              <span>{totalPrice.toLocaleString()} تومان</span>
            </div>
            {isOpen && (
              <div className="max-h-96 overflow-y-auto">
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
                    <div className="p-4">
                      <Button 
                        variant="contained" 
                        className="w-full"
                        onClick={handleSubmitOrder}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'ارسال سفارش'
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Cart */}
        <MobileCart />
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