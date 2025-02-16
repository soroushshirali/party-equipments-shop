"use client";
import { Button } from '@mui/material';
import Link from 'next/link';
import { Cart } from '../Cart/Cart';
import { CartItem } from '../Cart/CartItem';
import { Product } from '@/types/types';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { MobileCart } from '../Cart/MobileCart';

interface HeaderProps {
  cart: Product[];
  onRemoveFromCart: (id: string) => Promise<void>;
  onUpdateQuantity: (id: string, quantity: number) => Promise<void>;
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
  const { user, userData, isAdmin, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="sticky top-0 z-40 bg-white shadow-md">
      <div className="max-w-6xl mx-auto">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center p-4">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Link href="/">
                <Button>بازگشت به دسته‌بندی‌ها</Button>
              </Link>
            )}
            <Link href="/about">
              <Button>درباره ما</Button>
            </Link>
            {user && (
              <>
                <Link href="/profile">
                  <Button>
                    {userData?.firstName} {userData?.lastName}
                  </Button>
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
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center p-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2"
          >
            <Menu size={24} />
          </button>
          
          {/* Cart Button in Header */}
          <button 
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="flex items-center gap-2"
          >
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={closeMobileMenu}
          >
            <div 
              className="bg-white h-full w-2/3 p-4 space-y-4 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={closeMobileMenu}
                className="absolute top-4 left-4 p-2 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>

              <div className="text-lg font-bold mb-6 pt-2">منو</div>

              {/* Add About Us link at the top of mobile menu */}
              <Link href="/about" onClick={closeMobileMenu}>
                <Button variant="text" fullWidth>
                  درباره ما
                </Button>
              </Link>

              {user ? (
                <>
                  <Link href="/profile" onClick={closeMobileMenu}>
                    <Button fullWidth>
                      {userData?.firstName} {userData?.lastName}
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin-panel" onClick={closeMobileMenu}>
                      <Button variant="contained" color="primary" fullWidth>
                        پنل مدیریت
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={() => {
                      signOut();
                      closeMobileMenu();
                    }}
                    fullWidth
                  >
                    خروج
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block" onClick={closeMobileMenu}>
                    <Button variant="contained" color="primary" fullWidth>
                      ورود
                    </Button>
                  </Link>
                  <Link href="/register" className="block" onClick={closeMobileMenu}>
                    <Button variant="outlined" color="primary" fullWidth>
                      ثبت نام
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Cart */}
      <div className="hidden md:block">
        <Cart
          items={cart}
          onRemove={onRemoveFromCart}
          onUpdateQuantity={onUpdateQuantity}
          isOpen={isCartOpen}
          onToggle={() => setIsCartOpen(!isCartOpen)}
        />
      </div>

      {/* Mobile Cart */}
      <MobileCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
      />
    </div>
  );
}; 