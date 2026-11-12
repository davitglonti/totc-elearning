import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => api.auth.getCurrentUser());
  const [loading, setLoading] = useState(true);

  // Sync session on mount and listen to storage events across tabs
  useEffect(() => {
    const user = api.auth.getCurrentUser();
    setCurrentUser(user);
    setLoading(false);

    const handleStorageChange = (e) => {
      if (e.key === 'totc_user') {
        try {
          setCurrentUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          setCurrentUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await api.auth.login(email, password);
    if (result?.user) {
      setCurrentUser(result.user);
    }
    return result;
  }, []);

  const register = useCallback(async (fullName, email, password, role = 'Student', extra = {}) => {
    const result = await api.auth.register(fullName, email, password, role, extra);
    if (result?.user) {
      setCurrentUser(result.user);
    }
    return result;
  }, []);

  const googleLogin = useCallback(async (params) => {
    const result = await api.auth.googleLogin(params);
    if (result?.user) {
      setCurrentUser(result.user);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    api.auth.logout();
    setCurrentUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setCurrentUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem('totc_user', JSON.stringify(updatedUser));
    }
  }, []);

  const value = {
    currentUser,
    setCurrentUser: updateUser,
    isAuthenticated: Boolean(currentUser),
    role: currentUser?.role || 'Guest',
    isStudent: currentUser?.role === 'Student',
    isInstructor: currentUser?.role === 'Instructor' || currentUser?.role === 'Admin',
    isAdmin: currentUser?.role === 'Admin',
    isSubscribed: Boolean(currentUser?.isSubscribed),
    login,
    register,
    googleLogin,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
