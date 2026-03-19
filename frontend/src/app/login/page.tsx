'use client';

import { LoginLayout, NoiseTexture } from '@/components/login';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false}>
      <div className="flex w-full h-screen bg-[#F4F1ED] text-[#1A1817] font-['Inter'] antialiased relative overflow-hidden">
        <NoiseTexture />
        
        <LoginLayout />
      </div>
    </AuthGuard>
  );
}