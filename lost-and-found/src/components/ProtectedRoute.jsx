import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  
  console.log('ProtectedRoute - currentUser:', currentUser);
  console.log('ProtectedRoute - emailVerified:', currentUser?.emailVerified);

  if (!currentUser || !currentUser.emailVerified) {
    console.log('ProtectedRoute - Redirecting to welcome page');
    return <Navigate to="/welcome" />;
  }

  return children;
}

export default ProtectedRoute;
