import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { X, MapPin, Building2, Filter, Home } from "lucide-react";

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

export default function FilterExplorerModal({ open, onClose, onExplore, initial = {} }: Props) {
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT, ...initial });
  const [states, setStates] = useState<{ iso2: string; name: string }[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CSC_API_KEY = (import.meta.env.VITE_CSC_API_KEY as string) || "";

  // Freeze background scroll while modal is open
    useEffect(() => {
    if (open) {
        document.body.classList.add("overflow-hidden");
        document.documentElement.classList.add("overflow-hidden");
    } else {
        document.body.classList.remove("overflow-hidden");
        document.documentElement.classList.remove("overflow-hidden");
    }
    }, [open]);

  // Reset local state whenever the modal is opened with new initial
  useEffect(() => {
    if (open) setFilters({ ...DEFAULT, ...initial });
  }, [open, initial]);

  // Load states once
  useEffect(() => {
    if (!open) return;
    const loadStates = async () => {
      setLoadingGeo(true);
      setError(null);
      try {
        if (!CSC_API_KEY) {
          setError("Missing CSC API key (VITE_CSC_API_KEY).");
          setStates([]);
          return;
        }
        const res = await axios.get("https://api.countrystatecity.in/v1/countries/IN/states", {
          headers: { "X-CSCAPI-KEY": CSC_API_KEY },
        });
        const list = (res.data || []).map((s: any) => ({ iso2: s.iso2, name: s.name })) as {
          iso2: string;
          name: string;
        }[];
        list.sort((a, b) => a.name.localeCompare(b.name));
        setStates(list);
      } catch (e) {
        console.error("Failed to load states", e);
        setError("Failed to load states.");
      } finally {
        setLoadingGeo(false);
      }
    };
    loadStates();
  }, [open, CSC_API_KEY]);

  // Load cities when state changes
  useEffect(() => {
    if (!open) return;
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
        const list = (res.data || []).map((c: any) => c.name) as string[];
        list.sort((a, b) => a.localeCompare(b));
        setCities(list);
      } catch (e) {
        console.error("Failed to load cities", e);
        setError("Failed to load cities.");
        setCities([]);
      } finally {
        setLoadingGeo(false);
      }
    };
    loadCities();
  }, [open, filters.stateIso, CSC_API_KEY]);

  // Property types visible for current category
  const propertyTypesToShow = useMemo(() => {
    if (filters.category === "Residential") return RESIDENTIAL_TYPES;
    if (filters.category === "Commercial") return COMMERCIAL_TYPES;
    // All → union (unique)
    const set = new Set([...RESIDENTIAL_TYPES, ...COMMERCIAL_TYPES]);
    return Array.from(set);
  }, [filters.category]);

  // Preference options by category (commercial → no PG)
  const preferenceOptions = useMemo(() => {
    return filters.category === "Commercial" ? (["All", "Rent", "Buy"] as const) : (["All", "Rent", "Buy", "PG"] as const);
  }, [filters.category]);

  // When category changes, drop property types that no longer apply
  useEffect(() => {
    const visible = new Set(propertyTypesToShow);
    setFilters((f) => ({
      ...f,
      propertyTypes: f.propertyTypes.filter((p) => visible.has(p)),
    }));
  }, [propertyTypesToShow]);

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
    if (filters.city && !cities.includes(filters.city)) {
      setError("Please select a valid city.");
      return;
    }
    onExplore(filters);
    onClose();
  }, [filters, cities, onExplore, onClose]);

  if (!open) return null;

  return (
    <div
      aria-modal
      role="dialog"
      className="fixed inset-0 z-50"
      onClick={onClose}
    >
      {/* Dimmed backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal panel */}
      <div
        className="absolute inset-0 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
                <Filter className="w-4 h-4 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold">Explore Properties</h3>
            </div>
            <button
              aria-label="Close"
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content (scrollable) */}
          <div className="max-h-[80vh] overflow-y-auto p-5 space-y-6">
            {/* Row 1: Category & Preference */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
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
                <label className="block text-sm font-medium mb-1">Preference</label>
                <div className="flex gap-2 flex-wrap">
                  {preferenceOptions.map((pref) => (
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
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={filters.stateIso || ""}
                  onChange={(e) => setStateIso(e.target.value)}
                >
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

            {error && (
              <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t bg-gray-50">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-white">
              Cancel
            </button>
            <button
              onClick={explore}
              className="px-5 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
            >
              Explore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
