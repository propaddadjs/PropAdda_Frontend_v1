// src/pages/PropertyDetailsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
import { api } from "../lib/api"; // use the axios instance with interceptor
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import avatarImg from "../images/avatar.jpg";
// Lucide icons (ensure your lucide-react version exports these)
import {X, User2,
  CheckCircle2,
  ArrowLeft,
  BadgeCheck,
  BedDouble,
  Bath,
  Building2,
  DoorClosed,
  FileText,
  FileDown,
  Heart,
  Images,
  IndianRupee,
  Layers,
  MapPin,
  Phone,
  Maximize2,
  ShieldCheck,
  Star,
  Tag,
  Film,
  ArrowRight,
  Compass,
  CalendarClock,
  History,
  CheckSquare,
  PhoneIcon,
} from "lucide-react";
import Footer from "../components/Footer";
import PropertyAction from "../components/PropertyAction";
import Header from "../components/Header";

/* ===================== Types (match your backend) ===================== */
type MediaResponse = { url?: string; filename?: string; ord?: number };

type OwnerResponse = {
  userId?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
};

type ResidentialPropertyResponse = {
  listingId: number;
  category: string; // "Residential"
  preference?: string; // "sale" | "rent" | "pg"
  propertyType?: string;
  title?: string;
  description?: string;
  price?: number | null;
  maintenance?: number | null;
  area?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  furnishing?: string;
  facing?: string;
  floor?: number | null;
  age?: string;
  availability?: string;
  reraNumber?: string;
  reraVerified?: boolean;
  state?: string;
  city?: string;
  locality?: string;
  address?: string;
  pincode?: number | null;
  nearbyPlace?: string;
  totalFloors?: number | null;
  securityDeposit?: number | null;
  balconies?: number | null;
  powerBackup?: string;
  coveredParking?: number | null;
  openParking?: number | null;
  adminApproved?: string;
  expired?: boolean;
  residentialOwner?: OwnerResponse;
  vip?: boolean;
  sold?: boolean;
  createdAt?: string;
  approvedAt?: string;
  mediaFiles?: MediaResponse[];

  // many boolean amenities (kept loose)
  [key: string]: any;
};

type CommercialPropertyResponse = {
  listingId: number;
  category: string; // "Commercial"
  preference?: string; // "sale" | "rent"
  propertyType?: string;
  title?: string;
  description?: string;
  price?: number | null;
  area?: number | null;
  reraNumber?: string;
  reraVerified?: boolean;
  cabins?: number | null;
  meetingRoom?: boolean;
  washroom?: boolean;
  conferenceRoom?: boolean;
  receptionArea?: boolean;
  lift?: boolean;
  parking?: boolean;
  age?: string;
  availability?: string;
  securityDeposit?: number | null;
  lockIn?: number | null;
  yearlyIncrease?: number | null;
  floor?: number | null;
  totalFloors?: number | null;
  address?: string;
  city?: string;
  state?: string;
  pincode?: number | null;
  locality?: string;
  nearbyPlace?: string;
  adminApproved?: string;
  expired?: boolean;
  commercialOwner?: OwnerResponse;
  vip?: boolean;
  sold?: boolean;
  createdAt?: string;
  approvedAt?: string;
  mediaFiles?: MediaResponse[];

  [key: string]: any;
};

const AMENITY_GROUPS: Array<{ title: string; keys: string[] }> = [
  {
    title: "Property Features",
    keys: [
      "centerCooling","heating","gym","modularKitchen","pool","elevator",
      "storage","laundry","dishwasher","dryer","sauna","powerBackup"
    ],
  },
  {
    title: "Safety & Utilities",
    keys: [
      "fireAlarm","securityFireAlarm","emergencyExit","waterPurifier","gasPipeline",
      "rainWaterHarvesting","maintenanceStaff"
    ],
  },
  {
    title: "Rooms",
    keys: ["poojaRoom","studyRoom","servantRoom","storeRoom"],
  },
  {
    title: "Interior",
    keys: [
      "highCeilingHeight","falseCeilingLighting","internetConnectivity",
      "centrallyAirConditioned","recentlyRenovated","privateGardenTerrace",
      "naturalLight","airyRooms","intercomFacility","spaciousInteriors"
    ],
  },
  {
    title: "Society / Building",
    keys: ["fitnessCenter","swimmingPool","clubhouseCommunityCenter","securityPersonnel","lifts","inGatedSociety"],
  },
  {
    title: "Advantages",
    keys: [
      "closeToMetroStation","closeToSchool","closeToHospital","closeToMarket",
      "closeToRailwayStation","closeToAirport","closeToMall","closeToHighway"
    ],
  },
  {
    title: "Water",
    keys: ["municipalCorporation","borewellTank","water24x7"],
  },
  {
    title: "Overlooking",
    keys: ["overlookingPool","overlookingParkGarden","overlookingClub","overlookingMainRoad"],
  },
  {
    title: "Other",
    keys: [
      "petFriendly","petFriendlySociety","cornerProperty","wheelchairFriendly",
      "lowDensitySociety","bankAttachedProperty","separateEntryForServantRoom","noOpenDrainageAround",
    ],
  },
];


type AnyDetails =
  | (ResidentialPropertyResponse & { _kind: "Residential" })
  | (CommercialPropertyResponse & { _kind: "Commercial" });

/* ===================== Config ===================== */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

/* ===================== Helpers ===================== */
const currency = (n?: number | null) =>
  typeof n === "number" ? n.toLocaleString("en-IN") : "—";

const toUiPreference = (pref?: string) => {
  const p = (pref ?? "").toLowerCase();
  if (!p) return "";
  if (p === "sale") return "Buy";
  if (p === "rent") return "Rent";
  if (p === "pg") return "PG";
  return pref!;
};

const isImageUrl = (url?: string) => {
  if (!url) return false;
  const b = url.split("?")[0].toLowerCase();
  return b.endsWith(".jpg") || b.endsWith(".jpeg") || b.endsWith(".png") || b.endsWith(".webp");
};
const isVideoUrl = (url?: string) => {
  if (!url) return false;
  const b = url.split("?")[0].toLowerCase();
  return b.endsWith(".mp4") || b.endsWith(".webm") || b.endsWith(".ogg");
};
const isPdf = (url?: string, filename?: string) => {
  const s = (filename || url || "").toLowerCase().split("?")[0];
  return s.endsWith(".pdf");
};

const pretty = (s: string) =>
  s
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());

/** From admin: ord semantics
 *  ord >= 1 => images (and possibly videos) in order, primary image ord=1
 *  ord = 0  => video
 *  ord = -1 => brochure/pdf
 */
function splitMedia(arr?: MediaResponse[]) {
  const media = [...(arr ?? [])];
  const images = media
    .filter((m) => (m.ord ?? -999) >= 1 && isImageUrl(m.url))
    .sort((a, b) => (a.ord ?? 999) - (b.ord ?? 999));
  const video = media.find((m) => m.ord === 0 && isVideoUrl(m.url));
  const brochure = media.find((m) => m.ord === -1 && (isPdf(m.url, m.filename)));
  return { images, video, brochure };
}

function booleanAmenityKeys(obj: Record<string, any>): string[] {
  const skip = new Set([
    "vip",
    "reraVerified",
    "expired",
    "sold",
    "adminApproved",
    "mediaFiles",
    "media",
    "residentialOwner",
    "commercialOwner",
  ]);
  return Object.keys(obj).filter((k) => typeof obj[k] === "boolean" && !skip.has(k));
}

const labelize = (s: string) =>
  s
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^\w/, (m) => m.toUpperCase())
    .trim();

/* ===================== Page ===================== */
const PropertyDetailsPage: React.FC = () => {
  const { category, listingId } = useParams<{ category?: string; listingId?: string }>();
  const navigate = useNavigate();
  
  const [data, setData] = useState<AnyDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [shortlisted, setShortlisted] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showNotLoggedInModal, setShowNotLoggedInModal] = useState(false);
  const [shortlistLoading, setShortlistLoading] = useState(false);

  // If buyerId is known server-side via session, you might expose an endpoint to fetch it.
  // For now, read from localStorage or similar; replace with your real source.
  // const [buyerId, setBuyerId] = useState<number | null>(null);
  // useEffect(() => {
  //   const val = localStorage.getItem("buyerId");
  //   if (val) setBuyerId(Number(val));
  //   // or fetch("/api/me").then(...) to set id
  // }, []);
  const { user } = useAuth();
  const buyerId = user?.userId ?? null;

  const categoryParam = (category ?? (data as any)?.category) as string;
  const listingIdParam = Number((listingId ?? (data as any)?.listingId) ?? 0);

  const enquiryKey = `enq:${buyerId ?? "anon"}:${categoryParam}:${listingIdParam}`;
  const [enquirySent, setEnquirySent] = useState(false);
  const favKey = `fav:${buyerId ?? "anon"}:${categoryParam}:${listingIdParam}`;

  useEffect(() => {
    // only check when we know who the user is and which listing we’re on
    if (!user || !categoryParam || !listingIdParam) return;

    (async () => {
      try {
        // 2.1 — check favorite
        const favRes = await api.post<boolean>(
          `/buyer/checkFavorite/${encodeURIComponent(categoryParam)}/${listingIdParam}`
        );
        setShortlisted(!!favRes.data);
      } catch (err) {
        // non-fatal
        console.debug("checkFavorite failed:", err);
      }

      try {
        // 2.2 — check enquiry
        // Your endpoint expects a body (EnquiredListingsDetails); send a minimal payload.
        const minimalEnquiry = {
          buyerName: "",
          buyerPhoneNumber: "",
          buyerType: "Individual",
          buyerReason: "Investment",
          buyerReasonDetail: "",
        };
        const enqRes = await api.post<boolean>(
          `/buyer/checkEnquiry/${encodeURIComponent(categoryParam)}/${listingIdParam}`,
          minimalEnquiry
        );
        setEnquirySent(!!enqRes.data);
      } catch (err) {
        console.debug("checkEnquiry failed:", err);
      }
    })();
  }, [user, categoryParam, listingIdParam]);

  useEffect(() => {
    setShortlisted(localStorage.getItem(favKey) === "1");
  }, [favKey]);

  useEffect(() => {
    setEnquirySent(localStorage.getItem(enquiryKey) === "1");
  }, [enquiryKey]);

  type EnquiryPayload = {
    buyerName: string;
    buyerPhoneNumber: string;
    buyerType: "Individual" | "Dealer";
    buyerReason: "Investment" | "Self Use";
    buyerReasonDetail?: string;
    // the backend also stores propertyCategory & propertyId from path; no need in body
  };

  function EnquiryForm({
  onSubmitted,
  onRequireLogin,
  category,
  listingId,
  buyerId,
  alreadySent,
}: {
  onSubmitted?: () => void;
  onRequireLogin?: () => void;
  category: string;
  listingId: number;
  buyerId: number | null;
  alreadySent?: boolean;
}) {
    const [buyerType, setBuyerType] = useState<"Individual" | "Dealer">("Individual");
    const [buyerReason, setBuyerReason] = useState<"Investment" | "Self Use">("Investment");
    const [name, setName] = useState("");
    // const [phoneCC, setPhoneCC] = useState("+91");
    const [phone, setPhone] = useState("");
    const [msg, setMsg] = useState("");
    const [agree, setAgree] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const disabled = alreadySent || !agree || !name.trim() || !phone.trim() || !buyerId || submitting;

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (alreadySent) return;          // hard stop if already sent
    if (disabled) return;
    if (!buyerId) {
      onRequireLogin?.();
      return;
    }
    try {
      setSubmitting(true);
      const payload: EnquiryPayload = {
        buyerName: name.trim(),
        buyerPhoneNumber: phone.trim(),
        buyerType,
        buyerReason,
        buyerReasonDetail: msg,
      };

      await api.post(`/buyer/sendEnquiriesFromBuyer/${category}/${listingId}`, payload);

      // lock the UI in parent
      setEnquirySent(true);
      onSubmitted?.();
      alert("Enquiry sent successfully! Our team will contact you soon.");
    } catch (err: any) {
      // If server returns 409/208 for duplicate, still lock UI
      const status = err?.response?.status;
      if (status === 409 || status === 208) {
        setEnquirySent(true);
        onSubmitted?.();
        return;
      }
      console.error(err);
      alert(err?.response?.data?.message || "Failed to send enquiry.");
    } finally {
      setSubmitting(false);
    }
  };

    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="text-gray-500 text-sm">Send enquiry to Dealer</div>

        {/* You are */}
        <div className="flex items-center gap-6 text-sm">
          <span>You are</span>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="buyerType" checked={buyerType==="Individual"} onChange={() => setBuyerType("Individual")} />
            Individual
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="buyerType" checked={buyerType==="Dealer"} onChange={() => setBuyerType("Dealer")} />
            Dealer
          </label>
        </div>

        {/* Reason */}
        <div className="flex items-center gap-6 text-sm">
          <span>Your reason to buy is</span>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="buyerReason" checked={buyerReason==="Investment"} onChange={() => setBuyerReason("Investment")} />
            Investment
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="buyerReason" checked={buyerReason==="Self Use"} onChange={() => setBuyerReason("Self Use")} />
            Self Use
          </label>
        </div>

        {/* Name / Phone / Message */}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <div className="flex gap-2">
          <span className="inline-flex items-center gap-1 px-3 rounded-l-lg border border-orange-100 bg-orange-50 text-gray-700 text-sm">
            <PhoneIcon className="w-4 h-4 text-orange-600" />
            +91
          </span>
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
        </div>

        <textarea
          rows={5}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="I am interested in this Property."
        />

        {/* Terms */}
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          I agree to the <a className="text-orange-600 hover:underline" href="/terms" target="_blank" rel="noreferrer">Terms &amp; Conditions</a> and <a className="text-orange-600 hover:underline" href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>
        </label>

            <button
              type="submit"
              disabled={disabled}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow ${
                alreadySent
                  ? "bg-gray-300 text-gray-700 cursor-default"
                  : disabled
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }`}
              title={alreadySent ? "You have already sent an enquiry for this property" : undefined}
            >
              <CheckCircle2 className="h-4 w-4" />
              {alreadySent ? "Enquiry sent" : submitting ? "Sending..." : "Send enquiry"}
            </button>

        {!buyerId && (
          <div className="text-xs text-red-600">
            (Buyer is not logged in / buyerId not available.)
          </div>
        )}
      </form>
    );
  }

  function EnquiryModal({
    open,
    onClose,
    children,
  }: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-orange-100 w-full max-w-xl rounded-xl shadow-lg p-6">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 p-1 rounded hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          {children}
        </div>
      </div>
    );
  }

  function InfoModal({
    open,
    onClose,
    title,
    message,
    children,
  }: {
    open: boolean;
    onClose: () => void;
    title: string;
    message: string;
    children?: React.ReactNode;
  }) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-orange-100 w-full max-w-md rounded-xl shadow-lg p-6">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 p-1 rounded hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-700 mb-4">{message}</p>
          {children}
        </div>
      </div>
    );
  }

  const handleShortlist = async () => {
    if (!buyerId) {
      setShowNotLoggedInModal(true);
      return;
    }
    if (shortlisted || shortlistLoading) return;

    try {
      setShortlistLoading(true);
      await api.post(`/buyer/addPropertyToFavoritesForBuyer/${encodeURIComponent(categoryParam)}/${listingIdParam}`);
      setShortlisted(true);
    } catch (e: any) {
      const status = e?.response?.status;
      // If backend returns 409/208 for already-favorited, still lock UI
      if (status === 409 || status === 208) {
        setShortlisted(true);
        return;
      }
      console.error(e);
      alert(e?.response?.data?.message || "Failed to add to favorites.");
    } finally {
      setShortlistLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState<
    "key" | "location" | "specific" | "amenities" | "dealer"
  >("key");

  useEffect(() => {
    let on = true;
    (async () => {
      if (!category || !listingId) return;
      setLoading(true);
      setErr(null);
      try {
        // const { data } = await axios.get<ResidentialPropertyResponse | CommercialPropertyResponse>(
        //   `${API_BASE_URL}/user/getPropertyDetails/${category}/${listingId}`,
        //   { withCredentials: true }
        // );
        const { data } = await api.get<ResidentialPropertyResponse | CommercialPropertyResponse>(
        `/user/getPropertyDetails/${category}/${listingId}`
        );
        if (!on) return;
        const kind = (data.category || category).toLowerCase().includes("com") ? "Commercial" : "Residential";
        setData({ ...(data as any), _kind: kind as "Residential" | "Commercial" });
      } catch (e: any) {
        if (!on) return;
        setErr(e?.response?.data?.message || e?.message || "Failed to load property.");
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => { on = false; };
  }, [category, listingId]);

  const mapsUrl = useMemo(() => {
    if (!data) return null;
    const parts = [data.address, data.locality, data.city, data.state]
      .filter(Boolean)
      .join(", ");
    if (!parts) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts)}`;
  }, [data]);

  // --- Derived ---
  const safeMedia = (data?.mediaFiles ?? []) as MediaResponse[];
  const { images, video, brochure } = useMemo(() => splitMedia(safeMedia), [safeMedia]);

  const slides = useMemo(() => {
    const s: { type: "image" | "video"; url: string; filename?: string }[] = [];
    images.forEach((img) => img.url && s.push({ type: "image", url: img.url!, filename: img.filename }));
    if (video?.url) s.push({ type: "video", url: video.url!, filename: video.filename });
    return s;
  }, [images, video]);

  const owner: OwnerResponse | undefined = useMemo(() => {
    if (!data) return undefined;
    return data._kind === "Residential" ? data.residentialOwner : data.commercialOwner;
  }, [data]);

  const amenityKeys = useMemo(
    () => (data ? booleanAmenityKeys(data as any) : []),
    [data]
  );

  const headerLocality = useMemo(() => {
    if (!data) return "";
    return [data.locality, data.city, data.state].filter(Boolean).join(" • ");
  }, [data]);

  const uiPref = toUiPreference(data?.preference);
  const priceLabel = data?.price != null ? `₹ ${currency(data?.price)}` : "Price on request";

  // --- Early returns ---
  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-gray-600 flex items-center gap-2">
        <Images className="h-4 w-4 animate-pulse" />
        Loading…
      </div>
    );
  }
  if (err) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{err}</div>
      </div>
    );
  }
  if (!data) return null;

  const isResidential = data._kind === "Residential";

  

  return (
    <div className="min-h-screen bg-orange-50">
      {/* ===================== Header ===================== */}
      <Header />
      <div className="border-b bg-orange-100">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col gap-3">
            {/* Back + price */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-sm text-white font-semibold bg-orange-500 rounded px-3 py-1.5 shadow hover:bg-orange-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="text-right">
                <div className="text-2xl font-bold">{priceLabel}</div>
                <div className="text-xs text-gray-500">{uiPref || "—"}</div>
              </div>
            </div>

            {/* Title + badges */}
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold">{data.title || "Property Details"}</h1>
              <span
                className={[
                  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                  isResidential ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700",
                ].join(" ")}
              >
                <Building2 className="h-3.5 w-3.5 mr-1" />
                {data._kind}
              </span>
              {data.vip && (
                <span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-semibold">
                  <Star className="h-3.5 w-3.5 mr-1" />
                  Featured
                </span>
              )}
              {data.reraVerified && (
                <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2 py-1 text-xs font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                  RERA Verified
                </span>
              )}
            </div>

            {/* Sub info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {data.propertyType && (
                <span className="inline-flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  {data.propertyType}
                </span>
              )}
              {headerLocality && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {headerLocality}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== CTA bar ABOVE carousel ===================== */}
      <div className="mx-auto max-w-6xl px-4 pt-5">
        <div className="rounded-xl border bg-orange-100 p-4 flex flex-col gap-4">
          {/* top row: brochure + shortlist + contact */}
          <div className="flex flex-wrap items-center gap-3">
            {brochure?.url && (
              <a
                href={brochure.url}
                download={brochure.filename ?? "brochure.pdf"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-orange-500 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-orange-600"
              >
                <FileDown className="h-4 w-4" />
                Download Brochure
              </a>
            )}
            {/* <button
              onClick={handleShortlist}
              className={[
                "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold",
                shortlisted
                  ? "border-red-300 bg-red-50 text-red-700"
                  : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50",
              ].join(" ")}
            >
              <Heart className={["h-4 w-4", shortlisted ? "fill-red-600 text-red-600" : ""].join(" ")} />
              {shortlisted ? "Shortlisted" : "Shortlist"}
            </button> */}
            <button
              onClick={handleShortlist}
              disabled={shortlistLoading || shortlisted}
              className={[
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition",
                shortlisted
                  ? "border-red-300 bg-red-50 text-red-700 cursor-default"
                  : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50",
                shortlistLoading ? "opacity-60 cursor-not-allowed" : ""
              ].join(" ")}
              title={shortlisted ? "Already in favorites" : undefined}
            >
              <Heart className={["h-4 w-4", shortlisted ? "fill-red-600 text-red-600" : "text-gray-500"].join(" ")} />
              {shortlisted ? "Shortlisted" : shortlistLoading ? "Adding..." : "Shortlist"}
            </button>

            <button
              onClick={() => {
                if (!buyerId) { setShowNotLoggedInModal(true); return; }
                if (enquirySent) {
                  alert("You’ve already sent an enquiry for this property.");
                  return;
                }
                setShowEnquiryModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
              disabled={enquirySent}
              title={enquirySent ? "Enquiry already sent" : undefined}
            >
              <Phone className="h-4 w-4" />
              {enquirySent ? "Enquiry Sent" : "Contact Dealer"}
            </button>

            {/* counts on the right */}
            <div className="ml-auto flex items-center gap-3 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1">
                <Images className="h-4 w-4" /> {images.length} image(s)
              </span>
              {video && (
                <span className="inline-flex items-center gap-1">
                  <Film className="h-4 w-4" /> 1 video
                </span>
              )}
            </div>
          </div>

          {/* description below actions */}
          {data.description && (
            <div className="rounded-lg border bg-orange-50 p-4">
              <div className="text-sm text-orange-900 font-semibold mb-2 inline-flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* ===================== Media Carousel ===================== */}
      <div className="bg-orange-50 mt-4">
        <div className="mx-auto max-w-6xl">
          {slides.length === 0 ? (
            <div className="w-full h-[420px] flex items-center justify-center text-white/70">
              <Images className="h-5 w-5 mr-2" />
              No media available
            </div>
          ) : (
            <Carousel
              showArrows
              showThumbs
              emulateTouch
              infiniteLoop
              showStatus={false}
              dynamicHeight={false}
              // accept the arg to satisfy types (like in your admin panel)
              renderThumbs={(children) =>
                slides.map((s, i) => {
                  if (s.type === "image") {
                    return <img key={i} src={s.url} alt={s.filename ?? `thumb-${i}`} />;
                  }
                  const poster = images.length ? images[0].url : undefined;
                  if (poster) return <img key={i} src={poster} alt={s.filename ?? `video-thumb-${i}`} />;
                  return (
                    <div
                      key={i}
                      style={{
                        width: 80,
                        height: 50,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#111",
                        color: "#fff",
                        fontSize: 12,
                        borderRadius: 4,
                      }}
                    >
                      VIDEO
                    </div>
                  );
                })
              }
              renderArrowPrev={(onClickHandler, hasPrev, label) =>
                hasPrev && (
                  <button
                    type="button"
                    onClick={onClickHandler}
                    title={label}
                    className="absolute top-1/2 left-4 -translate-y-1/2 z-10 bg-orange-500 text-white rounded-full shadow p-2 hover:scale-105"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                )
              }
              renderArrowNext={(onClickHandler, hasNext, label) =>
                hasNext && (
                  <button
                    type="button"
                    onClick={onClickHandler}
                    title={label}
                    className="absolute top-1/2 right-4 -translate-y-1/2 z-10 bg-orange-500 text-white rounded-full shadow p-2 hover:scale-105"
                  >
                    {/* could rotate ArrowLeft; keeping symmetry with admin code style */}
                    {/* <svg width="20" height="20" viewBox="0 0 24 24" className="fill-none stroke-current"><path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> */}
                    <ArrowRight className="h-5 w-5" />
                  </button>
                )
              }
            >
              {slides.map((s, idx) => (
                <div key={idx} style={{ maxHeight: 560, background: "#000" }}>
                  {s.type === "video" ? (
                    <video controls style={{ width: "100%", maxHeight: 560 }} src={s.url} />
                  ) : (
                    <img
                      src={s.url}
                      alt={s.filename ?? `image-${idx}`}
                      style={{ width: "auto", maxWidth: "100%", maxHeight: 560, objectFit: "contain" }}
                    />
                  )}
                </div>
              ))}
            </Carousel>
          )}
        </div>
      </div>

      {/* ===================== Tabs ===================== */}
      <div className="mx-auto max-w-6xl px-4 pb-12">
        {/* Tab headers */}
        <div className="flex flex-wrap gap-2 border-b mt-6">
          {[
            { id: "key", label: "Basic Details" },
            { id: "location", label: "Location Details" },
            { id: "specific", label: isResidential ? "Residential Details" : "Commercial Details" },
            { id: "amenities", label: "Amenities & Features" },
            { id: "dealer", label: "Dealer Details" },
          ].map((t) => {
            const active = activeTab === (t.id as any);
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={[
                  "px-4 py-2 text-sm font-semibold border-b-2",
                  active
                    ? "border-orange-900 bg-orange-100 text-orange-900"
                    : "border-transparent text-orange-900 hover:text-orange-600",
                ].join(" ")}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="pt-6">
          {/* Key Facts */}
          {activeTab === "key" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InfoCard title="Price" value={priceLabel} icon={<IndianRupee className="h-4 w-4" />} />
              <InfoCard title="Preference" value={uiPref || "—"} icon={<Tag className="h-4 w-4" />} />
              <InfoCard title="Property Type" value={data.propertyType || "—"} icon={<Building2 className="h-4 w-4" />} />
              <InfoCard title="Area" value={typeof data.area === "number" ? `${data.area} sq.ft` : "—"} icon={<Maximize2 className="h-4 w-4" />} />
              {"bedrooms" in data && (
                <InfoCard title="Bedrooms" value={(data as ResidentialPropertyResponse).bedrooms ?? "—"} icon={<BedDouble className="h-4 w-4" />} />
              )}
              {"bathrooms" in data && (
                <InfoCard title="Bathrooms" value={(data as ResidentialPropertyResponse).bathrooms ?? "—"} icon={<Bath className="h-4 w-4" />} />
              )}
              {"floor" in data && (
                <InfoCard title="Floor" value={data.floor ?? "—"} icon={<DoorClosed className="h-4 w-4" />} />
              )}
              {"totalFloors" in data && (
                <InfoCard title="Total Floors" value={data.totalFloors ?? "—"} icon={<Layers className="h-4 w-4" />} />
              )}
              {"facing" in data && (
                <InfoCard title="Facing" value={(data as ResidentialPropertyResponse).facing ?? "—"} icon={<Compass className="h-4 w-4" />} />
              )}
              {"availability" in data && (
                <InfoCard title="Availability" value={data.availability ?? "—"} icon={<CalendarClock className="h-4 w-4" />} />
              )}
              {"age" in data && (
                <InfoCard title="Age" value={data.age ?? "—"} icon={<History className="h-4 w-4" />} />
              )}
              {"reraNumber" in data && (
                <InfoCard title="RERA Number" value={data.reraNumber || "—"} icon={<BadgeCheck className="h-4 w-4" />} />
              )}
            </div>
          )}

          {/* Location */}
          {activeTab === "location" && (
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoCard title="Address" value={data.address || "—"} icon={<MapPin className="h-4 w-4" />} />
              <InfoCard title="Locality" value={data.locality || "—"} icon={<MapPin className="h-4 w-4" />} />
              <InfoCard title="Nearby Place" value={data.nearbyPlace || "—"} icon={<MapPin className="h-4 w-4" />} />
              <InfoCard title="City" value={data.city || "—"} icon={<MapPin className="h-4 w-4" />} />
              <InfoCard title="State" value={data.state || "—"} icon={<MapPin className="h-4 w-4" />} />
              <InfoCard title="Pincode" value={data.pincode ?? "—"} icon={<MapPin className="h-4 w-4" />} />

              {mapsUrl && (
                <div className="sm:col-span-2 flex justify-start mt-2">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-orange-500 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-orange-600"
                  >
                    <MapPin className="h-4 w-4" />
                    Open in Google Maps
                  </a>
                </div>
              )}

            </div>
          )}

          {/* Home/Office details */}
          {activeTab === "specific" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(data).map(([k, v]) => {
                if (
                  [
                    "_kind","listingId","category","preference","propertyType","title","description","price","area",
                    "reraVerified","reraNumber","city","state","locality","address","pincode","nearbyPlace","expired",
                    "vip","sold","adminApproved","createdAt","approvedAt","media","mediaFiles","residentialOwner","commercialOwner",
                  ].includes(k)
                ) return null;
                if (typeof v === "boolean") return null;
                if (v === null || v === undefined) return null;
                return <InfoCard key={k} title={pretty(k)} value={String(v)} icon={<CheckSquare className="h-4 w-4" />} />;
              })}
            </div>
          )}

          {/* Amenities */}
          {/* {activeTab === "amenities" && (
            <div className="rounded-xl border bg-white p-4">
              {amenityKeys.length === 0 ? (
                <div className="text-sm text-gray-600">No amenities listed.</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {amenityKeys.map((k) => (
                    data[k] === true && (
                      <span
                        key={k}
                        className="px-3 py-1 text-xs rounded-full font-medium bg-orange-100 text-orange-700 border border-orange-300 inline-flex items-center gap-1.5"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {pretty(k)}
                      </span>
                    )
                  ))}
                </div>
              )}
            </div>
          )} */}

          {activeTab === "amenities" && (
            <div className="rounded-xl border bg-orange-100 p-4 space-y-6">
              {(() => {
                // Collect all boolean=true keys
                const trueKeys = amenityKeys.filter((k) => data[k] === true);

                if (trueKeys.length === 0) {
                  return <div className="text-sm text-gray-600">No amenities listed.</div>;
                }

                // Build a map for quick lookup
                const set = new Set(trueKeys);

                // Anything true but not in our curated groups → goes to “Miscellaneous”
                const groupedKnown = AMENITY_GROUPS.map((g) => ({
                  title: g.title,
                  items: g.keys.filter((k) => set.has(k)),
                }));
                const knownShown = new Set(groupedKnown.flatMap((g) => g.items));
                const misc = trueKeys.filter((k) => !knownShown.has(k));

                return (
                  <>
                    {groupedKnown
                      .filter((g) => g.items.length > 0)
                      .map((g) => (
                        <AmenitySection key={g.title} title={g.title} items={g.items} />
                      ))}

                    {misc.length > 0 && (
                      <AmenitySection title="Miscellaneous" items={misc} />
                    )}
                  </>
                );
              })()}
            </div>
          )}


          {/* Owner/Dealer */}
          {/* {activeTab === "dealer" && (
            <div className="rounded-xl border bg-white p-4">
              <div className="text-sm text-gray-500 mb-2">Owner / Dealer</div>
              <div className="text-lg font-semibold">
                {(owner?.firstName ?? "") + (owner?.lastName ? ` ${owner.lastName}` : "") || "—"}
              </div>
              <div className="text-sm text-gray-700">{owner?.email || "—"}</div>
              <div className="text-sm text-gray-700">{owner?.phoneNumber || "—"}</div>

              <div className="mt-4">
                <button
                  onClick={() => alert("Contact Dealer flow coming soon")}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-500 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-orange-600"
                >
                  <Phone className="h-4 w-4" />
                  Contact Dealer
                </button>
              </div>
            </div>
          )} */}

          {activeTab === "dealer" && (
            <div className="rounded-xl border bg-orange-50 p-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* LEFT: avatar + name + button */}
                <div className="flex items-center gap-4">
                  <img
                    src={avatarImg}
                    alt="Owner avatar"
                    className="max-w-40 max-h-40 rounded-full object-cover border"
                  />
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">Dealer</div>
                    <div className="text-2xl font-bold">
                      {(owner?.firstName ?? "") + (owner?.lastName ? ` ${owner.lastName}` : "") || "—"}
                    </div>
                    <button
                       onClick={() => {
                        if (buyerId) {
                          setShowEnquiryModal(true);
                        } else {
                          setShowNotLoggedInModal(true);
                        }
                      }}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-orange-500 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-orange-600"
                    >
                      <Phone className="h-4 w-4" />
                      Contact Dealer
                    </button>
                  </div>
                </div>

                {/* RIGHT: the same enquiry form inline */}
                <div className="border bg-orange-100 rounded-lg p-4">
                  <EnquiryForm
                    category={String(categoryParam)}
                    listingId={listingIdParam}
                    buyerId={buyerId}
                    alreadySent={enquirySent}
                    onSubmitted={() => {/* optionally refresh UI */}}
                    onRequireLogin={() => setShowNotLoggedInModal(true)}
                  />
                </div>
              </div>

              {/* Modal version when clicking the button */}
              {/* <EnquiryModal open={showEnquiryModal} onClose={() => setShowEnquiryModal(false)}>
                <div className="flex items-center gap-3 mb-4">
                  <img src={avatarImg} alt="Owner avatar" className="w-10 h-10 rounded-full border" />
                  <div className="font-semibold">
                    {(owner?.firstName ?? "") + (owner?.lastName ? ` ${owner.lastName}` : "") || "—"}
                  </div>
                </div>
                <EnquiryForm
                  category={String(categoryParam)}
                  listingId={listingIdParam}
                  buyerId={buyerId}
                  onSubmitted={() => setShowEnquiryModal(false)}
                />
              </EnquiryModal>
              <InfoModal
                open={showNotLoggedInModal}
                onClose={() => setShowNotLoggedInModal(false)}
                title="You are not logged in"
                message="Log in or Sign up now to send your enquiry and connect with the dealer."
              >
                <a
                  href="/login" // adjust route
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-500 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-orange-600"
                >
                  Log in / Sign up
                </a>
              </InfoModal> */}
            </div>
          )}

          <EnquiryModal open={showEnquiryModal} onClose={() => setShowEnquiryModal(false)}>
            <div className="flex items-center gap-3 mb-4">
              <img src={avatarImg} alt="Owner avatar" className="w-10 h-10 rounded-full border" />
              <div className="font-semibold">
                {(owner?.firstName ?? "") + (owner?.lastName ? ` ${owner.lastName}` : "") || "—"}
              </div>
            </div>
            <EnquiryForm
              category={String(categoryParam)}
              listingId={listingIdParam}
              buyerId={buyerId}
              alreadySent={enquirySent}
              onSubmitted={() => setShowEnquiryModal(false)}
              onRequireLogin={() => { setShowEnquiryModal(false); setShowNotLoggedInModal(true); }}
            />
          </EnquiryModal>

          <InfoModal
            open={showNotLoggedInModal}
            onClose={() => setShowNotLoggedInModal(false)}
            title="You are not logged in"
            message="Log in or Sign up now to send your enquiry and connect with the dealer."
          >
            <a href="/login" className="inline-flex items-center gap-2 rounded-lg bg-orange-500 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-orange-600">
              Log in / Sign up
            </a>
          </InfoModal>

        </div>
      </div>
      <PropertyAction />
      <Footer />
    </div>
  );
};

/* ===================== Small presentational card ===================== */
function InfoCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-orange-100 p-4">
      <div className="text-xs text-orange-900 flex items-center gap-2">
        {icon}
        {title}
      </div>
      <div className="mt-1.5 text-sm font-semibold">{value ?? "—"}</div>
    </div>
  );
}

function AmenitySection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-sm font-bold text-orange-900 mb-2">{title}</div>
      {/* Responsive 2–3 column list with ticks */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {items.map((k) => (
          <li key={k} className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-[2px] text-orange-900 flex-shrink-0" />
            <span className="text-sm font-semibold text-black">{labelize(k)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PropertyDetailsPage;
