// src/pages/SearchResults.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// === Types that match your backend responses ===
type MediaResponse = {
  url?: string;
  mediaUrl?: string;
  fileUrl?: string;
  // add other fields if your backend returns them
};

type OwnerResponse = {
  // shape not used on card — keep minimal for now
  ownerId?: number;
  name?: string;
};

type ResidentialPropertyResponse = {
  listingId: number;
  category: string;
  preference: string; // "Rent" | "Sale" | "PG"
  propertyType: string;
  title: string;
  description: string;
  price: number | null;
  maintenance?: number | null;
  area?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  furnishing?: string | null;
  facing?: string | null;
  floor?: number | null;
  age?: string | null;
  availability?: string | null;
  reraNumber?: string | null;
  reraVerified?: boolean;
  state?: string;
  city?: string;
  locality?: string;
  address?: string;
  pincode?: number | null;
  nearbyPlace?: string | null;
  totalFloors?: number | null;
  securityDeposit?: number | null;
  balconies?: number | null;
  powerBackup?: string | null;
  coveredParking?: number | null;
  openParking?: number | null;
  adminApproved?: string | null;
  expired?: boolean;
  residentialOwner?: OwnerResponse;
  vip?: boolean;
  sold?: boolean;
  createdAt?: string;
  approvedAt?: string;
  mediaFiles?: MediaResponse[];
};

type CommercialPropertyResponse = {
  listingId: number;
  category: string;
  preference: string; // "Rent" | "Sale"
  propertyType: string;
  title: string;
  description: string;
  price: number | null;
  area?: number | null;
  reraNumber?: string | null;
  reraVerified?: boolean;
  cabins?: number | null;
  meetingRoom?: boolean;
  washroom?: boolean;
  conferenceRoom?: boolean;
  receptionArea?: boolean;
  lift?: boolean;
  parking?: boolean;
  age?: string | null;
  availability?: string | null;
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
  nearbyPlace?: string | null;
  adminApproved?: string | null;
  expired?: boolean;
  commercialOwner?: OwnerResponse;
  vip?: boolean;
  sold?: boolean;
  createdAt?: string;
  approvedAt?: string;
  mediaFiles?: MediaResponse[];
};

type BackendResponse = {
  residential: ResidentialPropertyResponse[] | null;
  commercial: CommercialPropertyResponse[] | null;
};

type FiltersPayload = {
  category: "All" | "Residential" | "Commercial";
  propertyTypes: string[];
  preference: "All" | "Rent" | "Sale" | "PG";
  stateName?: string;
  stateIso?: string;
  city?: string;
};

// === Config ===
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://propadda-backend-v1-506455747754.asia-south2.run.app";

// === Helpers ===
function getFirstImageUrl(media?: MediaResponse[]): string | null {
  if (!media || media.length === 0) return null;
  const m = media[0];
  return m.url || m.mediaUrl || m.fileUrl || null;
}

function formatINR(n?: number | null) {
  if (n == null) return "—";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `₹${n.toLocaleString("en-IN")}`;
  }
}

function asBuyLabel(pref?: string) {
  if (!pref) return "";
  return pref.toLowerCase() === "sale" ? "Buy" : pref;
}

function plural(n?: number | null, label?: string) {
  if (!n || !label) return "";
  return `${n} ${label}${n > 1 ? "s" : ""}`;
}

function classNames(...c: Array<string | false | undefined>) {
  return c.filter(Boolean).join(" ");
}

function SectionHeader({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-baseline justify-between mb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="text-sm text-gray-500">{count} result{count !== 1 ? "s" : ""}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border rounded-xl p-8 text-center text-gray-500 bg-white">
      {text}
    </div>
  );
}

// === Residential Card ===
function ResidentialCard({ p }: { p: ResidentialPropertyResponse }) {
  const img = getFirstImageUrl(p.mediaFiles);
  const location = [p.locality, p.city, p.state].filter(Boolean).join(", ");

  return (
    <div className="group border rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition">
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={p.title}
            className="h-full w-full object-cover group-hover:scale-[1.02] transition"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-gray-400">
            No image
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-2">
          {p.vip && (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-black">
              VIP
            </span>
          )}
          {p.reraVerified && (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-600 text-white">
              RERA
            </span>
          )}
          {p.sold && (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-600 text-white">
              SOLD
            </span>
          )}
        </div>
        <div className="absolute bottom-2 left-2">
          <span className="px-2 py-1 rounded-md text-xs font-semibold bg-black/70 text-white">
            {asBuyLabel(p.preference)} • {p.propertyType}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug line-clamp-2">{p.title}</h3>
          <div className="text-right shrink-0">
            <div className="text-lg font-bold">{formatINR(p.price ?? undefined)}</div>
            {p.area ? (
              <div className="text-xs text-gray-500">{p.area} sq.ft</div>
            ) : null}
          </div>
        </div>

        <div className="text-sm text-gray-600">{location || "—"}</div>

        <div className="flex flex-wrap gap-2 pt-1">
          {p.bedrooms ? (
            <span className="text-xs bg-gray-100 rounded-full px-2 py-1">
              {plural(p.bedrooms, "Bed")}
            </span>
          ) : null}
          {p.bathrooms ? (
            <span className="text-xs bg-gray-100 rounded-full px-2 py-1">
              {plural(p.bathrooms, "Bath")}
            </span>
          ) : null}
          {p.floor != null ? (
            <span className="text-xs bg-gray-100 rounded-full px-2 py-1">
              Floor {p.floor}
            </span>
          ) : null}
          {p.furnishing ? (
            <span className="text-xs bg-gray-100 rounded-full px-2 py-1">
              {p.furnishing}
            </span>
          ) : null}
        </div>

        <div className="pt-2 flex justify-between items-center">
          <Link
            to={`/property/residential/${p.listingId}`}
            className="text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            View details →
          </Link>
          {p.createdAt ? (
            <div className="text-xs text-gray-400">
              {new Date(p.createdAt).toLocaleDateString()}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// === Commercial Card ===
function CommercialCard({ p }: { p: CommercialPropertyResponse }) {
  const img = getFirstImageUrl(p.mediaFiles);
  const location = [p.locality, p.city, p.state].filter(Boolean).join(", ");

  return (
    <div className="group border rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition">
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={p.title}
            className="h-full w-full object-cover group-hover:scale-[1.02] transition"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-gray-400">
            No image
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-2">
          {p.vip && (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-black">
              VIP
            </span>
          )}
          {p.reraVerified && (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-600 text-white">
              RERA
            </span>
          )}
          {p.sold && (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-600 text-white">
              SOLD
            </span>
          )}
        </div>
        <div className="absolute bottom-2 left-2">
          <span className="px-2 py-1 rounded-md text-xs font-semibold bg-black/70 text-white">
            {asBuyLabel(p.preference)} • {p.propertyType}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug line-clamp-2">{p.title}</h3>
          <div className="text-right shrink-0">
            <div className="text-lg font-bold">{formatINR(p.price ?? undefined)}</div>
            {p.area ? (
              <div className="text-xs text-gray-500">{p.area} sq.ft</div>
            ) : null}
          </div>
        </div>

        <div className="text-sm text-gray-600">{location || "—"}</div>

        <div className="flex flex-wrap gap-2 pt-1">
          {p.cabins != null ? (
            <span className="text-xs bg-gray-100 rounded-full px-2 py-1">
              {plural(p.cabins, "Cabin")}
            </span>
          ) : null}
          {p.meetingRoom ? (
            <span className="text-xs bg-gray-100 rounded-full px-2 py-1">
              Meeting Room
            </span>
          ) : null}
          {p.parking ? (
            <span className="text-xs bg-gray-100 rounded-full px-2 py-1">
              Parking
            </span>
          ) : null}
          {p.lift ? (
            <span className="text-xs bg-gray-100 rounded-full px-2 py-1">
              Lift
            </span>
          ) : null}
        </div>

        <div className="pt-2 flex justify-between items-center">
          <Link
            to={`/property/commercial/${p.listingId}`}
            className="text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            View details →
          </Link>
          {p.createdAt ? (
            <div className="text-xs text-gray-400">
              {new Date(p.createdAt).toLocaleDateString()}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function SearchResults() {
  const location = useLocation() as {
    state?: { results?: BackendResponse; filters?: FiltersPayload };
  };
  const navigate = useNavigate();

  const initialResults = location.state?.results ?? null;
  const initialFilters = location.state?.filters ?? null;

  const [loading, setLoading] = useState<boolean>(!initialResults && !!initialFilters);
  const [results, setResults] = useState<BackendResponse | null>(initialResults);
  const [error, setError] = useState<string | null>(null);

  // If we arrived only with filters, refetch from backend
  useEffect(() => {
    const fetchWithFilters = async () => {
      if (!initialFilters || initialResults) return;
      setLoading(true);
      setError(null);
      try {
        // IMPORTANT: preference in UI may be "Buy"; backend expects "Sale"
        const payload: FiltersPayload = {
          ...initialFilters,
        //   preference:
        //     initialFilters.preference === "Buy" ? "Sale" : initialFilters.preference,
        };
        const { data } = await axios.post<BackendResponse>(
          `${API_BASE_URL}/user/getFilteredProperties`,
          payload
        );
        setResults(data);
      } catch (e: any) {
        console.error("Failed to fetch filtered properties:", e);
        setError(
          e?.response?.data?.message ||
            "Failed to load results. Please try adjusting filters."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWithFilters();
  }, [initialFilters, initialResults]);

  const counts = useMemo(() => {
    return {
      res: results?.residential?.length ?? 0,
      com: results?.commercial?.length ?? 0,
    };
  }, [results]);

  const hasAny =
    (results?.residential && results.residential.length > 0) ||
    (results?.commercial && results.commercial.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Search Results</h1>
            <div className="text-sm text-gray-500">
              {initialFilters ? (
                <>
                  {initialFilters.category} • {asBuyLabel(initialFilters.preference)}{" "}
                  {initialFilters.stateName ? `• ${initialFilters.stateName}` : ""}{" "}
                  {initialFilters.city ? `• ${initialFilters.city}` : ""}
                </>
              ) : (
                "Showing matching properties"
              )}
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">
        {loading && (
          <div className="bg-white border rounded-xl p-8 text-center text-gray-500">
            Loading properties…
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4">
            {error}
          </div>
        )}

        {!loading && !error && results && (
          <>
            {/* Residential */}
            {results.residential && results.residential.length > 0 ? (
              <section>
                <SectionHeader title="Residential" count={counts.res} />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {results.residential.map((p) => (
                    <ResidentialCard key={p.listingId} p={p} />
                  ))}
                </div>
              </section>
            ) : null}

            {/* Commercial */}
            {results.commercial && results.commercial.length > 0 ? (
              <section>
                <SectionHeader title="Commercial" count={counts.com} />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {results.commercial.map((p) => (
                    <CommercialCard key={p.listingId} p={p} />
                  ))}
                </div>
              </section>
            ) : null}

            {!hasAny && (
              <EmptyState text="No properties matched your filters. Try changing the filters and explore again." />
            )}
          </>
        )}
      </div>
    </div>
  );
}
