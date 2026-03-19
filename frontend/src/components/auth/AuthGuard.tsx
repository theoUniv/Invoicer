'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({ children, requireAuth = false, redirectTo }: AuthGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const hasToken = isAuthenticated();
      
      if (requireAuth && hasToken) {
        try {
          const user = await getCurrentUser();
          setIsAuthenticatedUser(user !== null);
        } catch {
          setIsAuthenticatedUser(false);
        }
      } else {
        setIsAuthenticatedUser(hasToken);
      }
      
      setIsChecking(false);

      if (requireAuth && !hasToken) {
        router.push('/login');
      } else if (!requireAuth && hasToken) {
        router.push(redirectTo || '/home');
      }
    };

    checkAuth();
  }, [router, requireAuth, redirectTo]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A1817] mx-auto mb-4"></div>
          <p className="text-[#8A8580]">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticatedUser) {
    return null;
  }

  if (!requireAuth && isAuthenticatedUser) {
    return null;
  }

  return <>{children}</>;
}
