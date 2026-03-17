'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Tooltip } from '@/components/ui';

export function ForgetPasswordForm() {
  const [email, setEmail] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowTooltip(true);
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  };

  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  return (
    <>
      <Tooltip 
        message="Mail de récupération envoyé !" 
        isVisible={showTooltip} 
      />
      <div className="w-full max-w-[400px] p-8">
        <h1 className="font-['Playfair_Display'] font-normal text-[3.5rem] leading-[1.1] mb-2">Reset password</h1>
        <p className="text-[#8A8580] mb-12 font-light">Enter your email to receive reset instructions.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <Input 
              type="email" 
              placeholder="Email address" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex justify-between items-center mt-12">
            <a href="/login" className="text-[#8A8580] no-underline text-sm">
              Back to login
            </a>
            <Button variant="dark">
              Send reset link
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
