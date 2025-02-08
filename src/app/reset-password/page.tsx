"use client";
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, TextField } from '@mui/material';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword(email);
      setMessage('لینک بازیابی رمز عبور به ایمیل شما ارسال شد');
      setError('');
    } catch (error) {
      setError('خطا در ارسال لینک بازیابی');
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">بازیابی رمز عبور</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            fullWidth
            label="ایمیل"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dir="ltr"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            className="mt-4"
          >
            ارسال لینک بازیابی
          </Button>
          <div className="text-center mt-4">
            <Link href="/login" className="text-blue-500 hover:underline">
              بازگشت به صفحه ورود
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 