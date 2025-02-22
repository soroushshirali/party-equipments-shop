"use client";

import { useParams } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { Header } from '@/components/Header';
import { Button } from '@mui/material';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ImageViewer } from '@/components/ImageViewer';

export default function ProductDetails() {
  const params = useParams();
  const categoryId = Array.isArray(params?.categoryId) 
    ? params.categoryId[0] 
    : params?.categoryId ?? '';
  const productId = Array.isArray(params?.productId)
    ? params.productId[0]
    : params?.productId ?? '';
  
  const { products, loading: productsLoading } = useProducts(categoryId);
  const { cart, addToCart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, loadingItemId } = useCart();

  if (productsLoading) return <LoadingSpinner />;

  console.log('All products:', products);
  const product = products?.find(p => p.id.toString() === productId);
  console.log('Selected product:', product);

  if (!product) return <div>محصول یافت نشد</div>;

  const headerProps = {
    cart,
    onRemoveFromCart: removeFromCart,
    onUpdateQuantity: updateQuantity,
    isCartOpen,
    setIsCartOpen,
  };

  return (
    <div dir="rtl">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-4">
          <Link href={`/products/${categoryId}`} className="text-blue-500 hover:underline">
            بازگشت به محصولات
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <ImageViewer 
                thumbnailUrl={product.image}
                originalUrl={product.originalImage}
                alt={product.name}
              />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">{product.name}</h1>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-4">مشخصات فنی:</h3>
                <div className="space-y-2">
                  <p className="text-gray-600 flex justify-between">
                    <span>طول:</span>
                    <span className="text-black">{product.specs.length} سانتی‌متر</span>
                  </p>
                  <p className="text-gray-600 flex justify-between">
                    <span>عرض:</span>
                    <span className="text-black">{product.specs.width} سانتی‌متر</span>
                  </p>
                  <p className="text-gray-600 flex justify-between">
                    <span>ارتفاع:</span>
                    <span className="text-black">{product.specs.height} سانتی‌متر</span>
                  </p>
                  <p className="text-gray-600 flex justify-between">
                    <span>وزن:</span>
                    <span className="text-black">{product.specs.weight} کیلوگرم</span>
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{product.price.toLocaleString()} تومان</span>
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

        {product.description ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">توضیحات محصول:</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">توضیحات محصول:</h2>
            <p className="text-gray-500">توضیحاتی برای این محصول ثبت نشده است.</p>
          </div>
        )}
      </div>
    </div>
  );
} 