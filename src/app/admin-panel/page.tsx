"use client";
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';
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
        <div className="grid gap-4">
          <Link href="/admin-panel/categories">
            <Button variant="contained" fullWidth>
              مدیریت دسته‌بندی‌ها
            </Button>
          </Link>
        </div>
      </div>
    </FirebaseWrapper>
  );
} 