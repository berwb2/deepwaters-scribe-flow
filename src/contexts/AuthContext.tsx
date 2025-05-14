
import React, { createContext, useState, useContext, ReactNode } from 'react';

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signOut: () => void; // Add signOut method to match Navbar usage
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
      name: 'Demo User',
      user_metadata: {
        name: 'Demo User',
        avatar_url: '/placeholder.svg',
        display_name: 'Demo User'
      }
    });
  };

  const logout = () => {
    setUser(null);
  };

  // Add signOut as an alias to logout for consistency
  const signOut = () => {
    logout();
  };

  const register = async (email: string, password: string, name?: string) => {
    // This is a placeholder for actual registration logic
    console.log('Register with:', email, password, name);
    
    // Simulate successful registration
    setUser({
      id: '1',
      email,
      name: name || 'New User',
      user_metadata: {
        name: name || 'New User',
        display_name: name || 'New User'
      }
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        signOut, // Added signOut
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
