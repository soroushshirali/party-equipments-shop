"use client";
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { Product } from '@/types/types';

interface CartItemProps {
  item: Product;
  onRemove: (id: number) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
}

export const CartItem = ({ item, onRemove, onUpdateQuantity }: CartItemProps) => (
  <div className="flex items-center justify-between p-2 border-b">
    <div className="flex items-center gap-2">
      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
      <div>
        <p className="font-bold">{item.name}</p>
        <p className="text-sm">{item.price}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center">
        <button 
          onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronUp size={16} />
        </button>
        <span>{item.quantity || 1}</span>
        <button 
          onClick={() => onUpdateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronDown size={16} />
        </button>
      </div>
      <button 
        onClick={() => onRemove(item.id)}
        className="p-1 hover:bg-red-100 rounded"
      >
        <X size={16} className="text-red-500" />
      </button>
    </div>
  </div>
); 