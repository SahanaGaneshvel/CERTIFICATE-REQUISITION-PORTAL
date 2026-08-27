import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '../types';
import { api, setToken } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (registerNo: string, dob: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  completeRegistration: (data: { mobile: string; altMobile?: string; email: string; altEmail?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toUser(apiUser: Record<string, unknown>): User {
  return {
    id: apiUser.id as string,
    registerNo: apiUser.registerNo as string,
    name: apiUser.name as string,
    dateOfBirth: apiUser.dateOfBirth as string,
    degree: apiUser.degree as string,
    branch: apiUser.branch as string,
    campus: apiUser.campus as string,
    gender: apiUser.gender as string,
    admittedYear: apiUser.admittedYear as number,
    institution: apiUser.institution as string,
    mobileNumber: (apiUser.mobileNumber as string) ?? '',
    alternateMobile: apiUser.alternateMobile as string | undefined,
    email: (apiUser.email as string) ?? '',
    alternateEmail: apiUser.alternateEmail as string | undefined,
    isRegistered: apiUser.isRegistered as boolean,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    api
      .get<{ user: Record<string, unknown> }>('/auth/me')
      .then((res) => setUser(toUser(res.user)))
      .catch(() => setToken(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (registerNo: string, dob: string): Promise<boolean> => {
    try {
      const res = await api.post<{ token: string; user: Record<string, unknown> }>('/auth/login', {
        registerNo,
        dateOfBirth: dob,
      });
      setToken(res.token);
      setUser(toUser(res.user));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const completeRegistration = async (data: { mobile: string; altMobile?: string; email: string; altEmail?: string }) => {
    const res = await api.post<{ user: Record<string, unknown> }>('/profile/complete-registration', data);
    setUser(toUser(res.user));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
        completeRegistration,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
