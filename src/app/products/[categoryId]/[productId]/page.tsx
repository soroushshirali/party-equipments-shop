"use client";

import { useParams } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { Header } from '@/components/Header';
import { Button } from '@mui/material';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function ProductDetails() {
  const params = useParams();
  const categoryId = params.categoryId as string;
  const productId = params.productId as string;
  
  const { products, loading: productsLoading } = useProducts(categoryId);
  const { cart, addToCart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, loadingItemId } = useCart();

  if (productsLoading) return <LoadingSpinner />;

  const product = products?.find(p => p.id.toString() === productId);
  if (!product) return <div>محصول یافت نشد</div>;

  return (
    <div dir="rtl">
      <Header
        cart={cart}
        onRemoveFromCart={removeFromCart}
        onUpdateQuantity={updateQuantity}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        showBackButton
      />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-4">
          <Link href={`/products/${categoryId}`} className="text-blue-500 hover:underline">
            بازگشت به محصولات
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img 
                src={product.image} 
                alt={product.title}
                className="w-full rounded-lg"
              />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">{product.title}</h1>
              
              <div className="space-y-2">
                <p className="text-lg">طول: {product.length || '-'} سانتی‌متر</p>
                <p className="text-lg">عرض: {product.width || '-'} سانتی‌متر</p>
                <p className="text-lg">ارتفاع: {product.height || '-'} سانتی‌متر</p>
              </div>

              <div className="text-gray-700 my-4">
                <h2 className="text-xl font-bold mb-2">توضیحات:</h2>
                <p className="whitespace-pre-wrap">{product.description || 'توضیحاتی ثبت نشده است'}</p>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold">{product.price} تومان</span>
                  <Button
                    variant="contained"
                    onClick={() => addToCart(product)}
                    disabled={loadingItemId === product.id}
                    size="large"
                  >
                    افزودن به سبد خرید
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 