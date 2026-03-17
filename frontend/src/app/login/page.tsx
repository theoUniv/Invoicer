'use client';

import { LoginLayout, NoiseTexture } from '@/components/login';

export default function LoginPage() {
  return (
    <div className="flex w-full h-screen bg-[#F4F1ED] text-[#1A1817] font-['Inter'] antialiased relative overflow-hidden">
      <NoiseTexture />
      
      <LoginLayout />
    </div>
  );
}