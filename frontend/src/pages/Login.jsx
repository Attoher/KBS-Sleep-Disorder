import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Common/Button';
import ThemeToggle from '../components/Common/ThemeToggle';

const Login = () => {
  const navigate = useNavigate();
  const { login, startGuestSession } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGuest = () => {
    startGuestSession();
    navigate('/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/dashboard');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen app-bg flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header buttons */}
      <div className="absolute top-6 left-6">
        <Link to="/welcome">
          <Button
            variant="outline"
            size="small"
            className="flex items-center gap-2 hover:gap-3 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-3xl flex items-center justify-center shadow-2xl shadow-accent-primary/30">
            <Moon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-4">Welcome Back</h1>
          <p className="text-secondary text-base">Sign in to your Kumeowturu account</p>
        </div>

        <div className="surface rounded-3xl p-10 shadow-xl border border-app mt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-secondary">
                Email Address
              </label>
              <div className="flex items-center gap-3 bg-gray-700/30 rounded-xl px-4 py-3.5 border border-app focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <Mail className="h-5 w-5 text-secondary/70 flex-shrink-0" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-secondary">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="flex items-center gap-3 bg-gray-700/30 rounded-xl px-4 py-3.5 border border-app focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <Lock className="h-5 w-5 text-secondary/70 flex-shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex-shrink-0 hover:bg-surface/30 rounded-lg p-1 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-secondary/70 hover:text-secondary" />
                  ) : (
                    <Eye className="h-5 w-5 text-secondary/70 hover:text-secondary" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-surface/50">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-app rounded transition-colors"
              />
              <label htmlFor="remember-me" className="text-sm text-secondary">
                Remember me
              </label>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              loading={loading}
              className="w-full py-4 rounded-xl text-base font-medium"
              size="large"
              title="Sign in"
            >
              Sign In
            </Button>

            {/* Guest Button */}
            <Button
              type="button"
              variant="secondary"
              className="w-full py-4 rounded-xl border border-app hover:border-app/50 transition-colors"
              onClick={handleGuest}
              title="Continue as Guest"
            >
              Continue as Guest
            </Button>

            {/* Register Link */}
            <div className="text-center pt-4">
              <p className="text-secondary">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-primary hover:underline font-medium inline-flex items-center gap-1 group"
                >
                  Create one now
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </p>
            </div>
          </form>

          {/* Terms */}
          <div className="mt-8 pt-6 border-t border-app/50">
            <p className="text-xs text-secondary/70 text-center">
              By signing in, you agree to our{' '}
              <a href="#" className="text-primary hover:underline font-medium">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-3">
          <p className="text-sm text-secondary/70">
            © {new Date().getFullYear()} Kumeowturu. All rights reserved.
          </p>
          <Link
            to="/showcase"
            className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors group"
          >
            🎨 View UI Showcase
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;