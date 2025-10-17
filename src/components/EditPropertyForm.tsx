// src/components/EditPropertyForm.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddressSelector from "./AddressSelector";
import MediaUploader, { type SavedMeta } from "./MediaUploader";
import AmenitiesPanel from "./AmenitiesPanel";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  BadgeCheck,
  Bath,
  BatteryCharging,
  BedDouble,
  BookMarked,
  Briefcase,
  Building2,
  CalendarCheck,
  CalendarRange,
  Car,
  CarFront,
  ChevronsUpDown,
  Compass,
  ConciergeBell,
  DoorClosed,
  Edit,
  FileText,
  History,
  Home,
  Images,
  IndianRupee,
  Layers,
  LockIcon,
  MapPin,
  Maximize2,
  PanelsTopLeft,
  Projector,
  RotateCw,
  Shapes,
  Shield,
  SoapDispenserDroplet,
  Sofa,
  TagIcon,
  TrendingUp,
  Users,
  Video,
  Wrench,
} from "lucide-react";
import { api } from "../lib/api";

// ---------- Shared styling (same as create page) ----------
const INPUT_CLASS =
  "w-full bg-white border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-themeOrange/40 focus:border-themeOrange/60 transition-shadow duration-200 shadow-sm";
const SELECT_CLASS = INPUT_CLASS;
const TEXTAREA_CLASS =
  "w-full bg-white border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-themeOrange/40 focus:border-themeOrange/60 transition-shadow duration-200 shadow-sm";
const SOFT_BTN_HOVER = "transition-transform duration-150 hover:-translate-y-0.5";

// ---------- Types ----------
export type PropertyCategory = "Residential" | "Commercial";

export type PropertyFormData = {
  preference: string;
  propertyType: string;
  title: string;
  description: string;
  price: number;
  area: number;
  state: string;
  city: string;
  locality: string;
  address?: string;
  pincode?: number;
  nearbyPlace?: string;
  maintenance?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: "Unfurnished" | "Semi-furnished" | "Fully-furnished";
  facing?: string;
  age?: string;
  availability?: string;
  possessionBy?: string | null;
  floor?: number;
  totalFloors?: number;
  reraNumber?: string;
  balconies?: number;
  powerBackup?: "None" | "Partial" | "Full";
  securityDeposit?: number;
  coveredParking?: number | null;
  openParking?: number | null;
  cabins?: number;
  meetingRoom?: boolean;
  washroom?: boolean;
  conferenceRoom?: boolean;
  receptionArea?: boolean;
  lift?: boolean;
  parking?: boolean;
  lockIn?: number;
  yearlyIncrease?: number;
  commercialOwnerId?: number;
  residentialOwnerId?: number;
  centerCooling?: boolean;
  fireAlarm?: boolean;
  heating?: boolean;
  gym?: boolean;
  modularKitchen?: boolean;
  pool?: boolean;
  elevator?: boolean;
  petFriendly?: boolean;
  storage?: boolean;
  laundry?: boolean;
  dishwasher?: boolean;
  dryer?: boolean;
  sauna?: boolean;
  emergencyExit?: boolean;
  waterPurifier?: boolean;
  gasPipeline?: boolean;
  park?: boolean;
  vastuCompliant?: boolean;
  rainWaterHarvesting?: boolean;
  maintenanceStaff?: boolean;
  poojaRoom?: boolean;
  studyRoom?: boolean;
  servantRoom?: boolean;
  storeRoom?: boolean;
  highCeilingHeight?: boolean;
  falseCeilingLighting?: boolean;
  internetConnectivity?: boolean;
  centrallyAirConditioned?: boolean;
  securityFireAlarm?: boolean;
  recentlyRenovated?: boolean;
  privateGardenTerrace?: boolean;
  naturalLight?: boolean;
  airyRooms?: boolean;
  intercomFacility?: boolean;
  spaciousInteriors?: boolean;
  fitnessCenter?: boolean;
  swimmingPool?: boolean;
  clubhouseCommunityCenter?: boolean;
  securityPersonnel?: boolean;
  lifts?: boolean;
  separateEntryForServantRoom?: boolean;
  noOpenDrainageAround?: boolean;
  bankAttachedProperty?: boolean;
  lowDensitySociety?: boolean;
  municipalCorporation?: boolean;
  borewellTank?: boolean;
  water24x7?: boolean;
  overlookingPool?: boolean;
  overlookingParkGarden?: boolean;
  overlookingClub?: boolean;
  overlookingMainRoad?: boolean;
  inGatedSociety?: boolean;
  cornerProperty?: boolean;
  petFriendlySociety?: boolean;
  wheelchairFriendly?: boolean;
  closeToMetroStation?: boolean;
  closeToSchool?: boolean;
  closeToHospital?: boolean;
  closeToMarket?: boolean;
  closeToRailwayStation?: boolean;
  closeToAirport?: boolean;
  closeToMall?: boolean;
  closeToHighway?: boolean;
};

type FilesPayload = {
  images: File[]; // max 10
  videos: File[]; // max 4
  brochures: File[]; // max 4
};

type ExistingMedia = {
  images: string[];
  videos?: string[];
  brochures?: string[];
};

type SavedMetaState = SavedMeta[];

type EditPropertyFormProps = {
  agentId: number;
  listingId: number;
  category: PropertyCategory;
  initialData: PropertyFormData;
  existingMedia: ExistingMedia;
  apiBase: string;
};

// ---------- Utils ----------
function numberToIndianWords(amount: number): string {
  const units = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const getTwoDigitWords = (num: number): string => {
    if (num < 20) return units[num];
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    return `${tens[ten]}${unit ? " " + units[unit] : ""}`;
  };

  const recurse = (n: number): string => numberToIndianWords(n);

  const parts: string[] = [];
  const crore = Math.floor(amount / 1_00_00_000);
  amount %= 1_00_00_000;
  const lakh = Math.floor(amount / 1_00_000);
  amount %= 1_00_000;
  const thousand = Math.floor(amount / 1_000);
  amount %= 1_000;
  const hundred = Math.floor(amount / 100);
  const remainder = amount % 100;

  if (crore > 0) parts.push(`${recurse(crore)} Crore`);
  if (lakh > 0) parts.push(`${recurse(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${recurse(thousand)} Thousand`);
  if (hundred > 0) parts.push(`${recurse(hundred)} Hundred`);
  if (remainder > 0) parts.push(getTwoDigitWords(remainder));
  return parts.join(" ") || "Zero";
}

// ---------- Component ----------
const EditPropertyForm: React.FC<EditPropertyFormProps> = ({
  agentId,
  listingId,
  category,
  initialData,
  existingMedia,
  apiBase,
}) => {
  const [formData, setFormData] = useState<PropertyFormData>(initialData);
  const navigate = useNavigate();

  const [priceInput, setPriceInput] = useState<string>(() =>
    initialData.price ? `₹ ${initialData.price.toLocaleString("en-IN")}` : ""
  );

  const [totalFloorsInput, setTotalFloorsInput] = useState<string>(String(initialData.totalFloors ?? 0));

  const [replaceMode, setReplaceMode] = useState(false);
  const [, setMediaMeta] = useState<SavedMetaState>([]);
  const [mediaFiles, setMediaFiles] = useState<FilesPayload | null>(null);

  const [savingOpen, setSavingOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saving" | "success" | "error">("saving");
  const [saveMsg, setSaveMsg] = useState("We are saving your property details. Please wait…");

  const isCommercial = category === "Commercial";
  const isSell = (formData.preference || "").toLowerCase() === "sale";
  const isPlot = formData.propertyType === "Plot/Land";
  const showFloorsUI = !isPlot;
  const showAvailability = isSell && !isPlot;
  const showCabins = isCommercial && !isPlot;

  const FURNISHING_OPTIONS = ["Unfurnished", "Semi-furnished", "Fully-furnished"] as const;
  const FACING_OPTIONS = [
    "North",
    "South",
    "East",
    "West",
    "North-East",
    "North-West",
    "South-East",
    "South-West",
  ] as const;
  const AGE_OPTIONS = [
    "0-1 Years",
    "1-3 Years",
    "3-5 Years",
    "5-10 Years",
    "10-15 Years",
    "More than 15 years old",
  ] as const;
  const POSSESSION_OPTIONS = [
    "Within 3 Months",
    "Within 6 Months",
    "By 2026",
    "By 2027",
    "By 2028",
    "By 2029",
    "By 2030",
    "By 2031",
    "By 2032",
  ] as const;

  const onMediaChanged = (meta: SavedMeta[], files?: FilesPayload) => {
    setMediaMeta(meta || []);
    if (files) setMediaFiles(files);
  };

  const getFloorOptions = (totalStr: string) => {
    const total = Math.max(0, Math.min(100, Number(totalStr || 0)));
    const opts: { label: string; value: number }[] = [
      { label: "All", value: -999 },
      { label: "Basement", value: -2 },
      { label: "Lower Ground", value: -1 },
      { label: "Ground", value: 0 },
    ];
    for (let i = 1; i <= total; i++) opts.push({ label: String(i), value: i });
    return opts;
  };

  const increment = (field: "bedrooms" | "bathrooms") =>
    setFormData((p) => ({ ...p, [field]: Math.max(0, (p[field] || 0) + 1) }));
  const decrement = (field: "bedrooms" | "bathrooms") =>
    setFormData((p) => ({ ...p, [field]: Math.max(0, (p[field] || 0) - 1) }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let newValue: string | number | boolean = value;
    if (type === "checkbox") newValue = (e.target as HTMLInputElement).checked;
    else if (type === "number") newValue = Number(value);
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const formatIndian = (digitsOnly: string) => {
    if (!digitsOnly) return "";
    const n = Number(digitsOnly);
    if (Number.isNaN(n)) return "";
    return n.toLocaleString("en-IN");
  };
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    const formatted = digitsOnly ? `₹ ${formatIndian(digitsOnly)}` : "";
    setPriceInput(formatted);
    setFormData((prev) => ({ ...prev, price: digitsOnly ? Number(digitsOnly) : 0 }));
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, area: digits ? Math.max(0, Number(digits)) : 0 }));
  };
  const handleBalconiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, balconies: digits ? Math.max(0, Number(digits)) : 0 }));
  };
  const handleMaintenanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, maintenance: digits ? Number(digits) : 0 }));
  };
  const handleSecurityDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, securityDeposit: digits ? Number(digits) : undefined }));
  };
  const handlePowerBackupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, powerBackup: e.target.value as "None" | "Partial" | "Full" }));
  };

  const handleAddressChange = (changes: {
    state?: string;
    city?: string;
    locality?: string;
    address?: string;
    pincode?: number;
    nearbyPlace?: string;
  }) => setFormData((prev) => ({ ...prev, ...changes }));

  useEffect(() => {
    const total = Number(totalFloorsInput || 0);
    if (showFloorsUI) {
      if (formData.floor !== undefined && (formData.floor as number) > total) {
        setFormData((prev) => ({ ...prev, floor: total }));
      }
      setFormData((prev) => ({ ...prev, totalFloors: Number(totalFloorsInput || 0) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalFloorsInput, showFloorsUI]);

  useEffect(() => {
    if (isSell) {
      setFormData((prev) => ({ ...prev, lockIn: undefined, yearlyIncrease: undefined }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSell]);

  useEffect(() => {
    if (isPlot) {
      setFormData((prev) => ({
        ...prev,
        totalFloors: undefined,
        floor: undefined,
        availability: undefined,
        possessionBy: null,
        cabins: undefined,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlot]);

  const handleStartReplace = async () => {
    if (!confirm("This will remove existing media for this listing so you can upload new files. Continue?")) return;

    const url =
      category === "Commercial"
        ? `/commercial-properties/deleteMedia/${listingId}`
        : `/residential-properties/deleteMedia/${listingId}`;

    try {
      await api.delete(url);
      setReplaceMode(true);
    } catch (e) {
      console.error(e);
      alert("Failed to prepare media replacement. Please try again.");
    }
  };

  const handleCancelReplace = () => {
    setReplaceMode(false);
    setMediaFiles(null);
    setMediaMeta([]);
  };

  const handleSubmit = async () => {
    const missing: string[] = [];
    if (!formData.title?.trim()) missing.push("title");
    if (!formData.description?.trim()) missing.push("description");
    if (!formData.price || formData.price <= 0) missing.push("price");
    if (!formData.area || formData.area <= 0) missing.push("area");
    if (!formData.state?.trim()) missing.push("state");
    if (!formData.city?.trim()) missing.push("city");
    if (!formData.locality?.trim()) missing.push("locality");
    if (!formData.address?.trim()) missing.push("address");
    if (!formData.nearbyPlace?.trim()) missing.push("nearbyPlace");
    if (!formData.pincode || String(formData.pincode).length !== 6) missing.push("pincode");
    if (!isPlot && (formData.totalFloors === undefined || formData.totalFloors === null)) missing.push("totalFloors");

    if (showAvailability && formData.availability === "Under Construction" && !formData.possessionBy) {
      missing.push("possession_by");
    }

    if (missing.length) {
      alert("Please fill required fields: " + missing.join(", "));
      return;
    }

    if (replaceMode) {
      const imgCount = mediaFiles?.images?.length ?? 0;
      const vidCount = mediaFiles?.videos?.length ?? 0;
      const broCount = mediaFiles?.brochures?.length ?? 0;

      if (imgCount > 10) {
        alert("You can upload up to 10 images.");
        return;
      }
      if (vidCount > 4) {
        alert("You can upload up to 4 videos.");
        return;
      }
      if (broCount > 4) {
        alert("You can upload up to 4 brochures.");
        return;
      }
    }

    setSavingOpen(true);
    setSaveStatus("saving");
    setSaveMsg("We are saving your property details. Please wait…");

    const HARD_CODED_USER_ID = 2;

    const payload: PropertyFormData & {
      listingId: number;
      category: PropertyCategory;
    } = {
      listingId,
      category,
      ...formData,
      preference: initialData.preference,
      propertyType: initialData.propertyType,
    };

    if (category.toLowerCase() === "commercial") {
      (payload as any).commercialOwnerId = HARD_CODED_USER_ID;
    } else {
      (payload as any).residentialOwnerId = HARD_CODED_USER_ID;
    }

    const url = category === "Commercial" ? "/commercial-properties/update" : "/residential-properties/update";

    try {
      const form = new FormData();
      const propertyBlob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      form.append("property", propertyBlob);

      if (replaceMode && mediaFiles) {
        for (const vid of mediaFiles.videos ?? []) {
          form.append("files", vid, vid.name);
        }
        for (const img of mediaFiles.images ?? []) {
          form.append("files", img, img.name);
        }
        for (const doc of mediaFiles.brochures ?? []) {
          form.append("files", doc, doc.name);
        }
      }

      const resp = await api.put(url, form, { headers: { Accept: "application/json" } });
      console.log("Update response:", resp.data);
      setSaveStatus("success");
      setSaveMsg("Your property was submitted to Admin for approval.");
      setTimeout(() => {
        navigate("/agent/listings/pending", { replace: true });
      }, 2000);
    } catch (err) {
      console.error("Update error:", err);
      setSaveStatus("error");
      setSaveMsg(`Failed to submit property. Please try again. listing id is ${listingId}`);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 bg-white p-6 sm:p-8 shadow-lg rounded-lg mt-2">
      <div className="flex justify-center">
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-orange-50 to-[#ffe9df] border border-orange-100 p-5">
          <h2 className="text-xl font-bold text-gray-800 flex gap-3">
            <Edit className="w-8 h-8 text-orange-600" /> EDIT PROPERTY
          </h2>
        </div>
      </div>

      {/* Badges: stack on phones, 3 columns on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 bg-orange-50 rounded-xl px-4 py-3 border border-orange-200 text-center sm:text-left">
          {category === "Residential" ? <Home className="w-5 h-5 text-orange-900" /> : <Building2 className="w-5 h-5 text-orange-900" />}
          <div>
            <div className="text-sm text-orange-800 font-medium">Category:</div>
            <div className="text-lg text-orange-900 font-bold capitalize">{category}</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 bg-orange-50 rounded-xl px-4 py-3 border border-orange-200 text-center sm:text-left">
          <Shapes className="w-5 h-5 text-orange-900" />
          <div>
            <div className="text-sm text-orange-800 font-medium">Property Type:</div>
            <div className="text-lg text-orange-900 font-bold">{initialData.propertyType}</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 bg-orange-50 rounded-xl px-4 py-3 border border-orange-200 text-center sm:text-left">
          <TagIcon className="w-5 h-5 text-orange-900" />
          <div>
            <div className="text-sm text-orange-800 font-medium">Preference:</div>
            <div className="text-lg text-orange-900 font-bold">{initialData.preference}</div>
          </div>
        </div>
      </div>

      {/* Title & Description */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex block text-sm font-medium mb-2">
            <BookMarked className="w-4 h-4 text-orange-500 mr-1" />
            Property Name/Title<span className="text-red-500">*</span>
          </label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} className={INPUT_CLASS} placeholder="Enter Title" />
        </div>
        <div>
          <label className="flex block text-sm font-medium mb-2">
            <FileText className="w-4 h-4 text-orange-500 mr-1" />
            Description<span className="text-red-500">*</span>
          </label>
          <textarea name="description" value={formData.description} onChange={handleChange} className={TEXTAREA_CLASS} rows={3} placeholder="Enter Description" />
        </div>
      </div>

      {/* Floors block (stack on phones, side-by-side on md+) */}
      {showFloorsUI && (
        <div className="flex flex-col md:flex-row items-end gap-4 mb-6">
          <div className="flex-1">
            <label className="flex block text-sm font-medium mb-2">
              <Layers className="w-4 h-4 text-orange-500 mr-1" />
              Total Floors<span className="text-red-500">*</span>
            </label>
            <input type="number" min={0} max={500} value={totalFloorsInput} onChange={(e) => setTotalFloorsInput(e.target.value.replace(/\D/g, ""))} className={INPUT_CLASS} placeholder="Enter total floors" />
          </div>
          <div className="flex-1">
            <label className="flex block text-sm font-medium mb-2">
              <DoorClosed className="w-4 h-4 text-orange-500 mr-1" />
              Select Floor
            </label>
            <select name="floor" value={String(formData.floor ?? "")} onChange={(e) => {
              const v = Number(e.target.value);
              setFormData((prev) => ({ ...prev, floor: Number.isNaN(v) ? prev.floor : v }));
            }} className={SELECT_CLASS}>
              {getFloorOptions(totalFloorsInput).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Residential-only quick fields (responsive grids) */}
      {category === "Residential" && (
        <div className="space-y-6 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="flex block text-sm font-medium mb-2">
                <Wrench className="w-4 h-4 text-orange-500 mr-1" />
                Maintenance (₹)
              </label>
              <input
                type="text"
                name="maintenance"
                value={formData.maintenance ?? ""}
                onChange={handleMaintenanceChange}
                className={INPUT_CLASS}
                placeholder="Enter maintenance in Rs"
              />
            </div>
            <div>
              <label className="flex block text-sm font-medium mb-2">
                <BedDouble className="w-4 h-4 text-orange-500 mr-1" />
                Bedrooms<span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => decrement("bedrooms")} className="px-3 py-1 bg-orange-500 text-white rounded">-</button>
                <div className="px-4">{formData.bedrooms ?? 0}</div>
                <button type="button" onClick={() => increment("bedrooms")} className="px-3 py-1 bg-orange-500 text-white rounded">+</button>
              </div>
            </div>
            <div>
              <label className="flex block text-sm font-medium mb-2">
                <Bath className="w-4 h-4 text-orange-500 mr-1" />
                Bathrooms<span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => decrement("bathrooms")} className="px-3 py-1 bg-orange-500 text-white rounded">-</button>
                <div className="px-4">{formData.bathrooms ?? 0}</div>
                <button type="button" onClick={() => increment("bathrooms")} className="px-3 py-1 bg-orange-500 text-white rounded">+</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="flex block text-sm font-medium mb-2">
                <Sofa className="w-4 h-4 text-orange-500 mr-1" />
                Furnishing<span className="text-red-500">*</span>
              </label>
              <select name="furnishing" value={formData.furnishing} onChange={handleChange} className={SELECT_CLASS}>
                {FURNISHING_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex block text-sm font-medium mb-2">
                <Compass className="w-4 h-4 text-orange-500 mr-1" />
                Facing<span className="text-red-500">*</span>
              </label>
              <select name="facing" value={formData.facing} onChange={handleChange} className={SELECT_CLASS}>
                {FACING_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex block text-sm font-medium mb-2">
                <BadgeCheck className="w-4 h-4 text-orange-500 mr-1" />
                RERA Number
              </label>
              <input
                type="text"
                name="reraNumber"
                value={formData.reraNumber ?? ""}
                onChange={handleChange}
                className={INPUT_CLASS}
                placeholder="Enter RERA Number (if any)"
              />
            </div>
          </div>

          {/* --- Balconies + Power Backup in one row, Parking below --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Number of Balconies */}
            <div>
              <label className="flex block text-sm font-medium mb-2">
                <PanelsTopLeft className="w-4 h-4 text-orange-500 mr-1" />
                Number of Balconies
              </label>
              <input
                type="number"
                name="balconies"
                value={formData.balconies ?? 0}
                onChange={handleBalconiesChange}
                className={INPUT_CLASS}
                placeholder="Enter number of balconies"
                min={0}
              />
            </div>

            {/* Power Backup (same row as balconies) */}
            <div>
              <label className="flex block text-sm font-medium mb-2">
                <BatteryCharging className="w-4 h-4 text-orange-500 mr-1" />
                Power Backup
              </label>
              <select
                name="powerBackup"
                value={formData.powerBackup}
                onChange={handlePowerBackupChange}
                className={SELECT_CLASS}
              >
                <option value="None">None</option>
                <option value="Partial">Partial</option>
                <option value="Full">Full</option>
              </select>
            </div>
          </div>

          {/* Reserved Parking (always on its own line beneath) */}
          <div className="mt-4">
            <label className="flex text-sm font-medium mb-2">
              <Car className="w-4 h-4 text-orange-500 mr-1" />
              Reserved Parking <span className="text-sm text-gray-400 ml-1 italic">(Optional)</span>
            </label>

            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-700">Covered Parking</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, coveredParking: Math.max(0, Number(prev.coveredParking ?? 0) - 1) }))}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-orange-300 bg-orange-500 text-white font-bold hover:bg-orange-600"
                  >
                    −
                  </button>
                  <div className="w-8 text-center text-sm">{formData.coveredParking ?? 0}</div>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, coveredParking: Number(prev.coveredParking ?? 0) + 1 }))}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-orange-300 bg-orange-500 text-white font-bold hover:bg-orange-600"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-700">Open Parking</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, openParking: Math.max(0, Number(prev.openParking ?? 0) - 1) }))}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-orange-300 bg-orange-500 text-white font-bold hover:bg-orange-600"
                  >
                    −
                  </button>
                  <div className="w-8 text-center text-sm">{formData.openParking ?? 0}</div>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, openParking: Number(prev.openParking ?? 0) + 1 }))}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-orange-300 bg-orange-500 text-white font-bold hover:bg-orange-600"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Shared: Price, Area, Age, Availability/SecurityDeposit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="flex block text-sm font-medium mb-2">
            <IndianRupee className="w-4 h-4 text-orange-500 mr-1" />
            Price in ₹<span className="text-red-500">*</span>
          </label>
          <input type="text" name="price" value={priceInput} onChange={handlePriceChange} className={INPUT_CLASS} placeholder="₹ Expected Price" />
          <p className="mt-2 text-gray-600 italic">{formData.price > 0 ? `₹ ${formData.price.toLocaleString("en-IN")} (${numberToIndianWords(formData.price)} only)` : ""}</p>
        </div>

        <div>
          <label className="flex block text-sm font-medium mb-2">
            <Maximize2 className="w-4 h-4 text-orange-500 mr-1" />
            Area (sq.ft)<span className="text-red-500">*</span>
          </label>
          <input type="number" name="area" value={formData.area} onChange={handleAreaChange} className={INPUT_CLASS} placeholder="Enter Area" min={0} />
        </div>

        <div>
          <label className="flex block text-sm font-medium mb-2">
            <History className="w-4 h-4 text-orange-500 mr-1" />
            Age<span className="text-red-500">*</span>
          </label>
          <select name="age" value={formData.age} onChange={handleChange} className={SELECT_CLASS}>
            {AGE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          {showAvailability && (
            <>
              <label className="flex block text-sm font-medium mb-2">
                <CalendarCheck className="w-4 h-4 text-orange-500 mr-1" />
                Availability
              </label>
              <select name="availability" value={formData.availability} onChange={handleChange} className={SELECT_CLASS}>
                <option value="Ready to move">Ready to move</option>
                <option value="Under Construction">Under Construction</option>
              </select>
              {formData.availability === "Under Construction" && (
                <div className="mt-3">
                  <label className="flex block text-sm font-medium mb-1">
                    <CalendarRange className="w-4 h-4 text-orange-500 mr-1" />
                    Possession By
                  </label>
                  <select name="possessionBy" value={formData.possessionBy ?? ""} onChange={handleChange} className={SELECT_CLASS}>
                    <option value="">-- Select Possession --</option>
                    {POSSESSION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {!isSell && (
            <div className="mt-3">
              <label className="flex block text-sm font-medium mb-2">
                <Shield className="w-4 h-4 text-orange-500 mr-1" />
                Security Deposit (optional)
              </label>
              <input type="text" name="securityDeposit" value={formData.securityDeposit ?? ""} onChange={handleSecurityDepositChange} className={INPUT_CLASS} placeholder="Enter security deposit (optional)" />
            </div>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-themeOrange" />
          Address<span className="text-red-500">*</span>
        </label>
        <AddressSelector
          stateValue={String(formData.state || "")}
          cityValue={String(formData.city || "")}
          localityValue={String(formData.locality || "")}
          addressValue={String(formData.address || "")}
          pincodeValue={formData.pincode}
          nearbyPlaceValue={String(formData.nearbyPlace || "")}
          onChange={handleAddressChange}
        />
      </div>

      {/* Media */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-3">
          <div className="flex items-center gap-2">
            <Images className="w-4 h-4 text-themeOrange" />
            <h3 className="text-lg font-semibold">Media</h3>
          </div>
          <div className="w-full sm:w-auto">
            {!replaceMode ? (
              <button type="button" onClick={handleStartReplace} className={`w-full sm:w-auto px-3 py-2 rounded bg-gray-100 text-gray-800 hover:bg-gray-200 ${SOFT_BTN_HOVER}`}>
                <span className="inline-flex items-center gap-2">
                  <RotateCw className="w-4 h-4" /> Replace Media
                </span>
              </button>
            ) : (
              <button type="button" onClick={handleCancelReplace} className={`w-full sm:w-auto px-3 py-2 rounded bg-gray-100 text-gray-800 hover:bg-gray-200 ${SOFT_BTN_HOVER}`}>
                Cancel Replace
              </button>
            )}
          </div>
        </div>

        {!replaceMode ? (
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-sm text-gray-700">
              <div className="inline-flex items-center gap-2">
                <Images className="w-4 h-4" />
                <span className="font-medium">Images:</span>
              </div>
              <div className="truncate mt-1 sm:mt-0">{existingMedia.images.length ? existingMedia.images.join(", ") : "—"}</div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-sm text-gray-700">
              <div className="inline-flex items-center gap-2">
                <Video className="w-4 h-4" />
                <span className="font-medium">Video:</span>
              </div>
              <div className="truncate mt-1 sm:mt-0">{(existingMedia.videos && existingMedia.videos.length) ? existingMedia.videos.join(", ") : "—"}</div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-sm text-gray-700">
              <div className="inline-flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="font-medium">Brochure:</span>
              </div>
              <div className="truncate mt-1 sm:mt-0">{(existingMedia.brochures && existingMedia.brochures.length) ? existingMedia.brochures.join(", ") : "—"}</div>
            </div>
          </div>
        ) : (
          <MediaUploader onChanged={onMediaChanged} />
        )}
      </div>

      {/* Commercial-only details */}
      {category === "Commercial" && (
        <div className="space-y-4 mb-8">
          {showCabins && (
            <div>
              <label className="flex block text-sm font-medium mb-2">
                <Briefcase className="w-4 h-4 text-orange-500 mr-1" />
                Cabins
              </label>
              <input type="number" name="cabins" value={formData.cabins ?? 0} onChange={handleChange} className={INPUT_CLASS} min={0} />
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2"><input type="checkbox" name="meetingRoom" checked={formData.meetingRoom || false} onChange={handleChange} className="accent-orange-600" /> Meeting Room <Users className="w-4 h-4 text-orange-500" /></label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" name="conferenceRoom" checked={formData.conferenceRoom || false} onChange={handleChange} className="accent-orange-600" /> Conference Room <Projector className="w-4 h-4 text-orange-500" /></label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" name="receptionArea" checked={formData.receptionArea || false} onChange={handleChange} className="accent-orange-600" /> Reception Area <ConciergeBell className="w-4 h-4 text-orange-500" /></label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" name="washroom" checked={formData.washroom || false} onChange={handleChange} className="accent-orange-600" /> Washroom <SoapDispenserDroplet className="w-4 h-4 text-orange-500" /></label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" name="lift" checked={formData.lift || false} onChange={handleChange} className="accent-orange-600" /> Lift <ChevronsUpDown className="w-4 h-4 text-orange-500" /></label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" name="parking" checked={formData.parking || false} onChange={handleChange} className="accent-orange-600" /> Parking <CarFront className="w-4 h-4 text-orange-500" /></label>
          </div>

          <div>
            <label className="flex block text-sm font-medium mb-2">
              <LockIcon className="w-4 h-4 text-orange-500 mr-1" />
              Lock-in (months)
            </label>
            <input type="number" name="lockIn" value={formData.lockIn ?? 0} onChange={handleChange} disabled={isSell} className={`${INPUT_CLASS} ${isSell ? "opacity-50 cursor-not-allowed" : ""}`} min={0} />
          </div>

          <div>
            <label className="flex block text-sm font-medium mb-2">
              <TrendingUp className="w-4 h-4 text-orange-500 mr-1" />
              Yearly Increase (%)
            </label>
            <input type="number" name="yearlyIncrease" value={formData.yearlyIncrease ?? 0} onChange={handleChange} disabled={isSell} className={`${INPUT_CLASS} ${isSell ? "opacity-50 cursor-not-allowed" : ""}`} min={0} />
          </div>
        </div>
      )}

      {/* Amenities (same component) */}
      {category !== "Commercial" && <AmenitiesPanel formData={formData as any} setFormData={setFormData as any} />}

      {/* Actions */}
      <div className="mt-6">
        <button type="button" onClick={handleSubmit} className={`w-full md:w-auto bg-themeOrange text-white font-bold py-3 px-6 rounded hover:bg-hoverOrange ${SOFT_BTN_HOVER}`}>
          UPDATE PROPERTY
        </button>
      </div>

      {savingOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3">
              {saveStatus === "saving" && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                </div>
              )}
              {saveStatus === "success" && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              )}
              {saveStatus === "error" && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              )}

              <div className="min-w-0">
                <h3 className="text-base font-semibold text-gray-900">
                  {saveStatus === "saving" ? "Saving Property" : saveStatus === "success" ? "Submitted" : "Submission Failed"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{saveMsg}</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              {saveStatus !== "saving" ? (
                <button type="button" onClick={() => setSavingOpen(false)} className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition">
                  Close
                </button>
              ) : (
                <button type="button" disabled className="px-4 py-2 rounded-lg bg-gray-200 text-gray-600 cursor-not-allowed">
                  Please wait…
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPropertyForm;
