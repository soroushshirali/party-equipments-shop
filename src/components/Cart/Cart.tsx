"use client";
import { ShoppingCart } from 'lucide-react';
import { Button } from '@mui/material';
import { Product } from '@/types/types';
import { CartItem } from './CartItem';

interface CartProps {
  items: Product[];
  onRemove: (id: number) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Cart = ({ items, onRemove, onUpdateQuantity, isOpen, onToggle }: CartProps) => {
  const total = items.reduce((sum, item) => {
    const price = parseFloat(item.price.replace('$', ''));
    return sum + price * (item.quantity || 1);
  }, 0);

  return (
    <div className="fixed top-4 left-4 z-50">
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
          <span>${total.toFixed(2)}</span>
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
                  <Button className="w-full">تکمیل خرید</Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 