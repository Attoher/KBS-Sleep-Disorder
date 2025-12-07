import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
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
    <div className="min-h-screen app-bg flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Moon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Create Account</h1>
          <p className="text-secondary">Start your sleep health journey today</p>
        </div>

        <div className="surface rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-secondary" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 input-surface rounded-lg transition-colors"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-secondary" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 input-surface rounded-lg transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Age
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-3 py-3 input-surface rounded-lg transition-colors"
                  placeholder="25"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-3 input-surface rounded-lg transition-colors"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-secondary" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-3 input-surface rounded-lg transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-secondary" />
                  ) : (
                    <Eye className="h-5 w-5 text-secondary" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-secondary">
                Must be at least 6 characters long
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3 py-3 input-surface rounded-lg transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-app rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-secondary">
                I agree to the{' '}
                <a href="#" className="text-primary hover:underline">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </label>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="large"
              title="Create account"
            >
              Create Account
            </Button>

            <div className="text-center text-sm text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-app">
            <p className="text-xs text-secondary text-center">
              Your data is securely encrypted and protected.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-secondary">
            © {new Date().getFullYear()} Sleep Health KBS. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;