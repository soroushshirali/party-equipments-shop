import React from 'react';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateQuantity, removeFromCart, selectLoadingItemId } from '@/store/cartSlice';
import { Product } from '@/types/types';
import { formatPrice } from '@/lib/utils';

interface CartItemProps {
  product: Product;
  quantity: number;
}

export const CartItem: React.FC<CartItemProps> = ({ product, quantity }) => {
  const dispatch = useAppDispatch();
  const loadingItemId = useAppSelector(selectLoadingItemId);
  const isLoading = loadingItemId === product.id;

  const handleQuantityChange = async (newQuantity: number) => {
    try {
      if (newQuantity >= 0) {
        await dispatch(updateQuantity({ productId: product.id, quantity: newQuantity })).unwrap();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemove = async () => {
    try {
      await dispatch(removeFromCart(product.id)).unwrap();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
      <div className="relative w-20 h-20">
        <Image
          src={product.image || '/placeholder.png'}
          alt={product.name}
          fill
          className="object-cover rounded-md"
        />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-gray-600">{formatPrice(product.price)}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={isLoading || quantity <= 1}
          className="px-2 py-1 text-lg font-bold text-gray-600 bg-gray-100 rounded-md disabled:opacity-50"
        >
          -
        </button>
        <span className="w-8 text-center">{quantity}</span>
        <button
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={isLoading || quantity >= 99}
          className="px-2 py-1 text-lg font-bold text-gray-600 bg-gray-100 rounded-md disabled:opacity-50"
        >
          +
        </button>
      </div>
      <button
        onClick={handleRemove}
        disabled={isLoading}
        className="p-2 text-red-500 hover:text-red-600 disabled:opacity-50"
      >
        حذف
      </button>
    </div>
  );
}; 