"use client";
import { useState, useEffect } from 'react';
import { Button, TextField } from '@mui/material';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import axios from '@/lib/axios';

export default function VerifyResetForm() {
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get('phone') || '';
  
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!phoneNumber) {
      setError('شماره تلفن نامعتبر است');
    }
  }, [phoneNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('رمز عبور و تکرار آن مطابقت ندارند');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', {
        phoneNumber,
        verificationCode,
        newPassword
      });
      
      setMessage('رمز عبور با موفقیت تغییر کرد');
      setError('');
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.error || 'خطا در تغییر رمز عبور');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">تغییر رمز عبور</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            fullWidth
            label="شماره تلفن"
            value={phoneNumber}
            disabled
            dir="ltr"
          />
          
          <TextField
            fullWidth
            label="کد تایید"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            dir="ltr"
            placeholder="1234"
          />
          
          <TextField
            fullWidth
            label="رمز عبور جدید"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            dir="ltr"
          />
          
          <TextField
            fullWidth
            label="تکرار رمز عبور جدید"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            dir="ltr"
          />
          
          <Button
            type="submit"
            variant="contained"
            fullWidth
            className="mt-4"
            disabled={loading}
          >
            {loading ? 'در حال پردازش...' : 'تغییر رمز عبور'}
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