'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api, AuthResponse } from '@/lib/api';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, firstName: string, lastName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: (code: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUser(data: AuthResponse['user']): User {
  return {
    id: data.id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    name: `${data.first_name} ${data.last_name}`.trim(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Always try to get user - if httpOnly cookie exists, backend will return user data
        const userData = await api.getUser();
        setUser(mapUser(userData));
      } catch {
        // If 401 or error - user is not authenticated, that's OK
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    const data = await api.login(email, password, rememberMe);
    setUser(mapUser(data.user));
  };

  const register = async (
    email: string,
    firstName: string,
    lastName: string,
    password: string
  ) => {
    const data = await api.register(email, firstName, lastName, password);
    setUser(mapUser(data.user));
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Backend clears httpOnly cookies automatically
      setUser(null);
    }
  };

  const googleLogin = async (code: string) => {
    const data = await api.googleLogin(code);
    setUser(mapUser(data.user));
  };

  const refreshUser = useCallback(async () => {
    try {
      // No need to check for token - httpOnly cookies are sent automatically
      const userData = await api.getUser();
      setUser(mapUser(userData));
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        googleLogin,
        refreshUser,
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