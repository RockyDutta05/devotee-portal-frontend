import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';
import WatermarkBackground from '../components/WatermarkBackground';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data && (data.errorCode === '403_PENDING_APPROVAL' || data.error === '403_PENDING_APPROVAL')) {
        navigate('/pending-approval');
      } else if (data && (data.errorCode === '403_REJECTED' || data.error === '403_REJECTED' || data.message?.includes('rejected'))) {
        setError('Your account application was rejected. Please contact the administrator.');
      } else {
        setError(data?.message || err.message || 'Invalid email or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <WatermarkBackground />

      <div className="relative z-30 flex items-start justify-center min-h-[calc(100vh-5rem)] px-4 py-12">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-orange-100 p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-orange-100 rounded-full mb-4 border border-orange-200">
              <span className="text-3xl">🕉️</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">Welcome Back</h1>
            <p className="text-gray-700 font-medium mt-2">Sign in to your devotee account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-xl flex items-start gap-3 border border-red-200">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-red-600" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="ENTER YOUR EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 px-4 rounded-lg border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">Password</label>
              <input
                type="password"
                placeholder="ENTER THE PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 px-4 rounded-lg border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-orange-600 rounded border-gray-400 focus:ring-orange-500"
                />
                <label htmlFor="remember" className="text-sm font-semibold text-gray-800">Remember me</label>
              </div>
              <a href="#" className="text-sm font-bold text-orange-600 hover:underline">Forgot password?</a>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-bold shadow-md mt-2" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Login'}
            </Button>
          </form>

          <p className="text-center mt-6 text-sm font-semibold text-gray-800">
            Don't have an account?{' '}
            <Link to="/signup" className="text-orange-600 font-bold hover:underline">Sign up here</Link>
          </p>
        </div>
      </div>
    </>
  );
}
