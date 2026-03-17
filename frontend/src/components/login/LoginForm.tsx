'use client';

import { Button, Input, Tooltip } from '@/components/ui';
import { useAppTranslation } from '@/hooks/useTranslation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('jean@invoicer.ia');
  const [password, setPassword] = useState('password');
  const [showTooltip, setShowTooltip] = useState(false);
  const router = useRouter();
  const { t, currentLanguage: language } = useAppTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowTooltip(true);
    setTimeout(() => {
      router.push('/');
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
        message={t('tooltip.loginSuccess')}
        isVisible={showTooltip}
      />
      <div className="w-full max-w-[450px] p-8">
        <h1 className="font-['Playfair_Display'] font-normal text-[3.5rem] leading-[1.1] mb-2">{t('login.title')}</h1>
        <p className="text-[#8A8580] mb-12 font-light">{t('login.subtitle')}</p>

        <form onSubmit={handleSubmit}>
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
          <div className="flex justify-between items-center mt-12">
            <div className="flex flex-col gap-2">
              <Link href="/forget-password" className="text-[#8A8580] no-underline text-sm hover:underline">
                {t('login.resetPassword')}
              </Link>
            </div>
            <Button variant="dark">
              {t('login.accessPlatform')}
            </Button>
          </div>
          <div className="flex justify-center mt-4">
            <Link href="/register" className="text-[#8A8580] no-underline text-sm hover:underline">
              {t('login.createAccount')}
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
