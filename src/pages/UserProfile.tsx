import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { api } from "../lib/api";
import {
  Mail, Phone, MapPin, Edit3, Send, Upload, AlertCircle, Loader2, User as UserIcon, ShieldCheck,
  UserRoundIcon
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PropertyAction from '../components/PropertyAction';

/* ---------------- Types ---------------- */
interface UserResponse {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  state: string;
  city: string;
  role: string;
  profileImageUrl: string;
  // Optional address: include if your backend supports it
  // address?: string;
}

interface StateItem { iso2: string; name: string; }
interface CityItem { name: string; }

/* --------------- External CSC Key --------------- */
const CSC_API_KEY = import.meta.env.VITE_CSC_API_KEY || "ZXBOVkxVdmVaNjhiMHlqQm5PZXpxWmRSanlIUHB4a0hCSHBwNGRFRA==";

/* ---------------- Component ---------------- */
const UserProfile: React.FC = () => {
  const [originalDetails, setOriginalDetails] = useState<UserResponse | null>(null);
  const [formData, setFormData] = useState<Partial<UserResponse>>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // avatar file (new selection)
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const previewUrl = useMemo(() => {
    if (profileFile) return URL.createObjectURL(profileFile);
    // show server image if available
    if (formData.profileImageUrl && !String(formData.profileImageUrl).startsWith('new_upload:')) {
      return formData.profileImageUrl!;
    }
    return "";
  }, [profileFile, formData.profileImageUrl]);

  // --- State/City ---
  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [selectedStateIso2, setSelectedStateIso2] = useState<string>('');
  const [loadingGeo, setLoadingGeo] = useState(false);

  /* -------------- Helpers -------------- */
  const initials = (first?: string, last?: string) => {
    const f = (first || "").trim();
    const l = (last || "").trim();
    const i1 = f ? f[0].toUpperCase() : '';
    const i2 = l ? l[0].toUpperCase() : '';
    return (i1 + i2) || 'U';
  };

  const fetchStates = useCallback(async () => {
    if (!CSC_API_KEY) return;
    setLoadingGeo(true);
    try {
      const res = await axios.get<StateItem[]>(
        "https://api.countrystatecity.in/v1/countries/IN/states",
        { headers: { "X-CSCAPI-KEY": CSC_API_KEY } }
      );
      const list: StateItem[] = (res.data || []).map((s: any) => ({ iso2: s.iso2, name: s.name }));
      list.sort((a, b) => a.name.localeCompare(b.name));
      setStates(list);
    } catch (err) {
      console.error("Failed to load states:", err);
      setError("Failed to load states from external API.");
    } finally {
      setLoadingGeo(false);
    }
  }, []);

  const fetchCities = useCallback(async (iso2: string) => {
    if (!CSC_API_KEY || !iso2) {
      setCities([]);
      return;
    }
    setLoadingGeo(true);
    try {
      const res = await axios.get<any[]>(
        `https://api.countrystatecity.in/v1/countries/IN/states/${iso2}/cities`,
        { headers: { "X-CSCAPI-KEY": CSC_API_KEY } }
      );
      const list: CityItem[] = (res.data || []).map((c: any) => ({ name: c.name }));
      list.sort((a, b) => a.name.localeCompare(b.name));
      setCities(list);
    } catch (err) {
      console.error("Failed to load cities:", err);
      setError("Failed to load cities for selected state.");
      setCities([]);
    } finally {
      setLoadingGeo(false);
    }
  }, []);

  const fetchUserDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<UserResponse>("/user/getUserDetails");
      setOriginalDetails(data);
      setFormData(data);
      // preselect state by ISO (if found)
      const found = states.find(s => s.name === data.state);
      if (found) setSelectedStateIso2(found.iso2);
    } catch (e) {
      console.error("Failed to fetch user details:", e);
      setError("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  }, [states]);

  useEffect(() => { fetchStates(); }, [fetchStates]);
  useEffect(() => { if (states.length > 0 && !originalDetails) fetchUserDetails(); }, [states, originalDetails, fetchUserDetails]);
  useEffect(() => { if (selectedStateIso2) fetchCities(selectedStateIso2); }, [selectedStateIso2, fetchCities]);

  /* -------------- Handlers -------------- */
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setProfileFile(file);
    if (file) {
      // mark that a new file has been chosen (for UI); actual file will be sent via FormData
      setFormData(prev => ({ ...prev, profileImageUrl: `new_upload:${file.name}` }));
      setSuccessMessage(`New image selected: ${file.name}. Click "Save Edits" to upload.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    // Basic validation
    if (!formData.firstName || !formData.phoneNumber || !formData.city || !formData.state) {
      setError("Please fill all required fields (marked with *).");
      setIsSubmitting(false);
      return;
    }

    try {
      // Build multipart/form-data with JSON + file
      const fd = new FormData();
      const userDetailsPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,          // usually read-only
        phoneNumber: formData.phoneNumber,
        state: formData.state,
        city: formData.city,
        // address: formData.address,    // include if applicable
      };

      fd.append(
        "userDetails",
        new Blob([JSON.stringify(userDetailsPayload)], { type: "application/json" })
      );

      if (profileFile) {
        fd.append("profileImage", profileFile);
      }

      await api.put("/user/updateUserDetails", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMessage("Profile updated successfully!");
      setProfileFile(null);
      await fetchUserDetails();
    } catch (submitError) {
      console.error("Profile update failed:", submitError);
      setError("Failed to save edits. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="MANANGE PROFILE" />
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-gray-200 rounded" />
            <div className="h-32 bg-gray-200 rounded" />
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="MANAGE PROFILE" />

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Edit3 className="w-7 h-7 text-orange-600" /> Manage Profile
        </h2>

        {successMessage && (
          <div className="p-4 mb-6 rounded-lg bg-green-50 text-green-800 border border-green-200">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="p-4 mb-6 rounded-lg bg-red-50 text-red-800 border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 md:p-8 space-y-6">
          {/* Profile header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-5 border-b border-orange-100">
            {/* Avatar */}
            <div className="relative">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-orange-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-orange-500 text-white grid place-items-center text-2xl font-semibold ring-4 ring-orange-100 select-none">
                  {initials(formData.firstName, formData.lastName)}
                </div>
              )}
            </div>

            {/* Upload control */}
            <div>
              <label className="block text-sm font-medium italic text-black mb-2 flex items-center gap-2">
                Update Profile Image
              </label>
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
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition bg-orange-500 text-white hover:bg-orange-600"
              >
                <Upload className="w-4 h-4 mr-2" />
                {previewUrl ? "Change Image" : "Upload Image"}
              </label>
              {formData.profileImageUrl?.startsWith('new_upload:') && (
                <div className="mt-2 text-xs text-gray-600">
                  Selected: <span className="font-medium">{formData.profileImageUrl.replace('new_upload:', '')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileInputField
              label="First Name*"
              name="firstName"
              value={formData.firstName || ''}
              onChange={handleInputChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
              icon={<UserIcon className="w-4 h-4 text-gray-400" />}
            />
            <ProfileInputField
              label="Last Name*"
              name="lastName"
              value={formData.lastName || ''}
              onChange={handleInputChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
              icon={<UserIcon className="w-4 h-4 text-gray-400" />}
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
              onChange={handleInputChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
              icon={<Phone className="w-4 h-4 text-gray-400" />}
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
              placeholder={loadingGeo ? 'Loading Cities...' : (!selectedStateIso2 ? 'Select State first' : 'Select City')}
              disabled={loadingGeo || !selectedStateIso2 || cities.length === 0}
              icon={<MapPin className="w-4 h-4 text-gray-400" />}
            />
          </div>

          {/* Save */}
          <div className="pt-4 border-t border-orange-100 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-lg shadow-sm hover:bg-orange-600 transition disabled:bg-gray-400 inline-flex items-center"
            >
              <Send className="w-5 h-5 mr-2" />
              {isSubmitting ? 'Saving…' : 'Save Edits'}
            </button>
          </div>
        </form>
      </div>
      <PropertyAction />
      <Footer />
    </div>
  );
};

/* ---------------- Reusable Inputs ---------------- */
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
        className={`w-full px-3 py-2 border rounded-lg shadow-sm transition
          ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white border-orange-300 focus:border-orange-500 focus:ring-orange-500'}
          ${icon ? 'pl-10' : ''}`}
      />
    </div>
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
        className={`w-full px-3 py-2 border rounded-lg shadow-sm appearance-none pr-10
          ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white border-orange-300 focus:border-orange-500 focus:ring-orange-500'}
          ${icon ? 'pl-10' : ''}`}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {disabled && name === 'city' && (
        <Loader2 className="w-4 h-4 absolute right-3 text-gray-500 animate-spin" />
      )}
    </div>
  </div>
);

export default UserProfile;
