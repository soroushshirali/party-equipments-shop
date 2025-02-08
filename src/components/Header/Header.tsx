"use client";
import { Button } from '@mui/material';
import Link from 'next/link';
import { Cart } from '../Cart/Cart';
import { Product } from '@/types/types';
import { useAuth } from '@/contexts/AuthContext';

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
}: HeaderProps) => {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <div className="sticky top-0 z-50 bg-white shadow-md p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Link href="/">
              <Button>بازگشت به دسته‌بندی‌ها</Button>
            </Link>
          )}
          {user && (
            <>
              <Link href="/profile">
                <Button>{user.email}</Button>
              </Link>
              {isAdmin && (
                <Link href="/admin-panel">
                  <Button variant="contained" color="primary">
                    پنل مدیریت
                  </Button>
                </Link>
              )}
              <Button 
                variant="outlined" 
                color="error" 
                onClick={signOut}
              >
                خروج
              </Button>
            </>
          )}
          {!user && (
            <>
              <Link href="/login">
                <Button variant="contained" color="primary">
                  ورود
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outlined" color="primary">
                  ثبت نام
                </Button>
              </Link>
            </>
          )}
        </div>
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
}; 