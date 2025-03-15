import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const VerifyResetForm = dynamic(() => import('@/components/Auth/VerifyResetForm'), {
  loading: () => <div>Loading...</div>
});

export default function VerifyResetPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyResetForm />
    </Suspense>
  );
} 