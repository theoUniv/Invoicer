export interface AuthUser {
  userId: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  role: {
    roleId: number;
    name: string;
  };
}

export interface AuthResponse {
  data: {
    token: string;
    user: AuthUser;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roleId?: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ApiError {
  error: {
    message: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

let lastErrorTime = 0;
let errorCount = 0;

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}/auth${endpoint}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Network error' } }));
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }
    
    errorCount = 0;
    
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    const now = Date.now();
    if (now - lastErrorTime < 10000) {
      errorCount++;
    } else {
      errorCount = 1;
    }
    lastErrorTime = now;
    
    if (errorCount <= 2) {
      console.error(`Auth API Error (${endpoint}):`, error);
    }
    
    throw error;
  }
}

export const setAuthCookie = (token: string) => {
  if (typeof window !== 'undefined') {
    const expires = new Date();
    expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000);
    document.cookie = `auth_token=${token}; path=/; expires=${expires.toUTCString()}; secure; samesite=strict`;
  }
};

export const getAuthCookie = (): string | null => {
  if (typeof window !== 'undefined') {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
    return authCookie ? authCookie.split('=')[1] : null;
  }
  return null;
};

export const removeAuthCookie = () => {
  if (typeof window !== 'undefined') {
    document.cookie = 'auth_token=; path=/; max-age=0; secure; samesite=strict';
  }
};

export const loginUser = async (email: string, password: string): Promise<{ success: boolean; user?: AuthUser; token?: string; error?: string }> => {
  try {
    const response = await apiCall<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    setAuthCookie(response.data.token);
    return {
      success: true,
      user: response.data.user,
      token: response.data.token
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur de connexion au serveur'
    };
  }
};

export const registerUser = async (data: RegisterData): Promise<{ success: boolean; user?: AuthUser; token?: string; error?: string }> => {
  try {
    const response = await apiCall<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    setAuthCookie(response.data.token);
    return {
      success: true,
      user: response.data.user,
      token: response.data.token
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de l\'inscription'
    };
  }
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const token = getAuthCookie();
  if (!token) return null;
  
  try {
    const response = await apiCall<{ data: { user: AuthUser } }>('/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.user;
  } catch (error) {
    removeAuthCookie();
    return null;
  }
};

export const logoutUser = async (): Promise<{ success: boolean; error?: string }> => {
  const token = getAuthCookie();
  
  try {
    if (token) {
      await apiCall('/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    }
    
    removeAuthCookie();
    return { success: true };
  } catch (error) {
    removeAuthCookie();
    return { success: true };
  }
};

export const getCurrentUserSync = (): AuthUser | null => {
  const token = getAuthCookie();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: parseInt(payload.sub),
      email: payload.email,
      firstName: null,
      lastName: null,
      isActive: true,
      createdAt: '',
      lastLoginAt: null,
      role: {
        roleId: 0,
        name: payload.role
      }
    };
  } catch {
    removeAuthCookie();
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return getAuthCookie() !== null;
};
