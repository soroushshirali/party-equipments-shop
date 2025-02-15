"use client";
import { Button } from '@mui/material';
import { CartItem } from './CartItem';
import { Product } from '@/types/types';

interface MobileCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
}

export function MobileCart({ isOpen, onClose, items }: MobileCartProps) {
  if (!isOpen) return null;

  const total = items.reduce((sum, item) => 
    sum + (parseFloat(item.price.replace(/[^\d]/g, '')) * (item.quantity || 1)), 0
  );

  return (
    <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">سبد سفارش</h2>
            <button onClick={onClose} className="text-gray-500">
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
        {items.length > 0 && (
          <div className="p-4 border-t bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold">جمع کل:</span>
              <span className="font-bold">
                {total.toLocaleString()} تومان
              </span>
            </div>
            <Button variant="contained" fullWidth>
              تکمیل خرید
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 