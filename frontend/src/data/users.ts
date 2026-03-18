export interface User {
  user_id: number;
  role_id: number;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  created_at: string;
  last_login_at?: string;
}

export interface Role {
  role_id: number;
  name: string;
  description?: string;
}

export const roles: Role[] = [
  {
    role_id: 1,
    name: 'admin',
    description: 'Administrateur avec accès complet à toutes les fonctionnalités'
  },
  {
    role_id: 2,
    name: 'user',
    description: 'Utilisateur standard avec accès limité à ses documents'
  },
  {
    role_id: 3,
    name: 'viewer',
    description: 'Lecteur seul, accès en lecture seule'
  }
];

export const users: User[] = [
  {
    user_id: 1,
    role_id: 1,
    email: 'admin@invoicer.com',
    password_hash: '$2b$12$abcdefghijklmnopqrstuvwxz',
    first_name: 'Admin',
    last_name: 'Invoicer',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    last_login_at: '2024-03-18T10:00:00Z'
  },
  {
    user_id: 2,
    role_id: 2,
    email: 'user@invoicer.com',
    password_hash: '$2b$12$abcdefghijklmnopqrstuvwxz',
    first_name: 'Jean',
    last_name: 'Dupont',
    is_active: true,
    created_at: '2024-01-15T00:00:00Z',
    last_login_at: '2024-03-17T15:30:00Z'
  },
  {
    user_id: 3,
    role_id: 3,
    email: 'viewer@invoicer.com',
    password_hash: '$2b$12$abcdefghijklmnopqrstuvwxz',
    first_name: 'Marie',
    last_name: 'Martin',
    is_active: true,
    created_at: '2024-02-01T00:00:00Z',
    last_login_at: '2024-03-16T09:15:00Z'
  }
];

export const getUserByEmail = (email: string): User | undefined => {
  return users.find(user => user.email === email);
};

export const getUserById = (id: number): User | undefined => {
  return users.find(user => user.user_id === id);
};

export const getRoleById = (id: number): Role | undefined => {
  return roles.find(role => role.role_id === id);
};

export const getRoleByName = (name: string): Role | undefined => {
  return roles.find(role => role.name === name);
};
