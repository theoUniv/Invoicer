'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Tooltip } from '@/components/ui';
import { useAppTranslation } from '@/hooks/useTranslation';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const router = useRouter();
  const { t } = useAppTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle registration logic here
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
        message={t('tooltip.accountCreated')} 
        isVisible={showTooltip} 
      />
      <div className="w-full max-w-[450px] p-8">
        <h1 className="font-['Playfair_Display'] font-normal text-[3.5rem] leading-[1.1] mb-2">{t('register.title')}</h1>
        <p className="text-[#8A8580] mb-12 font-light">{t('register.subtitle')}</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <Input 
              type="text" 
              placeholder={t('register.fullName')} 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-8">
            <Input 
              type="email" 
              placeholder={t('login.email')} 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-8">
            <Input 
              type="password" 
              placeholder={t('login.password')} 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="mb-8">
            <Input 
              type="password" 
              placeholder={t('register.confirmPassword')} 
              required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="flex justify-between items-center mt-12">
            <a href="/login" className="text-[#8A8580] no-underline text-sm">
              {t('login.alreadyHaveAccount')}
            </a>
            <Button variant="dark">
              {t('register.createAccount')}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
