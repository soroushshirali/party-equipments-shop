"use client";
import { X, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { Product } from '@/types/types';
import { useCart } from '@/contexts/CartContext';

interface CartItemProps {
  item: Product;
}

export const CartItem = ({ item }: CartItemProps) => {
  const { removeFromCart, updateQuantity, loadingItemId } = useCart();
  const isLoading = loadingItemId === item.id;

  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="flex items-center gap-2">
        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
        <div>
          <p className="font-bold">{item.name}</p>
          <p className="text-sm">{item.price}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <div className="flex flex-col items-center">
              <button 
                onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                disabled={isLoading}
              >
                <ChevronUp size={16} />
              </button>
              <span>{item.quantity || 1}</span>
              <button 
                onClick={() => updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                disabled={isLoading}
              >
                <ChevronDown size={16} />
              </button>
            </div>
            <button 
              onClick={() => removeFromCart(item.id)}
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
}; 