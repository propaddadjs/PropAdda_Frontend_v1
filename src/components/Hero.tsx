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

  return (
    <div className="hero-section">
      <div className="search-container transition-all duration-300">
        {/* Tabs */}
        <div
          className="tabs relative flex items-center gap-2"
          role="tablist"
          aria-label="Search mode"
        >
          <div
            className={`tab ${tab === "buy" ? "active" : ""} 
              inline-flex items-center justify-center gap-2 cursor-pointer select-none
              rounded-md px-3 py-2 transition
              hover:bg-orange-50 hover:text-orange-600
              ${tab === "buy" ? "shadow-sm ring-1 ring-orange-200 bg-orange-50 text-orange-600" : ""}`}
            onClick={() => setTab("buy")}
            role="tab"
            aria-selected={tab === "buy"}
            tabIndex={0}
          >
            <IndianRupee className="h-4 w-4" />
            Buy
          </div>

          <div
            className={`tab ${tab === "rent" ? "active" : ""} 
              inline-flex items-center justify-center gap-2 cursor-pointer select-none
              rounded-md px-3 py-2 transition
              hover:bg-orange-50 hover:text-orange-600
              ${tab === "rent" ? "shadow-sm ring-1 ring-orange-200 bg-orange-50 text-orange-600" : ""}`}
            onClick={() => setTab("rent")}
            role="tab"
            aria-selected={tab === "rent"}
            tabIndex={0}
          >
            <Home className="h-4 w-4" />
            Rent
          </div>

          <div
            className={`tab ${tab === "pg" ? "active" : ""} 
              inline-flex items-center justify-center gap-2 cursor-pointer select-none
              rounded-md px-3 py-2 transition
              hover:bg-orange-50 hover:text-orange-600
              ${tab === "pg" ? "shadow-sm ring-1 ring-orange-200 bg-orange-50 text-orange-600" : ""}`}
            onClick={() => setTab("pg")}
            role="tab"
            aria-selected={tab === "pg"}
            tabIndex={0}
          >
            <Users className="h-4 w-4" />
            PG/Co-Living
          </div>

          <div
            className={`tab ${tab === "land" ? "active" : ""} 
              inline-flex items-center justify-center gap-2 cursor-pointer select-none
              rounded-md px-3 py-2 transition
              hover:bg-orange-50 hover:text-orange-600
              ${tab === "land" ? "shadow-sm ring-1 ring-orange-200 bg-orange-50 text-orange-600" : ""}`}
            onClick={() => setTab("land")}
            role="tab"
            aria-selected={tab === "land"}
            tabIndex={0}
          >
            <Map className="h-4 w-4" />
            Plots/Land
          </div>
        </div>

        {/* Inputs */}
        <div
          className="inputs mt-3 flex items-stretch gap-2 rounded-lg border border-orange-100 bg-white/90 p-2 shadow-sm backdrop-blur
                     transition hover:shadow-md"
        >
          {/* GeoSelector kept intact; wrapped for icon affordance */}
          <div className="relative flex items-center">
            <MapPin className="pointer-events-none absolute left-2 h-4 w-4 text-gray-400" />
            <GeoSelector
              stateIso={stateIso}
              city={city}
              onStateChange={onStateChange}
              onCityChange={onCityChange}
              statePlaceholder="State"
              cityPlaceholder="City"
              className="flex gap-2 pl-6" /* left padding to make room for icon */
            />
          </div>

          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Preferred localities or landmarks"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full rounded-md border border-transparent bg-gray-50 px-3 py-2 text-sm outline-none
                         transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <button
            onClick={onSearch}
            className="search-btn inline-flex items-center justify-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white
                       shadow-sm transition hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-300 active:scale-[0.99]"
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
