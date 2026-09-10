import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';

// Guard for admin login route (/admin/login)
export default function AdminLoginGuard() {
  const { isAuthenticated, isAdmin } = useAuth();

  if (isAuthenticated) {
    // If already logged in, redirect based on role
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  // Not authenticated, show admin login form
  return <Login isAdminLogin={true} />;
}
