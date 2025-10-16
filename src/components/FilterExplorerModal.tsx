// src/components/FilterExplorerModal.tsx
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import axios from "axios";
import { X, MapPin, Building2, Filter, Home, Component, Shapes } from "lucide-react";

export type Filters = {
  category: "All" | "Residential" | "Commercial";
  propertyTypes: string[];
  preference: "All" | "Rent" | "Buy" | "PG";
  stateIso?: string;
  stateName?: string;
  city?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onExplore: (f: Filters) => void; // parent calls /user/getFilteredProperties
  initial?: Partial<Filters>;
};

const RESIDENTIAL_TYPES = ["Flat", "House", "Villa", "Apartment", "Plot/Land"];
const COMMERCIAL_TYPES = ["Office", "Plot/Land", "Storage/Warehouse"];

const DEFAULT: Filters = {
  category: "All",
  propertyTypes: [],
  preference: "All",
  stateIso: "",
  stateName: "",
  city: "",
};

/* ========================= Helpers ========================= */
// shallow array equality for primitives (order matters)
function arrEquals(a: any[] = [], b: any[] = []) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// shallow compare for relevant Filters fields (we don't compare functions)
function filtersEqual(a: Filters, b: Filters) {
  return (
    a.category === b.category &&
    a.preference === b.preference &&
    a.stateIso === b.stateIso &&
    a.stateName === b.stateName &&
    a.city === b.city &&
    arrEquals(a.propertyTypes, b.propertyTypes)
  );
}

/* ========================= Component ========================= */
export default function FilterExplorerModal({ open, onClose, onExplore, initial = {} }: Props) {
  // keep a ref to avoid re-applying identical initial repeatedly
  const initialRef = useRef<Partial<Filters>>(initial);
  initialRef.current = initial;

  const [filters, setFilters] = useState<Filters>({ ...DEFAULT, ...initial });
  const [states, setStates] = useState<{ iso2: string; name: string }[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CSC_API_KEY =
    (import.meta.env.VITE_CSC_API_KEY as string) ||
    "ZXBOVkxVdmVaNjhiMHlqQm5PZXpxWmRSanlIUHB4a0hCSHBwNGRFRA==";

  // Freeze background scroll while modal is open
  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
      document.documentElement.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
      document.documentElement.classList.remove("overflow-hidden");
    }
    // cleanup on unmount just in case
    return () => {
      document.body.classList.remove("overflow-hidden");
      document.documentElement.classList.remove("overflow-hidden");
    };
  }, [open]);

  // Reset local state whenever the modal is opened with new initial,
  // but only update if the incoming initial actually changes the filters.
  useEffect(() => {
    if (!open) return;
    const merged = { ...DEFAULT, ...initialRef.current };
    // only set if different
    if (!filtersEqual(filters, merged as Filters)) {
      setFilters((prev) => {
        // final safeguard: return prev if equal
        if (filtersEqual(prev, merged as Filters)) return prev;
        return { ...(merged as Filters) };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // intentionally only listen to `open` (initialRef holds the latest initial)

  // Property types visible for current category (memoized by category)
  const propertyTypesToShow = useMemo(() => {
    if (filters.category === "Residential") return RESIDENTIAL_TYPES;
    if (filters.category === "Commercial") return COMMERCIAL_TYPES;
    // All → union (unique)
    const set = new Set([...RESIDENTIAL_TYPES, ...COMMERCIAL_TYPES]);
    return Array.from(set);
  }, [filters.category]);

  // When category changes, drop property types that no longer apply.
  // We guard against unnecessary state updates by checking equality.
  useEffect(() => {
    setFilters((prev) => {
      const visible = new Set(propertyTypesToShow);
      const filtered = prev.propertyTypes.filter((p) => visible.has(p));
      if (arrEquals(filtered, prev.propertyTypes)) return prev;
      return { ...prev, propertyTypes: filtered };
    });
  }, [propertyTypesToShow]);

  // Load states once when modal opens
  useEffect(() => {
    if (!open) return;
    let active = true;
    const loadStates = async () => {
      setLoadingGeo(true);
      setError(null);
      try {
        if (!CSC_API_KEY) {
          setError("Missing CSC API key (VITE_CSC_API_KEY).");
          if (active) setStates([]);
          return;
        }
        const res = await axios.get("https://api.countrystatecity.in/v1/countries/IN/states", {
          headers: { "X-CSCAPI-KEY": CSC_API_KEY },
        });
        if (!active) return;
        const list = (res.data || []).map((s: any) => ({ iso2: s.iso2, name: s.name })) as {
          iso2: string;
          name: string;
        }[];
        list.sort((a, b) => a.name.localeCompare(b.name));
        // only update if changed
        setStates((prev) => {
          if (prev.length === list.length && prev.every((x, i) => x.iso2 === list[i].iso2 && x.name === list[i].name)) {
            return prev;
          }
          return list;
        });
      } catch (e) {
        console.error("Failed to load states", e);
        if (active) setError("Failed to load states.");
      } finally {
        if (active) setLoadingGeo(false);
      }
    };
    loadStates();
    return () => {
      active = false;
    };
  }, [open, CSC_API_KEY]);

  // Load cities when state changes
  useEffect(() => {
    if (!open) return;
    let active = true;
    const iso = filters.stateIso;
    if (!iso || !CSC_API_KEY) {
      setCities([]);
      return;
    }
    const loadCities = async () => {
      setLoadingGeo(true);
      setError(null);
      try {
        const res = await axios.get(
          `https://api.countrystatecity.in/v1/countries/IN/states/${iso}/cities`,
          { headers: { "X-CSCAPI-KEY": CSC_API_KEY } }
        );
        if (!active) return;
        const list = (res.data || []).map((c: any) => c.name) as string[];
        list.sort((a, b) => a.localeCompare(b));
        setCities((prev) => {
          if (prev.length === list.length && prev.every((x, i) => x === list[i])) return prev;
          return list;
        });
      } catch (e) {
        console.error("Failed to load cities", e);
        if (active) {
          setError("Failed to load cities.");
          setCities([]);
        }
      } finally {
        if (active) setLoadingGeo(false);
      }
    };
    loadCities();
    return () => {
      active = false;
    };
  }, [open, filters.stateIso, CSC_API_KEY]);

  // toggleType
  const toggleType = (pt: string) => {
    setFilters((f) => {
      const exists = f.propertyTypes.includes(pt);
      return { ...f, propertyTypes: exists ? f.propertyTypes.filter((x) => x !== pt) : [...f.propertyTypes, pt] };
    });
  };

  const setStateIso = (iso: string) => {
    const name = states.find((s) => s.iso2 === iso)?.name || "";
    setFilters((f) => ({ ...f, stateIso: iso, stateName: name, city: "" }));
  };

  const explore = useCallback(() => {
    // basic validations (optional): ensure city belongs to selected state list
    if (filters.city && cities.length > 0 && !cities.includes(filters.city)) {
      setError("Please select a valid city.");
      return;
    }
    onExplore(filters);
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, cities, onExplore, onClose]);

  if (!open) return null;

  return (
    <div
      aria-modal
      role="dialog"
      className="fixed inset-0 z-[99999] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Dimmed backdrop */}
      <div
        className="absolute inset-0 bg-black/50 pointer-events-auto z-[99999]"
        aria-hidden
      />

      {/* Modal panel */}
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-lg border overflow-hidden z-[100000] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
              <Filter className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold">Explore Properties</h3>
          </div>
          <button aria-label="Close" onClick={onClose} className="p-2 rounded-md hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content (scrollable) */}
        <div className="max-h-[80vh] overflow-y-auto p-5 space-y-6">
          {/* Row 1: Category & Preference */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="flex items-center block text-sm font-medium mb-1"><Component className="h-4 w-4 mr-2" />Category</label>
              <div className="flex gap-2 flex-wrap">
                {(["All", "Residential", "Commercial"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilters((f) => ({ ...f, category: cat }))}
                    className={`px-4 py-2 rounded-lg border text-sm ${
                      filters.category === cat ? "bg-orange-500 text-white border-orange-600" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Preference */}
            <div>
              <label className="flex items-center block text-sm font-medium mb-1"><Shapes className="h-4 w-4 mr-2" />Preference</label>
              <div className="flex gap-2 flex-wrap">
                {(
                  filters.category === "Commercial"
                    ? (["All", "Rent", "Buy"] as const)
                    : (["All", "Rent", "Buy", "PG"] as const)
                ).map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setFilters((f) => ({ ...f, preference: pref }))}
                    className={`px-4 py-2 rounded-lg border text-sm ${
                      filters.preference === pref ? "bg-orange-500 text-white border-orange-600" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Property Types as selectable chips */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Property Type
            </label>
            <div className="flex gap-2 flex-wrap">
              {propertyTypesToShow.map((pt) => {
                const active = filters.propertyTypes.includes(pt);
                return (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => toggleType(pt)}
                    className={`px-3 py-1.5 rounded-full border text-sm ${
                      active ? "bg-orange-500 text-white border-orange-600" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {pt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: State & City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* State */}
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> State
              </label>
              <select className="w-full border rounded-lg px-3 py-2" value={filters.stateIso || ""} onChange={(e) => setStateIso(e.target.value)}>
                <option value="">All India</option>
                {states.map((s) => (
                  <option key={s.iso2} value={s.iso2}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <Home className="w-4 h-4" /> City
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                disabled={!filters.stateIso || loadingGeo}
                value={filters.city || ""}
                onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
              >
                <option value="">{filters.stateIso ? "All Cities" : "Select state first"}</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-white">
            Cancel
          </button>
          <button onClick={explore} className="px-5 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600">
            Explore
          </button>
        </div>
      </div>
    </div>
  );
}
