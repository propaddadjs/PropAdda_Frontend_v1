// Author-Hemant Arora
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Carousel from "./Carousel";
import FilterExplorerModal, { type Filters as ExploreFilters } from "./FilterExplorerModal";
import {
  BedDouble,
  Bath,
  Ruler,
  MapPin,
  ShieldCheck,
  Building2,
  Briefcase,
  Presentation,
  ShowerHead,
  Sparkles,
  ChevronRight,
  Star,
  BriefcaseIcon,
  Projector,
  Maximize2,
  SoapDispenserDroplet,
  Eye,
} from "lucide-react";
import { api } from "../lib/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

/* ----------------------- Types ----------------------- */
type MediaResponse = { url?: string; filename?: string; ord?: number; type?: string };

type ResidentialPropertyResponse = {
  listingId: number;
  category: string; // "Residential"
  preference?: string; // "sale" | "Sale" | "rent" | "pg" (case-insensitive)
  propertyType?: string;
  title?: string;
  description?: string;
  price?: number | null;
  area?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  city?: string;
  state?: string;
  locality?: string;
  reraVerified?: boolean;
  vip?: boolean;
  mediaFiles?: MediaResponse[];
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
  cabins?: number | null;
  meetingRoom?: boolean;
  washroom?: boolean;
  city?: string;
  state?: string;
  locality?: string;
  reraVerified?: boolean;
  vip?: boolean;
  mediaFiles?: MediaResponse[];
};

type ApiResponse = {
  residential: ResidentialPropertyResponse[] | null;
  commercial: CommercialPropertyResponse[] | null;
};

type AnyProp =
  | (ResidentialPropertyResponse & { _kind: "Residential" })
  | (CommercialPropertyResponse & { _kind: "Commercial" });

/* ----------------------- Helpers ----------------------- */
const currency = (n?: number | null) =>
  typeof n === "number" ? n.toLocaleString("en-IN") : "—";

const isImageUrl = (url?: string) => {
  if (!url) return false;
  const lower = url.split("?")[0].toLowerCase();
  return lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".webp");
};

function extractImages(media?: MediaResponse[]) {
  if (!media || media.length === 0) return [] as string[];
  const imgs = media
    .filter((m) => {
      const o = m.ord ?? -999;
      return o >= 1 && o <= 8 && isImageUrl(m.url);
    })
    .sort((a, b) => (a.ord ?? 999999) - (b.ord ?? 999999));

  if (imgs.length === 0) return [];
  const primaryIndex = imgs.findIndex((m) => m.ord === 1);
  if (primaryIndex > 0) {
    const [primary] = imgs.splice(primaryIndex, 1);
    imgs.unshift(primary);
  }
  return imgs.map((m) => m.url!) as string[];
}

const toUiPreference = (pref?: string) => {
  const p = (pref ?? "").toLowerCase();
  if (p === "sale") return "Buy";
  if (p === "rent") return "Rent";
  if (p === "pg") return "PG";
  return pref ?? "";
};

/* ----------------------- Small pill ----------------------- */
type PillProps = { tone?: "res" | "com" | "neutral"; children: React.ReactNode };
const PILL: React.FC<PillProps> = ({ children, tone = "neutral" }) => (
  <span
    className={[
      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] sm:px-2.5 sm:py-1 sm:text-xs font-semibold shadow-sm transition",
      tone === "res"
        ? "bg-green-100 text-green-700"
        : tone === "com"
        ? "bg-blue-100 text-blue-700"
        : "bg-orange-100 text-orange-600",
      "hover:shadow",
    ].join(" ")}
  >
    {children}
  </span>
);

/* ----------------------- Card ----------------------- */
const PropertyCard: React.FC<{ p: AnyProp; onView: (p: AnyProp) => void }> = ({ p, onView }) => {
  const isRes = p.category?.toLowerCase().includes("res");
  const images = useMemo(() => extractImages(p.mediaFiles), [p.mediaFiles]);

  const [idx, setIdx] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setIdx(0);
    if (images.length > 1) {
      timerRef.current = window.setInterval(() => {
        setIdx((i) => (i + 1) % images.length);
      }, 3600);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [images]);

  const img = images[idx] || "https://via.placeholder.com/800x450?text=No+Image";
  const priceLabel = p.price != null ? `₹${currency(p.price)}` : "Price on request";
  const loc = [p.state, p.city].filter(Boolean).join(" • ");
  const uiPref = toUiPreference(p.preference);

  return (
    <div
      className="property-card group rounded-xl border-2 border-gray-200 bg-white overflow-hidden shadow-sm
               transition hover:shadow-lg hover:-translate-y-0.5 w-full max-w-sm sm:max-w-none sm:min-w-[350px]"
    >
      <div className="relative">
        <img
          src={img}
          alt={p.title?.trim() || "Property"}
          className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          loading="lazy"
        />
        <div className="absolute left-3 top-3 flex items-center gap-2">
            <PILL tone={isRes ? "res" : "com"}>
              <span className="inline-flex items-center gap-1">
                {isRes ? <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <Briefcase className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                {isRes ? "Residential" : "Commercial"}
              </span>
            </PILL>
        </div>
        {p.reraVerified && (
          <span className="absolute left-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 px-1.5 py-0.5 text-[11px] sm:px-2 sm:py-1 sm:text-xs font-semibold shadow-sm">
            <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> RERA Verified
          </span>
        )}
      </div>

      <div className="property-info p-4 flex flex-col">
        <h4 className="font-semibold text-base line-clamp-1">{p.title?.trim() || "Untitled"}</h4>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {uiPref && <PILL tone="neutral">{uiPref}</PILL>}
          {p.propertyType && <PILL tone="neutral">{p.propertyType}</PILL>}
        </div>

        {/* Features */}
        <div className="mt-2 text-xs text-gray-700 flex flex-wrap gap-x-4 gap-y-2">
          {isRes ? (
            <>
              {typeof (p as any).bedrooms === "number" && (p as any).bedrooms > 0 && (
                <span className="inline-flex items-center gap-1">
                  <BedDouble className="h-4 w-4" /> {(p as any).bedrooms} Beds
                </span>
              )}
              {typeof (p as any).bathrooms === "number" && (p as any).bathrooms > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Bath className="h-4 w-4" /> {(p as any).bathrooms} Baths
                </span>
              )}
            </>
          ) : (
            <>
              {typeof (p as any).cabins === "number" && (p as any).cabins > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="h-4 w-4" /> {(p as any).cabins} Cabins
                </span>
              )}
              {((p as any).meetingRoom === true ||
                (typeof (p as any).meetingRoom === "number" && (p as any).meetingRoom > 0)) && (
                <span className="inline-flex items-center gap-1">
                  <Projector className="h-4 w-4" /> {(typeof (p as any).meetingRoom === "number" ? (p as any).meetingRoom + " " : "")}Meeting Rooms
                </span>
              )}
              {((p as any).washroom === true ||
                (typeof (p as any).washroom === "number" && (p as any).washroom > 0)) && (
                <span className="inline-flex items-center gap-1">
                  <SoapDispenserDroplet className="h-4 w-4" /> {(typeof (p as any).washroom === "number" ? (p as any).washroom + " " : "")}Washrooms
                </span>
              )}
            </>
          )}

          {typeof p.area === "number" && p.area > 0 && (
            <span className="inline-flex items-center gap-1">
              <Maximize2 className="h-4 w-4" /> {p.area} sq.ft
            </span>
          )}
        </div>

        <div className="mt-2 text-xs text-gray-500 inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {loc || "—"}
        </div>

        <div className="mt-auto pt-3 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <span className="text-orange-600 text-xl font-bold">{priceLabel}</span>
          <button
            className="flex w-full sm:w-auto justify-center rounded-lg bg-orange-500 px-3 py-1.5 text-white text-sm font-semibold
                       transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 active:scale-[0.99]"
            onClick={() => onView(p)}
          >
            <Eye className="h-5 w-5 mr-1" /> View
          </button>
        </div>
      </div>
    </div>
  );
};


/* ----------------------- Section ----------------------- */
const DISPLAY_LABEL_BY_TAB: Record<"villa" | "flat" | "plot" | "pg", string> = {
  villa: "Bungalow / Villa",
  flat: "Flat / Apartment",
  plot: "Plot / Land",
  pg: "PG / Co-Living",
};

const PropertySection: React.FC = () => {
  const [active, setActive] = useState<"villa" | "flat" | "plot" | "pg">("flat");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [residential, setResidential] = useState<ResidentialPropertyResponse[]>([]);
  const [commercial, setCommercial] = useState<CommercialPropertyResponse[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const results: AnyProp[] = useMemo(() => {
    const r: AnyProp[] = (residential ?? []).map((x) => ({ ...x, _kind: "Residential" }));
    const c: AnyProp[] = (commercial ?? []).map((x) => ({ ...x, _kind: "Commercial" }));
    return [...r, ...c];
  }, [residential, commercial]);

  useEffect(() => {
    let on = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        if (active === "pg") {
          const { data } = await api.get<ApiResponse>("/user/getVipFilterByPG", {
            //withCredentials: true,
          });
          if (!on) return;
          setResidential(data.residential ?? []);
          setCommercial(data.commercial ?? []);
        } else {
          const url = `/user/getVipFilterByPropertyType/${active}`;
          const { data } = await api.get<ApiResponse>(url,
            // { withCredentials: true }
          );
          if (!on) return;
          setResidential(data.residential ?? []);
          setCommercial(data.commercial ?? []);
        }
      } catch (e: any) {
        if (!on) return;
        setErr(e?.response?.data?.message || "Failed to load featured properties.");
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => {
      on = false;
    };
  }, [active]);

  const onView = (p: AnyProp) => {
    navigate(`/properties/${encodeURIComponent(p.category)}/${p.listingId}`);
  };

  // Open filter explorer modal from "View all Properties"
  const openExplorer = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalOpen(true);
  };

  // Submit filters -> backend -> results page
  const handleExplore = async (filters: ExploreFilters) => {
    const payload = {
      ...filters,
      preference: filters.preference === "Buy" ? "Sale" : filters.preference,
    };
    try {
      const { data } = await api.post("/user/getFilteredProperties", payload, {
        // withCredentials: true,
      });
      navigate("/search-results", { state: { filters, results: data } });
    } catch (e) {
      console.error("Filter explore failed", e);
    }
  };

  return (
    <section className="featured-properties px-4 sm:px-0">
      <h3 className="flex items-center justify-center mt-5 gap-2 text-lg font-bold tracking-wide text-gray-600">
        <Star className="h-4 w-4 text-orange-500" />
        FEATURED PROPERTIES <Star className="h-4 w-4 text-orange-500" />
      </h3>
      <h2 className="mt-1 text-2xl font-bold text-center">
        <span className="highlight text-orange-600">RECOMMENDED</span> FOR YOU
      </h2>

      <div className="mt-3 mb-8 mx-auto grid max-w-xs grid-cols-2 gap-4 md:mx-0 md:max-w-none md:flex md:flex-wrap md:justify-center md:gap-6">
        {(["villa", "flat", "plot", "pg"] as const).map((type) => {
          const isActive = active === type; // the results currently shown
          return (
            <button
              key={type}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`filter rounded-xl px-3 py-1.5 transition text-sm sm:text-base
                ${isActive
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-white text-gray-700 border-orange-200 border-t-2 border-b-2 hover:bg-orange-50 hover:text-orange-600"}`}
              onClick={() => setActive(type)}
            >
              {DISPLAY_LABEL_BY_TAB[type]}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="mt-3 rounded-xl border bg-white p-4 text-center text-gray-600 animate-pulse">
          Loading featured properties…
        </div>
      )}

      {err && !loading && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          {err}
        </div>
      )}

      {!loading && !err && results.length === 0 && (
        <div className="mt-3 rounded-xl border bg-white p-4 text-center text-gray-600">
          No featured properties found.
        </div>
      )}

      {!loading && !err && results.length > 0 && (
        <>
          {results.length <= 3 ? (
            <div className="mt-3 flex justify-center gap-4 flex-wrap">
              {results.map((p) => (
                <PropertyCard key={`${p._kind}-${p.listingId}`} p={p} onView={onView} />
              ))}
            </div>
          ) : (
            <div className="mt-3">
              <Carousel>
                {results.map((p) => (
                  <PropertyCard key={`${p._kind}-${p.listingId}`} p={p} onView={onView} />
                ))}
              </Carousel>
            </div>
          )}
        </>
      )}

      <div className="text-center">
        <a
            href="/search-results"
            onClick={openExplorer}
            className="view-all-btn mt-6 inline-flex items-center gap-2 text-orange-600 font-semibold"
        >
            View all Properties <ChevronRight className="h-4 w-4" />
        </a>
      </div>


      {/* Filter Explorer Modal */}
      <FilterExplorerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onExplore={handleExplore}
        initial={{
          category: "All",
          preference: "All",
          propertyTypes: [],
        }}
      />
    </section>
  );
};

export default PropertySection;