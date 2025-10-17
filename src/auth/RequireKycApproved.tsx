import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const RequireKycApproved: React.FC = () => {
  const { isAuthenticated, canEnterAgentPanel, loading } = useAuth();

    if (loading) {
    // Optionally show a spinner or blank until rehydrate completes
    return <div />;
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!canEnterAgentPanel) return <Navigate to="/account/checkKycStatus" replace />;

  return <Outlet />; // render children routes
};

export default RequireKycApproved;
