// (entire file — updated per your requests)
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import {
  Home,
  IndianRupee,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  Clock,
  User,
  ExternalLink,
  TimerOff,
  RefreshCw,
  Image,
  CheckSquare,
  CheckCircle as CheckCircleIcon,
  X,
  Maximize2,
  ActivitySquare,
  Drone,
  UserCheck2,
} from "lucide-react";

/* ---------------- Types ---------------- */
type AgentMetrics = {
  totalPropertiesListed: number;
  activeProperties: number;
  totalPropertiesPendingApproval: number;
  totalPropertiesSold: number;
};

type AgentDetails = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  state: string;
  city: string;
  role: string;
  profileImageUrl?: string;
  propaddaVerified: boolean;
  kycVerified: "PENDING" | "VERIFIED" | "REJECTED";
};

type MediaResponse = { filename?: string; ord?: number; url: string };
type PropertyResponse = {
  listingId: number;
  category: "Residential" | "Commercial";
  preference?: string;
  propertyType?: string;
  title?: string;
  city?: string;
  locality?: string;
  price?: number;
  area?: number;
  vip?: boolean;
  media?: MediaResponse[];
  mediaFiles?: MediaResponse[];
  expired?: boolean;
};
type AgentAllPropertiesResponse = {
  Commercial: PropertyResponse[];
  Residential: PropertyResponse[];
};

type NormProp = {
  listingId: number;
  category: "Residential" | "Commercial";
  title?: string;
  description?: string;
  price?: number;
  area?: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  cabins?: number | null;
  meetingRoom?: boolean | null;
  locality?: string;
  city?: string;
  state?: string;
  mediaFiles?: MediaResponse[];
  propertyType?: string | null;
  preference?: string | null;
};

/* ---------------- Helpers / UI components ---------------- */
const formatNum = (n?: number) => (typeof n === "number" ? n.toLocaleString("en-IN") : "—");

const Shimmer: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-gray-100 rounded ${className || ""}`} />
);

const StatCard: React.FC<{
  title: string;
  value?: number;
  icon: React.ReactNode;
  loading?: boolean;
  accent?: string;
}> = ({ title, value, icon, loading, accent = "from-orange-50 to-amber-50" }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:translate-y-0.5 transition duration-150">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <div className="p-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 border border-gray-200">{icon}</div>
        <div className="min-w-0">
          <div className="text-xs text-gray-500 truncate">{title}</div>
          {loading ? <Shimmer className="h-6 w-20 mt-2" /> : <div className="text-2xl font-semibold mt-1">{formatNum(value)}</div>}
        </div>
      </div>
    </div>
  );
};

const QuickActionButton: React.FC<{
  to?: string;
  onClick?: () => void;
  label: string;
  icon: React.ReactNode;
  accent?: string;
}> = ({ to, onClick, label, icon, accent = "from-orange-50 to-blue-50" }) => {
  const content = (
    <div className="relative overflow-hidden flex flex-col items-start justify-center p-4 text-sm font-medium rounded-2xl bg-white border-2 border-gray-100 shadow-sm text-gray-700 hover:border-orange-500 hover:bg-orange-100 transition duration-200 text-left hover:-translate-y-0.5 h-full">
      <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${accent} opacity-0 hover:opacity-100 transition`} />
      <div className="p-3 rounded-full bg-gray-50 border border-gray-200 transition group-hover:bg-orange-100">{icon}</div>
      <span className="mt-3 text-sm font-semibold">{label}</span>
    </div>
  );

  if (to) return <Link to={to} className="block w-full h-full">{content}</Link>;
  return <button onClick={onClick} className="w-full h-full">{content}</button>;
};

/* Renewal item used in dashboard preview */
const RenewalItem: React.FC<{ p: PropertyResponse }> = ({ p }) => {
  const title = p.title || p.propertyType || "Untitled";
  const location = [p.locality, p.city].filter(Boolean).join(", ");
  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-md transition duration-150">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate" title={title}>
          {title}
        </p>
        <p className="text-xs text-gray-500 truncate flex items-center gap-1" title={location}>
          <MapPin className="w-3 h-3 text-gray-400" /> {location || "—"}
        </p>
      </div>
      <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
        <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-red-600 text-white">
          <TimerOff className="w-3 h-3" /> Expired
        </span>
        <Link to="/agent/listings/expired" className="flex items-center text-themeOrange hover:text-orange-700 transition duration-150 text-sm font-medium">
          <RefreshCw className="w-4 h-4 mr-1" /> Renew
        </Link>
      </div>
    </div>
  );
};

/* ---------------- Main Component ---------------- */
const AgentDashboard: React.FC = () => {
  const [details, setDetails] = useState<AgentDetails | null>(null);
  const [metrics, setMetrics] = useState<AgentMetrics>({} as AgentMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expiredPreview, setExpiredPreview] = useState<PropertyResponse[]>([]);
  const [loadingExpired, setLoadingExpired] = useState<boolean>(true);
  const [errorExpired, setErrorExpired] = useState<string | null>(null);

  /* modal state */
  const [reqModalOpen, setReqModalOpen] = useState(false);
  const [reqType, setReqType] = useState<"graphics" | "photoshoot" | null>(null);
  const [propsLoading, setPropsLoading] = useState(false);
  const [propsError, setPropsError] = useState<string | null>(null);
  const [propsList, setPropsList] = useState<NormProp[]>([]);
  const [selectedProps, setSelectedProps] = useState<Record<number, boolean>>({});
  const [sending, setSending] = useState(false);

  // Utility function to convert a string to PascalCase
  const toPascalCase = (str: string): string => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(/[\s_-]+/)
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: detailsRespData } = await api.get<AgentDetails>("/agent/getAgentDetails");
        const { data: metricsRespData } = await api.get<AgentMetrics>("/agent/getAgentDashboardMetrics");
        setDetails(detailsRespData);
        setMetrics(metricsRespData ?? ({} as AgentMetrics));
      } catch (e) {
        console.error("Failed to load agent dashboard data:", e);
        setError("Failed to load dashboard data. Check API endpoints.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadExpired = async () => {
      setLoadingExpired(true);
      setErrorExpired(null);
      try {
        const { data } = await api.get<AgentAllPropertiesResponse>("/agent/expiredPropertiesByAgent");
        const commercial = Array.isArray(data?.Commercial) ? data.Commercial : [];
        const residential = Array.isArray(data?.Residential) ? data.Residential : [];
        const merged = [...commercial, ...residential];
        merged.sort((a, b) => (b.listingId ?? 0) - (a.listingId ?? 0));
        if (mounted) setExpiredPreview(merged.slice(0, 3));
      } catch (e) {
        console.error("Failed to load expired previews:", e);
        if (mounted) setErrorExpired("Could not load expired listings right now.");
      } finally {
        if (mounted) setLoadingExpired(false);
      }
    };
    loadExpired();
    return () => {
      mounted = false;
    };
  }, []);

  const { totalPropertiesListed, activeProperties, totalPropertiesPendingApproval, totalPropertiesSold } = metrics;

  const statCards = useMemo(
    () => [
      { title: "Total Properties Sold", value: totalPropertiesSold, icon: <IndianRupee className="w-5 h-5 text-green-600" />, accent: "from-green-500 to-emerald-300" },
      { title: "Total Properties Posted", value: totalPropertiesListed, icon: <Home className="w-5 h-5 text-blue-600" />, accent: "from-blue-500 to-sky-300" },
      { title: "Active Listings", value: activeProperties, icon: <TrendingUp className="w-5 h-5 text-orange-600" />, accent: "from-orange-500 to-amber-300" },
      { title: "Pending Approval", value: totalPropertiesPendingApproval, icon: <Clock className="w-5 h-5 text-red-600" />, accent: "from-red-500 to-pink-300" },
    ],
    [totalPropertiesListed, totalPropertiesPendingApproval, totalPropertiesSold, activeProperties]
  );

  const themeOrange = "text-orange-500";
  const themeOrangeHover = "hover:text-orange-600";

  const pickMediaOrd1 = (m?: MediaResponse[]) => {
    if (!m || m.length === 0) return null;
    const byOrd = m.find((x) => x.ord === 1);
    return byOrd ?? m[0] ?? null;
  };

  /* --- Modal helpers --- */
  const openRequestModal = async (type: "graphics" | "photoshoot") => {
    setReqType(type);
    setReqModalOpen(true);
    await loadPropertiesForRequest(type);
  };

  const loadPropertiesForRequest = async (type: "graphics" | "photoshoot") => {
    setPropsLoading(true);
    setPropsError(null);
    setPropsList([]);
    setSelectedProps({});
    try {
      const endpoint = type === "graphics" ? "/agent/getPropertiesToRequestGraphicShoot" : "/agent/getPropertiesToRequestPhotoshoot";
      const { data } = await api.get<Record<string, any>>(endpoint);

      const residential = Array.isArray(data?.Residential) ? data.Residential : [];
      const commercial = Array.isArray(data?.Commercial) ? data.Commercial : [];
      const normalized: NormProp[] = [];

      residential.forEach((r: any) =>
        normalized.push({
          listingId: r.listingId ?? r.listingIdResidential ?? r.id ?? 0,
          category: "Residential",
          title: r.title ?? r.propertyType ?? r.listingTitle ?? "",
          description: r.description ?? "",
          price: r.price,
          area: r.area,
          bedrooms: r.bedrooms ?? null,
          bathrooms: r.bathrooms ?? null,
          locality: r.locality,
          city: r.city,
          state: r.state,
          mediaFiles: r.mediaFiles ?? r.media ?? [],
          propertyType: r.propertyType ?? null,
          preference: r.preference ?? null,
        })
      );

      commercial.forEach((c: any) =>
        normalized.push({
          listingId: c.listingId ?? c.listingIdCommercial ?? c.id ?? 0,
          category: "Commercial",
          title: c.title ?? c.propertyType ?? "",
          description: c.description ?? "",
          price: c.price,
          area: c.area,
          cabins: c.cabins ?? null,
          meetingRoom: c.meetingRoom ?? null,
          locality: c.locality,
          city: c.city,
          state: c.state,
          mediaFiles: c.mediaFiles ?? c.media ?? [],
          propertyType: c.propertyType ?? null,
          preference: c.preference ?? null,
        })
      );

      setPropsList(normalized);
    } catch (e) {
      console.error("Failed to load properties for request:", e);
      setPropsError("Could not load properties right now.");
    } finally {
      setPropsLoading(false);
    }
  };

  const toggleSelectProp = (listingId: number) => {
    setSelectedProps((prev) => ({ ...prev, [listingId]: !prev[listingId] }));
  };

  const sendRequests = async () => {
    const chosen = propsList.filter((p) => selectedProps[p.listingId]);
    if (chosen.length === 0) {
      alert("Select at least one property.");
      return;
    }
    setSending(true);
    try {
      if (reqType === "graphics") {
        const reqList = chosen.map((p) => ({ graphics: true, propertyCategory: p.category, propertyId: p.listingId }));
        await api.post("/agent/addMediaProductionGraphicsRequestFromAgent", reqList);
        alert("Graphic service request(s) sent successfully.");
      } else if (reqType === "photoshoot") {
        const reqList = chosen.map((p) => ({ photoshoot: true, propertyCategory: p.category, propertyId: p.listingId }));
        await api.post("/agent/addMediaProductionPhotoshootRequestFromAgent", reqList);
        alert("Photoshoot request(s) sent successfully.");
      }
      setReqModalOpen(false);
      setReqType(null);
      setPropsList([]);
      setSelectedProps({});
    } catch (e: any) {
      console.error("Failed to send request:", e);
      const serverMsg = e?.response?.data?.message ?? e?.message;
      alert(`Failed to send request. ${serverMsg ?? ""}`);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">{Array.from({ length: 4 }).map((_, i) => <Shimmer key={i} className="h-20" />)}</div>
        <Shimmer className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="p-4 rounded-lg border border-red-300 bg-red-100 text-red-800">Error: {error}</div>
      </div>
    );
  }

  /* ---------------- RENDER ---------------- */
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Welcome message: center on phone, left on sm+ */}
      <div className="text-center sm:text-left">
        <h1 className="text-lg sm:text-2xl font-serif font-semibold">Welcome, {details?.firstName} {details?.lastName}!</h1>
      </div>

      {/* USER CARD — image covers left side on wide screens */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Image left (cover) */}
          <div className="w-full lg:w-72 max-h-56 sm:h-44 lg:h-auto flex-shrink-0 relative">
            {details?.profileImageUrl ? (
              <img src={details.profileImageUrl} alt="Agent" className="max-h-56 md:h-full lg:h-full w-full object-contain" />
            ) : (
              <div className="w-full h-full bg-orange-100 flex items-center justify-center">
                <span className="text-6xl sm:text-8xl text-orange-500 font-semibold">{`${details?.firstName?.[0] ?? "A"}${details?.lastName?.[0] ?? ""}`}</span>
              </div>
            )}
          </div>

          {/* Right content */}
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex gap-4 items-center flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{details?.firstName} {details?.lastName}</h2>
                <p className="flex text-xs font-semibold text-orange-700 bg-yellow-50 rounded-full px-2 py-2">
                  <UserCheck2 className="w-4 h-4 mr-1" />
                  PropAdda {toPascalCase(details?.role ?? "")}
                </p>
              </div>
              <p className="flex text-sm text-gray-600 mt-1"><MapPin className="text-orange-500 h-4 w-4 mr-1" />{details?.city}, {details?.state}</p>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-3">
                <div className="flex items-center text-gray-700">
                  <Mail className="w-4 h-4 mr-2 text-orange-500" /> <span className="text-sm break-all">{details?.email}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Phone className="w-4 h-4 mr-2 text-orange-500" /> <span className="text-sm">+91 {details?.phoneNumber}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <div>
                {details?.propaddaVerified && (
                  <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-700">
                    <CheckCircle className="w-4 h-4 mr-1" /> PropAdda Verified
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Link to="/agent/listings/active" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-orange-50 text-orange-600 font-semibold border border-orange-500 hover:bg-orange-500 hover:text-white transition">
                  <ActivitySquare />View Active Listings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((s) => (
          <StatCard key={s.title} title={s.title} value={s.value} icon={s.icon} loading={loading} accent={s.accent} />
        ))}
      </div>

      {/* Main area: Media on left, 2x2 quick actions on right (quick action grid is 2x2 even on phone) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — Media & Creative Services */}
        <div className="lg:col-span-1 h-full">
          <div className="bg-white shadow-md rounded-2xl border border-gray-100 p-6 h-full flex flex-col justify-between">
            <h4 className="text-lg font-semibold text-gray-800">Media & Creative Services</h4>
            <p className="text-sm text-gray-500 mt-1">Request Graphic Services or Photo Shoot / Drone Shoot for your listed properties.</p>

            <div className="mt-4 flex flex-col gap-3">
              <button onClick={() => openRequestModal("graphics")} className="inline-flex w-full sm:w-auto justify-start items-center gap-2 px-4 py-2 rounded-lg border border-orange-200 bg-orange-50 text-orange-600 text-sm md:text-base lg:text-lg font-semibold hover:bg-orange-500 hover:text-white transition">
                <Image className="w-4 h-4" /> Request Graphic Services
              </button>

              <button onClick={() => openRequestModal("photoshoot")} className="inline-flex w-full sm:w-auto justify-start items-center gap-2 px-4 py-2 rounded-lg border border-orange-200 bg-orange-50 text-orange-600 text-sm md:text-base lg:text-lg font-semibold hover:bg-orange-500 hover:text-white transition">
                <Drone className="w-4 h-4" /> Request Photo Shoot / Drone Shoot
              </button>
            </div>

            {/* Put additional content here if needed */}
          </div>
        </div>

        {/* Right — 2x2 grid quick action buttons */}
        <div className="lg:col-span-1 h-full">
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="h-full">
              <QuickActionButton to="/agent/postproperty" label="Add New Property" icon={<Home className="w-5 h-5 text-orange-500" />} />
            </div>

            <div className="h-full">
              <QuickActionButton to="/agent/listings/active" label={`Total Properties Posted`} icon={<IndianRupee className="w-5 h-5 text-blue-600" />} />
            </div>

            <div className="h-full">
              <QuickActionButton to="/agent/listings/pending" label="Pending Listings" icon={<Clock className="w-5 h-5 text-red-500" />} />
            </div>

            <div className="h-full">
              <QuickActionButton to="/agent/support/manageProfile" label="Manage Profile" icon={<User className="w-5 h-5 text-green-500" />} />
            </div>
          </div>
        </div>
      </div>

      {/* Listing Expiry Renewal — full width */}
      <div className="bg-white shadow-md rounded-2xl border border-gray-100 p-6">
        {/* header: stack on phone (centered), inline on sm+ */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-center sm:items-center gap-2">
          <h3 className="text-xl font-semibold text-gray-800 text-center sm:text-left">Listing Expiry Renewal</h3>
          <Link to="/agent/listings/expired" className={`text-sm font-medium ${themeOrange} ${themeOrangeHover} flex items-center justify-center sm:justify-start`}>
            View Expired <ExternalLink className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="space-y-3 mt-4">
          {loadingExpired ? (
            <>
              <div className="h-12 bg-gray-50 border border-gray-100 rounded-md animate-pulse" />
              <div className="h-12 bg-gray-50 border border-gray-100 rounded-md animate-pulse" />
              <div className="h-12 bg-gray-50 border border-gray-100 rounded-md animate-pulse" />
            </>
          ) : errorExpired ? (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-md">{errorExpired}</div>
          ) : expiredPreview.length === 0 ? (
            <p className="text-gray-500">No listings currently expired.</p>
          ) : (
            expiredPreview.map((p) => <RenewalItem key={`${p.category}-${p.listingId}`} p={p} />)
          )}
        </div>
      </div>

      {/* --- Request Modal (unchanged functionality, UI preserved) --- */}
      {reqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/40" onClick={() => setReqModalOpen(false)} />

          <div className="relative z-10 w-full max-w-3xl sm:max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden border border-orange-100">
            <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold">{reqType === "graphics" ? "Request Graphic Services" : "Request Photo / Drone Shoot"}</h3>
                <div className="text-sm opacity-90 mt-1">{propsList.length} properties available</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-full bg-white/20 text-sm">{Object.values(selectedProps).filter(Boolean).length} selected</div>
                <button onClick={() => setReqModalOpen(false)} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {propsLoading ? (
                <div className="space-y-3">
                  <Shimmer className="h-16 rounded" />
                  <Shimmer className="h-16 rounded" />
                  <Shimmer className="h-16 rounded" />
                </div>
              ) : propsError ? (
                <div className="text-red-600 bg-red-50 border border-red-100 p-3 rounded">{propsError}</div>
              ) : propsList.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-600 mb-3">You have no active or pending properties.</p>
                  <Link to="/agent/postproperty" className="text-orange-600 font-semibold">Click here to add a new property.</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 max-h-[62vh] overflow-auto">
                  {propsList.map((p) => {
                    const media = pickMediaOrd1(p.mediaFiles);
                    const imgUrl = media?.url ?? "https://via.placeholder.com/320x180?text=No+Image";
                    const selected = !!selectedProps[p.listingId];
                    return (
                      <button
                        key={`${p.category}-${p.listingId}`}
                        onClick={() => toggleSelectProp(p.listingId)}
                        className={`relative flex items-stretch gap-3 p-3 rounded-lg border transition text-left focus:outline-none ${
                          selected ? "border-orange-500 bg-orange-50 shadow-md" : "border-gray-100 hover:shadow-sm"
                        }`}
                        aria-pressed={selected}
                      >
                        <div className="w-28 h-20 sm:w-36 sm:h-24 bg-gray-100 flex-shrink-0 overflow-hidden rounded">
                          <img src={imgUrl} alt={p.title} className="w-full h-full object-cover" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-gray-900 truncate">{p.title || "Untitled"}</div>

                              {/* TAGS: category, propertyType, preference */}
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700">{p.category}</span>
                                {p.propertyType && <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-red-50 text-red-700">{p.propertyType}</span>}
                                {p.preference && <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-green-50 text-green-700">{p.preference}</span>}
                              </div>

                              <div className="text-xs text-gray-500 mt-1 truncate">{[p.locality, p.city, p.state].filter(Boolean).join(" • ")}</div>
                            </div>

                            <div className="text-right">
                              <div className="text-orange-600 font-bold">₹ {p.price ? p.price.toLocaleString("en-IN") : "—"}</div>
                              <div className="flex text-xs text-right text-gray-500"><Maximize2 className="h-3 w-3 mr-1 text-right"/> {p.area ? `${p.area} sqft` : "—"}</div>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-xs text-gray-600 line-clamp-2">{p.description ?? "—"}</div>

                            <div className="ml-3 flex items-center">
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${selected ? "bg-orange-600 text-white" : "bg-white text-gray-600 border border-gray-200"}`}>
                                {selected ? <CheckCircleIcon className="w-4 h-4 mr-2" /> : <CheckSquare className="w-4 h-4 mr-2" />}
                                {selected ? "Selected" : "Select"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-3 sm:p-4 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-gray-50 gap-3">
              <div className="text-sm text-gray-600">Selected: <span className="font-medium">{Object.values(selectedProps).filter(Boolean).length}</span></div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button onClick={() => { setReqModalOpen(false); setPropsList([]); setSelectedProps({}); }} className="px-4 py-2 rounded bg-white border w-full sm:w-auto">Cancel</button>
                <button onClick={sendRequests} disabled={Object.values(selectedProps).filter(Boolean).length === 0 || sending} className="px-4 py-2 rounded bg-orange-500 text-white font-semibold disabled:opacity-60 w-full sm:w-auto">
                  {sending ? "Sending..." : "Send Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
