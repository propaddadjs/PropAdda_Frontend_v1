import React, { useEffect, useMemo, useState, useRef } from "react";
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
import { api } from "../lib/api";

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

/**
 * A reusable city card component that animates in when it becomes visible.
 */
const AnimatedCityCard: React.FC<{
  city: { label: string; apiKey: string };
  img: string;
  countLabel: string;
  onClick: () => void;
  index: number;
}> = ({ city, img, countLabel, onClick, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <button
      ref={ref}
      onClick={onClick}
      title={`Explore properties in ${city.label}`}
      className={`group flex flex-col items-center text-center focus:outline-none focus:ring-2 focus:ring-orange-300 rounded-lg transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`
      }
      style={{ transitionDelay: `${index * 100}ms` }} // Staggered animation delay
      aria-label={`Explore ${city.label}`}
    >
      {/* Circular image */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden mb-2 ring-1 ring-orange-100 transition-all duration-300 group-hover:ring-2 group-hover:ring-orange-300">
        <img
          src={img}
          alt={city.label}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Text */}
      <h4 className="text-sm font-semibold text-gray-900">{city.label}</h4>
      <p className="mt-0.5 text-xs text-gray-600">{countLabel}</p>
    </button>
  );
};


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
        const { data } = await api.get<CountMap>("/user/getCountByCity", {
          // withCredentials: true,
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
      const { data } = await api.get(`/user/filterByCity/${encodeURIComponent(cityKey)}`, {
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
      const countLabel = `${count.toLocaleString("en-IN")} Properties`;

      return (
        <AnimatedCityCard
          key={c.apiKey}
          city={c}
          img={img}
          countLabel={countLabel}
          onClick={() => onCityClick(c.apiKey)}
          index={idx}
        />
      );
    }),
  [counts]
);

  return (
    <section className="explore-cities py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h5 className="text-sm font-bold uppercase tracking-wider text-gray-500">EXPLORE CITIES</h5>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          FIND THE <span className="highlight text-orange-600">PROPERTY OF YOUR DREAM</span> IN
          YOUR PREFERRED CITY
        </h2>
      </div>


      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800 mb-3 max-w-xl mx-auto">
          {err}
        </div>
      )}

      <div className="mt-12 mx-auto max-w-fit">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8">
          {cityCards}
        </div>
      </div>

      <div className="view-more-container mt-8 text-center">
        <button
          className="view-all-btn inline-flex items-center gap-2 text-orange-600 font-semibold"
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