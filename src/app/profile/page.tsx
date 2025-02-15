"use client";
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, TextField } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { user, userData, updateUserPassword, signOut } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push('/login');
    return null;
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('رمز عبور و تکرار آن مطابقت ندارند');
      return;
    }
    try {
      await updateUserPassword(newPassword);
      setMessage('رمز عبور با موفقیت تغییر کرد');
      setError('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError('خطا در تغییر رمز عبور');
      setMessage('');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">پروفایل</h1>
      <div className="mb-6 space-y-2">
        <p>نام: {userData?.firstName}</p>
        <p>نام خانوادگی: {userData?.lastName}</p>
        <p>شماره تلفن: {userData?.phone}</p>
        {userData?.email && <p>ایمیل: {userData.email}</p>}
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">تغییر رمز عبور</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {message && <p className="text-green-500 mb-4">{message}</p>}
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <TextField
            fullWidth
            type="password"
            label="رمز عبور جدید"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            dir="ltr"
          />
          <TextField
            fullWidth
            type="password"
            label="تکرار رمز عبور جدید"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            dir="ltr"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
          >
            تغییر رمز عبور
          </Button>
        </form>
      </div>
      <Button
        onClick={signOut}
        variant="outlined"
        fullWidth
        className="mt-6"
        color="error"
      >
        خروج از حساب کاربری
      </Button>
    </div>
  );
} 