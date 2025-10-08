import React from "react";
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

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

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
    // Plot/Land appears under both Residential and Commercial lists in your modal;
    // start from "All" + preselect the chip.
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
      // UI "Buy" → API "Sale"
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
      // Fallback for buyers: push toward KYC init
      navigate("/account/initiateKyc");
      return;
    }
    if (user.role === "AGENT" || user.role === "ADMIN") {
      navigate("/agent/postproperty");
      return;
    }
    // Default
    navigate("/account/initiateKyc");
  };

  return (
    <section className="services-section">
      <h3 className="section-subtitle">OUR SERVICES</h3>
      <h2 className="section-title">
        <span>WHAT</span> WE DO
      </h2>

      <div className="services-container">
        {/* BUY */}
        <div className="service-box group transition hover:shadow-md">
          <div className="service-text">
            <h4 className="inline-flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-orange-500" /> BUY A HOME
            </h4>
            <h3>Find, Buy & Own Your Dream Home</h3>
            <p>Explore from Apartments, land, builder floors, villas and more</p>
            <button
              onClick={openBuying}
              className="service-btn inline-flex items-center gap-2 transition hover:translate-x-0.5"
            >
              Explore Buying <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="service-image overflow-hidden rounded-lg">
            <img
              src={house1}
              alt="Buy a Home"
              className="transition duration-500 group-hover:scale-[1.03]"
            />
          </div>
        </div>

        {/* RENT */}
        <div className="service-box group transition hover:shadow-md">
          <div className="service-image overflow-hidden rounded-lg">
            <img
              src={house2}
              alt="Rent a Home"
              className="transition duration-500 group-hover:scale-[1.03]"
            />
          </div>
          <div className="service-text">
            <h4 className="inline-flex items-center gap-2">
              <Home className="h-4 w-4 text-orange-500" /> RENT A HOME
            </h4>
            <h3>Rental Homes for Everyone</h3>
            <p>Explore from Apartments, builder floors, villas and more</p>
            <button
              onClick={openRenting}
              className="service-btn inline-flex items-center gap-2 transition hover:translate-x-0.5"
            >
              Explore Renting <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* PLOTS / LAND */}
        <div className="service-box group transition hover:shadow-md">
          <div className="service-text">
            <h4 className="inline-flex items-center gap-2">
              <Map className="h-4 w-4 text-orange-500" /> BUY PLOT/LAND
            </h4>
            <h3>Residential & Commercial Plots/Land</h3>
            <p>Explore Residential, Agricultural, Industrial and Commercial Plots/Land</p>
            <button
              onClick={openPlots}
              className="service-btn inline-flex items-center gap-2 transition hover:translate-x-0.5"
            >
              Explore Plots/Land <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="service-image overflow-hidden rounded-lg">
            <img
              src={house3}
              alt="Buy Plot/Land"
              className="transition duration-500 group-hover:scale-[1.03]"
            />
          </div>
        </div>

        {/* PG / CO-LIVING */}
        <div className="service-box group transition hover:shadow-md">
          <div className="service-image overflow-hidden rounded-lg">
            <img
              src={house4}
              alt="Rent a PG/Co-Living"
              className="transition duration-500 group-hover:scale-[1.03]"
            />
          </div>
          <div className="service-text">
            <h4 className="inline-flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" /> RENT A PG/CO-LIVING
            </h4>
            <h3>Paying Guest or Co living options</h3>
            <p>Explore shared and private rooms in all top cities of India</p>
            <button
              onClick={openPG}
              className="service-btn inline-flex items-center gap-2 transition hover:translate-x-0.5"
            >
              Explore PG/Co-living <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* POST PROPERTY */}
        <div className="service-box group transition hover:shadow-md">
          <div className="service-text">
            <h3 className="inline-flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-500" />
              Sell or rent faster at the right price!
            </h3>
            <p>List your property now</p>
            <button
              onClick={onPostProperty}
              className="service-btn inline-flex items-center gap-2 transition hover:translate-x-0.5"
            >
              Post Property. It's FREE <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="service-image overflow-hidden rounded-lg">
            <img
              src={house5}
              alt="Post Property. It's FREE"
              className="transition duration-500 group-hover:scale-[1.03]"
            />
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
