import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, User, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Common/Button';
import ThemeToggle from '../components/Common/ThemeToggle';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      age: formData.age ? parseInt(formData.age) : undefined,
      gender: formData.gender || undefined,
    });

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
          <h1 className="text-3xl font-bold text-primary mb-3">Create Account</h1>
          <p className="text-secondary text-base">Start your sleep health journey today</p>
        </div>

        <div className="surface rounded-3xl p-8 shadow-xl border border-app">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-secondary">
                Full Name
              </label>
              <div className="flex items-center gap-3 bg-gray-700/30 rounded-xl px-4 py-3.5 border border-app focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <User className="h-5 w-5 text-secondary/70 flex-shrink-0" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400"
                  placeholder="John Doe"
                />
              </div>
            </div>

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

            {/* Age & Gender Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-secondary">
                  Age
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3.5 input-surface rounded-xl border border-app focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="25"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-secondary">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3.5 input-surface rounded-xl border border-app focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                >
                  <option value="" className="text-secondary/70">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-secondary">
                Password
              </label>
              <div className="flex items-center gap-3 bg-gray-700/30 rounded-xl px-4 py-3.5 border border-app focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <Lock className="h-5 w-5 text-secondary/70 flex-shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400"
                  placeholder="••••••••"
                  minLength="6"
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
              <p className="text-xs text-secondary/70 mt-2">
                Must be at least 6 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-secondary">
                Confirm Password
              </label>
              <div className="flex items-center gap-3 bg-gray-700/30 rounded-xl px-4 py-3.5 border border-app focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <Lock className="h-5 w-5 text-secondary/70 flex-shrink-0" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="flex-shrink-0 hover:bg-surface/30 rounded-lg p-1 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-secondary/70 hover:text-secondary" />
                  ) : (
                    <Eye className="h-5 w-5 text-secondary/70 hover:text-secondary" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-surface/50">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-5 w-5 mt-0.5 text-blue-600 focus:ring-blue-500 border-app rounded transition-colors"
              />
              <label htmlFor="terms" className="text-sm text-secondary">
                I agree to the{' '}
                <a href="#" className="text-primary hover:underline font-medium">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={loading}
              className="w-full py-4 rounded-xl text-base font-medium"
              size="large"
              title="Create account"
            >
              Create Account
            </Button>

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-secondary">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium inline-flex items-center gap-1 group"
                >
                  Sign in
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </p>
            </div>
          </form>

          {/* Security Note */}
          <div className="mt-8 pt-6 border-t border-app/50">
            <p className="text-xs text-secondary/70 text-center">
              🔒 Your data is securely encrypted and protected
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

export default Register;