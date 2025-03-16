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
  DialogActions,
  Box,
  Divider
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
    <div className="min-h-screen bg-gray-50 py-12" dir="rtl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Paper className="max-w-2xl mx-auto rounded-lg shadow-lg overflow-hidden">
          <Box className="bg-primary-600 px-6 py-4">
            <Typography variant="h5" className="text-white font-bold">
              پروفایل کاربری
            </Typography>
          </Box>
          
          <Box className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Typography variant="subtitle2" className="text-gray-500 mb-1">
                  نام و نام خانوادگی
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {session.user.name}
                </Typography>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <Typography variant="subtitle2" className="text-gray-500 mb-1">
                  شماره تماس
                </Typography>
                <Typography variant="body1" className="font-medium" dir="ltr">
                  {session.user.phoneNumber || 'شماره تماسی ثبت نشده است'}
                </Typography>
              </div>
            </div>

            <Divider className="my-6" />

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="contained"
                color="primary"
                onClick={() => setIsChangePasswordOpen(true)}
                className="flex-1"
                size="large"
              >
                تغییر رمز عبور
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleSignOut}
                className="flex-1"
                size="large"
              >
                خروج از حساب کاربری
              </Button>
            </div>
          </Box>
        </Paper>
      </div>

      {/* Change Password Dialog */}
      <Dialog
        open={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" className="font-bold">
            تغییر رمز عبور
          </Typography>
        </DialogTitle>
        <form onSubmit={handlePasswordChange}>
          <DialogContent>
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4">
                {success}
              </div>
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
                variant="outlined"
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
                variant="outlined"
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
                variant="outlined"
              />
            </div>
          </DialogContent>
          <DialogActions className="p-4">
            <Button 
              onClick={() => setIsChangePasswordOpen(false)}
              variant="outlined"
              size="large"
            >
              انصراف
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              size="large"
            >
              {loading ? <CircularProgress size={24} /> : 'تغییر رمز عبور'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
} 