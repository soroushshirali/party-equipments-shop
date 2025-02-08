"use client";
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button, TextField } from '@mui/material';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('رمز عبور و تکرار آن مطابقت ندارند');
      return;
    }
    try {
      await signUp(email, password);
      router.push('/');
    } catch (error) {
      setError('خطا در ثبت نام');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">ثبت نام</h1>
        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            fullWidth
            label="ایمیل"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dir="ltr"
          />
          <TextField
            fullWidth
            type="password"
            label="رمز عبور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            dir="ltr"
          />
          <TextField
            fullWidth
            type="password"
            label="تکرار رمز عبور"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            dir="ltr"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            className="mt-4"
          >
            ثبت نام
          </Button>
          <div className="text-center mt-4">
            <Link href="/login" className="text-blue-500 hover:underline">
              قبلاً ثبت نام کرده‌اید؟ ورود
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 