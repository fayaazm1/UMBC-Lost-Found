import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { currentUser, dbUser, loading } = useAuth();
  const location = useLocation();

  // Check if we're still loading auth state
  if (loading) {
    return <div>Loading...</div>;
  }

  // For admin routes
  if (requireAdmin) {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return children;
  }
  
  // For regular protected routes
  if (!currentUser || !dbUser) {
    return <Navigate to="/welcome" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
