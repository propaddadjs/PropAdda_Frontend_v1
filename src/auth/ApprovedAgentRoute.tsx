// components/guards/ApprovedAgentRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ApprovedAgentRoute: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const loc = useLocation();

  // not logged in → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }

  // must be agent AND approved
  if (user?.role !== 'AGENT' || user?.kycVerified !== 'APPROVED') {
    // send users to the KYC status page (outside agent panel)
    return <Navigate to="/kycStatus" replace />;
  }

  return <Outlet />;
};

export default ApprovedAgentRoute;
