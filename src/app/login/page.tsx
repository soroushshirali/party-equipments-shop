import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const LoginForm = dynamic(() => import('@/components/Auth/LoginForm'), {
  loading: () => <div>Loading...</div>
});

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
} 