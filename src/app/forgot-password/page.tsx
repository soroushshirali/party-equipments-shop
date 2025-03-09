"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  InputAdornment,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { Phone, Lock, Numbers } from '@mui/icons-material';
import axios from '@/lib/axios';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    phoneNumber: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  const steps = ['وارد کردن شماره تلفن', 'تایید کد', 'تغییر رمز عبور'];

  const handleSendVerificationCode = async () => {
    setError('');
    setLoading(true);


    try {
      // TODO: Implement SMS verification
      // For now, we'll just move to the next step
      // In a real application, you would send an SMS here
      setSuccess('کد تایید به شماره تلفن شما ارسال شد');
      setActiveStep(1);
    } catch (error: any) {
      setError(error.response?.data?.error || 'خطا در ارسال کد تایید');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    setLoading(true);

    if (!formData.verificationCode) {
      setError('لطفاً کد تایید را وارد کنید');
      setLoading(false);
      return;
    }

    try {
      // TODO: Implement verification code check
      // For now, we'll just check if it's 1234
      if (formData.verificationCode === '1234') {
        setSuccess('کد تایید صحیح است');
        setActiveStep(2);
      } else {
        setError('کد تایید نادرست است');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'خطا در تایید کد');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('رمز عبور و تکرار آن مطابقت ندارند');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
      setLoading(false);
      return;
    }

    try {
      await axios.post('/api/auth/forgot-password', {
        phoneNumber: formData.phoneNumber,
        verificationCode: formData.verificationCode,
        newPassword: formData.newPassword
      });

      router.push('/login?message=رمز عبور با موفقیت تغییر کرد');
    } catch (error: any) {
      setError(error.response?.data?.error || 'خطا در تغییر رمز عبور');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
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
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleSendVerificationCode}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'ارسال کد تایید'}
            </Button>
          </>
        );

      case 1:
        return (
          <>
            <TextField
              fullWidth
              label="کد تایید"
              type="text"
              value={formData.verificationCode}
              onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Numbers />
                  </InputAdornment>
                ),
              }}
              dir="ltr"
            />
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleVerifyCode}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'تایید کد'}
            </Button>
          </>
        );

      case 2:
        return (
          <>
            <TextField
              fullWidth
              label="رمز عبور جدید"
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
              }}
              dir="ltr"
            />
            <TextField
              fullWidth
              label="تکرار رمز عبور جدید"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
              variant="contained"
              fullWidth
              size="large"
              onClick={handleResetPassword}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'تغییر رمز عبور'}
            </Button>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <Paper className="p-8 max-w-md w-full">
        <Typography variant="h4" className="mb-6 text-center">
          بازیابی رمز عبور
        </Typography>

        <Stepper activeStep={activeStep} className="mb-8">
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" className="mb-4">
            {success}
          </Alert>
        )}

        <div className="space-y-4">
          {renderStep()}
        </div>

        <div className="mt-4 text-center">
          <Typography>
            <Link href="/login" className="text-blue-600 hover:text-blue-800">
              بازگشت به صفحه ورود
            </Link>
          </Typography>
        </div>
      </Paper>
    </div>
  );
} 