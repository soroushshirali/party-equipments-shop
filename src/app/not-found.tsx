"use client";
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">صفحه مورد نظر یافت نشد</h2>
        <Link href="/" className="text-blue-500 hover:underline">
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
} 