// Author-Hemant Arora
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { api } from "../../lib/api";
import { Mail, Phone, MapPin, Edit3, Send, Briefcase, Upload, AlertCircle, Loader2, Image as ImageIcon, CheckCircle2, User2Icon } from 'lucide-react';

// --- Types ---
interface AgentResponse {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  state: string;
  city: string;
  role: string;
  profileImageUrl: string;
  agentReraNumber?: string;
  propaddaVerified: boolean;
  aadharUrl?: string;
  kycVerified: 'INAPPLICABLE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  address?: string;
}

// Payload your backend expects at @RequestPart("updatedAgentDetails")
// (Adjust fields as per AgentUpdateRequest on server if needed)
interface AgentUpdateRequest {
  firstName: string;
  lastName?: string;
  email?: string;
  phoneNumber: string;
  state: string;
  city: string;
  agentReraNumber?: string;
  address?: string;
   aadharUrl?: string | null;
}

interface StateItem { iso2: string; name: string; }
interface CityItem { name: string; }

const CSC_API_KEY = import.meta.env.VITE_CSC_API_KEY || "ZXBOVkxVdmVaNjhiMHlqQm5PZXpxWmRSanlIUHB4a0hCSHBwNGRFRA==";

const ORANGE = {
  base: 'bg-orange-500',
  baseHover: 'hover:bg-orange-600',
  ring: 'focus:border-orange-500 focus:ring-orange-500',
  text: 'text-orange-600',
  border: 'border-orange-200'
};

const AgentProfile: React.FC = () => {
  const [originalDetails, setOriginalDetails] = useState<AgentResponse | null>(null);
  const [formData, setFormData] = useState<Partial<AgentResponse>>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- State/City API States ---
  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [selectedStateIso2, setSelectedStateIso2] = useState('');
  const [loadingGeo, setLoadingGeo] = useState(false);

  // NEW: local image selection state + preview
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Cleanup created object URLs on unmount/change
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);
  // --- API Handlers ---
  const fetchAgentDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<AgentResponse>("/agent/getAgentDetails");
      setOriginalDetails(data);
      setFormData(data);
      console.log('details', data);

      const foundState = states.find(s => s.name === data.state);
      if (foundState) {
        setSelectedStateIso2(foundState.iso2);
      } else {
        setSelectedStateIso2('');
      }
    } catch (e) {
      console.error("Failed to fetch agent details:", e);
      setError("Failed to load profile details. Check API connection.");
    } finally {
      setLoading(false);
    }
  }, [states]);

  const fetchStates = useCallback(async () => {
    if (!CSC_API_KEY || CSC_API_KEY === "YOUR_CSC_API_KEY_HERE") {
      setError("CSC API key is required to load states. Please set VITE_CSC_API_KEY.");
      return;
    }
    setLoadingGeo(true);
    try {
      const res = await axios.get<StateItem[]>("https://api.countrystatecity.in/v1/countries/IN/states", {
        headers: { "X-CSCAPI-KEY": CSC_API_KEY },
      });
      const stateList: StateItem[] = (res.data || []).map((s: any) => ({ iso2: s.iso2, name: s.name }));
      setStates(stateList);
    } catch (err) {
      console.error("Failed to load states:", err);
      setError("Failed to load states from external API.");
    } finally {
      setLoadingGeo(false);
    }
  }, []);

  const fetchCities = useCallback(async (iso2: string) => {
    if (!CSC_API_KEY || !iso2) { setCities([]); return; }
    setLoadingGeo(true);
    try {
      const res = await axios.get<any[]>(`https://api.countrystatecity.in/v1/countries/IN/states/${iso2}/cities`, {
        headers: { "X-CSCAPI-KEY": CSC_API_KEY }
      });
      const cityList: CityItem[] = (res.data || []).map((c: any) => ({ name: c.name }));
      setCities(cityList);
    } catch (err) {
      console.error("Failed to load cities:", err);
      setError("Failed to load cities for selected state.");
      setCities([]);
    } finally {
      setLoadingGeo(false);
    }
  }, []);

  useEffect(() => { fetchStates(); }, [fetchStates]);

  useEffect(() => { if (states.length > 0 && !originalDetails) { fetchAgentDetails(); } }, [states, originalDetails, fetchAgentDetails]);

  useEffect(() => { if (selectedStateIso2) { fetchCities(selectedStateIso2); } }, [selectedStateIso2, fetchCities]);

  // --- Form Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const iso2 = e.target.value;
    const stateObj = states.find((s) => s.iso2 === iso2);
    const stateName = stateObj ? stateObj.name : "";

    setSelectedStateIso2(iso2);
    setCities([]);
    setFormData(prev => ({ ...prev, state: stateName, city: "" }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityName = e.target.value;
    setFormData(prev => ({ ...prev, city: cityName }));
  };

  // UPDATED: Proper file handling to send MultipartFile
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProfileFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSuccessMessage(`New image selected: ${file.name}. Click 'Save Edits' to upload.`);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    if (!formData.firstName || !formData.phoneNumber || !formData.city || !formData.state) {
      setError("Please fill all required fields (marked with *).");
      setIsSubmitting(false);
      return;
    }

    // Build JSON for updatedAgentDetails
    const payload: AgentUpdateRequest = {
      firstName: formData.firstName!,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber!,
      state: formData.state!,
      city: formData.city!,
      agentReraNumber: formData.agentReraNumber,
      address: formData.address,
      aadharUrl: formData.aadharUrl ?? ''
    };

    // Build multipart/form-data request
    const fd = new FormData();
    fd.append(
      'updatedAgentDetails',
      new Blob([JSON.stringify(payload)], { type: 'application/json' })
    );
    if (profileFile) {
      fd.append('profileImage', profileFile);
    }

    try {
      // IMPORTANT: endpoint expects multipart with @RequestPart
      await api.put("/agent/updateAgentDetails", fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccessMessage('Profile updated successfully!');
      // Refresh details to get latest image URL from server
      await fetchAgentDetails();
      // Clear local preview state after successful upload
      setProfileFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    } catch (submitError) {
      console.error('Profile update failed:', submitError);
      setError('Failed to save edits. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-4 md:p-8 text-center text-gray-500">Loading Profile...</div>;
  }

  // Derived avatar content
  const initials = `${(formData.firstName?.[0] || '').toUpperCase()}${(formData.lastName?.[0] || '').toUpperCase()}` || 'U';
  const showImage = Boolean(previewUrl || (formData.profileImageUrl && formData.profileImageUrl.trim() !== ''));
  const imageSrc = previewUrl || (formData.profileImageUrl || '');

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-3xl font-bold text-gray-800 flex items-center gap-2`}>
          <Edit3 className={`w-7 h-7 ${ORANGE.text}`} /> Manage Profile
        </h2>
        {originalDetails?.propaddaVerified && (
          <span className="inline-flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
            <CheckCircle2 className="w-4 h-4" /> Verified
          </span>
        )}
      </div>

      {successMessage && (
        <div className="p-4 mb-6 rounded-lg bg-green-50 text-green-800 border border-green-200 flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="p-4 mb-6 rounded-lg bg-red-50 text-red-800 border border-red-200 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`bg-white rounded-2xl shadow-lg border ${ORANGE.border} p-6 md:p-8 space-y-6`}>
        {/* Profile Image / Logo */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-gray-100">
          <div className="relative">
            {showImage ? (
              <img
                src={imageSrc}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-orange-100"
              />
            ) : (
              <div className={`w-24 h-24 rounded-full ${ORANGE.base} flex items-center justify-center ring-4 ring-orange-100`}>
                <span className="text-white text-2xl font-semibold">{initials}</span>
              </div>
            )}
            {/* <label htmlFor="profileImageUpload" className={`absolute -bottom-2 -right-2 cursor-pointer inline-flex items-center justify-center w-9 h-9 rounded-full shadow-md ${ORANGE.base} ${ORANGE.baseHover}`}>
              <Upload className="w-4 h-4 text-white" />
            </label> */}
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-700 font-medium italic flex items-center gap-2">
              Update Profile Image
            </p>
            {/* <p className="text-xs text-gray-600 flex items-center gap-2"><ImageIcon className={`w-4 h-4 ${ORANGE.text}`} /> JPG/PNG up to ~5MB.</p>
            {previewUrl && <p className="text-xs text-gray-500">Preview shown; remember to click <span className="font-medium">Save Edits</span>.</p>} */}
            {/* Upload control (explicit button) */}
            <div>
            <input
              type="file"
              id="profileImageUpload"
              name="profileImage"
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
              <label
                htmlFor="profileImageUpload"
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition ${ORANGE.base} text-white ${ORANGE.baseHover}`}
              >
                <Upload className="w-4 h-4 mr-2" />
                {previewUrl ? "Change Image" : "Upload Image"}
              </label>
              {profileFile && (
                <div className="mt-2 text-xs text-gray-600">
                  Selected: <span className="font-medium">{profileFile.name}</span>
          </div>
              )}
            </div>
          </div>
        </div>

        {/* --- Form Inputs --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileInputField
            label="First Name*"
            name="firstName"
            value={formData.firstName || ''}
            onChange={handleInputChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            icon={<User2Icon className="w-4 h-4 text-gray-400" />}
          />
          <ProfileInputField
            label="Last Name*"
            name="lastName"
            value={formData.lastName || ''}
            onChange={handleInputChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            icon={<User2Icon className="w-4 h-4 text-gray-400" />}
          />

          <ProfileInputField
            label="Email*"
            name="email"
            value={formData.email || ''}
            icon={<Mail className="w-4 h-4 text-gray-400" />}
            disabled
          />

          <ProfileInputField
            label="Phone Number*"
            name="phoneNumber"
            value={formData.phoneNumber || ''}
            icon={<Phone className="w-4 h-4 text-gray-400" />}
            onChange={handleInputChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
          />

          <ProfileInputField
            label="RERA Number"
            name="agentReraNumber"
            value={formData.agentReraNumber || ''}
            icon={<Briefcase className="w-4 h-4 text-gray-400" />}
            onChange={handleInputChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
          />

          <ProfileTextareaField
            label="Address*"
            name="address"
            value={formData.address || ''}
            onChange={handleInputChange as (e: React.ChangeEvent<HTMLTextAreaElement>) => void}
          />

          {/* State */}
          <SelectField
            label="State*"
            name="state"
            value={selectedStateIso2 || (formData.state && states.find(s => s.name === formData.state)?.iso2) || ''}
            onChange={handleStateChange}
            options={states.map(s => ({ value: s.iso2, label: s.name }))}
            placeholder={loadingGeo ? 'Loading States...' : 'Select State'}
            disabled={loadingGeo || states.length === 0}
            icon={<MapPin className="w-4 h-4 text-gray-400" />}
          />

          {/* City */}
          <SelectField
            label="City*"
            name="city"
            value={formData.city || ''}
            onChange={handleCityChange}
            options={cities.map(c => ({ value: c.name, label: c.name }))}
            placeholder={loadingGeo ? 'Loading Cities...' : 'Select City'}
            disabled={loadingGeo || !selectedStateIso2 || cities.length === 0}
            icon={<MapPin className="w-4 h-4 text-gray-400" />}
          />
        </div>

        {/* Actions */}
        <div className="pt-6 border-t flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 ${ORANGE.base} text-white font-semibold rounded-xl shadow-md ${ORANGE.baseHover} transition disabled:bg-gray-400 flex items-center`}
          >
            <Send className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Edits'}
          </button>
        </div>
      </form>
    </div>
  );
};

// --- Reusable Components ---
const ProfileInputField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}> = ({ label, name, value, onChange, disabled = false, icon }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-orange-500 mb-1">{label}</label>
    <div className="relative flex items-center">
      {icon && <div className="absolute left-3 text-gray-400">{icon}</div>}
      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-xl shadow-sm ${
          disabled
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : `bg-white border-orange-300 ${ORANGE.ring}`
        } ${icon ? 'pl-10' : ''}`}
      />
    </div>
  </div>
);

const ProfileTextareaField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
}> = ({ label, name, value, onChange, disabled = false }) => (
  <div className="md:col-span-2">
    <label htmlFor={name} className="block text-sm font-medium text-orange-500 mb-1">{label}</label>
    <textarea
      id={name}
      name={name}
      rows={3}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-3 py-2 border rounded-xl shadow-sm resize-none ${
        disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : `bg-white border-orange-300 ${ORANGE.ring}`
      }`}
    />
  </div>
);

const SelectField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  disabled: boolean;
  icon: React.ReactNode;
}> = ({ label, name, value, onChange, options, placeholder, disabled, icon }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-orange-500 mb-1">{label}</label>
    <div className="relative flex items-center">
      {icon && <div className="absolute left-3 text-gray-400 z-10">{icon}</div>}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-xl shadow-sm appearance-none pr-10 ${
          disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : `bg-white border-orange-300 ${ORANGE.ring}`
        } ${icon ? 'pl-10' : ''}`}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {disabled && name === 'city' && (
        <Loader2 className="w-4 h-4 absolute right-3 text-gray-500 animate-spin" />
      )}
    </div>
  </div>
);

export default AgentProfile;
