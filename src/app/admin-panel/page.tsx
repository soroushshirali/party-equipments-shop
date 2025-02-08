"use client";
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/login');
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">پنل مدیریت</h1>
      <div>
        <p>Welcome, {user.email}</p>
        {/* Add admin functionality here */}
      </div>
    </div>
  );
} 