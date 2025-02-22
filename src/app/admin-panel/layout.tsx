"use client";
import Link from 'next/link';
import { Button } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <div className="p-4">دسترسی محدود شده است</div>;
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex gap-4" dir="rtl">
          <Link href="/admin-panel">
            <Button variant="text">داشبورد</Button>
          </Link>
          <Link href="/admin-panel/orders">
            <Button variant="text">مدیریت سفارش‌ها</Button>
          </Link>
          <Link href="/admin-panel/products">
            <Button variant="text">مدیریت محصولات</Button>
          </Link>
          <Link href="/admin-panel/categories">
            <Button variant="text">مدیریت دسته‌بندی‌ها</Button>
          </Link>
        </div>
      </nav>
      <main className="container mx-auto py-6">
        {children}
      </main>
    </div>
  );
} 