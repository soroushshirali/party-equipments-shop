"use client";
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPanel() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="p-4" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">پنل مدیریت</h1>
      <p>به پنل مدیریت خوش آمدید</p>
    </div>
  );
} 