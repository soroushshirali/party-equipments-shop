"use client";
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  InputAdornment,
  Alert
} from '@mui/material';
import { Phone, Lock } from '@mui/icons-material';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);


    try {
      const result = await signIn('credentials', {
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        redirect: false
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push(callbackUrl);
      }
    } catch (error) {
      setError('خطا در ورود به حساب کاربری');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <Paper className="p-8 max-w-md w-full">
        <Typography variant="h4" className="mb-6 text-center">
          ورود به حساب کاربری
        </Typography>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            fullWidth
            label="شماره تلفن"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone />
                </InputAdornment>
              ),
            }}
            placeholder="09xxxxxxxxx"
            dir="ltr"
          />

          <TextField
            fullWidth
            label="رمز عبور"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
            }}
            dir="ltr"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'ورود'}
          </Button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <Typography>
            حساب کاربری ندارید؟{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-800">
              ثبت نام کنید
            </Link>
          </Typography>
          <Typography>
            <Link href="/forgot-password" className="text-blue-600 hover:text-blue-800">
              رمز عبور خود را فراموش کرده‌اید؟
            </Link>
          </Typography>
        </div>
      </Paper>
    </div>
  );
} 