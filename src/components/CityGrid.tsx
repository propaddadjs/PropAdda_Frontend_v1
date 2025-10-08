import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FilterExplorerModal, { type Filters } from "./FilterExplorerModal";

import city1 from "../images/city1.jpg";
import city2 from "../images/city2.jpg";
import city3 from "../images/city3.jpeg";
import city4 from "../images/city4.png";
import city5 from "../images/city5.jpeg";
import city6 from "../images/city6.jpg";
import city7 from "../images/city7.jpg";
import city8 from "../images/city8.png";
import city9 from "../images/city9.jpg";
import city10 from "../images/city10.jpeg";
import city11 from "../images/city11.jpg";
import city12 from "../images/city12.png";
import { ChevronRight } from "lucide-react";

type CountMap = Record<string, number>;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

/** 
 * Display name + server key (must match backend keys exactly).
 * Note: Backend uses "Bengaluru" (not "Bangalore").
 */
const CITIES: Array<{ label: string; apiKey: string }> = [
  { label: "Bengaluru", apiKey: "Bengaluru" },
  { label: "Gurgaon", apiKey: "Gurgaon" },
  { label: "Mumbai", apiKey: "Mumbai" },
  { label: "New Delhi", apiKey: "New Delhi" },
  { label: "Pune", apiKey: "Pune" },
  { label: "Lucknow", apiKey: "Lucknow" },
  { label: "Chennai", apiKey: "Chennai" },
  { label: "Noida", apiKey: "Noida" },
  { label: "Hyderabad", apiKey: "Hyderabad" },
  { label: "Jaipur", apiKey: "Jaipur" },
  { label: "Kolkata", apiKey: "Kolkata" },
  { label: "Ahmedabad", apiKey: "Ahmedabad" },
];

const IMAGES = [city1, city2, city3, city4, city5, city6, city7, city8, city9, city10, city11, city12];

const CityGrid: React.FC = () => {
  const [counts, setCounts] = useState<CountMap>({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [openExplorer, setOpenExplorer] = useState(false);
  const navigate = useNavigate();

  // Load counts once
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { data } = await axios.get<CountMap>(`${API_BASE_URL}/user/getCountByCity`, {
          withCredentials: true,
        });
        if (!active) return;
        setCounts(data || {});
      } catch (e: any) {
        if (!active) return;
        setErr(e?.response?.data?.message || "Failed to load city counts.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Click → call /user/filterByCity/{city}, then navigate and pass prefetched result
  const onCityClick = async (cityKey: string) => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/user/filterByCity/${encodeURIComponent(cityKey)}`, {
        withCredentials: true,
      });
      navigate(`/search-results`, {
        state: {
          from: "cityGrid",
          filters: { stateName: "", city: cityKey } as Partial<Filters>,
          prefetched: data, // { residential:[], commercial:[] }
        },
      });
    } catch (e: any) {
      alert(e?.response?.data?.message || `Failed to load properties for ${cityKey}.`);
    }
  };

  const cityCards = useMemo(
    () =>
      CITIES.map((c, idx) => {
        const img = IMAGES[idx % IMAGES.length];
        const count = counts[c.apiKey] ?? 0;
        // “+ Properties” suffix kept same as your design
        const countLabel = `${count.toLocaleString("en-IN")} Properties`;
        return (
          <button
            key={c.apiKey}
            className="city-card text-left"
            onClick={() => onCityClick(c.apiKey)}
            title={`Explore properties in ${c.label}`}
          >
            <img src={img} alt={c.label} />
            <h4>{c.label}</h4>
            <p>{countLabel}</p>
          </button>
        );
      }),
    [counts]
  );

  return (
    <section className="explore-cities">
      <h5>EXPLORE CITIES</h5>
      <h2>
        FIND THE <span className="highlight">PROPERTY OF YOUR DREAM</span> IN
        YOUR PREFERRED CITY
      </h2>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800 mb-3">
          {err}
        </div>
      )}

      <div className="city-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        {loading ? (
          <div className="text-gray-600 p-4">Loading cities…</div>
        ) : (
          cityCards
        )}
      </div>

      <div className="view-more-container">
        <button
          className="view-all-btn mt-4 inline-flex items-center gap-2 text-orange-600 font-semibold"
          onClick={() => setOpenExplorer(true)}
          type="button"
        >
          View more Cities <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <FilterExplorerModal
        open={openExplorer}
        onClose={() => setOpenExplorer(false)}
        onExplore={(f) => {
          // parent will do its usual POST flow on FilteredPropertiesPage
          navigate("/search-results", { state: { filters: f } });
        }}
      />
    </section>
  );
};

export default CityGrid;
