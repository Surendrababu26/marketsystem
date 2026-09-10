import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole) {
    const currentRole = (role || '').toLowerCase();
    const targetRole = allowedRole.toLowerCase();

    if (currentRole !== targetRole) {
      const redirectPath = currentRole === 'buyer' ? '/buyer/dashboard' : '/supplier/dashboard';
      return (
        <div className="access-denied-container">
          <div className="card text-center p-4">
            <h2>Access Denied</h2>
            <p>You do not have permission to view this page. This area is reserved for <strong>{allowedRole}s</strong>.</p>
            <p className="text-muted">Your account role is <strong>{role || 'Unknown'}</strong>.</p>
            <div className="mt-3">
              <Link to={redirectPath} className="btn btn-primary">
                Go to My Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
