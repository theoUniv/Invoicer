'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Tooltip } from '@/components/ui';
import { useAppTranslation } from '@/hooks/useTranslation';
import { registerSchema, RegisterFormData } from '@/validators/auth';

export function RegisterForm() {
  const [showTooltip, setShowTooltip] = useState(false);
  const router = useRouter();
  const { t } = useAppTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema as any),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    console.log('Register data:', data);
    setShowTooltip(true);
    reset();
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
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-8">
            <Input 
              type="text" 
              placeholder={t('register.fullName')} 
              {...register('name')}
              error={errors.name?.message}
            />
          </div>
          <div className="mb-8">
            <Input 
              type="email" 
              placeholder={t('login.email')} 
              {...register('email')}
              error={errors.email?.message}
            />
          </div>
          <div className="mb-8">
            <Input 
              type="password" 
              placeholder={t('login.password')} 
              {...register('password')}
              error={errors.password?.message}
            />
          </div>
          <div className="mb-8">
            <Input 
              type="password" 
              placeholder={t('register.confirmPassword')} 
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />
          </div>
          <div className="flex justify-between items-center mt-12">
            <a href="/login" className="text-[#8A8580] no-underline text-sm">
              {t('login.alreadyHaveAccount')}
            </a>
            <Button variant="dark" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Création...' : t('register.createAccount')}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
