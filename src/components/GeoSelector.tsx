// Author-Hemant Arora
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

export type StateItem = { iso2: string; name: string };
export type CityItem = { name: string };

type Props = {
  stateIso: string;
  city: string;
  onStateChange: (iso2: string, name: string) => void;
  onCityChange: (cityName: string) => void;
  disabled?: boolean;
  className?: string;         // allow you to apply your existing styles
  statePlaceholder?: string;
  cityPlaceholder?: string;
};

const CSC_API_KEY = (import.meta.env.VITE_CSC_API_KEY as string) || "ZXBOVkxVdmVaNjhiMHlqQm5PZXpxWmRSanlIUHB4a0hCSHBwNGRFRA==";

const GeoSelector: React.FC<Props> = ({
  stateIso,
  city,
  onStateChange,
  onCityChange,
  disabled,
  className,
  statePlaceholder = "Select State",
  cityPlaceholder = "Select City",
}) => {
  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStates = useCallback(async () => {
    if (!CSC_API_KEY) return;
    setLoading(true);
    try {
      const res = await axios.get<any[]>("https://api.countrystatecity.in/v1/countries/IN/states", {
        headers: { "X-CSCAPI-KEY": CSC_API_KEY },
      });
      const list: StateItem[] = (res.data || []).map(s => ({ iso2: s.iso2, name: s.name }))
        .sort((a,b)=>a.name.localeCompare(b.name));
      setStates(list);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCities = useCallback(async (iso2: string) => {
    if (!CSC_API_KEY || !iso2) { setCities([]); return; }
    setLoading(true);
    try {
      const res = await axios.get<any[]>(
        `https://api.countrystatecity.in/v1/countries/IN/states/${iso2}/cities`,
        { headers: { "X-CSCAPI-KEY": CSC_API_KEY } }
      );
      const list: CityItem[] = (res.data || []).map(c => ({ name: c.name }))
        .sort((a,b)=>a.name.localeCompare(b.name));
      setCities(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStates(); }, [fetchStates]);
  useEffect(() => { if (stateIso) fetchCities(stateIso); else setCities([]); }, [stateIso, fetchCities]);

  const stateName = useMemo(() => states.find(s => s.iso2 === stateIso)?.name ?? "", [states, stateIso]);

  return (
    <div className={className}>
      <select
        value={stateIso}
        onChange={(e) => {
          const iso = e.target.value;
          const name = states.find(s => s.iso2 === iso)?.name ?? "";
          onStateChange(iso, name);
        }}
        disabled={disabled || loading}
        className="location-select"
      >
        <option value="">{statePlaceholder}</option>
        {states.map(s => <option key={s.iso2} value={s.iso2}>{s.name}</option>)}
      </select>

      <select
        value={city}
        onChange={(e) => onCityChange(e.target.value)}
        disabled={!stateIso || disabled || loading}
        className="location-select"
      >
        <option value="">{stateIso ? cityPlaceholder : "Select State first"}</option>
        {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
      </select>

      {/* If you ever need the name, it's available: {stateName} */}
    </div>
  );
};

export default GeoSelector;
