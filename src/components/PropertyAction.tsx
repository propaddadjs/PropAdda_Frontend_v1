import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import FilterExplorerModal, { type Filters as ExploreFilters } from "./FilterExplorerModal";
import { api } from "../lib/api";

const PropertyAction: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth() as any;

  const [modalOpen, setModalOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  // --- Find Now -> FilterExplorerModal ---
  const onFindNow = () => {
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
      console.error("Filter explore failed", e);
    }
  };

  // --- Free Posting (same as header Post Property button) ---
  const onPostProperty = () => {
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
    <section className="mt-8 flex flex-col md:flex-row justify-around bg-gray-100 divide-y divide-gray-300 md:divide-y-0 md:divide-x">
      <div className="flex-1 text-center p-8">
        <h3 className="text-xl font-bold text-gray-800">Find Property</h3>
        <p className="mt-2 text-gray-600">Select from thousands of options, without brokerage.</p>
        <button 
          className="mt-4 px-5 py-2.5 rounded-lg bg-gray-800 text-white font-semibold transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500" 
          onClick={onFindNow}
        >
          Find Now
        </button>
      </div>
      <div className="flex-1 text-center p-8">
        <h3 className="text-xl font-bold text-gray-800">List Your Property</h3>
        <p className="mt-2 text-gray-600">For Free. Without any brokerage.</p>
        <button 
          className="mt-4 px-5 py-2.5 rounded-lg bg-gray-800 text-white font-semibold transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500" 
          onClick={onPostProperty}
        >
          Free Posting
        </button>
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

export default PropertyAction;