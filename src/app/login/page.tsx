"use client";
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button, TextField } from '@mui/material';
import Link from 'next/link';
import { FirebaseWrapper } from '@/components/FirebaseWrapper';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      router.push('/');
    } catch (error) {
      setError('Invalid email or password');
    }
  };

  return (
    <FirebaseWrapper>
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-6 text-center">ورود به سیستم</h1>
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
            <Button
              type="submit"
              variant="contained"
              fullWidth
              className="mt-4"
            >
              ورود
            </Button>
            <div className="text-center mt-4 space-y-2">
              <Link href="/register" className="text-blue-500 hover:underline block">
                ثبت نام
              </Link>
              <Link href="/reset-password" className="text-blue-500 hover:underline block">
                فراموشی رمز عبور
              </Link>
            </div>
          </form>
        </div>
      </div>
    </FirebaseWrapper>
  );
} 