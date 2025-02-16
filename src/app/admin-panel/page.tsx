"use client";
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent } from '@mui/material';
import Link from 'next/link';
import { FirebaseWrapper } from '@/components/FirebaseWrapper';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function AdminPanel() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/login');
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <FirebaseWrapper>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">پنل مدیریت</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin-panel/categories" className="no-underline">
            <Card className="h-32 hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="h-full flex items-center justify-center text-lg font-bold text-blue-600">
                مدیریت دسته‌بندی‌ها
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin-panel/products" className="no-underline">
            <Card className="h-32 hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="h-full flex items-center justify-center text-lg font-bold text-blue-600">
                مدیریت محصولات
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </FirebaseWrapper>
  );
} 