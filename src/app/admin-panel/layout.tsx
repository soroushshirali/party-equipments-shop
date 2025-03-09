"use client";
import Link from 'next/link';
import { Button } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return <div className="p-4">Loading...</div>;
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return null;
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