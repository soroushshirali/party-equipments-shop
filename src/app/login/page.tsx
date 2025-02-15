"use client";
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button, TextField } from '@mui/material';
import Link from 'next/link';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and limit length to 15
    if (/^\d*$/.test(value) && value.length <= 15) {
      setPhone(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Just check if phone is not empty and contains only numbers
    if (!phone || !/^\d+$/.test(phone)) {
      setError('لطفاً شماره تلفن معتبر وارد کنید');
      return;
    }
    
    try {
      await signIn(phone, password);
    } catch (error: any) {
      setError(error.message || 'خطا در ورود به سیستم');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">ورود</h1>
        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            fullWidth
            label="شماره تلفن"
            value={phone}
            onChange={handlePhoneChange}
            required
            dir="ltr"
            inputProps={{
              maxLength: 15
            }}
          />
          <TextField
            fullWidth
            type="password"
            label="رمز عبور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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
  );
} 