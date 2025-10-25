// Author-Hemant Arora
import React, { useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../auth/AuthContext";
import { HelpCircle, Phone, Send } from "lucide-react";

const HELP_CATEGORIES_MAP = {
  "Account & Login Issues": [
    "Cannot sign in",
    "Password reset failed",
    "Update personal details",
    "Profile access issue",
  ],
  "KYC & Verification": [
    "Aadhaar upload failed",
    "RERA number invalid",
    "Verification status incorrect",
    "KYC rejection reason",
  ],
  "Property Listings": [
    "Cannot post new listing",
    "Error editing listing",
    "Listing deletion failed",
    "Listing missing",
  ],
  "Media Uploads": [
    "Photo/Video upload errors",
    "Images distorted",
    "Requesting drone shoot",
    "Requesting graphic design",
  ],
  "Agent Panel / Dashboard": [
    "Dashboard data incorrect",
    "Cannot view listings",
    "Leads/enquiries not loading",
    "Missing feature",
  ],
  "Notifications & Alerts": [
    "Not receiving emails",
    "Incorrect reminder frequency",
    "Alert pop-ups incorrect",
  ],
  "Technical Support": ["Website is slow", "Page not loading", "404 error", "Other bug"],
  "Other Queries": ["General question", "Partnership inquiry", "Other"],
} as const;

type CategoryKey = keyof typeof HELP_CATEGORIES_MAP;
const CATEGORY_OPTIONS = Object.keys(HELP_CATEGORIES_MAP) as CategoryKey[];

interface HelpPayload {
  helpCategory: string;
  helpSubcategory?: string | null;
  helpDetail: string;
}

const AgentHelp: React.FC = () => {
  const { user } = useAuth();

  const MOCK_AGENT = {
    name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
    email: user?.email,
  };

  const [formData, setFormData] = useState({
    category: "" as CategoryKey | "",
    subCategory: "",
    helpQuery: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<"success" | "error" | null>(null);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value as CategoryKey;
    setFormData((prev) => ({ ...prev, category: newCategory, subCategory: "" }));
  };

  const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, subCategory: e.target.value }));
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, helpQuery: e.target.value }));
  };

  const currentSubCategories = formData.category ? HELP_CATEGORIES_MAP[formData.category as CategoryKey] || [] : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionStatus(null);

    // Validation
    if (!formData.category) {
      alert("Please select a Help Category.");
      return;
    }
    const categoryKey = formData.category as CategoryKey;
    const subcats = HELP_CATEGORIES_MAP[categoryKey] ?? [];
    if (subcats.length > 0 && !formData.subCategory) {
      alert("Please select a Help Subcategory.");
      return;
    }
    if (!formData.helpQuery?.trim()) {
      alert("Please enter your query.");
      return;
    }

    setIsSubmitting(true);

    const payload: HelpPayload = {
      helpCategory: formData.category,
      helpSubcategory: formData.subCategory || null,
      helpDetail: formData.helpQuery.trim(),
    };

    try {
      console.log("Help payload:", payload);
      await api.post("/user/addHelpRequestFromUser", payload);

      setSubmissionStatus("success");
      setFormData({ category: "", subCategory: "", helpQuery: "" });
    } catch (error) {
      console.error("Help submission failed:", error);
      setSubmissionStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h2 className="text-3xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center md:justify-start gap-2">
        <HelpCircle className="w-7 h-7 text-orange-600" /> Need Help?
      </h2>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
        {submissionStatus === "success" && (
          <div className="p-4 mb-6 rounded-lg bg-green-100 text-green-800 border border-green-300">
            Success! Your help request has been submitted. Our team will contact you shortly.
          </div>
        )}
        {submissionStatus === "error" && (
          <div className="p-4 mb-6 rounded-lg bg-red-100 text-red-800 border border-red-300">
            Submission failed. Please try again or contact support by phone.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={MOCK_AGENT.name}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={MOCK_AGENT.email}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Help Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50"
              >
                <option value="" hidden>---Select Category---</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700 mb-1">
                Help Subcategory
              </label>
              <select
                id="subCategory"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleSubCategoryChange}
                required={currentSubCategories.length > 0 && !!formData.category}
                disabled={!formData.category || currentSubCategories.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50 disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="" hidden>---Select Subcategory---</option>
                {currentSubCategories.map((subCat) => (
                  <option key={subCat} value={subCat}>
                    {subCat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="helpQuery" className="block text-sm font-medium text-gray-700 mb-1">
              Type your query
            </label>
            <textarea
              id="helpQuery"
              name="helpQuery"
              rows={6}
              value={formData.helpQuery}
              onChange={handleQueryChange}
              required
              placeholder="Describe your issue in detail..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AgentHelp;
