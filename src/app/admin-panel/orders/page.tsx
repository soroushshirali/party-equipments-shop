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
  Select,
  MenuItem,
  TablePagination,
  CircularProgress,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { collection, query, orderBy, getDocs, doc, updateDoc, limit, startAfter, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types/types';
import { useAuth } from '@/contexts/AuthContext';
import { Notification } from '@/components/Notification';

const ITEMS_PER_PAGE = 10;

const statusTranslations = {
  'pending': 'در انتظار تایید',
  'processing': 'در حال پردازش',
  'completed': 'تکمیل شده',
  'cancelled': 'لغو شده'
};

export default function OrdersManagement() {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [pageData, setPageData] = useState<{
    [key: number]: {
      orders: Order[];
      lastVisible: any;
    };
  }>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    if (!isAdmin) return;

    try {
      setLoading(true);
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('finalized', '==', true),
        orderBy('createdAt', 'desc'),
        limit(ITEMS_PER_PAGE)
      );

      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate().toISOString()
      })) as Order[];

      setOrders(ordersData);
      setPageData({
        0: {
          orders: ordersData,
          lastVisible: snapshot.docs[snapshot.docs.length - 1]
        }
      });
      
      // Get total count of finalized orders
      const totalQuery = query(
        collection(db, 'orders'),
        where('finalized', '==', true)
      );
      const totalSnapshot = await getDocs(totalQuery);
      setTotalOrders(totalSnapshot.size);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setNotification({
        open: true,
        message: 'خطا در دریافت سفارش‌ها',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreOrders = async (newPage: number) => {
    if (!isAdmin) return;

    // If we already have this page's data, use it
    if (pageData[newPage]) {
      setOrders(pageData[newPage].orders);
      setLastVisible(pageData[newPage].lastVisible);
      setPage(newPage);
      return;
    }

    try {
      setLoading(true);
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('finalized', '==', true),
        orderBy('createdAt', 'desc'),
        startAfter(pageData[newPage - 1].lastVisible),
        limit(ITEMS_PER_PAGE)
      );

      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate().toISOString()
      })) as Order[];

      setOrders(ordersData);
      setPageData(prev => ({
        ...prev,
        [newPage]: {
          orders: ordersData,
          lastVisible: snapshot.docs[snapshot.docs.length - 1]
        }
      }));
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setPage(newPage);
    } catch (error) {
      console.error('Error loading more orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus
      });

      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      setNotification({
        open: true,
        message: 'وضعیت سفارش با موفقیت تغییر کرد',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      setNotification({
        open: true,
        message: 'خطا در تغییر وضعیت سفارش',
        severity: 'error'
      });
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return <div>دسترسی محدود شده است</div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">مدیریت سفارش‌ها</h1>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>شماره سفارش</TableCell>
              <TableCell>نام کاربر</TableCell>
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
                <TableCell>{order.userName}</TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                </TableCell>
                <TableCell>{order.items.length}</TableCell>
                <TableCell>{order.totalPrice.toLocaleString()} تومان</TableCell>
                <TableCell>
                  <FormControl size="small">
                    <Select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                      disabled={order.status === 'cancelled'}
                    >
                      {Object.entries(statusTranslations).map(([value, label]) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleViewDetails(order)}
                  >
                    جزئیات
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalOrders}
        page={page}
        onPageChange={(_, newPage) => loadMoreOrders(newPage)}
        rowsPerPage={ITEMS_PER_PAGE}
        rowsPerPageOptions={[ITEMS_PER_PAGE]}
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} از ${count !== -1 ? count : `بیش از ${to}`}`
        }
      />

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      />

      {/* Order Details Dialog */}
      <Dialog
        open={!!selectedOrder}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>جزئیات سفارش {selectedOrder?.id.slice(0, 8)}</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold">اطلاعات مشتری</h3>
                  <p>نام: {selectedOrder.userName}</p>
                  <p>ایمیل: {selectedOrder.userEmail}</p>
                </div>
                <div>
                  <h3 className="font-bold">اطلاعات سفارش</h3>
                  <p>تاریخ: {new Date(selectedOrder.createdAt).toLocaleDateString('fa-IR')}</p>
                  <p>وضعیت: {statusTranslations[selectedOrder.status]}</p>
                  <p>مبلغ کل: {selectedOrder.totalPrice.toLocaleString()} تومان</p>
                </div>
              </div>

              <Divider />

              <div>
                <h3 className="font-bold mb-2">اقلام سفارش</h3>
                <List>
                  {selectedOrder.items.map((item) => (
                    <ListItem key={item.id}>
                      <ListItemText
                        primary={item.name}
                        secondary={`${item.quantity} عدد - ${(item.price * (item.quantity || 1)).toLocaleString()} تومان`}
                      />
                    </ListItem>
                  ))}
                </List>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>بستن</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
} 