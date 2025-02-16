"use client";
import { ShoppingCart } from 'lucide-react';
import { Button } from '@mui/material';
import { Product } from '@/types/types';
import { CartItem } from './CartItem';

interface CartProps {
  items: Product[];
  onRemove: (id: string) => Promise<void>;
  onUpdateQuantity: (id: string, quantity: number) => Promise<void>;
  isOpen: boolean;
  onToggle: () => void;
}

export const Cart = ({ items, onRemove, onUpdateQuantity, isOpen, onToggle }: CartProps) => {
  const totalPrice = items.reduce((total, item) => {
    return total + (item.price * (item.quantity || 1));
  }, 0).toLocaleString();

  return (
    <div className="md:fixed md:top-4 md:left-4 z-50">
      {/* Mobile Cart Button */}
      <div className="fixed bottom-4 right-4 md:hidden">
        <button 
          onClick={onToggle}
          className="bg-blue-500 text-white p-3 rounded-full shadow-lg flex items-center gap-2"
        >
          <ShoppingCart size={24} />
          <span className="bg-white text-blue-500 px-2 py-1 rounded-full text-sm">
            {items.length}
          </span>
        </button>
      </div>

      {/* Desktop Cart */}
      <div className="hidden md:block">
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
            <span>{totalPrice} تومان</span>
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
                    />
                  ))}
                  <div className="p-4">
                    <Button variant="contained" className="w-full">
                      تکمیل خرید
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Cart Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">سبد سفارش</h2>
                <button onClick={onToggle} className="text-gray-500">
                  ✕
                </button>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {items.length === 0 ? (
                <p className="p-4 text-center text-gray-500">سبد سفارش خالی است</p>
              ) : (
                <>
                  {items.map(item => (
                    <CartItem 
                      key={item.id} 
                      item={item}
                    />
                  ))}
                </>
              )}
            </div>
            <div className="p-4 border-t bg-white">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold">جمع کل:</span>
                <span className="font-bold">{totalPrice}</span>
              </div>
              <Button variant="contained" fullWidth>
                تکمیل خرید
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 