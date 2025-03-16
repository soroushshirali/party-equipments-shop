"use client";
import { X, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { Product } from '@/types/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  updateQuantity,
  removeFromCart,
  selectLoadingItemId
} from '@/store/cartSlice';

interface CartItemProps {
  item: Product;
  onRemove?: (id: string) => Promise<void>;
  onUpdateQuantity?: (id: string, quantity: number) => Promise<void>;
}

export function CartItem({ item }: CartItemProps) {
  const dispatch = useAppDispatch();
  const loadingItemId = useAppSelector(selectLoadingItemId);
  const isLoading = loadingItemId === item.id;

  const handleQuantityChange = async (change: number) => {
    const newQuantity = (item.quantity || 0) + change;
    if (newQuantity >= 0) {
      try {
        await dispatch(updateQuantity({ productId: item.id, quantity: newQuantity })).unwrap();
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    }
  };

  const handleRemove = async () => {
    try {
      await dispatch(removeFromCart(item.id)).unwrap();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="flex items-center gap-2">
        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
        <div>
          <p className="font-bold">{item.name}</p>
          <p className="text-sm">{item.price.toLocaleString()} تومان</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <div className="flex flex-col items-center">
              <button 
                onClick={() => handleQuantityChange(1)}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                disabled={isLoading || (item.quantity || 0) >= 99}
              >
                <ChevronUp size={16} />
              </button>
              <span>{item.quantity || 1}</span>
              <button 
                onClick={() => handleQuantityChange(-1)}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                disabled={isLoading || (item.quantity || 0) <= 1}
              >
                <ChevronDown size={16} />
              </button>
            </div>
            <button 
              onClick={handleRemove}
              className="p-1 hover:bg-red-100 rounded disabled:opacity-50"
              disabled={isLoading}
            >
              <X size={16} className="text-red-500" />
            </button>
          </>
        )}
      </div>
    </div>
  );
} 