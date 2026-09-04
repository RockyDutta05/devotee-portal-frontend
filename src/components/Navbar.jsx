import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-orange-600" />
          <span className="text-xl font-bold text-gray-900">ISKCON Devotees Job</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-orange-600">Dashboard</Link>
          <Link to="/resumes" className="text-sm font-medium text-gray-600 hover:text-orange-600">Resumes</Link>
          <Link to="/jobs" className="text-sm font-medium text-gray-600 hover:text-orange-600">Jobs</Link>
          <Link to="/referrals" className="text-sm font-medium text-gray-600 hover:text-orange-600">Referrals</Link>
          <Link to="/requests" className="text-sm font-medium text-gray-600 hover:text-orange-600">Requests</Link>
          <Link to="/profile" className="text-sm font-medium text-gray-600 hover:text-orange-600">Profile</Link>
          {isAdmin && (
            <Link to="/admin" className="text-sm font-bold text-orange-600 hover:text-orange-700">Admin Panel</Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <button onClick={handleLogout} className="flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-orange-600">Login</Link>
              <Link to="/signup" className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
