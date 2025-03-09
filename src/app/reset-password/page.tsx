"use client";
import { useState } from 'react';
import { Button, TextField } from '@mui/material';
import Link from 'next/link';
import axios from '@/lib/axios';

export default function ResetPasswordPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password/request', { phoneNumber });
      setMessage('کد تایید به شماره تلفن شما ارسال شد');
      setError('');
      // Redirect to verification page
      window.location.href = `/verify-reset?phone=${encodeURIComponent(phoneNumber)}`;
    } catch (error: any) {
      setError(error.response?.data?.error || 'خطا در ارسال کد تایید');
      setMessage('');
    } finally {
      setLoading(false);
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
            label="شماره تلفن"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            dir="ltr"
            placeholder="09123456789"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            className="mt-4"
            disabled={loading}
          >
            {loading ? 'در حال ارسال...' : 'ارسال کد تایید'}
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