import React, { createContext, useContext, useState } from 'react';
import type { User, TokenResponse } from '../types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: TokenResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('ft_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('ft_token');
  });

  const login = (data: TokenResponse) => {
    setUser(data.user);
    setToken(data.access_token);
    localStorage.setItem('ft_token', data.access_token);
    localStorage.setItem('ft_user', JSON.stringify(data.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ft_token');
    localStorage.removeItem('ft_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
