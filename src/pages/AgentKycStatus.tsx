import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import {
  User, Mail, Phone, MapPin, Upload, AlertCircle, Clock,
  XCircle, Edit3, Send, CheckCircle, ShieldCheck, ExternalLink, FileText, Image as ImageIcon, UploadCloud, IdCard,
  ChevronRightSquareIcon,
  IdCardLanyardIcon
} from 'lucide-react';
import headerImg from "../images/Banners/KYC-Status.png"
import Header from '../components/Header';
import Footer from '../components/Footer';
import PropertyAction from '../components/PropertyAction';

type KycStatusType = 'PENDING' | 'REJECTED' | 'INAPPLICABLE';

interface AgentResponse {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  state: string;
  city: string;
  address: string;
  role: string;
  profileImageUrl: string;
  agentReraNumber?: string;
  propaddaVerified: boolean;
  aadharUrl?: string;
  kycVerified: KycStatusType;
  kycRejectionReason?: string;
}

const getStatusMeta = (status: Exclude<KycStatusType, 'INAPPLICABLE'>) => {
  switch (status) {
    case 'PENDING':
      return {
        text: 'KYC Registration — Approval Pending',
        icon: <Clock className="w-5 h-5 mr-2" />,
        classes: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-amber-600',
        canEdit: false,
        chip: { text: 'Pending', classes: 'bg-white text-amber-700' },
      };
    case 'REJECTED':
    default:
      return {
        text: 'KYC Registration — Rejected. Please edit and resubmit.',
        icon: <XCircle className="w-5 h-5 mr-2" />,
        classes: 'bg-gradient-to-r from-red-500 to-rose-500 text-white border-rose-600',
        canEdit: true,
        chip: { text: 'Rejected', classes: 'bg-white text-red-700' },
      };
  }
};

// ---- Reusable inputs ----
const InputField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}> = ({ label, name, value, onChange, disabled = false, icon }) => (
  <div> 
    <label htmlFor={name} className="block flex text-sm font-medium text-gray-700 mb-1"><ChevronRightSquareIcon className="text-orange-500 w-4 h-4 mr-1" />{label}</label>
    <div className="relative flex items-center">
      {icon && <div className="pointer-events-none absolute left-3 text-gray-400">{icon}</div>}
      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={[
          'w-full rounded-lg px-3 py-2 border shadow-sm transition focus:outline-none',
          icon ? 'pl-10' : '',
          disabled
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : 'bg-white border-orange-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-400'
        ].join(' ')}
      />
    </div>
  </div>
);

// Textarea version (to match Initiate KYC)
const TextAreaField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  placeholder?: string;
}> = ({ label, name, value, onChange, disabled = false, placeholder }) => (
  <div>
    <label htmlFor={name} className="block flex text-sm font-medium text-gray-700 mb-1"><ChevronRightSquareIcon className="text-orange-500 w-4 h-4 mr-1" />{label}</label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={[
        'w-full rounded-lg px-3 py-2 border shadow-sm transition focus:outline-none',
        disabled
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : 'bg-white border-orange-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-400'
      ].join(' ')}
    />
  </div>
);

// Upload (used only when REJECTED)
const DocumentUploadField: React.FC<{
  label: string;
  name: 'profileImage' | 'aadharCard';
  currentUrl?: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}> = ({ label, name, currentUrl, onFileChange, disabled = false }) => {
  const isUploaded = !!currentUrl && !currentUrl.startsWith('uploaded:');
  const pretty = isUploaded ? 'Uploaded' : (currentUrl?.startsWith('uploaded:') ? currentUrl.replace('uploaded:', 'New: ') : 'No file');

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="file"
          id={`file-${name}`}
          name={name}
          onChange={onFileChange}
          accept={
            name === 'aadharCard'
              ? 'image/*,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              : 'image/*'
          }
          disabled={disabled}
          className="hidden"
        />
        <label
          htmlFor={`file-${name}`}
          className={[
            'flex items-center px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition',
            disabled ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600'
          ].join(' ')}
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploaded ? 'Change File' : 'Upload File'}
        </label>

        <span className={`text-sm ${isUploaded ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
          {pretty}
        </span>
      </div>
    </div>
  );
};

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
              <XCircle className="h-4 w-4" />
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


const AgentKycStatus: React.FC = () => {
  const navigate = useNavigate();

  const [agentDetails, setAgentDetails] = useState<AgentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<AgentResponse>>({});
  // local file state just for UI (no backend change)
const [profileImage, setProfileImage] = useState<File | null>(null);
const [aadhar, setAadhar] = useState<File | null>(null);

// drag & drop helpers (mirror Initiate KYC behavior)
const prevent = (e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

const onDrop =
  (setter: (f: File | null) => void, accept: string[], formKey: "profileImageUrl" | "aadharUrl") =>
  (evt: React.DragEvent<HTMLLabelElement>) => {
    prevent(evt);
    const file = evt.dataTransfer?.files?.[0];
    if (!file) return;

    const ok =
      accept.length === 0 ||
      accept.some((a) => {
        const lower = a.toLowerCase();
        return file.type.toLowerCase().includes(lower.replace(".", "")) ||
               file.name.toLowerCase().endsWith(lower);
      });

    if (!ok) return;
    setter(file);
    // keep existing functionality: only store a marker string (no upload change)
    setFormData((prev) => ({ ...prev, [formKey]: `uploaded:${file.name}` }));
  };

  const fetchAgentDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<AgentResponse>("/user/kycStatus");
      // Redirect immediately if INAPPLICABLE
      if (response.data.kycVerified === 'INAPPLICABLE') {
        navigate("/account/kycInfo", { replace: true });
        return;
      }
      setAgentDetails(response.data);
      setFormData(response.data);
      setIsEditing(response.data.kycVerified === 'REJECTED');
    } catch (e) {
      console.error("Failed to fetch agent details:", e);
      setError("Failed to load agent details. Check API connection.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchAgentDetails(); }, [fetchAgentDetails]);

  // If we've redirected for INAPPLICABLE, render nothing
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header headerImage={headerImg} />
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
        <PropertyAction />
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header headerImage={headerImg} />
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <div className="p-4 rounded-lg border border-red-300 bg-red-100 text-red-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        </div>
        <PropertyAction />
        <Footer />
      </div>
    );
  }

  if (!agentDetails) return null;

  const statusMeta = getStatusMeta(agentDetails.kycVerified as Exclude<KycStatusType, 'INAPPLICABLE'>);
  const isUneditable = !statusMeta.canEdit || !isEditing;
  const isPending = agentDetails.kycVerified === 'PENDING';
  const isRejected = agentDetails.kycVerified === 'REJECTED';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileName = e.target.files?.[0]?.name;
    if (e.target.name === 'profileImage') {
      setFormData(prev => ({ ...prev, profileImageUrl: fileName ? `uploaded:${fileName}` : prev?.profileImageUrl }));
    } else if (e.target.name === 'aadharCard') {
      setFormData(prev => ({ ...prev, aadharUrl: fileName ? `uploaded:${fileName}` : prev?.aadharUrl }));
    }
    if (fileName) alert(`File selected for ${e.target.name}: ${fileName}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const submissionPayload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      state: formData.state,
      city: formData.city,
      address: formData.address,
      profileImageUrl: formData.profileImageUrl,
      aadharUrl: formData.aadharUrl,
    };

    try {
      await api.put("/user/updateKycDetails", submissionPayload);
      alert("Profile/KYC details updated successfully! Status reset to PENDING.");
      setIsEditing(false);
      fetchAgentDetails();
    } catch (submitError) {
      console.error("Submission error:", submitError);
      setError("Failed to update details. Please check form data and connection.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header headerImage={headerImg} />

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <User className="w-7 h-7 text-orange-600" /> KYC Registration
        </h2>

        {/* Status banner */}
        <div className={`p-4 mb-8 rounded-xl shadow-md border ${statusMeta.classes} flex items-center justify-between`}>
          <div className="flex items-center font-semibold">
            {statusMeta.icon}
            <span className="text-base md:text-lg">{statusMeta.text}</span>
          </div>

          <div className="flex items-center gap-2">
            {agentDetails.propaddaVerified && (
              <span className="px-3 py-1 bg-white text-green-700 font-bold rounded-full text-xs md:text-sm inline-flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> VERIFIED SELLER
              </span>
            )}
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusMeta.chip.classes}`}>
              {statusMeta.chip.text}
            </span>
          </div>
        </div>

        {/* Rejection reason */}
        {isRejected && (
          <div className="p-4 mb-6 rounded-lg bg-red-50 text-red-800 border border-red-200">
            <p className="font-semibold mb-1">Reason for Rejection:</p>
            <p className="text-sm">
              {agentDetails.kycRejectionReason || "Details were insufficient or did not match records. Please review and re-upload documents."}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-orange-100 p-6 md:p-8 space-y-6">
          {/* Personal information */}
          <div className="flex items-center gap-2 mb-2">
            <IdCardLanyardIcon className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="First Name"
              name="firstName"
              value={formData.firstName || ''}
              onChange={handleInputChange}
              disabled={isUneditable}
            />
            <InputField
              label="Last Name"
              name="lastName"
              value={formData.lastName || ''}
              onChange={handleInputChange}
              disabled={isUneditable}
            />
            <InputField
              label="Email"
              name="email"
              value={formData.email || ''}
              icon={<Mail className="w-4 h-4" />}
              disabled
            />
            <InputField
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber || ''}
              icon={<Phone className="w-4 h-4" />}
              onChange={handleInputChange}
              disabled={isUneditable}
            />
            <InputField
              label="City"
              name="city"
              value={formData.city || ''}
              icon={<MapPin className="w-4 h-4" />}
              onChange={handleInputChange}
              disabled={isUneditable}
            />
            <InputField
              label="State"
              name="state"
              value={formData.state || ''}
              icon={<MapPin className="w-4 h-4" />}
              onChange={handleInputChange}
              disabled={isUneditable}
            />
            {/* Address as TEXTAREA to match Initiate KYC */}
            <div className="md:col-span-2">
              <TextAreaField
                label="Address"
                name="address"
                value={formData.address || ''}
                onChange={handleTextAreaChange}
                disabled={isUneditable}
                placeholder="Enter your full address (required)"
              />
            </div>
          </div>

          {/* Documents */}
          <div className="flex items-center gap-2 mt-2">
            <ShieldCheck className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-800">KYC Documents</h3>
          </div>

          {/* PENDING → read-only file rows; REJECTED → upload controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isPending ? (
            <>
            <FileReadonlyRow label="Profile Image / Logo" url={agentDetails.profileImageUrl} />
            <FileReadonlyRow label="Aadhar Card" url={agentDetails.aadharUrl} />
            </>
            ) : (
                // REJECTED → exact Initiate KYC UI
                <>
                {/* Profile Image (optional) */}
                <div className="rounded-xl bg-white border border-orange-100 shadow-sm p-5">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-3">
                    <ImageIcon className="h-4 w-4 text-orange-600" />
                    Profile Image <span className="text-gray-400 text-xs font-normal">(optional)</span>
                    </label>

                    <label
                    onDragOver={prevent}
                    onDragEnter={prevent}
                    onDrop={onDrop(setProfileImage, [".png", ".jpg", ".jpeg", "image/"], "profileImageUrl")}
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-orange-200 bg-[#fffaf7] px-4 py-8 text-center hover:border-orange-300 transition"
                    >
                    <UploadCloud className="h-7 w-7 text-orange-600" />
                    <div className="text-sm text-gray-700">
                        Drag & drop or <span className="text-orange-600 font-semibold">browse</span>
                    </div>
                    <div className="text-xs text-gray-500">PNG, JPG, JPEG • Max 10 MB</div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        setProfileImage(f);
                        if (f) setFormData((prev) => ({ ...prev, profileImageUrl: `uploaded:${f.name}` }));
                        handleFileChange(e); // keep your existing behavior
                        }}
                        className="sr-only"
                    />
                    </label>

                    {profileImage && (
                    <div className="mt-3 text-xs text-gray-600">
                        Selected: <span className="font-medium">{profileImage.name}</span>
                    </div>
                    )}
                </div>

                {/* Aadhar (required) */}
                <div className="rounded-xl bg-white border border-orange-100 shadow-sm p-5">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-3">
                    <IdCard className="h-4 w-4 text-orange-600" />
                    Aadhar <span className="text-red-500">*</span>
                    </label>

                    <label
                    onDragOver={prevent}
                    onDragEnter={prevent}
                    onDrop={onDrop(
                      setAadhar,
                      [
                        ".png", ".jpg", ".jpeg", ".heic", ".heif",
                        ".pdf", ".doc", ".docx",
                        "image/",
                        "application/pdf",
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      ],
                      "aadharUrl"
                    )}
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-orange-200 bg-[#fffaf7] px-4 py-8 text-center hover:border-orange-300 transition"
                    >
                    <UploadCloud className="h-7 w-7 text-orange-600" />
                    <div className="text-sm text-gray-700">
                      Drag & drop your Aadhar file or <span className="text-orange-600 font-semibold">browse</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      One file only • Max size 10 MB • Formats: png, jpg, jpeg, heic, heif, pdf, doc, docx
                    </div>
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null; // still single-file only
                        setAadhar(f);
                        if (f) setFormData((prev) => ({ ...prev, aadharUrl: `uploaded:${f.name}` }));
                        handleFileChange(e);
                      }}
                      className="sr-only"
                    />
                    </label>

                    {aadhar && (
                    <div className="mt-3 text-xs text-gray-600">
                        Selected: <span className="font-medium">{aadhar.name}</span>
                    </div>
                    )}
                </div>
                </>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t flex flex-wrap items-center justify-end gap-3">
            {agentDetails.kycVerified !== 'REJECTED' && statusMeta.canEdit && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-5 py-2 border border-orange-400 text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition flex items-center"
              >
                <Edit3 className="w-5 h-5 mr-2" /> Edit Details
              </button>
            )}

            {statusMeta.canEdit && isEditing && (
              <>
                <button
                  type="button"
                  onClick={() => { navigate("/") }}
                  className="px-5 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition disabled:bg-gray-400 flex items-center"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {loading ? 'Submitting...' : 'Resubmit KYC'}
                </button>
              </>
            )}

            {isPending && !statusMeta.canEdit && (
            <span className="text-gray-500 text-sm italic">Details are locked for Admin review.</span>
            )}
          </div>
        </form>
      </div>
      <PropertyAction />
      <Footer />
    </div>
  );
};

export default AgentKycStatus;
