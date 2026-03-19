'use client';

import { useState, useEffect } from 'react';
import { AuthUser } from '@/lib/auth';
import { getCurrentUser, isAuthenticated, logoutUser, loginUser, registerUser } from '@/lib/auth';

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const result = await loginUser(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Erreur de connexion' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; firstName?: string; lastName?: string }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const result = await registerUser(data);
      
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Erreur lors de l\'inscription' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    register,
    logout
  };
}
