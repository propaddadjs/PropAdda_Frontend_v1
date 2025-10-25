// Author-Hemant Arora
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import {
  User, Mail, Phone, MapPin, AlertCircle, CheckCircle,
  ExternalLink, FileText, ShieldCheck,
  ChevronRightSquareIcon,
  IdCardLanyardIcon
} from 'lucide-react';

/* --- Types --- */
type KycStatusType = 'INAPPLICABLE' | 'PENDING' | 'APPROVED' | 'REJECTED';

interface AgentResponse {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  state: string;
  city: string;
  role: string;
  address: string;
  profileImageUrl: string;
  agentReraNumber?: string;
  propaddaVerified: boolean;
  aadharUrl?: string;
  kycVerified: KycStatusType;
  kycRejectionReason?: string;
}

/* --- Small UI helpers (match Initiate/Pending look) --- */
const InputField: React.FC<{
  label: string;
  name: string;
  value: string;
  icon?: React.ReactNode;
}> = ({ label, name, value, icon }) => (
  <div>
    <label htmlFor={name} className="block flex text-sm font-medium text-gray-700 mb-1"><ChevronRightSquareIcon className="text-orange-500 w-4 h-4 mr-1" />{label}</label>
    <div className="relative flex items-center">
      {icon && <div className="pointer-events-none absolute left-3 text-gray-400">{icon}</div>}
      <input
        id={name}
        name={name}
        type="text"
        value={value}
        disabled
        className={[
          'w-full rounded-lg px-3 py-2 border shadow-sm transition focus:outline-none',
          icon ? 'pl-10' : '',
          'bg-gray-100 text-gray-600 cursor-not-allowed'
        ].join(' ')}
      />
    </div>
  </div>
);

const TextAreaReadonly: React.FC<{
  label: string;
  name: string;
  value: string;
}> = ({ label, name, value }) => (
  <div>
    <label htmlFor={name} className="block flex text-sm font-medium text-gray-700 mb-1"><ChevronRightSquareIcon className="text-orange-500 w-4 h-4 mr-1" />{label}</label>
    <textarea
      id={name}
      name={name}
      value={value}
      disabled
      className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm min-h-28 text-gray-700 cursor-not-allowed"
    />
  </div>
);

/* Pending-style read-only file row */
const FileReadonlyRow: React.FC<{ label: string; url?: string }> = ({ label, url }) => {
  const hasFile = !!url;
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center justify-between rounded-lg border border-orange-100 bg-white px-3 py-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400" />
          {hasFile ? (
            <span className="inline-flex items-center gap-1 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              Document on file
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-sm text-gray-500">
              <AlertCircle className="h-4 w-4" />
              Not uploaded
            </span>
          )}
        </div>

        {hasFile && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-orange-200 px-2 py-1 text-xs font-medium text-orange-700 hover:bg-orange-50"
          >
            View <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
};

/* --- Page --- */
const KycStatusApproved: React.FC = () => {
  const navigate = useNavigate();
  const [agentDetails, setAgentDetails] = useState<AgentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgentDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<AgentResponse>("/agent/getAgentDetails");
      // This page is APPROVED-only; redirect otherwise
      if (data.kycVerified !== 'APPROVED') {
        navigate("/account/checkKycStatus", { replace: true });
        return;
      }
      setAgentDetails(data);
    } catch (e) {
      console.error("Failed to fetch agent details:", e);
      setError("Failed to load agent details. Check API connection.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchAgentDetails(); }, [fetchAgentDetails]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-7 w-56 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-24 bg-gray-200 rounded" />
              <div className="h-24 bg-gray-200 rounded" />
              <div className="h-24 bg-gray-200 rounded" />
              <div className="h-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <div className="p-4 rounded-lg border border-red-300 bg-red-100 text-red-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!agentDetails) return null;

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <User className="w-7 h-7 text-orange-600" /> KYC Registration
        </h2>

        {/* Approved banner */}
        <div className="p-4 mb-8 rounded-xl shadow-md border bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-600 flex items-center justify-between">
          <div className="flex items-center font-semibold">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="text-base md:text-lg">KYC Registration — Approved</span>
          </div>
          <div className="flex items-center gap-2">
            {agentDetails.propaddaVerified && (
              <span className="px-3 py-1 bg-white text-green-700 font-bold rounded-full text-xs md:text-sm inline-flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> VERIFIED SELLER
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white text-green-700">
              Approved
            </span>
          </div>
        </div>

        {/* Form (read-only) */}
        <div className="bg-white rounded-xl shadow-md border border-orange-100 p-6 md:p-8 space-y-6">
          {/* Personal information */}
          <div className="flex items-center gap-2 mb-2">
            <IdCardLanyardIcon className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="First Name"
              name="firstName"
              value={agentDetails.firstName || ''}
            />
            <InputField
              label="Last Name"
              name="lastName"
              value={agentDetails.lastName || ''}
            />
            <InputField
              label="Email"
              name="email"
              value={agentDetails.email || ''}
              icon={<Mail className="w-4 h-4" />}
            />
            <InputField
              label="Phone Number"
              name="phoneNumber"
              value={agentDetails.phoneNumber || ''}
              icon={<Phone className="w-4 h-4" />}
            />
            <InputField
              label="City"
              name="city"
              value={agentDetails.city || ''}
              icon={<MapPin className="w-4 h-4" />}
            />
            <InputField
              label="State"
              name="state"
              value={agentDetails.state || ''}
              icon={<MapPin className="w-4 h-4" />}
            />

            {/* Address as textarea (read-only, matches Initiate KYC styling) */}
            <div className="md:col-span-2">
              <TextAreaReadonly
                label="Address"
                name="address"
                value={agentDetails.address || ''}
              />
            </div>
          </div>

          {/* Documents (read-only view, same as pending) */}
          <div className="flex items-center gap-2 mt-2">
            <ShieldCheck className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-800">KYC Documents</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileReadonlyRow label="Profile Image / Logo" url={agentDetails.profileImageUrl} />
            <FileReadonlyRow label="Aadhar Card" url={agentDetails.aadharUrl} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KycStatusApproved;
