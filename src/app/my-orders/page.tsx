"use client";
import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Button,
  CircularProgress
} from '@mui/material';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Order } from '@/types/types';
import { useCart } from '@/contexts/CartContext';
import { Notification } from '@/components/Notification';
import { Header } from '@/components/Header/Header';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchOrders } from '@/store/ordersSlice';

const statusTranslations = {
  'pending': 'در انتظار تایید',
  'processing': 'در حال پردازش',
  'completed': 'تکمیل شده',
  'cancelled': 'لغو شده'
};

export default function MyOrdersPage() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { items: orders, loading, error } = useAppSelector(state => state.orders);
  const { cart, removeFromCart, updateQuantity, returnOrderToCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  const handleReturnToCart = async (orderId: string) => {
    if (!user) return;
    
    try {
      await returnOrderToCart(orderId);
      setNotification({
        open: true,
        message: 'سفارش به سبد خرید برگشت',
        severity: 'success'
      });
      dispatch(fetchOrders(user.uid));
    } catch (error) {
      console.error('Error returning order to cart:', error);
      setNotification({
        open: true,
        message: 'خطا در برگرداندن سفارش به سبد خرید',
        severity: 'error'
      });
    }
  };

  const handleRemoveFromCart = async (productId: string) => {
    await removeFromCart(productId);
  };

  if (!user) {
    return;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">سفارش‌های من</h1>
      
      {orders.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p>هنوز سفارشی ثبت نکرده‌اید</p>
        </div>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>شماره سفارش</TableCell>
                <TableCell>تاریخ</TableCell>
                <TableCell>تعداد اقلام</TableCell>
                <TableCell>مبلغ کل</TableCell>
                <TableCell>وضعیت</TableCell>
                <TableCell>عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                  </TableCell>
                  <TableCell>{order.items.length}</TableCell>
                  <TableCell>{order.totalPrice.toLocaleString()} تومان</TableCell>
                  <TableCell>{statusTranslations[order.status]}</TableCell>
                  <TableCell>
                    {order.status === 'pending' && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleReturnToCart(order.id)}
                      >
                        برگشت به سبد خرید
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
} 