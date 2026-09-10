import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminLoginGuard from './components/AdminLoginGuard';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PendingApproval from './pages/PendingApproval';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Resumes from './pages/Resumes';
import Jobs from './pages/Jobs';
import Referrals from './pages/Referrals';
import Requests from './pages/Requests';
import Admin from './pages/Admin';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            {/* Devotee login */}
            <Route path="/login" element={<Login isAdminLogin={false} />} />

            <Route path="/signup" element={<Signup />} />
            <Route path="/pending-approval" element={<PendingApproval />} />

            {/* Admin login – separate dedicated URL */}
            <Route path="/admin" element={<AdminLoginGuard />} />
            <Route path="/admin/login" element={<Login isAdminLogin={true} />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/resumes" element={<Resumes />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/referrals" element={<Referrals />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/admin/dashboard" element={<Admin />} />
            </Route>

          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
