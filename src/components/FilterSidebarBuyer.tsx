// src/components/FilterSidebarBuyer.tsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import {
  ChevronLeft, ChevronRight, Filter as FilterIcon, Shapes, Building,
  Tag, IndianRupee, Armchair, MapPin, Sparkles, CalendarCheck,
  Maximize2, History, ChevronUp, ChevronDown, Search, RotateCw,
} from "lucide-react";

export type Filters = {
  category: "All" | "Residential" | "Commercial";
  propertyTypes: string[];
  preference: "All" | "Rent" | "Buy" | "PG"; // <-- Buy (not Sale)
  priceMin?: number | null;
  priceMax?: number | null;
  furnishing?: "" | "Unfurnished" | "Semi-furnished" | "Fully-furnished";
  stateIso?: string;
  stateName?: string;
  city?: string;
  amenities: string[];
  availability: "All" | "Ready to move" | "Under Construction";
  areaMin?: number | null;
  areaMax?: number | null;
  ageRanges: string[];
};

const DEFAULTS: Filters = {
  category: "All",
  propertyTypes: [],
  preference: "All",
  priceMin: null,
  priceMax: null,
  furnishing: "",
  stateIso: "",
  stateName: "",
  city: "",
  amenities: [],
  availability: "All",
  areaMin: null,
  areaMax: null,
  ageRanges: [],
};

const RESIDENTIAL = ["Flat", "House", "Villa", "Apartment"];
const COMMERCIAL = ["Office", "Plot/Land", "Storage/Warehouse"];
const PREFERENCES = ["Rent", "Buy", "PG"]; // <-- Buy
const FURNISHING = ["Unfurnished", "Semi-furnished", "Fully-furnished"];
const AVAILABILITY = ["Ready to move", "Under Construction"];
const AGE_OPTIONS = [
  "0-1 Years","1-3 Years","3-5 Years","5-10 Years","10-15 Years","More than 15 years old",
];
const AMENITIES = [
  "Elevator","Water 24x7","Gas Pipeline","Pet Friendly","Emergency Exit","Wheelchair Friendly",
  "Vastu Compliant","Pooja Room","Study Room","Servant Room","Store Room","Modular Kitchen",
  "High Ceiling Height","Park","Swimming Pool","Gym","Clubhouse / Community Center",
  "Municipal Corporation","In Gated Society","Corner Property",
];

type ApiResponse = {
  residential: any[] | null;
  commercial: any[] | null;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

// type Props = {
//   initial?: Partial<Filters>;
//   onApply: (f: Filters) => void;
//   onReset?: () => void;
// };

type Props = {
  initial?: Partial<Filters>;
  onApply: (f: Filters, data: ApiResponse | null) => void;
  onReset?: () => void;
};

const MAX_PRICE = 100000000;
const MAX_AREA = 1000000;
const SLIDER_COLOR = "#ff671f";

const FilterSidebarBuyer: React.FC<Props> = ({ initial = {}, onApply, onReset }) => {
  const initialMerged: Filters = { ...DEFAULTS, ...initial };
  const [filters, setFilters] = useState<Filters>(initialMerged);
  const [states, setStates] = useState<{ name: string; iso2: string }[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [loading, setLoading] = useState(false);

  const CSC_API_KEY =
    (import.meta.env.VITE_CSC_API_KEY as string) ||
    "ZXBOVkxVdmVaNjhiMHlqQm5PZXpxWmRSanlIUHB4a0hCSHBwNGRFRA==";

  const isCommercial = filters.category === "Commercial";
  const onlyPlot =
    filters.propertyTypes.length === 1 && filters.propertyTypes[0] === "Plot/Land";

  const preferenceOptions = useMemo(
    () => (isCommercial ? ["Rent", "Buy"] : PREFERENCES),
    [isCommercial]
  );
  const propertyTypes = useMemo(() => {
    if (filters.category === "Residential") return RESIDENTIAL;
    if (filters.category === "Commercial") return COMMERCIAL;
    return [...RESIDENTIAL, ...COMMERCIAL];
  }, [filters.category]);

  useEffect(() => {
    (async () => {
      try {
        if (!CSC_API_KEY) return;
        const resp = await axios.get(
          "https://api.countrystatecity.in/v1/countries/IN/states",
          { headers: { "X-CSCAPI-KEY": CSC_API_KEY } }
        );
        setStates(resp.data.map((s: any) => ({ name: s.name, iso2: s.iso2 })));
      } catch {}
    })();
  }, [CSC_API_KEY]);

  useEffect(() => {
    (async () => {
      if (!filters.stateIso || !CSC_API_KEY) {
        setCities([]);
        return;
      }
      try {
        const resp = await axios.get(
          `https://api.countrystatecity.in/v1/countries/IN/states/${filters.stateIso}/cities`,
          { headers: { "X-CSCAPI-KEY": CSC_API_KEY } }
        );
        setCities(resp.data.map((c: any) => c.name));
      } catch { setCities([]); }
    })();
  }, [filters.stateIso, CSC_API_KEY]);

  const callApi = async (f: Filters) => {
    setLoading(true);
    try {
        const body = {
        category: f.category ?? "All",
        propertyType: f.propertyTypes ?? [],
        preference:
            f.preference === "Buy" ? "sale" :
            f.preference === "Rent" ? "rent" :
            f.preference === "PG" ? "pg" : "all",
        priceMin: f.priceMin ?? null,
        priceMax: f.priceMax ?? null,
        furnishing: f.furnishing ?? "",
        state: f.stateName ?? "",
        city: f.city ?? "",
        amenities: f.amenities ?? [],
        availability: f.availability ?? "All",
        areaMin: f.areaMin ?? null,
        areaMax: f.areaMax ?? null,
        age: f.ageRanges ?? [],
        };

        const { data } = await axios.post<ApiResponse>(
        `${API_BASE_URL}/user/getDetailedFilteredProperties`,
        body,
        { withCredentials: true }
        );
        onApply(f, data); // <-- pass results to page
    } catch (e) {
        console.error("Filter fetch failed", e);
        onApply(f, null); // still notify page
    } finally {
        setLoading(false);
    }
    };
  // helpers
  const toggle = (list: string[], val: string) =>
    list.includes(val) ? list.filter((x) => x !== val) : [...list, val];

  //const apply = () => onApply(filters);
  const apply = () => callApi(filters);
//   const reset = () => {
//     setFilters(DEFAULTS);
//     setCities([]);
//     setExpanded(false);
//     onReset?.();
//   };
    const reset = () => {
    const cleared = { ...DEFAULTS };
    setFilters(cleared);
    setCities([]);
    setExpanded(false);
    onReset?.();
    callApi(cleared);
    };

  return (
    <aside className={`${collapsed ? "w-14" : "w-72"} bg-white border-r p-3 transition-all duration-200 shrink-0`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#fff1e9] flex items-center justify-center">
              <FilterIcon className="w-4 h-4 text-[#ff671f]" />
            </div>
            <h3 className="text-base font-bold">Filters</h3>
          </div>
        ) : (
          <div className="w-full flex items-center justify-center">
            <FilterIcon className="w-5 h-5 text-[#ff671f]" />
          </div>
        )}
        <button className="p-1.5 rounded-md hover:bg-gray-50" onClick={() => setCollapsed((v) => !v)}>
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {collapsed && <div className="text-xs text-gray-500 text-center">Click to apply filters</div>}

      {!collapsed && (
        <>
          {/* Category */}
          <label className="block text-sm mb-1 font-semibold flex items-center gap-2"><Shapes className="w-4 h-4"/>Category</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value as any }))}
            className="w-full text-sm border rounded p-2 mb-3"
          >
            <option value="All">All</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
          </select>

          {/* Property types */}
          <div className="mb-3">
            <div className="text-sm mb-1 font-semibold flex items-center gap-2"><Building className="w-4 h-4"/>Property Type</div>
            <div className="grid grid-cols-2 gap-1">
              {propertyTypes.map((pt) => (
                <label key={pt} className="text-xs">
                  <input
                    type="checkbox"
                    checked={filters.propertyTypes.includes(pt)}
                    onChange={() => setFilters((f) => ({ ...f, propertyTypes: toggle(f.propertyTypes, pt) }))}
                    className="mr-2"
                  />
                  {pt}
                </label>
              ))}
            </div>
          </div>

          {/* Preference (Buy wording) */}
          <label className="block text-sm mb-1 font-semibold flex items-center gap-2"><Tag className="w-4 h-4"/>Preference</label>
          <select
            value={isCommercial && filters.preference === "PG" ? "All" : filters.preference}
            onChange={(e) => setFilters((f) => ({ ...f, preference: e.target.value as any }))}
            className="w-full text-sm border rounded p-2 mb-3"
          >
            <option value="All">All</option>
            {preferenceOptions.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>

          {/* Budget */}
          <label className="block text-sm mb-1 font-semibold flex items-center gap-2">
            <IndianRupee className="w-4 h-4" /> Budget (₹)
          </label>
          <div className="mb-4">
            <Slider
              range min={0} max={MAX_PRICE} step={10000}
              value={[filters.priceMin ?? 0, filters.priceMax ?? MAX_PRICE]}
              onChange={(v) => {
                const [min, max] = Array.isArray(v) ? v : [v, v];
                setFilters((f) => ({ ...f, priceMin: Number(min), priceMax: Number(max) }));
              }}
              trackStyle={[{ backgroundColor: SLIDER_COLOR }]}
              handleStyle={[{ borderColor: SLIDER_COLOR }, { borderColor: SLIDER_COLOR }]}
              railStyle={{ backgroundColor: "#e5e7eb" }}
            />
            <div className="flex justify-between mt-2">
              <input
                type="number" min={0} max={MAX_PRICE}
                value={filters.priceMin ?? ""} placeholder="Min"
                onChange={(e) => {
                  const val = e.target.value === "" ? null : Number(e.target.value);
                  setFilters((f) => {
                    const curMax = f.priceMax ?? MAX_PRICE;
                    return { ...f, priceMin: val, priceMax: val !== null && curMax < val ? val : curMax };
                  });
                }}
                className="w-1/2 border rounded p-2 mr-2"
              />
              <input
                type="number" min={0} max={MAX_PRICE}
                value={filters.priceMax ?? ""} placeholder="Max"
                onChange={(e) => {
                  const val = e.target.value === "" ? null : Number(e.target.value);
                  setFilters((f) => {
                    const curMin = f.priceMin ?? 0;
                    return { ...f, priceMax: val, priceMin: val !== null && curMin > val ? val : curMin };
                  });
                }}
                className="w-1/2 border rounded p-2"
              />
            </div>
          </div>

          {/* Furnishing (residential only) */}
          {filters.category !== "Commercial" && (
            <>
              <label className="block text-sm mb-1 font-semibold flex items-center gap-2">
                <Armchair className="w-4 h-4"/> Furnishing
              </label>
              <select
                value={filters.furnishing}
                onChange={(e) => setFilters((f) => ({ ...f, furnishing: e.target.value as any }))}
                className="w-full text-sm border rounded p-2 mb-3"
              >
                <option value="">Any</option>
                {FURNISHING.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </>
          )}

          {/* State & City */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1">
              <label className="block text-sm mb-1 font-semibold flex items-center gap-2"><MapPin className="w-4 h-4"/>State</label>
              <select
                value={filters.stateIso}
                onChange={(e) => {
                  const iso = e.target.value;
                  const name = states.find((s) => s.iso2 === iso)?.name ?? "";
                  setFilters((f) => ({ ...f, stateIso: iso, stateName: name, city: "" }));
                }}
                className="w-full text-sm border rounded p-2"
              >
                <option value="">Select state</option>
                {states.map((s) => <option key={s.iso2} value={s.iso2}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1 font-semibold">City</label>
              <select
                value={filters.city}
                onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
                className="w-full text-sm border rounded p-2"
              >
                <option value="">Any</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Amenities (residential only) */}
          {filters.category !== "Commercial" && (
            <div className="mb-3">
              <div className="text-sm mb-1 font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4"/>Amenities</div>
              <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto">
                {(expanded ? AMENITIES : AMENITIES.slice(0, 6)).map((am) => (
                  <label key={am} className="text-xs">
                    <input
                      type="checkbox"
                      checked={filters.amenities.includes(am)}
                      onChange={() => setFilters((f) => ({ ...f, amenities: toggle(f.amenities, am) }))}
                      className="mr-2"
                    />
                    {am}
                  </label>
                ))}
              </div>
              <button
                className="mt-2 font-semibold text-xs text-[#ff671f] hover:underline flex items-center gap-1"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
                {expanded ? "Show less" : `Show more (${AMENITIES.length - 6})`}
              </button>
            </div>
          )}

          {/* Availability */}
            <label className="block text-sm mb-1 font-semibold flex items-center gap-2">
            <CalendarCheck className="w-4 h-4"/>Availability
            </label>
            <select
            value={filters.availability}
            onChange={(e) => setFilters((f) => ({ ...f, availability: e.target.value as any }))}
            className={`w-full text-sm border rounded p-2 mb-3 ${onlyPlot ? "bg-gray-100 cursor-not-allowed" : ""}`}
            disabled={onlyPlot}
            title={onlyPlot ? "Availability not applicable for Plot/Land" : undefined}
            >
            <option value="All">All</option>
            {AVAILABILITY.map((a) => (
                <option key={a} value={a}>
                {a}
                </option>
            ))}
            </select>

          {/* Area */}
          <div className="mb-3">
            <div className="text-sm mb-1 font-semibold flex items-center gap-2"><Maximize2 className="w-4 h-4"/>Area (sq.ft)</div>
            <Slider
              range min={0} max={MAX_AREA} step={100}
              value={[filters.areaMin ?? 0, filters.areaMax ?? MAX_AREA]}
              onChange={(v) => {
                const [min, max] = Array.isArray(v) ? v : [v, v];
                setFilters((f) => ({ ...f, areaMin: Number(min), areaMax: Number(max) }));
              }}
              trackStyle={[{ backgroundColor: SLIDER_COLOR }]}
              handleStyle={[{ borderColor: SLIDER_COLOR }, { borderColor: SLIDER_COLOR }]}
              railStyle={{ backgroundColor: "#e5e7eb" }}
            />
            <div className="flex gap-2 mt-2">
              <input
                type="number" min={0} max={MAX_AREA} placeholder="Min"
                value={filters.areaMin ?? ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? null : Number(e.target.value);
                  setFilters((f) => {
                    const curMax = f.areaMax ?? MAX_AREA;
                    return { ...f, areaMin: val, areaMax: val !== null && curMax < val ? val : curMax };
                  });
                }}
                className="w-1/2 border rounded p-2 mr-2"
              />
              <input
                type="number" min={0} max={MAX_AREA} placeholder="Max"
                value={filters.areaMax ?? ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? null : Number(e.target.value);
                  setFilters((f) => {
                    const curMin = f.areaMin ?? 0;
                    return { ...f, areaMax: val, areaMin: val !== null && curMin > val ? val : curMin };
                  });
                }}
                className="w-1/2 border rounded p-2"
              />
            </div>
          </div>

          {/* Age */}
          <div className="mb-3">
            <div className="text-sm mb-1 font-semibold flex items-center gap-2"><History className="w-4 h-4"/>Age of property</div>
            <div className="grid grid-cols-2 gap-1">
              {AGE_OPTIONS.map((a) => (
                <label key={a} className="text-xs">
                  <input
                    type="checkbox"
                    checked={filters.ageRanges.includes(a)}
                    onChange={() => setFilters((f) => ({ ...f, ageRanges: toggle(f.ageRanges, a) }))}
                    className="mr-2"
                  />
                  {a}
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4">
            {/* <button
              onClick={apply}
              className="w-full bg-[#ff671f] text-white py-2 rounded flex items-center justify-center gap-2 hover:scale-[1.02] transition"
            >
              <Search className="w-4 h-4"/> Apply
            </button>
            <button
              onClick={reset}
              className="w-full bg-gray-300 text-gray-800 py-2 rounded mt-2 flex items-center justify-center gap-2 hover:scale-[1.02] transition"
            >
              <RotateCw className="w-4 h-4"/> Reset Filters
            </button> */}
            <button
                onClick={apply}
                disabled={loading}
                className="w-full bg-[#ff671f] text-white py-2 rounded flex items-center justify-center gap-2 hover:scale-[1.02] transition disabled:opacity-50"
                >
                <Search className="w-4 h-4"/> {loading ? "Applying..." : "Apply"}
                </button>

                <button
                onClick={reset}
                disabled={loading}
                className="w-full bg-gray-300 text-gray-800 py-2 rounded mt-2 flex items-center justify-center gap-2 hover:scale-[1.02] transition disabled:opacity-50"
                >
                <RotateCw className="w-4 h-4"/> {loading ? "Resetting..." : "Reset Filters"}
                </button>
          </div>
        </>
      )}
    </aside>
  );
};

export default FilterSidebarBuyer;
