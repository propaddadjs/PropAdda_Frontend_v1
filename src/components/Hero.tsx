import React from "react";
import { useNavigate } from "react-router-dom";
import GeoSelector from "./GeoSelector";
import { useAuth } from "../auth/AuthContext";
import { Home, Users, Map, Search, MapPin, IndianRupee } from "lucide-react";

const Hero: React.FC = () => {
  const nav = useNavigate();
  const { setGeo } = useAuth() as any;

  const [tab, setTab] = React.useState<"buy" | "rent" | "pg" | "land">("buy");
  const [stateIso, setStateIso] = React.useState("");
  const [stateName, setStateName] = React.useState("");
  const [city, setCity] = React.useState("");
  const [keywords, setKeywords] = React.useState("");

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

  const toServerPreference = (t: typeof tab) => {
    if (t === "buy") return "sale";
    if (t === "rent") return "rent";
    if (t === "pg") return "pg";
    return ""; // land has no preference param
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

  // Helper to generate classes for each tab
  const getTabClasses = (tabName: typeof tab) => {
    const isActive = tab === tabName;
    
    // Base classes for both mobile and desktop
    let classes = 'flex items-center justify-center gap-2 font-semibold cursor-pointer transition';

    // Desktop-specific classes for connected tab bar style
    classes += ' sm:flex-1 sm:py-3 sm:border-r sm:border-gray-300';

    // Mobile-specific classes for 2x2 grid button style
    classes += ' rounded-md p-3';

    if (isActive) {
      // Desktop active style
      classes += ' sm:bg-orange-50 sm:text-orange-600 sm:border-b-2 sm:border-orange-600 sm:-mb-px';
      // Mobile active style
      classes += ' bg-orange-50 text-orange-600 border-b-2 border-orange-600 ring-1 ring-orange-200 sm:ring-0 sm:shadow-none';
    } else {
      // Desktop inactive style
      classes += ' sm:bg-gray-50 sm:text-gray-500';
      // Mobile inactive style
      classes += ' bg-gray-100 text-gray-600 sm:bg-transparent';
    }
    return classes;
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center -mt-[30px] pb-[30px]">
      <div className="w-[90%] max-w-5xl rounded-xl bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-300 sm:p-5">
        {/* Tabs */}
        {/* On mobile: grid. On desktop: flex with connected borders */}
        <div
          className="grid grid-cols-2 gap-2 sm:flex sm:overflow-hidden sm:border sm:border-gray-300 sm:rounded-t-[10px]"
          role="tablist"
          aria-label="Search mode"
        >
          <div
            className={getTabClasses("buy")}
            onClick={() => setTab("buy")}
            role="tab"
            aria-selected={tab === "buy"}
            tabIndex={0}
          >
             <IndianRupee className="h-4 w-4" /> Buy
          </div>

          <div
            className={getTabClasses("rent")}
            onClick={() => setTab("rent")}
            role="tab"
            aria-selected={tab === "rent"}
            tabIndex={0}
          >
            <Home className="h-4 w-4" /> Rent
          </div>

          <div
            className={getTabClasses("pg")}
            onClick={() => setTab("pg")}
            role="tab"
            aria-selected={tab === "pg"}
            tabIndex={0}
          >
            <Users className="h-4 w-4" /> PG/Co-Living
          </div>

          <div
            className={`${getTabClasses("land")} sm:last:border-r-0`}
            onClick={() => setTab("land")}
            role="tab"
            aria-selected={tab === "land"}
            tabIndex={0}
          >
            <Map className="h-4 w-4" /> Plots/Land
          </div>
        </div>

        {/* Inputs */}
        <div className="flex flex-col items-stretch gap-3 rounded-b-lg border-x border-b border-gray-300 bg-white p-2 md:flex-row md:gap-2">
          {/* GeoSelector wrapped for icon affordance */}
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-4 h-4 w-4 text-gray-400 md:top-1/2 md:-translate-y-1/2" />
            <GeoSelector
              stateIso={stateIso}
              city={city}
              onStateChange={onStateChange}
              onCityChange={onCityChange}
              statePlaceholder="State"
              cityPlaceholder="City"
              className="flex w-full flex-col gap-2 pl-9 md:flex-row"
            />
          </div>

          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by locality, landmark, or project"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <button
            onClick={onSearch}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#FF671F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02] hover:bg-orange-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 active:scale-[0.99] md:w-auto"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;