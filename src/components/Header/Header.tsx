"use client";
import { Button } from '@mui/material';
import Link from 'next/link';
import { Cart } from '../Cart/Cart';
import { Product } from '@/types/types';

interface HeaderProps {
  cart: Product[];
  onRemoveFromCart: (id: number) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  showBackButton?: boolean;
}

export const Header = ({
  cart,
  onRemoveFromCart,
  onUpdateQuantity,
  isCartOpen,
  setIsCartOpen,
  showBackButton
}: HeaderProps) => (
  <div className="sticky top-0 z-50 bg-white shadow-md p-4">
    <div className="max-w-6xl mx-auto flex justify-between items-center">
      {showBackButton && (
        <Link href="/">
          <Button>بازگشت به دسته‌بندی‌ها</Button>
        </Link>
      )}
      <Cart
        items={cart}
        onRemove={onRemoveFromCart}
        onUpdateQuantity={onUpdateQuantity}
        isOpen={isCartOpen}
        onToggle={() => setIsCartOpen(!isCartOpen)}
      />
    </div>
  </div>
); 