import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Common/Loader';

const PrivateRoute = ({ children, allowGuest = false }) => {
  const { isAuthenticated, guestMode, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (isAuthenticated || (allowGuest && guestMode)) {
    return children;
  }

  return <Navigate to="/login" />;
};

export default PrivateRoute;