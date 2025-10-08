import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const KycStatusCTA: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;
  if (user.kycVerified === "PENDING" || user.kycVerified === "REJECTED") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 text-sm">
        Your agent KYC is {user.kycVerified.toLowerCase()}.{" "}
        <Link to="/kycStatus" className="underline font-medium">Check KYC status</Link>
      </div>
    );
  }
  return null;
};

export default KycStatusCTA;
