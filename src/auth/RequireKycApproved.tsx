import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const RequireKycApproved: React.FC = () => {
  const { isAuthenticated, canEnterAgentPanel } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!canEnterAgentPanel) return <Navigate to="/kycStatus" replace />;

  return <Outlet />; // render children routes
};

export default RequireKycApproved;
