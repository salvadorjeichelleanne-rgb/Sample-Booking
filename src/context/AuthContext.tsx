import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { DEMO_USERS } from '../data/mockData';

export interface AuthContextType {
  user: User | null;
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, phone?: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  quickLogin: (userId: string) => void;
  switchDemoUser: (userId: string) => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'bookwell_auth_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return DEMO_USERS[0]; // Jane Doe demo client
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [user]);

  const login = async (email: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    const existingDemo = DEMO_USERS.find(u => u.email.toLowerCase() === cleanEmail);
    if (existingDemo) {
      setUser(existingDemo);
      return { success: true };
    }

    const newUser: User = {
      id: 'usr-' + Date.now(),
      name: cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: cleanEmail,
      role: 'client',
    };
    setUser(newUser);
    return { success: true };
  };

  const register = async (name: string, email: string, phone?: string): Promise<{ success: boolean; message?: string }> => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      return { success: false, message: 'Please fill in all required fields.' };
    }

    const newUser: User = {
      id: 'usr-' + Date.now(),
      name: cleanName,
      email: cleanEmail,
      phone: phone?.trim() || undefined,
      role: 'client',
    };

    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const quickLogin = (userId: string) => {
    const target = DEMO_USERS.find(u => u.id === userId);
    if (target) {
      setUser(target);
    }
  };

  const updateProfile = (data: Partial<User>) => {
    setUser(prev => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        quickLogin,
        switchDemoUser: quickLogin,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
