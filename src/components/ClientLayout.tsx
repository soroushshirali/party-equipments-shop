"use client";
import { Providers } from './Providers';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';

interface ClientLayoutProps {
  children: React.ReactNode;
  fontClasses: string;
}

export function ClientLayout({ children, fontClasses }: ClientLayoutProps) {
  return (
    <body className={`${fontClasses} antialiased`}>
      <Providers>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </Providers>
    </body>
  );
} 