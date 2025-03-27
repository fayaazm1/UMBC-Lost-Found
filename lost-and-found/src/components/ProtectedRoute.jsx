import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser || !currentUser.emailVerified) {
    return <Navigate to="/welcome" />;
  }

  return children;
}

export default ProtectedRoute;
