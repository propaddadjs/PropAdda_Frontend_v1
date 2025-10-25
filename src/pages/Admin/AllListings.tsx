// Author-Hemant Arora
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { api } from "../../lib/api";
import { Link } from "react-router-dom";
import FilterSidebar, { type Filters as SidebarFilters } from "../../components/FilterSidebar";
import {
  BedDouble,
  Bath,
  Star,
  BadgeCheck,
  TimerOff,
  CheckCircle2,
  Eye,
  Building,
  Home,
  Tag,
  Briefcase,
  Maximize2,
  MapPin,
  StarOff,
  BadgeX,
} from "lucide-react";

// ... (interfaces unchanged; copy from your original file)
interface MediaResponse { filename?: string; ord?: number; url: string; }
interface OwnerResponse {
  userId?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}
interface PropertyResponse {
  listingId: number;
  category: string;
  preference?: string;
  propertyType?: string;
  maintenance?: number;
  title?: string;
  description?: string;
  price?: number;
  area?: number;
  city?: string;
  state?: string;
  locality?: string;
  address?: string;
  pincode?: number;
  nearbyPlace?: string;
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: string;
  facing?: string;
  floor?: number;
  age?: string;
  availability?: string;
  reraNumber?: string;
  reraVerified?: boolean;
  totalFloors?: number;
  securityDeposit?: number;
  balconies?: number;
  powerBackup?: string;
  coveredParking?: number;
  openParking?: number;
  adminApproved?: string;
  expired?: boolean;
  vip?: boolean;
  media?: MediaResponse[];
  mediaFiles?: MediaResponse[];
  residentialOwner?: OwnerResponse;
  commercialOwner?: OwnerResponse;
  cabins?: number;
  meetingRoom?: boolean;
  washroom?: boolean;
  conferenceRoom?: boolean;
  receptionArea?: boolean;
  lift?: boolean;
  parking?: boolean;
  lockIn?: number;
  yearlyIncrease?: number;
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
}

interface PageResponse {
  content?: PropertyResponse[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

/* Card component (replace existing) */
const Card: React.FC<{
  p: PropertyResponse;
  onToggleVip?: (id: number, category: string) => void;
  onToggleRera?: (id: number, category: string) => void;
}> = ({ p, onToggleVip, onToggleRera }) => {
  const media = p.mediaFiles ?? p.media ?? [];
  const thumb = media.find((m) => m.ord === 1)?.url;
  const owner = p.residentialOwner ?? p.commercialOwner;

  return (
    <article
      className={`rounded-lg border-2 shadow-sm overflow-hidden bg-white
        ${p.vip ? "border-yellow-500 bg-yellow-50" : "border-gray-200"}
        flex flex-col h-full`}
    >
      {/* Image on top */}
      <div className="w-full h-44 sm:h-52 md:h-44 lg:h-40 bg-gray-100 overflow-hidden">
        {thumb ? (
          <img src={thumb} alt={p.title ?? "thumbnail"} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title & meta */}
        <div className="mb-2">
          <div className="font-semibold text-base sm:text-lg truncate">{p.title ?? p.propertyType ?? "Untitled"}</div>
          <div className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center gap-1.5 truncate">
            <MapPin className="w-4 h-4 text-gray-600 flex-shrink-0" />
            <span className="truncate">
              {p.locality ? `${p.locality}, ` : ""}
              {p.city ?? ""}
              {p.address ? ` • ${p.address}` : ""}
            </span>
          </div>

          <div className="mt-2 text-xs sm:text-sm text-gray-600 flex flex-wrap gap-2">
            {p.bedrooms !== undefined && <span className="flex items-center gap-1.5 whitespace-nowrap"><BedDouble className="w-4 h-4 text-gray-600" />{p.bedrooms} BHK</span>}
            {p.bathrooms !== undefined && <span className="flex items-center gap-1.5 whitespace-nowrap"><Bath className="w-4 h-4 text-gray-600" />{p.bathrooms} Bath</span>}
            {p.area !== undefined && <span className="flex items-center gap-1.5 whitespace-nowrap"><Maximize2 className="w-4 h-4 text-gray-600" />{p.area} sq.ft</span>}
          </div>
        </div>

        {/* Description */}
        {p.description && (
          <div className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-3 break-words">
            {p.description}
          </div>
        )}

        {/* Owner details */}
        {owner && (
          <div className="text-xs text-gray-500 mb-3 border-t pt-2">
            Owner:{" "}
            <span className="truncate">
              {owner.firstName ?? ""}
              {owner.lastName ? ` ${owner.lastName}` : ""}
              {owner.email ? ` • ${owner.email}` : ""}
            </span>
          </div>
        )}

        {/* Price + status row (keeps to top of bottom area) */}
        <div className="mt-auto">
          <div className="flex items-center justify-between gap-4">
            <div className="text-lg font-bold whitespace-nowrap">
              {p.price !== undefined ? `₹${Number(p.price).toLocaleString("en-IN")}` : "-"}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {p.vip && <div className="flex items-center gap-1 text-xs font-semibold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded"><Star className="w-3 h-3" /> VIP</div>}
              {p.reraVerified && <div className="flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded"><BadgeCheck className="w-3 h-3" /> RERA</div>}
              {p.expired && <div className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded"><TimerOff className="w-3 h-3" /> Expired</div>}
            </div>
          </div>

          {/* Buttons stacked vertically */}
          <div className="mt-3 flex flex-col gap-2">
            <Link
              to={`/admin/listings/view/${p.category ?? "Residential"}/${p.listingId}`}
              className="w-full px-3 py-2 text-white text-center rounded text-sm bg-blue-500 flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" /> View Listing
            </Link>

            {onToggleVip && (
              <button
                onClick={() => onToggleVip(p.listingId, p.category)}
                className="w-full px-3 py-2 text-white rounded text-sm bg-yellow-400 flex items-center justify-center gap-2"
              >
                {p.vip ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                {p.vip ? "Unmark VIP" : "Mark VIP"}
              </button>
            )}

            {p.reraNumber ? (
              onToggleRera ? (
                <button
                  onClick={() => onToggleRera(p.listingId, p.category)}
                  className="w-full px-3 py-2 text-white rounded text-sm bg-purple-600 flex items-center justify-center gap-2"
                >
                  {p.reraVerified ? <BadgeX className="w-4 h-4" /> : <BadgeCheck className="w-4 h-4" />}
                  {p.reraVerified ? "Unmark RERA Verified" : "Mark RERA Verified"}
                </button>
              ) : null
            ) : (
              <button
                disabled
                className="w-full px-3 py-2 bg-gray-300 text-white rounded text-sm cursor-not-allowed flex items-center justify-center gap-2"
                title="RERA number not available for this listing"
              >
                <BadgeCheck className="w-4 h-4" /> Mark RERA Verified
              </button>
            )}

            <div className="text-xs text-gray-400 mt-2">ID: {p.listingId}</div>
          </div>
        </div>
      </div>
    </article>
  );
};

/* AllListings page */
const AllListings: React.FC = () => {
  const [, setRawData] = useState<PropertyResponse[]>([]);
  const [pageSlice, setPageSlice] = useState<PropertyResponse[]>([]);
  const [page, setPage] = useState<number>(0); // 0-based
  const [size, setSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState<SidebarFilters | null>(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? "https://propadda-backend-v1-506455747754.asia-south2.run.app";

  // determine compact screen (<=1024) to move filter trigger into header
  const [isCompactScreen, setIsCompactScreen] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth <= 1024 : false
  );
  useEffect(() => {
    const onResize = () => setIsCompactScreen(window.innerWidth <= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    fetch(appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  const buildParamsFromSidebar = (f: SidebarFilters | null) => {
    if (!f) return {};
    const params: any = {};
    if (f.category && f.category !== "All") params.category = f.category;
    if (f.propertyTypes && f.propertyTypes.length) params.propertyTypes = f.propertyTypes.join(",");
    if (f.preference && f.preference !== "All") params.preference = f.preference;

    if (f.priceMin !== null && f.priceMax !== null && Number(f.priceMin) > Number(f.priceMax)) {
      params.priceMin = f.priceMax;
      params.priceMax = f.priceMin;
    } else {
      if (f.priceMin !== null) params.priceMin = f.priceMin;
      if (f.priceMax !== null) params.priceMax = f.priceMax;
    }
    if (f.furnishing) params.furnishing = f.furnishing;
    if (f.stateName) params.state = f.stateName;
    if (f.city) params.city = f.city;
    if (f.amenities && f.amenities.length) params.amenities = f.amenities.join(",");
    if (f.availability && f.availability !== "All") params.availability = f.availability;

    if (f.areaMin !== null && f.areaMax !== null && Number(f.areaMin) > Number(f.areaMax)) {
      params.areaMin = f.areaMax;
      params.areaMax = f.areaMin;
    } else {
      if (f.areaMin !== null) params.areaMin = f.areaMin;
      if (f.areaMax !== null) params.areaMax = f.areaMax;
    }
    if (f.ageRanges && f.ageRanges.length) params.ageRanges = f.ageRanges.join(",");
    return params;
  };

  const fetch = async (filters: SidebarFilters | null = null) => {
    setLoading(true);
    try {
      const paging = { page, size };
      const filterParams = buildParamsFromSidebar(filters);

      if (filters) {
        const resp = await api.get<PageResponse | any>("/admin/filterAllProperties", {
          params: { ...paging, ...filterParams },
        });
        const body = resp.data;

        if (body && Array.isArray(body.content)) {
          const pageContent: PropertyResponse[] = body.content;
          setRawData(pageContent);
          setPageSlice(pageContent);
          setTotalPages(body.totalPages ?? 1);
          setLoading(false);
          return;
        }

        if (body && (Array.isArray(body.commercial) || Array.isArray(body.residential))) {
          const com: PropertyResponse[] = Array.isArray(body.commercial) ? body.commercial : [];
          const res: PropertyResponse[] = Array.isArray(body.residential) ? body.residential : [];
          const merged = [...com, ...res];
          setRawData(merged);
          const tp = Math.max(1, Math.ceil(merged.length / size));
          setTotalPages(tp);
          const start = page * size;
          setPageSlice(merged.slice(start, start + size));
          setLoading(false);
          return;
        }

        if (Array.isArray(body)) {
          setRawData(body);
          const tp = Math.max(1, Math.ceil(body.length / size));
          setTotalPages(tp);
          const start = page * size;
          setPageSlice(body.slice(start, start + size));
          setLoading(false);
          return;
        }

        setRawData([]);
        setPageSlice([]);
        setTotalPages(0);
        setLoading(false);
        return;
      } else {
        const resp = await api.get<PageResponse | any>("/admin/allProperties", { params: paging });
        const body = resp.data;

        if (body && Array.isArray(body.content)) {
          const pageContent: PropertyResponse[] = body.content;
          setRawData(pageContent);
          setPageSlice(pageContent);
          setTotalPages(body.totalPages ?? 1);
          setLoading(false);
          return;
        }

        if (body && (Array.isArray(body.commercial) || Array.isArray(body.residential))) {
          const com: PropertyResponse[] = Array.isArray(body.commercial) ? body.commercial : [];
          const res: PropertyResponse[] = Array.isArray(body.residential) ? body.residential : [];
          const merged = [...com, ...res];
          setRawData(merged);
          const tp = Math.max(1, Math.ceil(merged.length / size));
          setTotalPages(tp);
          const start = page * size;
          setPageSlice(merged.slice(start, start + size));
          setLoading(false);
          return;
        }

        if (Array.isArray(body)) {
          setRawData(body);
          const tp = Math.max(1, Math.ceil(body.length / size));
          setTotalPages(tp);
          const start = page * size;
          setPageSlice(body.slice(start, start + size));
          setLoading(false);
          return;
        }

        setRawData([]);
        setPageSlice([]);
        setTotalPages(0);
      }
    } catch (err) {
      console.error("fetch properties error:", err);
      setRawData([]);
      setPageSlice([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Sidebar handlers
  const onFilterApply = (f: SidebarFilters) => {
    setAppliedFilters(f);
    setPage(0);
    fetch(f);
  };
  const onFilterReset = () => {
    setAppliedFilters(null);
    setPage(0);
    fetch(null);
  };

  // Toggle handlers
  const toggleVip = async (id: number, category: string) => {
    try {
      await api.patch(`/admin/toggleVip/${category}/${id}`);
      fetch(appliedFilters);
    } catch (e) {
      console.error("toggle vip error", e);
      alert("VIP toggle failed");
    }
  };
  const toggleRera = async (id: number, category: string) => {
    try {
      await api.patch(`/admin/toggleReraVerified/${category}/${id}`);
      fetch(appliedFilters);
    } catch (e) {
      console.error("toggle rera error", e);
      alert("RERA toggle failed");
    }
  };

  const itemsToRender = pageSlice;

  // ----- Unified Pagination (windowed 1..10) -----
  const total = totalPages || 1;
  const current = page + 1; // 1-based
  const windowStart = Math.floor((current - 1) / 10) * 10 + 1;
  const windowEnd = Math.min(windowStart + 9, total);
  const numbers = useMemo(
    () => Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i),
    [windowStart, windowEnd]
  );

  return (
    // larger breakpoint: show sidebar + main (two-column)
    // compact: don't render sidebar as left column to avoid taking space; render trigger in header
    <div className="flex">
      {!isCompactScreen && (
        <FilterSidebar initial={appliedFilters ?? undefined} onApply={onFilterApply} onReset={onFilterReset} />
      )}

      <main className="flex-1 p-4 sm:p-6">
        {/* Header: title + desktop controls */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Active Listings</h2>

            <div className="flex items-center gap-3">
              {/* Desktop / tablet count (right side) */}
              <div className="text-sm text-gray-600 hidden sm:block">
                {loading ? "Loading..." : `${itemsToRender.length} results`}
              </div>

              {/* On compact screens, place the filter trigger inline in header so it doesn't take extra layout space */}
              {isCompactScreen ? (
                <div className="ml-2">
                  {/* FilterSidebar renders only a compact trigger + drawer on compact screens */}
                  <FilterSidebar initial={appliedFilters ?? undefined} onApply={onFilterApply} onReset={onFilterReset} />
                </div>
              ) : null}
            </div>
          </div>

          {/* Mobile-only: show count under the title */}
          <div className="block sm:hidden mt-1 text-sm text-gray-600">
            {loading ? "Loading..." : `${itemsToRender.length} results`}
          </div>
        </div>

        {/* For non-compact screens show the results count below header too */}
        { !isCompactScreen && (
          <div className="mb-4 text-sm text-gray-600">
            {loading ? "Loading..." : `${itemsToRender.length} results`}
          </div>
        )}

        {/* Grid: 1 column on small & tablet, 2 columns on large (desktop/laptop) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {itemsToRender.length === 0 && !loading && <div className="text-gray-600 col-span-1">No listings found.</div>}

          {[...itemsToRender]
            .sort((a, b) => (b?.listingId ?? 0) - (a?.listingId ?? 0))
            .map((p) => (
              <div key={p.listingId} className="w-full">
                <Card p={p} onToggleVip={toggleVip} onToggleRera={toggleRera} />
              </div>
            ))}
        </div>

        {/* Unified pagination bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#faf6f3] px-4 py-3 border border-orange-100">
          <div className="text-sm text-gray-600">
            Page <span className="font-medium">{current}</span> of{" "}
            <span className="font-medium">{total}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="text-sm text-gray-700 disabled:opacity-50"
            >
              ‹ Previous Page
            </button>

            <div className="flex items-center">
              {numbers.map((n) => {
                const active = n === current;
                return (
                  <button
                    key={n}
                    onClick={() => setPage(n - 1)}
                    disabled={loading}
                    className={[
                      "mx-1 w-9 h-9 text-sm rounded-full border transition",
                      active
                        ? "bg-buttonOrange text-themeOrange border-themeOrange"
                        : "bg-white hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {n}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, Math.max(0, total - 1)))}
              disabled={current >= total || loading}
              className="text-sm text-gray-700 disabled:opacity-50"
            >
              Next Page ›
            </button>
          </div>

          {/* Per-page selector (5/10/15) */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Per page:</span>
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(0);
              }}
              className="border rounded-lg px-2 py-1 text-sm bg-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AllListings;
