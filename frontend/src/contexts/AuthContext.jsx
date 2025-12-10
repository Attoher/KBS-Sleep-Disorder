import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Loader from '../components/Common/Loader';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(false);
  const [hasToken, setHasToken] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const guest = localStorage.getItem('guest') === 'true';
    const cachedUser = localStorage.getItem('user');

    if (token) {
      setHasToken(true);
      // Optimistically hydrate user from cache to avoid flicker/redirect on refresh
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch (_) {
          localStorage.removeItem('user');
        }
      }
      fetchUser();
    } else if (guest) {
      setGuestMode(true);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      setHasToken(true);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // Only clear auth on explicit 401; network issues should not log out users
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
        setGuestMode(false);
        localStorage.removeItem('user');
        setHasToken(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('guest');
      setHasToken(true);
      setGuestMode(false);
      setUser(user);
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('guest');
      setHasToken(true);
      setGuestMode(false);
      setUser(user);
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('guest');
    localStorage.removeItem('user');
    setHasToken(false);
    setUser(null);
    setGuestMode(false);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      setUser(response.data.data.user);
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Update failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const startGuestSession = () => {
    localStorage.removeItem('token');
    localStorage.setItem('guest', 'true');
    setHasToken(false);
    setUser(null);
    setGuestMode(true);
    toast.success('You are now exploring as Guest');
  };

  const value = {
    user,
    loading,
    guestMode,
    login,
    register,
    logout,
    updateProfile,
    fetchUser,
    startGuestSession,
    isAuthenticated: !!user || (hasToken && !guestMode),
    hasToken
  };

  // Show loader while checking authentication
  if (loading) {
    return (
      <AuthContext.Provider value={value}>
        <Loader fullScreen />
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};