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
  IconButton,
  Button,
  Typography,
  CircularProgress
} from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import axios from '@/lib/axios';
import { Product } from '@/types/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectCartItems,
  selectIsLoading,
  updateQuantity,
  removeFromCart,
  clearCart,
  finalizeOrder
} from '@/store/cartSlice';

export default function Cart() {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCartItems);
  const isLoading = useAppSelector(selectIsLoading);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productIds = Object.keys(cart || {});
        if (!productIds || productIds.length === 0) {
          setProducts([]);
          return;
        }

        const promises = productIds.map(id => 
          axios.get(`/api/products/${id}`)
            .then(response => {
              const product = response.data;
              return product && typeof product === 'object' && 'id' in product ? 
                { ...product, quantity: cart[id] } : 
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
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [cart]);

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

  const handleCheckout = async () => {
    if (status !== 'authenticated' || !session?.user) {
      router.push('/login');
      return;
    }

    try {
      await dispatch(finalizeOrder()).unwrap();
      alert('سفارش شما با موفقیت ثبت شد. می‌توانید سفارش خود را در صفحه سفارش‌های من مشاهده کنید.');
    } catch (error) {
      console.error('Error finalizing order:', error);
      if (error === 'User not authenticated') {
        router.push('/login');
      }
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  const totalPrice = products.reduce((total, item) => {
    return total + (item.price * (item.quantity || 1));
  }, 0);

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <Typography variant="h4" className="mb-4">سبد خرید</Typography>

      {products.length === 0 ? (
        <Typography variant="h6" className="text-center">
          سبد خرید خالی است
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper} className="mb-4">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>محصول</TableCell>
                  <TableCell>قیمت واحد</TableCell>
                  <TableCell>تعداد</TableCell>
                  <TableCell>قیمت کل</TableCell>
                  <TableCell>حذف</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.price.toLocaleString()} تومان</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(product.id, (product.quantity || 1) + 1)}
                        >
                          <Add />
                        </IconButton>
                        <span>{product.quantity || 1}</span>
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(product.id, Math.max(1, (product.quantity || 1) - 1))}
                        >
                          <Remove />
                        </IconButton>
                      </div>
                    </TableCell>
                    <TableCell>
                      {((product.price * (product.quantity || 1))).toLocaleString()} تومان
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveFromCart(product.id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <div className="flex justify-between items-center">
            <Typography variant="h6">
              مجموع: {totalPrice.toLocaleString()} تومان
            </Typography>
            <div className="space-x-2">
              <Button
                variant="contained"
                color="primary"
                onClick={handleCheckout}
                disabled={isLoading}
              >
                نهایی کردن خرید
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => dispatch(clearCart())}
                disabled={isLoading}
              >
                خالی کردن سبد
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 