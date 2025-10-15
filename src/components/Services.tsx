import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import house1 from "../images/house1.jpg";
import house2 from "../images/house2.jpg";
import house3 from "../images/house3.jpg";
import house4 from "../images/house4.jpg";
import house5 from "../images/house5.jpg";
import { useAuth } from "../auth/AuthContext";
import FilterExplorerModal, { type Filters as ExploreFilters } from "./FilterExplorerModal";
import {
  Home,
  KeyRound,
  Map,
  Users,
  ArrowRight,
  Sparkles,
  Building2,
  IndianRupee,
} from "lucide-react";

/**
 * A reusable image component that animates in when it becomes visible.
 * It uses the Intersection Observer API for performance.
 */
const AnimatedImage: React.FC<{ src: string; alt: string; direction?: 'left' | 'right' }> = ({ src, alt, direction = 'left' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 } // Trigger when 10% of the image is visible
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

  const baseClasses = "transition-all duration-1000 ease-in-out";
  const animationClasses = isVisible
    ? "opacity-100 translate-x-0"
    : `opacity-0 ${direction === 'left' ? '-translate-x-20' : 'translate-x-20'}`;

  return (
    <div className="overflow-hidden rounded-lg">
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={`w-full object-cover group-hover:scale-[1.03] ${baseClasses} ${animationClasses}`}
      />
    </div>
  );
};


const Services: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth() as any;

  const [modalOpen, setModalOpen] = React.useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = React.useState(false);
  const [initialFilters, setInitialFilters] = React.useState<Partial<ExploreFilters>>({
    category: "All",
    preference: "All",
    propertyTypes: [],
  });

  // --- Open FilterExplorer with sensible defaults for each CTA ---
  const openBuying = () => {
    setInitialFilters({
      category: "Residential",
      preference: "Buy",
      propertyTypes: [],
    });
    setModalOpen(true);
  };

  const openRenting = () => {
    setInitialFilters({
      category: "Residential",
      preference: "Rent",
      propertyTypes: [],
    });
    setModalOpen(true);
  };

  const openPlots = () => {
    setInitialFilters({
      category: "All",
      preference: "All",
      propertyTypes: ["Plot/Land"],
    });
    setModalOpen(true);
  };

  const openPG = () => {
    setInitialFilters({
      category: "Residential",
      preference: "PG",
      propertyTypes: [],
    });
    setModalOpen(true);
  };

  // --- Explore handler: post to backend, then navigate with results ---
  const handleExplore = async (filters: ExploreFilters) => {
    const payload = {
      ...filters,
      preference: filters.preference === "Buy" ? "Sale" : filters.preference,
    };
    try {
      const { data } = await api.post("/user/getFilteredProperties", payload);
      navigate("/search-results", { state: { filters, results: data } });
    } catch (e) {
      console.error("Explore failed", e);
    }
  };

  // --- Post Property behavior (same as header) ---
  const onPostProperty = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      setLoginPromptOpen(true);
      return;
    }
    if (user.role === "BUYER") {
      if (user.kycVerified === "INAPPLICABLE") {
        navigate("/account/initiateKyc");
        return;
      }
      if (user.kycVerified === "PENDING") {
        navigate("/kycStatus");
        return;
      }
      navigate("/account/initiateKyc");
      return;
    }
    if (user.role === "AGENT" || user.role === "ADMIN") {
      navigate("/agent/postproperty");
      return;
    }
    navigate("/account/initiateKyc");
  };

  return (
    <section className="bg-gray-50/70 py-4 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">OUR SERVICES</h3>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          <span className="text-orange-600">WHAT</span> WE DO
        </h2>
      </div>

      <div className="mt-12 max-w-lg mx-auto lg:max-w-7xl grid gap-12 lg:gap-16">
        {/* BUY */}
        <div className="group flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="text-center lg:text-center lg:w-1/2">
            <h4 className="inline-flex items-center gap-2 text-sm text-gray-500 font-semibold uppercase tracking-wider">
              <IndianRupee className="h-4 w-4 text-orange-500" /> BUY A HOME
            </h4>
            <h3 className="mt-2 text-2xl font-bold text-gray-800">Find, Buy & Own Your Dream Home</h3>
            <p className="mt-2 text-gray-600">Explore from Apartments, land, builder floors, villas and more</p>
            <button
              onClick={openBuying}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-orange-600 hover:translate-x-0.5"
            >
              Explore Buying <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="lg:w-1/2">
            <AnimatedImage src={house1} alt="Buy a Home" direction="right" />
          </div>
        </div>

        {/* RENT */}
        <div className="group flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-16">
          <div className="text-center lg:text-center lg:w-1/2">
            <h4 className="inline-flex items-center gap-2 text-sm text-gray-500 font-semibold uppercase tracking-wider">
              <Home className="h-4 w-4 text-orange-500" /> RENT A HOME
            </h4>
            <h3 className="mt-2 text-2xl font-bold text-gray-800">Rental Homes for Everyone</h3>
            <p className="mt-2 text-gray-600">Explore from Apartments, builder floors, villas and more</p>
            <button
              onClick={openRenting}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-orange-600 hover:translate-x-0.5"
            >
              Explore Renting <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="lg:w-1/2">
            <AnimatedImage src={house2} alt="Rent a Home" direction="left" />
          </div>
        </div>

        {/* PLOTS / LAND */}
        <div className="group flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="text-center lg:text-center lg:w-1/2">
            <h4 className="inline-flex items-center gap-2 text-sm text-gray-500 font-semibold uppercase tracking-wider">
              <Map className="h-4 w-4 text-orange-500" /> BUY PLOT/LAND
            </h4>
            <h3 className="mt-2 text-2xl font-bold text-gray-800">Residential & Commercial Plots/Land</h3>
            <p className="mt-2 text-gray-600">Explore Residential, Agricultural, Industrial and Commercial Plots/Land</p>
            <button
              onClick={openPlots}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-orange-600 hover:translate-x-0.5"
            >
              Explore Plots/Land <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="lg:w-1/2">
            <AnimatedImage src={house3} alt="Buy Plot/Land" direction="right" />
          </div>
        </div>

        {/* PG / CO-LIVING */}
        <div className="group flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-16">
          <div className="text-center lg:text-center lg:w-1/2">
            <h4 className="inline-flex items-center gap-2 text-sm text-gray-500 font-semibold uppercase tracking-wider">
              <Users className="h-4 w-4 text-orange-500" /> RENT A PG/CO-LIVING
            </h4>
            <h3 className="mt-2 text-2xl font-bold text-gray-800">Paying Guest or Co-living options</h3>
            <p className="mt-2 text-gray-600">Explore shared and private rooms in all top cities of India</p>
            <button
              onClick={openPG}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-orange-600 hover:translate-x-0.5"
            >
              Explore PG/Co-living <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="lg:w-1/2">
            <AnimatedImage src={house4} alt="Rent a PG/Co-Living" direction="left" />
          </div>
        </div>

        {/* POST PROPERTY */}
        <div className="group flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="text-center lg:text-center lg:w-1/2">
            <h3 className="inline-flex flex-col lg:flex-row items-center gap-2 text-2xl font-bold text-gray-800">
              <Sparkles className="h-5 w-5 text-orange-500" />
              Sell or rent faster at the right price!
            </h3>
            <p className="mt-2 text-gray-600">List your property now and connect with genuine buyers and tenants.</p>
            <button
              onClick={onPostProperty}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-orange-600 hover:translate-x-0.5"
            >
              Post Property. It's FREE <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="lg:w-1/2">
             <AnimatedImage src={house5} alt="Post Property. It's FREE" direction="right" />
          </div>
        </div>
      </div>

      {/* Filter Explorer Modal */}
      <FilterExplorerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onExplore={handleExplore}
        initial={initialFilters}
      />

      {/* Login prompt modal (same UX as header) */}
      {loginPromptOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
          onClick={() => setLoginPromptOpen(false)}
        >
          <div
            className="w-[90%] max-w-sm rounded-lg bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900">You are not logged in</h3>
            <p className="mt-1 text-sm text-gray-600">Log in or sign up to post your property.</p>
            <div className="mt-4 flex justify-end">
              <button
                className="inline-flex items-center rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:opacity-95"
                onClick={() => {
                  setLoginPromptOpen(false);
                  navigate("/login");
                }}
              >
                Log in / Sign up
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Services;