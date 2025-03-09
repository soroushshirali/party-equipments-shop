"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  CircularProgress
} from '@mui/material';
import axios from '@/lib/axios';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  userId: string;
  userPhoneNumber: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

const statusColors = {
  pending: 'warning',
  processing: 'info',
  completed: 'success',
  cancelled: 'error'
} as const;

const statusLabels = {
  pending: 'در انتظار',
  processing: 'در حال پردازش',
  completed: 'تکمیل شده',
  cancelled: 'لغو شده'
} as const;

export default function MyOrders() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (status !== 'authenticated' || !session?.user) return;
      
      try {
        const response = await axios.get(`/api/orders?userId=${session.user.id}`);
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [session, status]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto p-4 text-center" dir="rtl">
        <Typography variant="h5">لطفا وارد حساب کاربری خود شوید</Typography>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center" dir="rtl">
        <Typography variant="h5">شما هنوز سفارشی ثبت نکرده‌اید</Typography>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <Typography variant="h4" className="mb-4">سفارش‌های من</Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>شماره سفارش</TableCell>
              <TableCell>تاریخ</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell>تعداد اقلام</TableCell>
              <TableCell>مبلغ کل</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                </TableCell>
                <TableCell>
                  <Chip
                    label={statusLabels[order.status]}
                    color={statusColors[order.status]}
                    size="small"
                  />
                </TableCell>
                <TableCell>{order.items.length}</TableCell>
                <TableCell>{order.total.toLocaleString()} تومان</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
} 