// Author-Hemant Arora
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import NoPropertyFound from "../../images/NoPropertyfound.png"
import {
  ArrowRight,
  ArrowDown,
  Building2,
  Home,
  Star,
  ShieldCheck,
  MapPin,
  Maximize2,
  BedDouble,
  Bath,
  Briefcase,
  Projector,
  User2,
  Mail,
  Phone,
  Eye,
} from "lucide-react";

/* ---------------- Types (shape per backend) ---------------- */
type MediaResponse = { url: string; filename?: string; ord?: number };

type AgentResponse = {
  userId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  state?: string;
  city?: string;
  role?: string;
  profileImageUrl?: string | null;
  propaddaVerified?: boolean;
};

type CommercialPropertyResponse = {
  listingId: number;
  category?: string;
  preference?: string;
  propertyType?: string;
  title?: string;
  description?: string;
  price?: number;
  area?: number;
  cabins?: number | null;
  meetingRoom?: boolean | null;
  city?: string;
  state?: string;
  locality?: string;
  mediaFiles?: MediaResponse[];
  vip?: boolean;
  reraVerified?: boolean;
  commercialOwner?: { firstName?: string; lastName?: string; email?: string; phoneNumber?: string } | null;
};

type ResidentialPropertyResponse = {
  listingId: number;
  category?: string;
  preference?: string;
  propertyType?: string;
  title?: string;
  description?: string;
  price?: number;
  area?: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  city?: string;
  state?: string;
  locality?: string;
  mediaFiles?: MediaResponse[];
  vip?: boolean;
  reraVerified?: boolean;
  residentialOwner?: { firstName?: string; lastName?: string; email?: string; phoneNumber?: string } | null;
};

type MediaProductionResponse = {
  mediaProductionId: number;
  graphics?: boolean;
  photoshoot?: boolean;
  agent?: AgentResponse;
  comResponse?: CommercialPropertyResponse | null;
  resResponse?: ResidentialPropertyResponse | null;
};

/* ---------------- Helpers ---------------- */
const currencyIN = (n?: number) => (typeof n === "number" ? n.toLocaleString("en-IN") : "");
function initialsFor(u?: AgentResponse) {
  const fn = u?.firstName ?? "";
  const ln = u?.lastName ?? "";
  const s = `${fn.charAt(0) || ""}${ln.charAt(0) || ""}`.toUpperCase();
  return s || "U";
}
function pickMediaOrd1(m?: MediaResponse[]) {
  if (!m || m.length === 0) return null;
  const byOrd = m.find((x) => x.ord === 1);
  return byOrd ?? m[0] ?? null;
}

// Utility function to convert a string (like "SALES_MANAGER") to PascalCase ("SalesManager")
const toPascalCase = (str: string): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(/[\s_-]+/)
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
};

/* ---------------- UI small components ---------------- */
function FeatureChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-orange-50 text-orange-700">
      {children}
    </span>
  );
}

/* ---------------- PropertyCard (left) ---------------- */
function PropertyCard({ p }: { p: ResidentialPropertyResponse | CommercialPropertyResponse | null }) {
  if (!p) return <div className="p-4 text-gray-500">No property data</div>;
  const isRes = String(p.category || "").toLowerCase() === "residential";
  const media = pickMediaOrd1(p.mediaFiles ?? []);
  const img = media?.url ?? NoPropertyFound;
  const priceLabel = p.price != null ? `₹ ${currencyIN(p.price)}` : "Price on request";
  const localityLine = [p.locality, p.city, p.state].filter(Boolean).join(" • ");
  const hasNum = (n: unknown) => typeof n === "number" && (n as number) > 0;
  const hasTrue = (b: unknown) => (typeof b === "boolean" && b) || (typeof b === "number" && (b as number) > 0);
  const navigate = useNavigate();

  return (
    <article className="rounded-xl shadow-md border-2 border-orange-100 bg-white overflow-hidden h-full flex flex-col min-h-0">
      <div className="relative">
        <img src={img} alt={String(p.title ?? "Property")} className="h-44 w-full object-cover" loading="lazy" />

        <span
          className={[
            "absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm",
            isRes ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700",
          ].join(" ")}
        >
          {isRes ? <Home className="h-3.5 w-3.5" /> : <Building2 className="h-3.5 w-3.5" />}
          {isRes ? "Residential" : "Commercial"}
        </span>

        {(p as any).vip && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-semibold shadow-sm">
            <Star className="h-3.5 w-3.5" /> Featured
          </span>
        )}
        {(p as any).reraVerified && (
          <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-1 text-xs font-semibold shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5" /> RERA
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 min-h-0">
        <h3 className="line-clamp-1 text-base font-semibold">{String(p.title ?? "Untitled")}</h3>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {p.preference && <FeatureChip>{p.preference}</FeatureChip>}
          {p.propertyType && <FeatureChip>{p.propertyType}</FeatureChip>}
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-gray-600">{p.description ?? "—"}</p>

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

          {isRes ? (
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
                  <Projector className="h-4 w-4" /> Meeting Rooms
                </span>
              )}
            </>
          )}
        </div>

        {/* Owner details (show if present) */}
        <div className="mt-3 text-xs text-gray-500">
          {isRes ? (
            (p as ResidentialPropertyResponse).residentialOwner ? (
              <div className="truncate">
                <span className="font-semibold">Owner:</span>{" "}
                <span className="truncate">
                  {(p as ResidentialPropertyResponse).residentialOwner?.firstName ?? ""}{" "}
                  {(p as ResidentialPropertyResponse).residentialOwner?.lastName ?? ""}
                  {(p as ResidentialPropertyResponse).residentialOwner?.email ? ` • ${(p as ResidentialPropertyResponse).residentialOwner?.email}` : ""}
                  {(p as ResidentialPropertyResponse).residentialOwner?.phoneNumber ? ` • ${(p as ResidentialPropertyResponse).residentialOwner?.phoneNumber}` : ""}
                </span>
              </div>
            ) : null
          ) : (
            (p as CommercialPropertyResponse).commercialOwner ? (
              <div className="truncate">
                <span className="font-semibold">Owner:</span>{" "}
                <span className="truncate">
                  {(p as CommercialPropertyResponse).commercialOwner?.firstName ?? ""}{" "}
                  {(p as CommercialPropertyResponse).commercialOwner?.lastName ?? ""}
                  {(p as CommercialPropertyResponse).commercialOwner?.email ? ` • ${(p as CommercialPropertyResponse).commercialOwner?.email}` : ""}
                  {(p as CommercialPropertyResponse).commercialOwner?.phoneNumber ? ` • ${(p as CommercialPropertyResponse).commercialOwner?.phoneNumber}` : ""}
                </span>
              </div>
            ) : null
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="text-orange-600 text-xl font-bold">{priceLabel}</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/admin/listings/view/${(p.category ?? "unknown").toString().toLowerCase()}/${p.listingId}`)}
              className="flex rounded-lg bg-orange-500 border px-3 py-1 text-sm text-white font-semibold hover:bg-orange-600 items-center gap-2"
            >
              <Eye className="w-4 h-4" /> View
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---------------- AgentCard (right) ---------------- */
function AgentCard({ agent, graphics, photoshoot }: { agent?: AgentResponse | null; graphics?: boolean; photoshoot?: boolean }) {
  if (!agent) return <div className="p-4 text-gray-500">No agent data</div>;

  return (
    <div className="rounded-xl shadow-md border-2 border-orange-100 bg-white overflow-hidden h-full flex flex-col min-h-0">
      {/* Top: profile image full width at top */}
      <div className="w-full h-44 bg-gray-100 flex-shrink-0 overflow-hidden">
        {agent.profileImageUrl ? (
          <img src={agent.profileImageUrl} alt="agent" className="h-full w-full object-cover" />
        ) : (
          <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-5xl">
            {initialsFor(agent)}
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1 min-h-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0">
            <div className="text-md font-semibold mr-2 truncate">{agent.firstName} {agent.lastName}</div>
            <div className="text-xs px-2 py-0.5 rounded-lg bg-yellow-100 text-orange-700 font-semibold inline-block mt-1">
              PropAdda {toPascalCase(agent.role ?? "Agent")}
            </div>
          </div>

          {/* <div className="flex-shrink-0">
            <a
              href={`/admin/agents/view/${agent.userId}`}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white bg-orange-500 hover:bg-orange-600 border border-orange-500"
            >
              <Eye size={16} /> View
            </a>
          </div> */}
        </div>

        <div className="mt-3 text-sm text-gray-600 flex-1 overflow-hidden">
          <div className="flex items-center gap-2 mt-2 truncate"><Mail size={14} /> <span className="truncate">{agent.email ?? "-"}</span></div>
          <div className="flex items-center gap-2 mt-2"><Phone size={14} /> <span>{agent.phoneNumber ?? "-"}</span></div>
          <div className="flex items-center gap-2 mt-2"><MapPin size={14} /> <span>{agent.city ?? "-"}, {agent.state ?? "-"}</span></div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {graphics && <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold bg-emerald-100 text-emerald-700 border border-emerald-700">Requested Graphic Services</span>}
            {photoshoot && <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold bg-purple-100 text-purple-700 border border-purple-700">Requested Photo Shoot / Drone shoot</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Main page ---------------- */
export default function ShootRequests() {
  const navigate = useNavigate();
  const [items, setItems] = useState<MediaProductionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchRequests() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/getMediaProductionRequests");

      // normalize -> always array
      let list: MediaProductionResponse[] = [];
      if (Array.isArray(res.data)) list = res.data;
      else if (res.data && typeof res.data === "object") {
        if (Array.isArray((res.data as any).data)) list = (res.data as any).data;
        else if (Array.isArray((res.data as any).content)) list = (res.data as any).content;
        else {
          const vals = Object.values(res.data);
          const firstArray = vals.find((v) => Array.isArray(v));
          if (firstArray) list = firstArray as MediaProductionResponse[];
        }
      }
      if (!Array.isArray(list)) list = [];

      // sort desc by id (newest first)
      const sorted = (list ?? []).slice().sort((a, b) => (b.mediaProductionId ?? 0) - (a.mediaProductionId ?? 0));
      setItems(sorted);
    } catch (e: any) {
      console.error("Failed to fetch media production requests:", e);
      setError(e?.response?.data?.message ?? e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  // pagination helpers (unified windowed)
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const total = totalPages || 1;
  const current = page + 1;
  const windowStart = Math.floor((current - 1) / 10) * 10 + 1;
  const windowEnd = Math.min(windowStart + 9, total);
  const numbers = useMemo(() => Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i), [windowStart, windowEnd]);

  const itemsToRender = items.slice(page * size, page * size + size);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Shoot Requests</h1>
        <div className="text-sm text-gray-600">{loading ? "Loading..." : `${items.length} requests`}</div>
      </header>

      {loading && <div className="py-8 text-center">Loading requests...</div>}
      {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4">Error: {error}</div>}

      {!loading && (
        <div className="space-y-6">
          {itemsToRender.length === 0 && <div className="text-gray-600 p-6 bg-white rounded">No shoot requests found.</div>}

          {itemsToRender.map((it) => {
            const prop = it.resResponse ?? it.comResponse ?? null;
            const media = pickMediaOrd1((prop as any)?.mediaFiles ?? []);
            // const imgUrl = media?.url ?? "https://via.placeholder.com/640x360?text=No+Image";
            const category = (prop as any)?.category ?? (it.comResponse ? "Commercial" : "Residential");
            const listingId = (prop as any)?.listingId ?? 0;

            return (
              <div key={it.mediaProductionId} className="bg-white rounded-lg shadow p-4 overflow-hidden">
                {/* Grid layout: stacked on small, 3-col on md+ */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-stretch gap-4">
                  {/* Property column */}
                  <div className="min-w-0">
                    <PropertyCard p={prop as any} />
                  </div>

                  {/* Arrow column */}
                  <div className="flex items-center justify-center">
                    <div className="md:hidden">
                      <ArrowDown className="w-8 h-8 text-orange-500" />
                    </div>
                    <div className="hidden md:flex">
                      <ArrowRight className="h-8 w-8 text-orange-500" />
                    </div>
                  </div>

                  {/* Agent column */}
                  <div className="min-w-0">
                    <AgentCard agent={it.agent ?? undefined} graphics={it.graphics} photoshoot={it.photoshoot} />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination (same unified pagination) */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#fff7f0] px-4 py-3 border border-orange-100">
            <div className="text-sm text-gray-600">
              Page <span className="font-medium">{current}</span> of <span className="font-medium">{total}</span>
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
                      className={["mx-1 w-9 h-9 text-sm rounded-full border transition", active ? "bg-orange-600 text-white border-orange-600" : "bg-white hover:bg-gray-50"].join(" ")}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>

              <button onClick={() => setPage((p) => Math.min(p + 1, Math.max(0, total - 1)))} disabled={current >= total || loading} className="text-sm text-gray-700 disabled:opacity-50">
                Next Page ›
              </button>
            </div>

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
        </div>
      )}
    </div>
  );
}
