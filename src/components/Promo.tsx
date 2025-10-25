// Author-Hemant Arora
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import FilterExplorerModal, { type Filters as ExploreFilters } from "./FilterExplorerModal";
import { api } from "../lib/api";

const Promo: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth() as any;

  const [modalOpen, setModalOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  // --- Post Property button (same as header) ---
  const onPostProperty = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      setLoginPromptOpen(true);
      return;
    }
    if (user.role === "BUYER") {
      if (user.kycVerified === "INAPPLICABLE") {
        navigate("/account/kycInfo");
        return;
      }
      if (user.kycVerified === "PENDING") {
        navigate("account/checkKycStatus");
        return;
      }
      navigate("/account/kycInfo");
      return;
    }
    if (user.role === "AGENT" || user.role === "ADMIN") {
      navigate("/agent/postproperty");
      return;
    }
    navigate("/account/kycInfo");
  };

  // --- Explore Now handler ---
  const onExploreNow = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalOpen(true);
  };

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

  return (
    <section className="promo-section grid md:grid-cols-3 gap-6 my-2 px-4">
      {/* List your Property */}
      <div className="promo-card rounded-xl p-6 text-center transition mb-10 lg:mb-1">
        <h3 className="text-lg font-semibold mb-3">
          Post your property ads <br /> for free!
        </h3>
        <a
          href="#"
          onClick={onPostProperty}
          className="promo-btn inline-flex items-center gap-2 font-semibold"
        >
          List your Property <ChevronRight className="h-4 w-4" />
        </a>
      </div>

      {/* Explore Now */}
      <div className="promo-card rounded-xl p-6 text-center transition mb-10 lg:mb-1">
        <h3 className="text-lg font-semibold mb-3">
          Explore India’s Top <br /> Residential Cities List
        </h3>
        <a
          href="#"
          onClick={onExploreNow}
          className="promo-btn inline-flex items-center gap-2 font-semibold"
        >
          Explore Now <ChevronRight className="h-4 w-4" />
        </a>
      </div>

      {/* Post your Requirement */}
      <div className="promo-card rounded-xl p-6 text-center transition mb-10 lg:mb-1">
        <h3 className="text-lg font-semibold mb-3">
          Helping you to Find your <br /> Dream Property
        </h3>
        <a
          href="/contactUs"
          className="promo-btn inline-flex items-center gap-2 font-semibold"
        >
          Post your Requirement <ChevronRight className="h-4 w-4" />
        </a>
      </div>

      {/* Filter Explorer Modal */}
      <FilterExplorerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onExplore={handleExplore}
        initial={{
          category: "All",
          preference: "All",
          propertyTypes: [],
        }}
      />

      {/* Login Prompt Modal */}
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

export default Promo;
