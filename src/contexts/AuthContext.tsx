
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { getCurrentUser } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

// Define the User type with user_metadata
export interface User {
  id: string;
  email: string;
  name?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    display_name?: string;
  };
}

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Use React Query to manage user state
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
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

export default AuthContext;
