import { User, getUserByEmail } from '@/data/users';

// MODIFIER AVEC LE CALL API /api/auth/login
const mockApiCall = async (endpoint: string, data: any): Promise<any> => {
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
  
  switch (endpoint) {
    case '/auth/login':
      const user = getUserByEmail(data.email);
      if (!user) {
        return { success: false, error: 'Utilisateur non trouvé' };
      }
      
      const isValidPassword = data.password === 'admin123' && user.email === 'admin@invoicer.com' ||
                            data.password === 'user123' && user.email === 'user@invoicer.com' ||
                            data.password === 'viewer123' && user.email === 'viewer@invoicer.com';
      
      if (!isValidPassword) {
        return { success: false, error: 'Mot de passe incorrect' };
      }
      
      return {
        success: true,
        user,
        token: generateMockToken(user)
      };
      
    default:
      return { success: false, error: 'Endpoint non trouvé' };
  }
};

const generateMockToken = (user: User): string => {
  const payload = {
    userId: user.user_id,
    email: user.email,
    roleId: user.role_id,
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60
  };
  
  return btoa(JSON.stringify(payload));
};

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

export const loginUser = async (email: string, password: string): Promise<{ success: boolean; user?: User; token?: string; error?: string }> => {
  try {
    const result = await mockApiCall('/auth/login', { email, password });
    if (result.success) {
      setAuthCookie(result.token);
    }
    return result;
  } catch (error) {
    return {
      success: false,
      error: 'Erreur de connexion au serveur'
    };
  }
};

export const logoutUser = (): void => {
  removeAuthCookie();
};


export const getCurrentUser = (): User | null => {
  const token = getAuthCookie();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token));
    return {
      user_id: payload.userId,
      role_id: payload.roleId,
      email: payload.email,
      password_hash: '',
      first_name: '',
      last_name: '',
      is_active: true,
      created_at: '',
      last_login_at: ''
    } as User;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return getAuthCookie() !== null;
};
