import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast as sonnerToast } from 'sonner';
import { loginStaff, logoutStaff } from '@/lib/api';
import { User as UserType, UserRole } from '@/lib/types';

interface AuthContextType {
  user: UserType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if we have a token in localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const response = await loginStaff(email, password);
      
      // If login successful, store the user
      if (response && response.staff) {
        setUser(response.staff);
        localStorage.setItem('user', JSON.stringify(response.staff));
        
        sonnerToast.success(`Welcome back, ${response.staff.name}!`);
        
        navigate('/dashboard');
        return true;
      } else {
        sonnerToast.error('Invalid response from server');
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      sonnerToast.error(error.message || 'Invalid email or password');
      return false;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = () => {
    setUser(null);
    logoutStaff(); // This will clear the token
    localStorage.removeItem('user');
    sonnerToast.info('You have been logged out');
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading: loading,
        login,
        logout,
        isAdmin: user?.role === 'admin',
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