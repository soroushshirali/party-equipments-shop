"use client";
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button, TextField } from '@mui/material';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const router = useRouter();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and limit length to 15
    if (/^\d*$/.test(value) && value.length <= 15) {
      setFormData({ ...formData, phone: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.phone || !formData.firstName || !formData.lastName || !formData.password) {
      setError('نام، نام خانوادگی، شماره تلفن و رمز عبور الزامی هستند');
      return;
    }

    // Just check if phone contains only numbers
    if (!/^\d+$/.test(formData.phone)) {
      setError('لطفاً شماره تلفن معتبر وارد کنید');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('رمز عبور و تکرار آن مطابقت ندارند');
      return;
    }

    try {
      await signUp(formData);
      router.push('/');
    } catch (error: any) {
      setError(error.message || 'خطا در ثبت نام');
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
            label="نام"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
            dir="rtl"
          />
          <TextField
            fullWidth
            label="نام خانوادگی"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
            dir="rtl"
          />
          <TextField
            fullWidth
            label="شماره تلفن"
            value={formData.phone}
            onChange={handlePhoneChange}
            required
            dir="ltr"
            inputProps={{
              maxLength: 15
            }}
          />
          <TextField
            fullWidth
            label="ایمیل (اختیاری)"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            dir="ltr"
          />
          <TextField
            fullWidth
            type="password"
            label="رمز عبور"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            dir="ltr"
          />
          <TextField
            fullWidth
            type="password"
            label="تکرار رمز عبور"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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