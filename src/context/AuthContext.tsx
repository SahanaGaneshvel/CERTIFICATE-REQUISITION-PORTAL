import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (registerNo: string, dob: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  completeRegistration: (data: { mobile: string; altMobile?: string; email: string; altEmail?: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demonstration
const mockUser: User = {
  id: '1',
  registerNo: 'RA2311003010079',
  name: 'Vijay Bala Mahalingam',
  dateOfBirth: '15-03-2005',
  degree: 'B.Tech',
  branch: 'Computer Science and Engineering',
  campus: 'Kattankulathur',
  gender: 'Male',
  admittedYear: 2023,
  institution: 'Faculty of Engineering and Technology, Kattankulathur',
  mobileNumber: '',
  email: '',
  isRegistered: false,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (registerNo: string, _dob: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (registerNo) {
      setUser({ ...mockUser, registerNo });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const completeRegistration = (data: { mobile: string; altMobile?: string; email: string; altEmail?: string }) => {
    if (user) {
      setUser({
        ...user,
        mobileNumber: data.mobile,
        alternateMobile: data.altMobile,
        email: data.email,
        alternateEmail: data.altEmail,
        isRegistered: true,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
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
