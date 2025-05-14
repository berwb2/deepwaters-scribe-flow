
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // This is a placeholder for actual authentication logic
    // In a real application, this would connect to your authentication service
    console.log('Login with:', email, password);
    
    // Simulate successful login
    setUser({
      id: '1',
      email,
      name: 'Demo User'
    });
  };

  const logout = () => {
    setUser(null);
  };

  const register = async (email: string, password: string, name?: string) => {
    // This is a placeholder for actual registration logic
    console.log('Register with:', email, password, name);
    
    // Simulate successful registration
    setUser({
      id: '1',
      email,
      name: name || 'New User'
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        register
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
