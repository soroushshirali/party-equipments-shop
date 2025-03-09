"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import axios from '@/lib/axios';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('رمز عبور جدید و تکرار آن مطابقت ندارند');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('رمز عبور جدید باید حداقل ۶ کاراکتر باشد');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setSuccess('رمز عبور با موفقیت تغییر کرد');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangePasswordOpen(false);
    } catch (error: any) {
      setError(error.response?.data?.error || 'خطا در تغییر رمز عبور');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <Paper className="p-6 max-w-lg mx-auto">
        <Typography variant="h4" className="mb-6">پروفایل کاربری</Typography>
        
        <div className="space-y-4">
          <div>
            <Typography variant="subtitle1" className="text-gray-600">نام و نام خانوادگی</Typography>
            <Typography>{session.user.name}</Typography>
          </div>
          
          <div>
            <Typography variant="subtitle1" className="text-gray-600">ایمیل</Typography>
            <Typography>{session.user.email}</Typography>
          </div>

          <div className="pt-4 space-x-4">
            <Button
              variant="contained"
              onClick={() => setIsChangePasswordOpen(true)}
            >
              تغییر رمز عبور
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleSignOut}
            >
              خروج از حساب کاربری
            </Button>
          </div>
        </div>
      </Paper>

      {/* Change Password Dialog */}
      <Dialog
        open={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>تغییر رمز عبور</DialogTitle>
        <form onSubmit={handlePasswordChange}>
          <DialogContent>
            {error && (
              <Typography color="error" className="mb-4">{error}</Typography>
            )}
            {success && (
              <Typography color="success" className="mb-4">{success}</Typography>
            )}
            <div className="space-y-4">
              <TextField
                fullWidth
                type="password"
                label="رمز عبور فعلی"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({
                  ...prev,
                  currentPassword: e.target.value
                }))}
                required
                dir="ltr"
              />
              <TextField
                fullWidth
                type="password"
                label="رمز عبور جدید"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({
                  ...prev,
                  newPassword: e.target.value
                }))}
                required
                dir="ltr"
              />
              <TextField
                fullWidth
                type="password"
                label="تکرار رمز عبور جدید"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({
                  ...prev,
                  confirmPassword: e.target.value
                }))}
                required
                dir="ltr"
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsChangePasswordOpen(false)}>انصراف</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'تغییر رمز عبور'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
} 