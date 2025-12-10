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
    <div className="min-h-screen app-bg flex items-center justify-center p-4 relative overflow-hidden">
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
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Moon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-3">Welcome Back</h1>
          <p className="text-secondary text-base">Sign in to your Sleep Health KBS account</p>
        </div>

        <div className="surface rounded-3xl p-8 shadow-xl border border-app">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-secondary">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-secondary/70" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3.5 input-surface rounded-xl border border-app focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
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
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-secondary/70" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3.5 input-surface rounded-xl border border-app focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-surface/30 rounded-r-xl transition-colors"
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
            © {new Date().getFullYear()} Sleep Health KBS. All rights reserved.
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