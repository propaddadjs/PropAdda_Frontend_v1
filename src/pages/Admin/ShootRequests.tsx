// ShootRequests.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import {
  ArrowRight,
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
    if (!str) return '';
    
    // 1. Replace underscores/dashes with space (for multi-word roles like "SALES_MANAGER")
    // 2. Convert to lowercase
    // 3. Split by spaces
    // 4. Capitalize the first letter of each word
    // 5. Join them back without spaces
    return str.toLowerCase()
              .split(/[\s_-]+/)
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join('');
};

/* ---------------- UI small components ---------------- */
function FeatureChip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-orange-50 text-orange-700">{children}</span>;
}

/* ---------------- PropertyCard (left) ---------------- */
function PropertyCard({ p }: { p: ResidentialPropertyResponse | CommercialPropertyResponse | null }) {
  if (!p) return <div className="p-4 text-gray-500">No property data</div>;
  const isRes = String(p.category || "").toLowerCase() === "residential";
  const media = pickMediaOrd1(p.mediaFiles ?? []);
  const img = media?.url ?? "https://via.placeholder.com/640x360?text=No+Image";
  const priceLabel = p.price != null ? `₹ ${currencyIN(p.price)}` : "Price on request";
  const localityLine = [p.locality, p.city, p.state].filter(Boolean).join(" • ");
  const hasNum = (n: unknown) => typeof n === "number" && (n as number) > 0;
  const hasTrue = (b: unknown) => (typeof b === "boolean" && b) || (typeof b === "number" && (b as number) > 0);
  const navigate = useNavigate();

  return (
    <article className="rounded-xl shadow-md border-2 border-orange-100 bg-white overflow-hidden">
      <div className="relative">
        <img src={img} alt={String(p.title ?? "Property")} className="h-44 w-full object-cover" loading="lazy" />

        <span className={["absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm", isRes ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"].join(" ")}>
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

      <div className="p-4">
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

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-700">
          {isRes ? (
            <>
              {((p as ResidentialPropertyResponse).residentialOwner?.firstName || (p as ResidentialPropertyResponse).residentialOwner?.lastName) && (
                <span className="inline-flex items-center gap-1">
                  <User2 className="h-4 w-4" /> {(p as ResidentialPropertyResponse).residentialOwner?.firstName ?? ""}{" "}
                  {(p as ResidentialPropertyResponse).residentialOwner?.lastName ?? ""}
                </span>
              )}
              {(p as ResidentialPropertyResponse).residentialOwner?.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-4 w-4" /> {(p as ResidentialPropertyResponse).residentialOwner?.email}
                </span>
              )}
              {(p as ResidentialPropertyResponse).residentialOwner?.phoneNumber && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-4 w-4" /> {(p as ResidentialPropertyResponse).residentialOwner?.phoneNumber}
                </span>
              )}
            </>
          ) : (
            <>
              {((p as CommercialPropertyResponse).commercialOwner?.firstName || (p as CommercialPropertyResponse).commercialOwner?.lastName) && (
                <span className="inline-flex items-center gap-1">
                  <User2 className="h-4 w-4" /> {(p as CommercialPropertyResponse).commercialOwner?.firstName ?? ""}{" "}
                  {(p as CommercialPropertyResponse).commercialOwner?.lastName ?? ""}
                </span>
              )}
              {(p as CommercialPropertyResponse).commercialOwner?.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-4 w-4" /> {(p as CommercialPropertyResponse).commercialOwner?.email}
                </span>
              )}
              {(p as CommercialPropertyResponse).commercialOwner?.phoneNumber && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-4 w-4" /> {(p as CommercialPropertyResponse).commercialOwner?.phoneNumber}
                </span>
              )}
            </>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="text-orange-600 text-xl font-bold">{priceLabel}</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/admin/listings/view/${(p.category ?? 'unknown').toString().toLowerCase()}/${p.listingId}`)}
              className="flex rounded-lg bg-orange-500 border px-3 py-1.5 text-sm text-white font-semibold hover:bg-orange-600 items-center gap-2"
            >
              <Eye className="w-4 h-4" /> View
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---------------- UserCard (right) ---------------- */
function UserCard({ agent, graphics, photoshoot }: { agent?: AgentResponse | null; graphics?: boolean; photoshoot?: boolean }) {
  if (!agent) return <div className="p-4 text-gray-500">No agent data</div>;
  return (
    <div className="w-80 flex-shrink-0 rounded-xl shadow-md border-2 border-orange-100 bg-white overflow-hidden flex flex-col">
      {/* Top: profile image full width at top (like earlier design) */}
      <div className="w-full h-[40%] bg-gray-100 flex-shrink-0">
        {agent.profileImageUrl ? (
          <img src={agent.profileImageUrl} alt="agent" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-6xl">
            {initialsFor(agent)}
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-md font-semibold">
            {agent.firstName} {agent.lastName}
          </div>
          <div className="text-xs px-2 py-0.5 rounded-lg bg-yellow-100 text-orange-700 font-semibold inline-block mt-1">PropAdda {toPascalCase(agent.role ?? "Agent")}</div>

          <div className="mt-3 text-sm text-gray-600">
            <div className="flex items-center gap-2 mt-2">
              <Mail className="w-4 h-4 text-orange-500" /> <span>{agent.email ?? "-"}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Phone className="w-4 h-4 text-orange-500" /> <span>{agent.phoneNumber ?? "-"}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4 text-orange-500" /> <span>{agent.city ?? "-"}, {agent.state ?? "-"}</span>
            </div>
          </div>
        </div>

        {/* Tags + small actions */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {graphics && <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold bg-emerald-100 text-emerald-700 border border-emerald-700">Requested Graphic Services</span>}
            {photoshoot && <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold bg-purple-100 text-purple-700 border border-purple-700">Requested Photo Shoot / Drone Shoot</span>}
          </div>
{/* 
          <div className="flex flex-col gap-2">
            <a href={`/admin/agents/view/${agent.userId}`} className="text-sm text-orange-600 font-semibold">View Agent</a>
          </div> */}
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
        <div className="space-y-4">
          {itemsToRender.length === 0 && <div className="text-gray-600 p-6 bg-white rounded">No shoot requests found.</div>}

          {itemsToRender.map((it) => {
            const prop = it.resResponse ?? it.comResponse ?? null;
            const media = pickMediaOrd1((prop as any)?.mediaFiles ?? []);
            const imgUrl = media?.url ?? "https://via.placeholder.com/640x360?text=No+Image";
            const category = (prop as any)?.category ?? (it.comResponse ? "Commercial" : "Residential");
            const listingId = (prop as any)?.listingId ?? (prop as any)?.listingId ?? 0;

            return (
              <div key={it.mediaProductionId} className="bg-white rounded-lg shadow p-4 flex items-stretch gap-4">
                {/* Left: property (flexible) */}
                <div className="flex-1">
                  {/* <div className="rounded-xl shadow-sm border bg-white overflow-hidden">
                    <div className="relative">
                      <img src={imgUrl} alt={prop?.title ?? "Property"} className="h-44 w-full object-cover" />
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 shadow-sm">
                        {category.toLowerCase() === "residential" ? <Home className="h-3.5 w-3.5" /> : <Building2 className="h-3.5 w-3.5" />}
                        {category}
                      </span>
                      {(prop as any)?.vip && <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-semibold shadow-sm"><Star className="h-3.5 w-3.5" /> Featured</span>}
                    </div>

                    <div className="p-4">
                      <h3 className="line-clamp-1 text-base font-semibold">{String(prop?.title ?? "Untitled")}</h3>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {prop?.preference && <FeatureChip>{prop.preference}</FeatureChip>}
                        {prop?.propertyType && <FeatureChip>{prop.propertyType}</FeatureChip>}
                      </div>

                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">{prop?.description ?? "—"}</p>

                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <div className="text-orange-600 text-xl font-bold">₹ {currencyIN((prop as any)?.price)}</div>
                          <div className="text-xs text-gray-500">{(prop as any)?.area ? `${(prop as any).area} sqft` : ""}</div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/admin/listings/view/${category.toString().toLowerCase()}/${listingId}`)}
                            className="flex rounded-lg bg-orange-500 border px-3 py-1.5 text-sm text-white font-semibold hover:bg-orange-600 items-center gap-2"
                          >
                            <Eye className="w-4 h-4" /> View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div> */}
                  <PropertyCard p={prop as any} />
                </div>

                {/* Arrow / divider */}
                <div className="flex items-center justify-center w-12">
                  <div className="flex flex-col items-center text-orange-500">
                    <ArrowRight className="h-10 w-12" />
                  </div>
                </div>

                {/* Right: user/agent card */}
                <UserCard agent={it.agent} graphics={it.graphics} photoshoot={it.photoshoot} />
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
