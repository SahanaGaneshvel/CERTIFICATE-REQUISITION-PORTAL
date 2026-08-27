import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { adminApi, setToken } from '../lib/api';

interface AdminUser {
  id: string;
  registerNo: string;
  name: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (registerNo: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setIsLoading(false);
      return;
    }
    adminApi
      .get<{ user: AdminUser }>('/auth/me')
      .then((res) => setAdmin(res.user))
      .catch(() => setToken(null, 'adminToken'))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (registerNo: string, password: string): Promise<boolean> => {
    try {
      const res = await adminApi.post<{ token: string; user: AdminUser }>('/auth/admin/login', {
        registerNo,
        password,
      });
      setToken(res.token, 'adminToken');
      setAdmin(res.user);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setToken(null, 'adminToken');
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, isAuthenticated: !!admin, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
