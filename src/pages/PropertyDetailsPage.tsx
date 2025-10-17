// src/pages/PropertyDetailsPage.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useAuth } from "../auth/AuthContext";
import { api } from "../lib/api";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import avatarImg from "../images/avatar.jpg";
import NoPropertyFound from "../images/NoPropertyfound.png";
import {
  X,
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
  ArrowUpRightFromSquare,
  Building,
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
  category: string;
  preference?: string;
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
  [key: string]: any;
};

type CommercialPropertyResponse = {
  listingId: number;
  category: string;
  preference?: string;
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
      "centerCooling",
      "heating",
      "gym",
      "modularKitchen",
      "pool",
      "elevator",
      "storage",
      "laundry",
      "dishwasher",
      "dryer",
      "sauna",
      "powerBackup",
    ],
  },
  {
    title: "Safety & Utilities",
    keys: [
      "fireAlarm",
      "securityFireAlarm",
      "emergencyExit",
      "waterPurifier",
      "gasPipeline",
      "rainWaterHarvesting",
      "maintenanceStaff",
    ],
  },
  {
    title: "Rooms",
    keys: ["poojaRoom", "studyRoom", "servantRoom", "storeRoom"],
  },
  {
    title: "Interior",
    keys: [
      "highCeilingHeight",
      "falseCeilingLighting",
      "internetConnectivity",
      "centrallyAirConditioned",
      "recentlyRenovated",
      "privateGardenTerrace",
      "naturalLight",
      "airyRooms",
      "intercomFacility",
      "spaciousInteriors",
    ],
  },
  {
    title: "Society / Building",
    keys: ["fitnessCenter", "swimmingPool", "clubhouseCommunityCenter", "securityPersonnel", "lifts", "inGatedSociety"],
  },
  {
    title: "Advantages",
    keys: [
      "closeToMetroStation",
      "closeToSchool",
      "closeToHospital",
      "closeToMarket",
      "closeToRailwayStation",
      "closeToAirport",
      "closeToMall",
      "closeToHighway",
    ],
  },
  {
    title: "Water",
    keys: ["municipalCorporation", "borewellTank", "water24x7"],
  },
  {
    title: "Overlooking",
    keys: ["overlookingPool", "overlookingParkGarden", "overlookingClub", "overlookingMainRoad"],
  },
  {
    title: "Other",
    keys: [
      "petFriendly",
      "petFriendlySociety",
      "cornerProperty",
      "wheelchairFriendly",
      "lowDensitySociety",
      "bankAttachedProperty",
      "separateEntryForServantRoom",
      "noOpenDrainageAround",
    ],
  },
];

type AnyDetails =
  | (ResidentialPropertyResponse & { _kind: "Residential" })
  | (CommercialPropertyResponse & { _kind: "Commercial" });

/* ===================== Helpers ===================== */
const currency = (n?: number | null) => (typeof n === "number" ? n.toLocaleString("en-IN") : "—");

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

function splitMedia(arr?: MediaResponse[]) {
  const media = [...(arr ?? [])];

  const images = media
    .filter((m) => (m.ord ?? -999) >= 1 && isImageUrl(m.url))
    .sort((a, b) => (a.ord ?? 999) - (b.ord ?? 999));

  const videos = media
    .filter((m) => (m.ord === 0 || isVideoUrl(m.url)) && isVideoUrl(m.url))
    .sort((a, b) => (a.ord ?? 999) - (b.ord ?? 999));

  const brochures = media
    .filter((m) => {
      const name = (m.filename || m.url || "").toLowerCase().split("?")[0];
      const isDoc = name.endsWith(".pdf") || name.endsWith(".doc") || name.endsWith(".docx") || name.endsWith(".pptx") || (m.ord !== undefined && m.ord >= 21);
      return isDoc;
    })
    .sort((a, b) => (a.ord ?? 999) - (b.ord ?? 999));

  return { images, videos, brochures };
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

  const { user } = useAuth();
  const buyerId = user?.userId ?? null;

  const categoryParam = (category ?? (data as any)?.category) as string;
  const listingIdParam = Number((listingId ?? (data as any)?.listingId) ?? 0);

  const enquiryKey = `enq:${buyerId ?? "anon"}:${categoryParam}:${listingIdParam}`;
  const [enquirySent, setEnquirySent] = useState(false);
  const favKey = `fav:${buyerId ?? "anon"}:${categoryParam}:${listingIdParam}`;

  /* ---------------- Derived media arrays (hooks early so order stable) ---------------- */
  const safeMedia = (data?.mediaFiles ?? []) as MediaResponse[];
  const { images, videos, brochures } = useMemo(() => splitMedia(safeMedia), [safeMedia]);

  const slides = useMemo(() => {
    const s: { type: "image" | "video"; url: string; filename?: string }[] = [];
    images.forEach((img) => img.url && s.push({ type: "image", url: img.url!, filename: img.filename }));
    (videos ?? []).forEach((v) => {
      if (v?.url) s.push({ type: "video", url: v.url!, filename: v.filename });
    });
    return s;
  }, [images, videos]);

  /* ---------------- Media handling state & helpers (moved before any return) ---------------- */
  const PLACEHOLDER_IMAGE = NoPropertyFound;
  const [mediaStatus, setMediaStatus] = useState<Record<string, "pending" | "loaded" | "error">>({});

  const markLoaded = useCallback((url?: string) => {
    if (!url) return;
    setMediaStatus((s) => {
      if (s[url] === "loaded") return s;
      return { ...s, [url]: "loaded" };
    });
  }, []);

  const markError = useCallback((url?: string) => {
    if (!url) return;
    setMediaStatus((s) => {
      if (s[url] === "error") return s;
      return { ...s, [url]: "error" };
    });
  }, []);

  // Build slide nodes for Carousel (typed and memoized to satisfy TS)
  // Build slide nodes for Carousel (always render media so load events fire;
  // show an overlay while pending and a placeholder when no media)
  const slideNodes = useMemo<React.ReactNode[]>(() => {
    // No media at all
  if (!slides || slides.length === 0) {
    return [
      <div
        key="no-media"
        className="w-full max-h-[72vh] bg-gray-100 flex flex-col items-center justify-center text-gray-700"
      >
        <img
          src={PLACEHOLDER_IMAGE}
          alt="No media available"
          className="w-48 h-auto mb-3 opacity-80"
        />
      </div>,
    ];
  }

    return slides.map((s, idx) => {
      const url = s.url;
      const status = url ? (mediaStatus[url] ?? "pending") : "pending";

      // media container — always render the media element so browser will attempt to load it
      return (
        <div
          key={idx}
          className="relative w-full flex items-center justify-center bg-orange-100"
          style={{ minHeight: 220, maxHeight: 720 }}
        >
          <div className="w-full">
            {s.type === "video" ? (
              <video
                controls
                className="w-full max-h-[72vh]"
                src={s.url}
                onLoadedData={() => markLoaded(s.url)}
                onError={() => markError(s.url)}
              />
            ) : (
              <img
                src={s.url}
                alt={s.filename ?? `image-${idx}`}
                className="max-h-[72vh] w-full object-contain"
                onLoad={() => markLoaded(s.url)}
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  // avoid infinite error loop
                  el.onerror = null;
                  markError(s.url);
                  // show placeholder image so user sees something
                  if (el.src !== PLACEHOLDER_IMAGE) el.src = PLACEHOLDER_IMAGE;
                }}
              />
            )}
          </div>

          {/* Loading overlay while pending */}
          {status === "pending" && (
            <div className="absolute inset-0 flex items-center justify-center bg-orange-100/90 text-orange-800 text-lg font-medium">
              Loading media...
            </div>
          )}

          {/* If an explicit error state, show a neutral placeholder overlay (optional) */}
          {status === "error" && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100/90 text-gray-700 text-lg font-medium">
              No images available for this property
            </div>
          )}
        </div>
      );
    });
  }, [slides, mediaStatus, markLoaded, markError]);

  /* ---------------- Rest of hooks & effects ---------------- */
  const downloadBrochuresClientZip = async () => {
    if (!brochures || brochures.length === 0) return;

    if (brochures.length === 1) {
      const b = brochures[0];
      window.open(b.url, "_blank");
      return;
    }

    try {
      const zip = new JSZip();
      for (let i = 0; i < brochures.length; i++) {
        const b = brochures[i];
        const filename = b.filename || `brochure-${i + 1}`;
        const res = await fetch(b.url!, { mode: "cors" });
        if (!res.ok) {
          throw new Error(`Failed to fetch ${filename}: ${res.status}`);
        }
        const blob = await res.blob();
        zip.file(filename, blob);
      }
      const contentBlob = await zip.generateAsync({ type: "blob" });
      const safeTitle = (data?.title || "brochures").replace(/[\/\\:*?"<>|]/g, "_");
      saveAs(contentBlob, `${safeTitle}.zip`);
    } catch (err) {
      console.error("Failed to create brochures zip:", err);
      alert("Failed to download brochures. This may be due to CORS or network restrictions. Try downloading brochures individually.");
    }
  };

  useEffect(() => {
    if (!user || !categoryParam || !listingIdParam) return;

    (async () => {
      try {
        const favRes = await api.post<boolean>(`/buyer/checkFavorite/${encodeURIComponent(categoryParam)}/${listingIdParam}`);
        setShortlisted(!!favRes.data);
      } catch (err) {
        console.debug("checkFavorite failed:", err);
      }

      try {
        const minimalEnquiry = {
          buyerName: "",
          buyerPhoneNumber: "",
          buyerType: "Individual",
          buyerReason: "Investment",
          buyerReasonDetail: "",
        };
        const enqRes = await api.post<boolean>(`/buyer/checkEnquiry/${encodeURIComponent(categoryParam)}/${listingIdParam}`, minimalEnquiry);
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
    const [phone, setPhone] = useState("");
    const [msg, setMsg] = useState("");
    const [agree, setAgree] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const disabled = alreadySent || !agree || !name.trim() || !phone.trim() || !buyerId || submitting;

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (alreadySent) return;
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

        setEnquirySent(true);
        onSubmitted?.();
        alert("Enquiry sent successfully! Our team will contact you soon.");
      } catch (err: any) {
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

        <div className="flex items-center gap-6 text-sm">
          <span>You are</span>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="buyerType" checked={buyerType === "Individual"} onChange={() => setBuyerType("Individual")} />
            Individual
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="buyerType" checked={buyerType === "Dealer"} onChange={() => setBuyerType("Dealer")} />
            Dealer
          </label>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <span>Your reason to buy is</span>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="buyerReason" checked={buyerReason === "Investment"} onChange={() => setBuyerReason("Investment")} />
            Investment
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="buyerReason" checked={buyerReason === "Self Use"} onChange={() => setBuyerReason("Self Use")} />
            Self Use
          </label>
        </div>

        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />

        <div className="flex gap-2">
          <span className="inline-flex items-center gap-1 px-3 rounded-l-lg border border-orange-100 bg-orange-50 text-gray-700 text-sm">
            <Phone className="w-4 h-4 text-orange-600" />
            +91
          </span>
          <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="flex-1 border rounded px-3 py-2 text-sm" />
        </div>

        <textarea rows={5} value={msg} onChange={(e) => setMsg(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="I am interested in this Property." />

        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          I agree to the <Link className="text-orange-600 hover:underline" to="/terms" target="_blank" rel="noreferrer">Terms & Conditions</Link> and <Link className="text-orange-600 hover:underline" to="/privacypolicy" target="_blank" rel="noreferrer">Privacy Policy</Link>
        </label>
        <br />
        <button
          type="submit"
          disabled={disabled}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow ${
            alreadySent ? "bg-gray-300 text-gray-700 cursor-default" : disabled ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-orange-500 text-white hover:bg-orange-600"
          }`}
          title={alreadySent ? "You have already sent an enquiry for this property" : undefined}
        >
          <CheckCircle2 className="h-4 w-4" />
          {alreadySent ? "Enquiry sent" : "Send enquiry"}
        </button>

        {!buyerId && <div className="text-xs text-red-600">(Buyer is not logged in / buyerId not available.)</div>}
      </form>
    );
  }

  function EnquiryModal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-orange-100 w-full max-w-xl rounded-xl shadow-lg p-6">
          <button onClick={onClose} className="absolute right-3 top-3 p-1 rounded hover:bg-gray-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
          {children}
        </div>
      </div>
    );
  }

  function InfoModal({ open, onClose, title, message, children }: { open: boolean; onClose: () => void; title: string; message: string; children?: React.ReactNode }) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-orange-100 w-full max-w-md rounded-xl shadow-lg p-6">
          <button onClick={onClose} className="absolute right-3 top-3 p-1 rounded hover:bg-gray-100" aria-label="Close">
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

  const [activeTab, setActiveTab] = useState<"key" | "location" | "specific" | "amenities" | "dealer">("key");

  useEffect(() => {
    let on = true;
    (async () => {
      if (!category || !listingId) return;
      setLoading(true);
      setErr(null);
      try {
        const { data } = await api.get<ResidentialPropertyResponse | CommercialPropertyResponse>(`/user/getPropertyDetails/${category}/${listingId}`);
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
    return () => {
      on = false;
    };
  }, [category, listingId]);

  const mapsUrl = useMemo(() => {
    if (!data) return null;
    const parts = [data.address, data.locality, data.city, data.state].filter(Boolean).join(", ");
    if (!parts) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts)}`;
  }, [data]);

  const owner: OwnerResponse | undefined = useMemo(() => {
    if (!data) return undefined;
    return data._kind === "Residential" ? data.residentialOwner : data.commercialOwner;
  }, [data]);

  const amenityKeys = useMemo(() => (data ? booleanAmenityKeys(data as any) : []), [data]);
  const headerLocality = useMemo(() => {
    if (!data) return "";
    return [data.locality, data.city, data.state].filter(Boolean).join(" • ");
  }, [data]);

  const uiPref = toUiPreference(data?.preference);
  const priceLabel = data?.price != null ? `₹ ${currency(data?.price)}` : "Price on request";

  /* --- Early returns (no hooks after this point) --- */
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

  /* ---------------- Derived values for layout content ---------------- */
  const locationLine = [data.locality, data.city, data.state].filter(Boolean).join(" • ");
  const typeLine = [uiPref || null, data.propertyType || null].filter(Boolean).join(" • ");

  /* ---------------- Render ---------------- */
  return (
    <div className="min-h-screen bg-orange-50">
      <Header />
      <div className="border-b bg-orange-100">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col gap-3">
            {/* Back + price */}
            <div className="flex items-center justify-between gap-4">
              <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-white font-semibold bg-orange-500 rounded px-3 py-1.5 shadow hover:bg-orange-600">
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="text-right">
                <div className="text-2xl font-bold">{priceLabel}</div>
                <Link to="/calculateEMI" target="_blank" rel="noopener noreferrer" className="flex justify-end text-orange-800 font-semibold text-md hover:text-orange-600">
                  <ArrowUpRightFromSquare className="h-5 w-5 mr-1" />
                  Calculate EMI
                </Link>
              </div>
            </div>

            {/* Title + badges */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col items-center md:items-start">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-center md:text-left">
                  {data.title || "Property Details"}
                </h1>

                {/* Tags / badges */}
                <div className="mt-2 flex flex-wrap gap-2 items-center justify-center md:justify-start">
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

                {/* Property preference / type / address — stacked under tags */}
                <div className="mt-2 flex flex-col items-center md:items-start text-center md:text-left space-y-1">
                  <div className="text-sm text-gray-700 flex items-center gap-2">
                  {/* Preference */}
                  {uiPref && (
                    <div className="text-sm text-gray-700 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-orange-800" />
                      <span className="font-medium">{uiPref}</span>
                    </div>
                  )}

                  {/* Property type */}
                  {data.propertyType && (
                    <div className="text-sm text-gray-700 flex items-center gap-2">
                      <Building className="h-4 w-4 text-orange-800" />
                      <span>{data.propertyType}</span>
                    </div>
                  )}
                  </div>

                  {/* Address / locality line */}
                  {headerLocality && (
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-orange-800" />
                      <span>{headerLocality}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sub info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 justify-center md:justify-start"></div>
          </div>
        </div>
      </div>

      {/* CTA bar ABOVE carousel */}
      <div className="mx-auto max-w-6xl px-4 pt-5">
        <div className="rounded-xl border bg-orange-100 p-4 flex flex-col gap-4">
          {/* top row: brochure + shortlist + contact */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
              {brochures && brochures.length > 0 && (
                <button onClick={downloadBrochuresClientZip} className="inline-flex items-center gap-2 rounded-lg bg-orange-500 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-orange-600">
                  <FileDown className="h-4 w-4" />
                  {brochures.length === 1 ? "Download Brochure" : `Download ${brochures.length} Brochures (ZIP)`}
                </button>
              )}

              <button
                onClick={handleShortlist}
                disabled={shortlistLoading || shortlisted}
                className={[
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition",
                  shortlisted ? "border-red-300 bg-red-50 text-red-700 cursor-default" : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50",
                  shortlistLoading ? "opacity-60 cursor-not-allowed" : "",
                ].join(" ")}
                title={shortlisted ? "Already in favorites" : undefined}
              >
                <Heart className={["h-4 w-4", shortlisted ? "fill-red-600 text-red-600" : "text-gray-500"].join(" ")} />
                {shortlisted ? "Shortlisted" : shortlistLoading ? "Adding..." : "Shortlist"}
              </button>

              <button
                onClick={() => {
                  if (!buyerId) {
                    setShowNotLoggedInModal(true);
                    return;
                  }
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
            </div>

            <div className="mt-3 md:mt-0 md:ml-auto flex items-center gap-3 text-sm text-gray-600 justify-center md:justify-end">
              <span className="inline-flex items-center gap-1">
                <Images className="h-4 w-4" /> {images.length} image(s)
              </span>
              {videos && videos.length > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Film className="h-4 w-4" /> {videos.length} video(s)
                </span>
              )}
            </div>
          </div>

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

      {/* Media Carousel */}
      <div className="bg-orange-50 mt-4">
        <div className="mx-auto max-w-6xl">
          <Carousel
            showArrows
            showThumbs
            emulateTouch
            infiniteLoop
            showStatus={false}
            dynamicHeight={false}
            swipeable
            renderThumbs={() =>
              (slides && slides.length ? slides : [{ type: "image", url: PLACEHOLDER_IMAGE }]).map((s, i) => {
                const thumbUrl = s.type === "image" ? s.url : images.length ? images[0].url : PLACEHOLDER_IMAGE;
                return (
                  <img
                    key={i}
                    src={thumbUrl}
                    alt={`thumb-${i}`}
                    onError={(e) => {
                      const el = e.currentTarget as HTMLImageElement;
                      el.onerror = null;
                      el.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                );
              })
            }
            renderArrowPrev={(onClickHandler, hasPrev, label) =>
              hasPrev && (
                <button type="button" onClick={onClickHandler} title={label} className="absolute top-1/2 left-4 -translate-y-1/2 z-10 bg-orange-500 text-white rounded-full shadow p-2 hover:scale-105">
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )
            }
            renderArrowNext={(onClickHandler, hasNext, label) =>
              hasNext && (
                <button type="button" onClick={onClickHandler} title={label} className="absolute top-1/2 right-4 -translate-y-1/2 z-10 bg-orange-500 text-white rounded-full shadow p-2 hover:scale-105">
                  <ArrowRight className="h-5 w-5" />
                </button>
              )
            }
          >
            {slideNodes}
          </Carousel>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-auto max-w-6xl px-4 pb-12">
        <div className="mt-6 overflow-x-auto">
          <div className="inline-flex gap-2 border-b">
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
                    "px-4 py-2 text-sm font-semibold border-b-2 whitespace-nowrap",
                    active ? "border-orange-900 bg-orange-100 text-orange-900" : "border-transparent text-orange-900 hover:text-orange-600",
                  ].join(" ")}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-6">
          {activeTab === "key" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InfoCard title="Price" value={priceLabel} icon={<IndianRupee className="h-4 w-4" />} />
              <InfoCard title="Preference" value={uiPref || "—"} icon={<Tag className="h-4 w-4" />} />
              <InfoCard title="Property Type" value={data.propertyType || "—"} icon={<Building2 className="h-4 w-4" />} />
              <InfoCard title="Area" value={typeof data.area === "number" ? `${data.area} sq.ft` : "—"} icon={<Maximize2 className="h-4 w-4" />} />
              {"bedrooms" in data && <InfoCard title="Bedrooms" value={(data as ResidentialPropertyResponse).bedrooms ?? "—"} icon={<BedDouble className="h-4 w-4" />} />}
              {"bathrooms" in data && <InfoCard title="Bathrooms" value={(data as ResidentialPropertyResponse).bathrooms ?? "—"} icon={<Bath className="h-4 w-4" />} />}
              {"floor" in data && <InfoCard title="Floor" value={data.floor ?? "—"} icon={<DoorClosed className="h-4 w-4" />} />}
              {"totalFloors" in data && <InfoCard title="Total Floors" value={data.totalFloors ?? "—"} icon={<Layers className="h-4 w-4" />} />}
              {"facing" in data && <InfoCard title="Facing" value={(data as ResidentialPropertyResponse).facing ?? "—"} icon={<Compass className="h-4 w-4" />} />}
              {"availability" in data && <InfoCard title="Availability" value={data.availability ?? "—"} icon={<CalendarClock className="h-4 w-4" />} />}
              {"age" in data && <InfoCard title="Age" value={data.age ?? "—"} icon={<History className="h-4 w-4" />} />}
              {"reraNumber" in data && <InfoCard title="RERA Number" value={data.reraNumber || "—"} icon={<BadgeCheck className="h-4 w-4" />} />}
            </div>
          )}

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
                  <a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-orange-500 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-orange-600">
                    <MapPin className="h-4 w-4" />
                    Open in Google Maps
                  </a>
                </div>
              )}
            </div>
          )}

          {activeTab === "specific" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(data).map(([k, v]) => {
                if (
                  [
                    "_kind",
                    "listingId",
                    "category",
                    "preference",
                    "propertyType",
                    "title",
                    "description",
                    "price",
                    "area",
                    "reraVerified",
                    "reraNumber",
                    "city",
                    "state",
                    "locality",
                    "address",
                    "pincode",
                    "nearbyPlace",
                    "expired",
                    "vip",
                    "sold",
                    "adminApproved",
                    "createdAt",
                    "approvedAt",
                    "media",
                    "mediaFiles",
                    "residentialOwner",
                    "commercialOwner",
                  ].includes(k)
                )
                  return null;
                if (typeof v === "boolean") return null;
                if (v === null || v === undefined) return null;
                return <InfoCard key={k} title={pretty(k)} value={String(v)} icon={<CheckSquare className="h-4 w-4" />} />;
              })}
            </div>
          )}

          {activeTab === "amenities" && (
            <div className="rounded-xl border bg-orange-100 p-4 space-y-6">
              {(() => {
                const trueKeys = amenityKeys.filter((k) => data[k] === true);
                if (trueKeys.length === 0) {
                  return <div className="text-sm text-gray-600">No amenities listed.</div>;
                }
                const set = new Set(trueKeys);
                const groupedKnown = AMENITY_GROUPS.map((g) => ({ title: g.title, items: g.keys.filter((k) => set.has(k)) }));
                const knownShown = new Set(groupedKnown.flatMap((g) => g.items));
                const misc = trueKeys.filter((k) => !knownShown.has(k));
                return (
                  <>
                    {groupedKnown.filter((g) => g.items.length > 0).map((g) => <AmenitySection key={g.title} title={g.title} items={g.items} />)}
                    {misc.length > 0 && <AmenitySection title="Miscellaneous" items={misc} />}
                  </>
                );
              })()}
            </div>
          )}

          {activeTab === "dealer" && (
            <div className="rounded-xl border bg-orange-50 p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <img src={avatarImg} alt="Owner avatar" className="max-w-40 max-h-40 rounded-full object-cover border" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">Dealer</div>
                    <div className="text-2xl font-bold">{(owner?.firstName ?? "") + (owner?.lastName ? ` ${owner.lastName}` : "") || "—"}</div>
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

                <div className="border bg-orange-100 rounded-lg p-4">
                  <EnquiryForm category={String(categoryParam)} listingId={listingIdParam} buyerId={buyerId} alreadySent={enquirySent} onSubmitted={() => {}} onRequireLogin={() => setShowNotLoggedInModal(true)} />
                </div>
              </div>
            </div>
          )}

          <EnquiryModal open={showEnquiryModal} onClose={() => setShowEnquiryModal(false)}>
            <div className="flex items-center gap-3 mb-4">
              <img src={avatarImg} alt="Owner avatar" className="w-10 h-10 rounded-full border" />
              <div className="font-semibold">{(owner?.firstName ?? "") + (owner?.lastName ? ` ${owner.lastName}` : "") || "—"}</div>
            </div>
            <EnquiryForm category={String(categoryParam)} listingId={listingIdParam} buyerId={buyerId} alreadySent={enquirySent} onSubmitted={() => setShowEnquiryModal(false)} onRequireLogin={() => { setShowEnquiryModal(false); setShowNotLoggedInModal(true); }} />
          </EnquiryModal>

          <InfoModal open={showNotLoggedInModal} onClose={() => setShowNotLoggedInModal(false)} title="You are not logged in" message="Log in or Sign up now to send your enquiry and connect with the dealer.">
            <a href="/login" className="inline-flex items-center gap-2 rounded-lg bg-orange-500 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-orange-600">Log in / Sign up</a>
          </InfoModal>
        </div>
      </div>

      <PropertyAction />
      <Footer />
    </div>
  );
};

/* ===================== Small presentational card ===================== */
function InfoCard({ title, value, icon }: { title: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-orange-100 p-4">
      <div className="text-xs text-orange-900 flex items-center gap-2">{icon} {title}</div>
      <div className="mt-1.5 text-sm font-semibold">{value ?? "—"}</div>
    </div>
  );
}

function AmenitySection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-sm font-bold text-orange-900 mb-2">{title}</div>
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
