// src/pages/FilteredPropertiesPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FilterSidebarBuyer, { type Filters as BuyerFilters } from "../components/FilterSidebarBuyer";
// Header + Footer (add these)
import Header from "../components/Header";
import Footer from "../components/Footer";
import NoPropertyFound from "../images/NoPropertyfound.png";
import headerImg from "../images/Banners/explore-properties.png";

// Lucide icons
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
  Filter as FilterIcon,
} from "lucide-react";
import { api } from "../lib/api";
import PropertyAction from "../components/PropertyAction";

/* ----------------------- Types (match your backend) ----------------------- */
type MediaResponse = {
  url?: string;
  filename?: string;
  ord?: number;
  type?: string; // optional
};

type ResidentialPropertyResponse = { [k: string]: any };
type CommercialPropertyResponse = { [k: string]: any };

type ApiResponse = {
  residential: ResidentialPropertyResponse[] | null;
  commercial: CommercialPropertyResponse[] | null;
};

export type Filters = {
  category: "All" | "Residential" | "Commercial";
  propertyTypes: string[];
  preference: "All" | "Rent" | "Buy" | "PG";
  stateIso?: string;
  stateName?: string;
  city?: string;
  priceMin?: number | null;
  priceMax?: number | null;
};

/* ----------------------- Config ----------------------- */
const PAGE_SIZE = 10;

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

  return imgs.map((m) => m.url!) as string[];
}

/* ----------------------- UI chips ----------------------- */
function FeatureChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-orange-100 text-orange-600 text-xs font-semibold px-2.5 py-1">
      {children}
    </span>
  );
}

/* ----------------------- Card with hover slideshow ----------------------- */
type AnyProp = (ResidentialPropertyResponse | CommercialPropertyResponse) & {
  _kind: "Residential" | "Commercial";
};

/* PropertyCard — minimal changes: image fallback + "No image found" when no images */
const PropertyCard: React.FC<{ p: AnyProp; onView: (p: AnyProp) => void }> = ({
  p,
  onView,
}) => {
  const isRes = p._kind === "Residential";
  const uiPref = (pref?: string) => {
    if (!pref) return "";
    const q = pref.toLowerCase();
    if (q === "sale") return "Buy";
    if (q === "rent") return "Rent";
    if (q === "pg") return "PG";
    return pref;
  };
  const priceLabel =
    p.price != null ? `₹ ${currency(p.price)}` : "Price on request";
  const localityLine = [p.locality, p.city, p.state].filter(Boolean).join(" • ");

  // images from mediaFiles
  const images = React.useMemo(() => extractImages(p.mediaFiles), [p.mediaFiles]);

  // slideshow state
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
    setIdx(0); // reset to primary
  };

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  // NEW: If no images -> show a simple "No image found" tile
  const hasImages = images.length > 0;
  const currentImg = images[idx] ?? NoPropertyFound;

  const onImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const el = e.currentTarget;
    if (el.src !== NoPropertyFound) el.src = NoPropertyFound;
  };

  const hasNum = (n: unknown) => typeof n === "number" && n > 0;
  const hasTrue = (b: unknown) =>
    (typeof b === "boolean" && b) || (typeof b === "number" && b > 0);

  return (
    <article
      className="group overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-md transition"
      onMouseEnter={startSlide}
      onMouseLeave={stopSlide}
    >
      <div className="relative">
        {hasImages ? (
          <img
            src={currentImg}
            onError={onImgError}
            alt={p.title?.trim() || "Property image"}
            className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="h-44 w-full bg-orange-100 flex items-center justify-center text-gray-500 font-medium">
            {/* No image found */}
            <img
              src={NoPropertyFound}
              alt="No media available"
              className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        )}

        <span
          className={[
            "absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm",
            isRes ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700",
          ].join(" ")}
        >
          {isRes ? <Building2 className="h-3.5 w-3.5" /> : <Briefcase className="h-3.5 w-3.5" />}
          {isRes ? "Residential" : "Commercial"}
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
        {/* Title */}
        <h3 className="line-clamp-1 text-base font-semibold">
          {p.title?.trim() || "Untitled"}
        </h3>

        {/* Chips */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {uiPref(p.preference) && <FeatureChip>{uiPref(p.preference)}</FeatureChip>}
          {p.propertyType && <FeatureChip>{p.propertyType}</FeatureChip>}
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
          {p.description || "—"}
        </p>

        <div className="mt-2 text-xs text-gray-500 inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {localityLine || "—"}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-700">
          {hasNum(p.area) && (
            <span className="inline-flex items-center gap-1">
              <Maximize2 className="h-4 w-4" /> {p.area} sq.ft
            </span>
          )}

          {p._kind === "Residential" ? (
            <>
              {hasNum((p as ResidentialPropertyResponse).bedrooms) && (
                <span className="inline-flex items-center gap-1">
                  <BedDouble className="h-4 w-4" /> {(p as ResidentialPropertyResponse).bedrooms} Beds
                </span>
              )}
              {hasNum((p as ResidentialPropertyResponse).bathrooms) && (
                <span className="inline-flex items-center gap-1">
                  <Bath className="h-4 w-4" /> {(p as ResidentialPropertyResponse).bathrooms} Baths
                </span>
              )}
            </>
          ) : (
            <>
              {hasNum((p as CommercialPropertyResponse).cabins) && (
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="h-4 w-4" /> {(p as CommercialPropertyResponse).cabins} Cabins
                </span>
              )}
              {hasTrue((p as CommercialPropertyResponse).meetingRoom) && (
                <span className="inline-flex items-center gap-1">
                  <Projector className="h-4 w-4" /> Meeting Room
                </span>
              )}
              {hasTrue((p as CommercialPropertyResponse).washroom) && (
                <span className="inline-flex items-center gap-1">
                  <SoapDispenserDroplet className="h-4 w-4" /> Washroom
                </span>
              )}
            </>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="text-orange-600 text-2xl font-bold">{priceLabel}</div>
          </div>
          <button
            onClick={() => onView(p)}
            className="flex rounded-lg bg-orange-500 border px-3 py-1.5 text-sm text-white font-semibold hover:bg-orange-600"
          >
            <Eye className="w-5 h-5 mr-3" /> View
          </button>
        </div>
      </div>
    </article>
  );
};

/* ----------------------- Page ----------------------- */
const FilteredPropertiesPage: React.FC = () => {
  const location = useLocation();
  const filters = (location.state?.filters ?? {}) as Partial<Filters>;

  const navigate = useNavigate();

  const filtersFromState = (location.state?.filters ?? {}) as Partial<Filters>;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [residential, setResidential] = useState<ResidentialPropertyResponse[]>([]);
  const [commercial, setCommercial] = useState<CommercialPropertyResponse[]>([]);
  const [page, setPage] = useState(0); // 0-based
  const [activeFilters, setActiveFilters] = useState<Partial<BuyerFilters>>(filters);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "priceAsc" | "priceDesc" | "areaAsc" | "areaDesc">("newest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setPage(0);
  }, [sortBy]);

  useEffect(() => {
    let active = true;

    async function run() {
      setLoading(true);
      setError(null);
      setPage(0);

      const prefetched = location.state?.prefetched as ApiResponse | undefined;
      if (prefetched) {
        setResidential(prefetched.residential ?? []);
        setCommercial(prefetched.commercial ?? []);
        setActiveFilters((prev) => ({
          ...prev,
          stateName: (location.state?.filters?.stateName as string) || "",
          city: (location.state?.filters?.city as string) || "",
        }));
        setLoading(false);
        return; // stop here; we already have data
      }

      // Detect if we came from Hero search with query params
      const sp = new URLSearchParams(location.search);
      const source = sp.get("source") || "";
      const heroQuery = source === "hero" ? {
        tab: sp.get("tab") || "",
        preference: sp.get("preference") || "",
        stateName: sp.get("state") || "",
        city: sp.get("city") || "",
        locality: sp.get("locality") || ""
      } : null;

      try {
        if (heroQuery) {
          // Branch to GET endpoints
          const { tab, preference, stateName, city, locality } = heroQuery;

          // Update header chips without disturbing sidebar behaviour
          setActiveFilters((prev) => ({
            ...prev,
            stateName,
            city,
            preference:
              tab === "buy" ? "Buy" :
              tab === "rent" ? "Rent" :
              tab === "pg" ? "PG" :
              "All",
          }));

          if (tab === "land") {
            const { data } = await api.get<ApiResponse>(
              "/user/filterByPlotAndLocation",
              {
                params: {
                  state: stateName || "",
                  city: city || "",
                  locality: locality || "",
                },
              }
            );
            if (!active) return;
            setResidential(data.residential ?? []);
            setCommercial(data.commercial ?? []);
          } else {
            const { data } = await api.get<ApiResponse>(
              "/user/filterByPreferenceAndLocation",
              {
                params: {
                  preference: preference || "all",
                  state: stateName || "",
                  city: city || "",
                  locality: locality || "",
                },
              }
            );
            if (!active) return;
            setResidential(data.residential ?? []);
            setCommercial(data.commercial ?? []);
          }
        } else {
          // Existing behaviour (unchanged)
          const fAny = filtersFromState as any;
          const body = {
            category: (filtersFromState.category ?? "All") as string,
            propertyType: filtersFromState.propertyTypes ?? [],
            preference:
              (function toServerPreference(pref: Filters["preference"]): "sale" | "rent" | "pg" | "all" {
                if (pref === "Buy") return "sale";
                if (pref === "Rent") return "rent";
                if (pref === "PG") return "pg";
                return "all";
              })((filtersFromState.preference as any) ?? "All"),

            priceMin: filtersFromState.priceMin ?? null,
            priceMax: filtersFromState.priceMax ?? null,

            furnishing: fAny?.furnishing ?? "",
            state: filtersFromState.stateName ?? "",
            city: filtersFromState.city ?? "",
            amenities: fAny?.amenities ?? [],
            availability: fAny?.availability ?? "All",
            areaMin: fAny?.areaMin ?? null,
            areaMax: fAny?.areaMax ?? null,
            age: fAny?.ageRanges ?? [],
          };

          const { data } = await api.post<ApiResponse>(
            "/user/getDetailedFilteredProperties",
            body,
          );

          if (!active) return;
          setResidential(data.residential ?? []);
          setCommercial(data.commercial ?? []);
        }
      } catch (e: any) {
        if (!active) return;
        setError(
          e?.response?.data?.message ||
          "Failed to fetch properties. Please try again."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    run();
    return () => { active = false; };
  }, [location.key, location.search]);

  // Flatten + normalize
  const allResults: AnyProp[] = useMemo(() => {
    const res: AnyProp[] = (residential ?? []).map((r) => ({
      ...r,
      _kind: "Residential" as const,
    }));
    const com: AnyProp[] = (commercial ?? []).map((c) => ({
      ...c,
      _kind: "Commercial" as const,
    }));
    return [...res, ...com];
  }, [residential, commercial]);

  // Filter results by search query
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return allResults;
    const q = searchQuery.toLowerCase();
    return allResults.filter((p) =>
      [p.title, p.description, p.city, p.locality, p.state]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q))
    );
  }, [allResults, searchQuery]);

  const sorted = useMemo(() => {
    const arr = [...filteredResults];

    const time = (d?: string) => (d ? new Date(d).getTime() : 0);
    const num = (n?: number | null) => (typeof n === "number" ? n : null);

    arr.sort((a, b) => {
      switch (sortBy) {
        case "priceAsc": {
          const ap = num(a.price), bp = num(b.price);
          if (ap === null && bp === null) break;
          if (ap === null) return 1;     // nulls last
          if (bp === null) return -1;
          return ap - bp;                // low → high
        }
        case "priceDesc": {
          const ap = num(a.price), bp = num(b.price);
          if (ap === null && bp === null) break;
          if (ap === null) return 1;     // nulls last
          if (bp === null) return -1;
          return bp - ap;                // high → low
        }
        case "areaAsc": {
          const aa = num((a as any).area), ba = num((b as any).area);
          if (aa === null && ba === null) break;
          if (aa === null) return 1;     // nulls last
          if (ba === null) return -1;
          return (aa as number) - (ba as number); // low → high
        }
        case "areaDesc": {
          const aa = num((a as any).area), ba = num((b as any).area);
          if (aa === null && ba === null) break;
          if (aa === null) return 1;     // nulls last
          if (ba === null) return -1;
          return (ba as number) - (aa as number); // high → low
        }
        case "newest":
        default: {
          const at = time((a as any).approvedAt);
          const bt = time((b as any).approvedAt);
          if (!at && !bt) return 0;
          if (!at) return 1;
          if (!bt) return -1;
          return bt - at;
        }
      }
      return 0;
    });

    return arr;
  }, [filteredResults, sortBy]);

  const totalCount = allResults.length;

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = page + 1; // 1-based
  const windowStart = Math.floor((current - 1) / 10) * 10 + 1;
  const windowEnd = Math.min(windowStart + 9, totalPages);
  const numbers = useMemo(
    () =>
      Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i),
    [windowStart, windowEnd]
  );
  const pageSlice = useMemo(() => {
    const start = page * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

  // Card CTA (hook your detail route later)
  const openDetail = (p: AnyProp) => {
    navigate(`/properties/${encodeURIComponent(p.category)}/${p.listingId}`);
  };

  // Open filters behavior: on large screens scroll the sidebar into view,
  // otherwise open the mobile filter drawer
  const openFilters = () => {
    try {
      if (window.innerWidth >= 1024) {
        const aside = document.querySelector("aside");
        if (aside) aside.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else {
        setMobileFiltersOpen(true);
      }
    } catch {
      setMobileFiltersOpen(true);
    }
  };

  const locationLabel = `${activeFilters.stateName ? activeFilters.stateName : "All India"}${activeFilters.city ? ` • ${activeFilters.city}` : ""}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Site Header with title */}
      <div>
        <Header headerImage={headerImg} />
      </div>

      {/* Page Header
          Behavior:
            - On phone/tablet (<= lg-1): first row = location/filter, count+sort; second row = full-width search input
            - On laptop (lg+): one row: location | search (center) | count+sort
      */}
      <div className="bg-white flex-shrink-0 border-b">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* First row: location button + (count+sort) at right; on lg also contains inline search center */}
            <div className="flex items-center w-full gap-3">
              <button
                onClick={openFilters}
                aria-label="Change location / filters"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-transparent hover:border-orange-100 text-sm text-gray-700 bg-white"
              >
                <MapPin className="w-4 h-4 text-orange-600" />
                <span className="truncate max-w-[12rem]">{locationLabel}</span>
              </button>

              {/* Inline search for lg and above (center area) */}
              <div className="hidden lg:block flex-1 min-w-0">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, description, city, or locality..."
                  className="w-full rounded-lg px-4 py-2 text-sm bg-orange-50 border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-200 max-w-2xl"
                />
              </div>

              {/* Count + sort — visible on all sizes (count now visible on phone) */}
              <div className="flex items-center gap-3 ml-auto">
                <span><span className="font-semibold">{totalCount}</span> properties</span>

                <label className="inline-flex items-center gap-2">
                  <span className="text-black font-bold hidden sm:inline">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
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

            {/* Stacked search for md and below (visible on md and smaller), hidden on lg */}
            <div className="w-full block lg:hidden mt-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, description, city, or locality..."
                className="w-full rounded-lg px-4 py-2 text-sm bg-orange-50 border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex gap-4">
          {/* Sidebar: visible on lg (keeps your laptop structure unchanged) */}
          <div className="hidden lg:block">
            <FilterSidebarBuyer
              initial={(location.state?.filters ?? {}) as Partial<BuyerFilters>}
              onApply={(f, data) => {
                setActiveFilters(f);
                if (data) {
                  setResidential(data.residential ?? []);
                  setCommercial(data.commercial ?? []);
                  setPage(0);
                }
              }}
              onReset={() => {
                setActiveFilters({});
                setResidential([]);
                setCommercial([]);
                setPage(0);
              }}
            />
          </div>

          {/* Existing content block — structure unchanged for laptop */}
          <div className="flex-1">
            {loading && (
              <div className="rounded-xl border bg-white p-6 text-center text-gray-600">
                Loading results…
              </div>
            )}

            {error && !loading && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
                {error}
              </div>
            )}

            {!loading && !error && totalCount === 0 && (
              <div className="rounded-xl border bg-white p-6 text-center text-gray-600">
                No properties found for your filters.
              </div>
            )}

            {!loading && !error && totalCount > 0 && (
              <>
                {/* Grid: phones 1col, tablets 2col, keep laptop as before (2col) */}
                <div className="mt-3 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
                  {pageSlice.map((p) => (
                    <PropertyCard key={`${p._kind}-${p.listingId}`} p={p} onView={openDetail} />
                  ))}
                </div>

                {/* Pagination bar (unchanged) */}
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#faf6f3] px-4 py-3 border border-orange-100">
                  <div className="text-sm text-gray-600">
                    Page <span className="font-medium">{current}</span> of{" "}
                    <span className="font-medium">{totalPages}</span>
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
                                ? "bg-orange-50 text-orange-700 border-orange-300"
                                : "bg-white hover:bg-gray-50",
                            ].join(" ")}
                          >
                            {n}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() =>
                        setPage((p) => Math.min(p + 1, Math.max(0, totalPages - 1)))
                      }
                      disabled={current >= totalPages || loading}
                      className="text-sm text-gray-700 disabled:opacity-50"
                    >
                      Next Page ›
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile / Tablet filter drawer (appears on screens < lg) — opens FROM LEFT */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <aside className="relative left-0 w-[86%] max-w-sm bg-white p-4 shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold flex items-center gap-2"><FilterIcon className="w-5 h-5 text-orange-600" /> Filters</h3>
              <button className="p-2 rounded-md" onClick={() => setMobileFiltersOpen(false)}>Close</button>
            </div>

            {/* Render filter component expanded and without its internal collapsed-toggle */}
            <FilterSidebarBuyer
              initial={(location.state?.filters ?? {}) as Partial<BuyerFilters>}
              onApply={(f, data) => {
                setActiveFilters(f);
                if (data) {
                  setResidential(data.residential ?? []);
                  setCommercial(data.commercial ?? []);
                  setPage(0);
                }
                setMobileFiltersOpen(false);
              }}
              onReset={() => {
                setActiveFilters({});
                setResidential([]);
                setCommercial([]);
                setPage(0);
                setMobileFiltersOpen(false);
              }}
              // optional mobile-only props (FilterSidebarBuyer should ignore unknown props if not supported)
              initialCollapsed={false}
              hideCollapseButton={true}
            />
          </aside>
        </div>
      )}

      {/* Site Footer */}
      <PropertyAction />
      <Footer />
    </div>
  );
};

export default FilteredPropertiesPage;
