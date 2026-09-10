import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore auth state from localStorage on first render
  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken');
    const savedUser = authService.getCurrentUser();
    // Guard against the string "undefined" being stored
    if (savedToken && savedToken !== 'undefined' && savedToken !== 'null') {
      setToken(savedToken);
    }
    if (savedUser) setUser(savedUser);
    setIsLoading(false);
  }, []);

  // Listen for 401 events dispatched by the api.js interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      // Navigate to login without a hard page reload
      window.location.replace('/login');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    const tok = data.accessToken || data.token;
    if (!tok) {
      throw new Error('No token received from server. Check backend response.');
    }
    setToken(tok);
    setUser(data.user);
    localStorage.setItem('accessToken', tok);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    authService.logout();
  };

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isAdmin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
