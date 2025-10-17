// src/pages/BuyerEnquiriesPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from "../lib/api";
import {
  Eye,
  BedDouble,
  Bath,
  Maximize2,
  MapPin,
  ShieldCheck,
  Building2,
  Briefcase,
  Projector,
  SoapDispenserDroplet,
  Star,
  MessageSquare,
} from "lucide-react";
import PropertyAction from "../components/PropertyAction";

/* ----------------------- Types (match your backend) ----------------------- */
export type MediaResponse = {
  url: string;
  filename?: string;
  ord?: number;
  type?: string;
};

export type ResidentialPropertyResponse = {
  listingId: number;
  category: string; // "Residential"
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
  residentialOwner?: any;
  vip?: boolean;
  sold?: boolean;
  createdAt?: string;
  approvedAt?: string;
  mediaFiles?: MediaResponse[];
};

export type CommercialPropertyResponse = {
  listingId: number;
  category: string; // "Commercial"
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
  commercialOwner?: any;
  vip?: boolean;
  sold?: boolean;
  createdAt?: string;
  approvedAt?: string;
  mediaFiles?: MediaResponse[];
};

export type EnquiriesApiResponse = {
  Commercial: CommercialPropertyResponse[] | null;
  Residential: ResidentialPropertyResponse[] | null;
};

/* ----------------------- Helpers ----------------------- */
function currency(n?: number | null) {
  return typeof n === "number" ? n.toLocaleString("en-IN") : "-";
}

function isImageUrl(url?: string) {
  if (!url) return false;
  const lower = url.split("?")[0].toLowerCase();
  return (
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".png") ||
    lower.endsWith(".webp")
  );
}

function extractImages(media?: MediaResponse[]) {
  if (!media || media.length === 0) return [] as string[];
  const imgs = media
    .filter((m) => (m.ord ?? -999) >= 1 && isImageUrl(m.url))
    .sort((a, b) => (a.ord ?? 999999) - (b.ord ?? 999999));
  if (imgs.length === 0) return [] as string[];
  const primaryIndex = imgs.findIndex((m) => m.ord === 1);
  if (primaryIndex > 0) {
    const [primary] = imgs.splice(primaryIndex, 1);
    imgs.unshift(primary);
  }
  return imgs.map((m) => m.url!);
}

function toUiPreference(pref?: string) {
  if (!pref) return "";
  const p = pref.toLowerCase();
  if (p === "sale") return "Buy";
  if (p === "rent") return "Rent";
  if (p === "pg") return "PG";
  return pref;
}

function FeatureChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-orange-100 text-orange-600 text-xs font-semibold px-2.5 py-1">
      {children}
    </span>
  );
}

/* ----------------------- Card ----------------------- */
type AnyProp = (ResidentialPropertyResponse | CommercialPropertyResponse) & {
  _kind: "Residential" | "Commercial";
};

const PropertyCard: React.FC<{ p: AnyProp; onView: (p: AnyProp) => void }> = ({ p, onView }) => {
  const isRes = p._kind === "Residential";
  const uiPref = toUiPreference(p.preference);
  const priceLabel = p.price != null ? `₹ ${currency(p.price)}` : "Price on request";
  const localityLine = [p.locality, p.city, p.state].filter(Boolean).join(" • ");
  const images = useMemo(() => extractImages(p.mediaFiles), [p.mediaFiles]);

  const [idx, setIdx] = useState(0);
  const timerRef = useRef<number | null>(null);
  const startSlide = () => {
    if (images.length <= 1 || timerRef.current) return;
    timerRef.current = window.setInterval(() => {
      setIdx((i) => (i + 1) % images.length);
    }, 2400);
  };
  const stopSlide = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIdx(0);
  };
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);

  const hasImages = images.length > 0;
  const img = images[idx];

  const onImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const el = e.currentTarget;
    el.onerror = null;
    el.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
  };

  const hasNum = (n: unknown) => typeof n === "number" && n > 0;
  const hasTrue = (b: unknown) => (typeof b === "boolean" && b) || (typeof b === "number" && b > 0);

  return (
    <article
      className="group overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-md transition"
      onMouseEnter={startSlide}
      onMouseLeave={stopSlide}
    >
      <div className="relative">
        {hasImages ? (
          <img
            src={img}
            onError={onImgError}
            alt={p.title?.trim() || "Property"}
            className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="h-44 w-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium">
            No image found
          </div>
        )}

        <span
          className={[
            "absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm",
            isRes ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700",
          ].join(" ")}
        >
          {isRes ? <Building2 className="h-3.5 w-3.5" /> : <Briefcase className="h-3.5 w-3.5" />} {isRes ? "Residential" : "Commercial"}
        </span>
        {p.vip && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-semibold shadow-sm">
            <Star className="h-3.5 w-3.5" /> Featured
          </span>
        )}
        {p.reraVerified && (
          <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-1 text-xs font-semibold shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5" /> RERA Verified
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 text-base font-semibold">{p.title?.trim() || "Untitled"}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {uiPref && <FeatureChip>{uiPref}</FeatureChip>}
          {p.propertyType && <FeatureChip>{p.propertyType}</FeatureChip>}
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-gray-600">{p.description || "—"}</p>
        <div className="mt-2 text-xs text-gray-500 inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {localityLine || "—"}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-700">
          {hasNum(p.area) && (
            <span className="inline-flex items-center gap-1"><Maximize2 className="h-4 w-4" /> {p.area} sq.ft</span>
          )}
          {p._kind === "Residential" ? (
            <>
              {hasNum((p as ResidentialPropertyResponse).bedrooms) && (
                <span className="inline-flex items-center gap-1"><BedDouble className="h-4 w-4" /> {(p as ResidentialPropertyResponse).bedrooms} Beds</span>
              )}
              {hasNum((p as ResidentialPropertyResponse).bathrooms) && (
                <span className="inline-flex items-center gap-1"><Bath className="h-4 w-4" /> {(p as ResidentialPropertyResponse).bathrooms} Baths</span>
              )}
            </>
          ) : (
            <>
              {hasNum((p as CommercialPropertyResponse).cabins) && (
                <span className="inline-flex items-center gap-1"><Briefcase className="h-4 w-4" /> {(p as CommercialPropertyResponse).cabins} Cabins</span>
              )}
              {hasTrue((p as CommercialPropertyResponse).meetingRoom) && (
                <span className="inline-flex items-center gap-1"><Projector className="h-4 w-4" /> Meeting Room</span>
              )}
              {hasTrue((p as CommercialPropertyResponse).washroom) && (
                <span className="inline-flex items-center gap-1"><SoapDispenserDroplet className="h-4 w-4" /> Washroom</span>
              )}
            </>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="text-orange-600 text-2xl font-bold">{priceLabel}</div>
          </div>
          <button onClick={() => onView(p)} className="flex rounded-lg bg-orange-500 border px-3 py-1.5 text-sm text-white font-semibold hover:bg-orange-600">
            <Eye className="w-5 h-5 mr-3" /> View
          </button>
        </div>
      </div>
    </article>
  );
};

/* ----------------------- Page ----------------------- */
const BuyerEnquiriesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [residential, setResidential] = useState<ResidentialPropertyResponse[]>([]);
  const [commercial, setCommercial] = useState<CommercialPropertyResponse[]>([]);

  const [tab, setTab] = useState<"All" | "Residential" | "Commercial">("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "priceAsc" | "priceDesc" | "areaAsc" | "areaDesc">("newest");

  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const navigate = useNavigate();
  const onView = (p: AnyProp) => navigate(`/properties/${encodeURIComponent(p.category)}/${p.listingId}`);

  useEffect(() => {
    let active = true;
    async function fetchEnqs() {
      setLoading(true); setError(null);
      try {
        const { data } = await api.get<EnquiriesApiResponse>("/buyer/allEnquiriesByBuyer");
        if (!active) return;
        setResidential((data?.Residential ?? []) as ResidentialPropertyResponse[]);
        setCommercial((data?.Commercial ?? []) as CommercialPropertyResponse[]);
      } catch (e: any) {
        if (!active) return;
        setError(e?.response?.data?.message || "Failed to load enquiries.");
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchEnqs();
    return () => { active = false; };
  }, []);

  // Flatten with _kind tag
  const allItems: AnyProp[] = useMemo(() => {
    const res: AnyProp[] = (residential ?? []).map((r) => ({ ...r, _kind: "Residential" as const }));
    const com: AnyProp[] = (commercial ?? []).map((c) => ({ ...c, _kind: "Commercial" as const }));
    return [...res, ...com];
  }, [residential, commercial]);

  const filteredByTab = useMemo(() => {
    if (tab === "Residential") return allItems.filter((p) => p._kind === "Residential");
    if (tab === "Commercial") return allItems.filter((p) => p._kind === "Commercial");
    return allItems;
  }, [tab, allItems]);

  const searched = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return filteredByTab;
    return filteredByTab.filter((p) => [p.title, p.description, p.city, p.locality, p.state]
      .filter(Boolean)
      .some((f) => (f as string).toLowerCase().includes(q))
    );
  }, [filteredByTab, search]);

  const sorted = useMemo(() => {
    const arr = [...searched];
    const time = (d?: string) => (d ? new Date(d).getTime() : 0);
    const num = (n?: number | null) => (typeof n === "number" ? n : null);
    arr.sort((a, b) => {
      switch (sortBy) {
        case "priceAsc": {
          const ap = num(a.price), bp = num(b.price); if (ap === null && bp === null) break; if (ap === null) return 1; if (bp === null) return -1; return (ap as number) - (bp as number);
        }
        case "priceDesc": {
          const ap = num(a.price), bp = num(b.price); if (ap === null && bp === null) break; if (ap === null) return 1; if (bp === null) return -1; return (bp as number) - (ap as number);
        }
        case "areaAsc": {
          const aa = num((a as any).area), ba = num((b as any).area); if (aa === null && ba === null) break; if (aa === null) return 1; if (ba === null) return -1; return (aa as number) - (ba as number);
        }
        case "areaDesc": {
          const aa = num((a as any).area), ba = num((b as any).area); if (aa === null && ba === null) break; if (aa === null) return 1; if (ba === null) return -1; return (ba as number) - (aa as number);
        }
        case "newest":
        default: {
          const at = time((a as any).approvedAt); const bt = time((b as any).approvedAt);
          if (!at && !bt) return 0; if (!at) return 1; if (!bt) return -1; return bt - at;
        }
      }
      return 0;
    });
    return arr;
  }, [searched, sortBy]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = page + 1;
  const start = page * PAGE_SIZE;
  const slice = sorted.slice(start, start + PAGE_SIZE);
  const windowStart = Math.floor((current - 1) / 10) * 10 + 1;
  const windowEnd = Math.min(windowStart + 9, totalPages);
  const numbers = useMemo(() => Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i), [windowStart, windowEnd]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="YOUR ENQUIRIES" />

      {/* Page header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-6xl px-4 py-6">
          {/* Heading: Laptop -> left; Tablet & Phone -> centered */}
          <div className="mb-4">
            <div className="hidden lg:flex items-center">
              <MessageSquare className="w-6 h-6 text-orange-600" />
              <h1 className="text-xl font-semibold ml-3">Enquired properties</h1>
            </div>

            <div className="flex lg:hidden justify-center items-center">
              <MessageSquare className="w-6 h-6 text-orange-600" />
              <h1 className="text-xl font-semibold ml-2">Enquired properties</h1>
            </div>
          </div>

          {/* Controls layout */}
          {/* ---------- Laptop (lg+): Under heading show one row: toggle | search(flex) | count | sort ---------- */}
          <div className="hidden lg:flex items-center gap-4">
            {/* left: toggle */}
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-lg border border-orange-200 bg-orange-50 p-1 text-sm">
                {(["All", "Residential", "Commercial"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setPage(0); }}
                    className={[
                      "px-3 py-1.5 rounded-md",
                      t === tab ? "bg-white border border-orange-200 text-orange-700" : "text-gray-700",
                    ].join(" ")}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* center: search fills the space */}
            <div className="flex-1 mx-6 min-w-0">
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                placeholder="Search by title, city, locality..."
                className="w-full rounded-lg px-4 py-2 text-sm bg-orange-50 border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            {/* right: count + sort */}
            <div className="flex items-center gap-3 ml-auto">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{total}</span> enquiries
              </div>

              <label className="inline-flex items-center gap-2 text-sm">
                <span className="text-black font-bold hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value as any); setPage(0); }}
                  className="rounded-md border border-orange-100 bg-orange-50 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                >
                  <option value="newest">Newest</option>
                  <option value="priceAsc">Price: Low→High</option>
                  <option value="priceDesc">Price: High→Low</option>
                  <option value="areaAsc">Area: Low→High</option>
                  <option value="areaDesc">Area: High→Low</option>
                </select>
              </label>
            </div>
          </div>

          {/* ---------- Tablet (md) layout:
                Under heading show: left -> toggle ; right -> count+sort
                Under that (stacked) show search full-width
            ---------- */}
          <div className="hidden md:flex lg:hidden flex-col gap-3">
            <div className="flex items-center justify-between">
              {/* toggle left */}
              <div className="flex items-center gap-3">
                <div className="inline-flex rounded-lg border border-orange-200 bg-orange-50 p-1 text-sm">
                  {(["All", "Residential", "Commercial"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTab(t); setPage(0); }}
                      className={[
                        "px-3 py-1.5 rounded-md",
                        t === tab ? "bg-white border border-orange-200 text-orange-700" : "text-gray-700",
                      ].join(" ")}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* count + sort right */}
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">{total}</span> enquiries
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value as any); setPage(0); }}
                    className="rounded-md border border-orange-100 bg-orange-50 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                  >
                    <option value="newest">Newest</option>
                    <option value="priceAsc">Price: Low→High</option>
                    <option value="priceDesc">Price: High→Low</option>
                    <option value="areaAsc">Area: Low→High</option>
                    <option value="areaDesc">Area: High→Low</option>
                  </select>
                </label>
              </div>
            </div>

            {/* search row */}
            <div>
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                placeholder="Search by title, city, locality..."
                className="w-full border rounded-lg px-3 py-1.5 text-sm bg-orange-50 border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>

          {/* ---------- Phone layout:
                Heading centered above (already handled).
                Row 1: toggle centered
                Row 2: count (left) | sort (right)
                Row 3: search full-width
              ---------- */}
          <div className="flex flex-col gap-3 md:hidden">
            {/* toggle centered */}
            <div className="flex justify-center">
              <div className="inline-flex rounded-lg border border-orange-200 bg-orange-50 p-1 text-sm">
                {(["All", "Residential", "Commercial"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setPage(0); }}
                    className={[
                      "px-3 py-1.5 rounded-md",
                      t === tab ? "bg-white border border-orange-200 text-orange-700" : "text-gray-700",
                    ].join(" ")}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* count left and sort right */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{total}</span> enquiries
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value as any); setPage(0); }}
                  className="rounded-md border border-orange-100 bg-orange-50 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                >
                  <option value="newest">Newest</option>
                  <option value="priceAsc">Price: Low→High</option>
                  <option value="priceDesc">Price: High→Low</option>
                  <option value="areaAsc">Area: Low→High</option>
                  <option value="areaDesc">Area: High→Low</option>
                </select>
              </label>
            </div>

            {/* search row */}
            <div>
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                placeholder="Search by title, city, locality..."
                className="w-full border rounded-lg px-3 py-1.5 text-sm bg-orange-50 border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        {loading && (
          <div className="rounded-xl border bg-white p-6 text-center text-gray-600">Loading enquiries…</div>
        )}
        {error && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>
        )}
        {!loading && !error && total === 0 && (
          <div className="rounded-xl border bg-white p-8 text-center text-gray-600">
            You haven't enquired on any properties yet.
          </div>
        )}

        {!loading && !error && total > 0 && (
          <>
            {/* Grid: phones 1col, tablets 1col, laptop 2col */}
            <div className="grid gap-5 grid-cols-1 md:grid-cols-1 lg:grid-cols-2">
              {slice.map((p) => (
                <PropertyCard key={`${p._kind}-${p.listingId}`} p={p} onView={onView} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#faf6f3] px-4 py-3 border border-orange-100">
              <div className="text-sm text-gray-600">
                Page <span className="font-medium">{current}</span> of {" "}
                <span className="font-medium">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0 || loading} className="text-sm text-gray-700 disabled:opacity-50">
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
                          active ? "bg-orange-50 text-orange-700 border-orange-300" : "bg-white hover:bg-gray-50",
                        ].join(" ")}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setPage((p) => Math.min(p + 1, Math.max(0, totalPages - 1)))} disabled={current >= totalPages || loading} className="text-sm text-gray-700 disabled:opacity-50">
                  Next Page ›
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <PropertyAction />
      <Footer />
    </div>
  );
};

export default BuyerEnquiriesPage;
