// src/auth/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

type Role = "ADMIN" | "AGENT" | "BUYER";

type Props = {
  children: React.ReactNode;
  allow: Role[];
  requireApprovedKyc?: boolean;
};

export function ProtectedRoute({ children, allow, requireApprovedKyc }: Props) {
  const { user, refreshKyc, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Optionally show a spinner or blank until rehydrate completes
    return <div />;
  }

  // not logged in
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // role not allowed
  if (!allow.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // require KYC APPROVED for agents
  if (requireApprovedKyc && user.role === "AGENT" && user.kycVerified !== "APPROVED") {
    if (user.kycVerified == null) {
      // try to hydrate once; no await in render
      void refreshKyc();
    }
    // send to public KYC status page (outside agent panel)
    return <Navigate to="/kycStatus" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
