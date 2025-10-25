// Author-Hemant Arora
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useAuth } from "../auth/AuthContext";
import {
  Home,
  Users,
  Map,
  Search,
  MapPin,
  IndianRupee,
  MapPinned,
  Loader2,
} from "lucide-react";
import { type StateItem, type CityItem } from '../components/GeoSelector'; // Adjust path if needed

const CSC_API_KEY = "ZXBOVkxVdmVaNjhiMHlqQm5PZXpxWmRSanlIUHB4a0hCSHBwNGRFRA==";

const Hero: React.FC = () => {
  const nav = useNavigate();
  const { setGeo } = useAuth() as any;

  const [tab, setTab] = useState<"buy" | "rent" | "pg" | "land">("buy");
  const [stateIso, setStateIso] = useState("");
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");
  const [keywords, setKeywords] = useState("");

  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [loadingGeo, setLoadingGeo] = useState(false);

  const reduceMotion = useReducedMotion();

  const fetchStates = useCallback(async () => {
    if (!CSC_API_KEY) return;
    setLoadingGeo(true);
    try {
      const res = await axios.get<any[]>("https://api.countrystatecity.in/v1/countries/IN/states", {
        headers: { "X-CSCAPI-KEY": CSC_API_KEY },
      });
      const list: StateItem[] = (res.data || []).map(s => ({ iso2: s.iso2, name: s.name }))
        .sort((a,b)=>a.name.localeCompare(b.name));
      setStates(list);
    } finally {
      setLoadingGeo(false);
    }
  }, []);

  const fetchCities = useCallback(async (iso2: string) => {
    if (!CSC_API_KEY || !iso2) { setCities([]); return; }
    setLoadingGeo(true);
    try {
      const res = await axios.get<any[]>(
        `https://api.countrystatecity.in/v1/countries/IN/states/${iso2}/cities`,
        { headers: { "X-CSCAPI-KEY": CSC_API_KEY } }
      );
      const list: CityItem[] = (res.data || []).map(c => ({ name: c.name }))
        .sort((a,b)=>a.name.localeCompare(b.name));
      setCities(list);
    } finally {
      setLoadingGeo(false);
    }
  }, []);

  useEffect(() => { fetchStates(); }, [fetchStates]);

  const onStateChange = (iso: string, name: string) => {
    setStateIso(iso);
    setStateName(name);
    setCity("");
    setGeo?.({ stateIso: iso, stateName: name, city: "" });
  };

  const onCityChange = (c: string) => {
    setCity(c);
    setGeo?.({ stateIso, stateName, city: c });
  };

  useEffect(() => {
    if (stateIso) fetchCities(stateIso);
    else setCities([]);
  }, [stateIso, fetchCities]);

  const toServerPreference = (t: typeof tab) => {
    if (t === "buy") return "sale";
    if (t === "rent") return "rent";
    if (t === "pg") return "pg";
    return "";
  };

  const onSearch = () => {
    const params = new URLSearchParams({
      source: "hero",
      tab,
      preference: toServerPreference(tab),
      state: stateName || "",
      stateIso: stateIso || "",
      city: city || "",
      locality: keywords || "",
    });
    nav(`/search-results?${params.toString()}`);
  };

  const getTabClasses = (tabName: typeof tab) => {
    const isActive = tab === tabName;
    let classes = 'flex items-center justify-center gap-2 font-semibold cursor-pointer transition';
    classes += ' sm:flex-1 sm:py-3 sm:border-r sm:border-gray-300';
    classes += ' rounded-md p-3';
    if (isActive) {
      classes += ' sm:bg-orange-50 sm:text-orange-600 sm:border-b-2 sm:border-orange-500 sm:-mb-px';
      classes += ' bg-orange-50 text-orange-600 border-b-2 border-orange-500 ring-1 ring-orange-200 sm:ring-0 sm:shadow-none';
    } else {
      classes += ' sm:bg-gray-50 sm:text-gray-500';
      classes += ' bg-gray-100 text-gray-600 sm:bg-transparent';
    }
    return classes;
  };

  // ---------------------- Motion Variants ----------------------
const containerVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.12,     // smoother, slightly slower stagger
      duration: 0.65,            // moderate overall fade-in
      ease: [0.25, 0.8, 0.25, 1], // custom cubic-bezier for natural motion
    },
  },
};

const tabVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1], // “easeOutBack” vibe (tiny bounce)
    },
  },
};

const controlVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.33, 1, 0.68, 1], // gentle overshoot ease
    },
  },
};

const buttonVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1], // slightly springy pop-in
    },
  },
};

  const containerVar = reduceMotion ? undefined : containerVariants;
  const tabVar = reduceMotion ? undefined : tabVariants;
  const ctrlVar = reduceMotion ? undefined : controlVariants;
  const btnVar = reduceMotion ? undefined : buttonVariants;

  // ---------------------- UI ----------------------
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={containerVar}
      className="relative z-10 flex flex-col items-center justify-center -mt-[30px] pb-[30px]"
    >
      <div className="w-[90%] max-w-5xl rounded-xl bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-300 sm:p-5">
        <motion.div
          className="grid grid-cols-2 gap-2 sm:flex sm:overflow-hidden sm:border sm:border-gray-300 sm:rounded-t-[10px]"
          role="tablist"
          aria-label="Search mode"
          variants={tabVar}
        >
          <motion.div
            className={getTabClasses("buy")}
            onClick={() => setTab("buy")}
            role="tab"
            aria-selected={tab === "buy"}
            tabIndex={0}
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            variants={tabVar}
          >
            <IndianRupee className="h-4 w-4" /> Buy
          </motion.div>

          <motion.div
            className={getTabClasses("rent")}
            onClick={() => setTab("rent")}
            role="tab"
            aria-selected={tab === "rent"}
            tabIndex={0}
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            variants={tabVar}
          >
            <Home className="h-4 w-4" /> Rent
          </motion.div>

          <motion.div
            className={getTabClasses("pg")}
            onClick={() => setTab("pg")}
            role="tab"
            aria-selected={tab === "pg"}
            tabIndex={0}
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            variants={tabVar}
          >
            <Users className="h-4 w-4" /> PG/Co-Living
          </motion.div>

          <motion.div
            className={`${getTabClasses("land")} sm:last:border-r-0`}
            onClick={() => setTab("land")}
            role="tab"
            aria-selected={tab === "land"}
            tabIndex={0}
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            variants={tabVar}
          >
            <Map className="h-4 w-4" /> Plot/Land
          </motion.div>
        </motion.div>

        <motion.div
          className="flex flex-col items-stretch gap-3 rounded-b-lg border-x border-b border-gray-300 bg-white p-2 md:flex-row md:gap-2"
          variants={ctrlVar}
        >
          <motion.div className="flex flex-col gap-2 md:flex-row md:gap-2" variants={ctrlVar}>
            {/* State Dropdown */}
            <motion.div className="relative md:w-48" variants={ctrlVar}>
              <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
              <select
                value={stateIso}
                onChange={(e) => {
                  const iso = e.target.value;
                  const name = states.find(s => s.iso2 === iso)?.name ?? "";
                  onStateChange(iso, name);
                }}
                disabled={loadingGeo}
                className="w-full appearance-none rounded-md border border-gray-200 bg-gray-50 py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="">State</option>
                {states.map(s => <option key={s.iso2} value={s.iso2}>{s.name}</option>)}
              </select>
              {loadingGeo && !cities.length && <Loader2 className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-gray-500" />}
            </motion.div>

            {/* City Dropdown */}
            <motion.div className="relative md:w-48" variants={ctrlVar}>
              <MapPinned className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
              <select
                value={city}
                onChange={(e) => onCityChange(e.target.value)}
                disabled={!stateIso || loadingGeo}
                className="w-full appearance-none rounded-md border border-gray-200 bg-gray-50 py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:opacity-50"
              >
                <option value="">{stateIso ? "City" : "Select State first"}</option>
                {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
              {loadingGeo && cities.length > 0 && <Loader2 className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-gray-500" />}
            </motion.div>
          </motion.div>

          <motion.div className="relative flex-1" variants={ctrlVar}>
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
            <input
              type="text"
              placeholder="Search by locality, landmark, or project"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full appearance-none rounded-md border border-gray-200 bg-gray-50 py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </motion.div>

          <motion.button
            onClick={onSearch}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#FF671F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02] hover:bg-orange-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 active:scale-[0.99] md:w-auto"
            aria-label="Search"
            variants={btnVar}
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          >
            <Search className="h-4 w-4" />
            Search
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Hero;
