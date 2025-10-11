import React, { useEffect, useState } from "react";
import axios from "axios";

// AllLeads.tsx
// Tailwind-styled React component (TypeScript) to render the All Leads dashboard page similar to the provided PDF.
// Usage: place inside your admin dashboard route. Assumes Tailwind is configured in the project.

type User = {
  userId: number;
  firstName: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  profileImageUrl?: string | null;
  city?: string;
  state?: string;
  role?: string;
};

type MediaFile = {
  url: string;
  filename?: string;
  ord?: number;
};

type ResResponse = {
  listingId: number;
  title?: string;
  price?: number;
  locality?: string;
  city?: string;
  state?: string;
  mediaFiles?: MediaFile[];
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
};

type ComResponse = {
  listingId: number;
  title?: string;
  price?: number;
  locality?: string;
  city?: string;
  state?: string;
  mediaFiles?: MediaFile[];
  area?: number;
};

type Lead = {
  enquiryId: number;
  user: User;
  buyerName?: string;
  buyerPhoneNumber?: string;
  buyerType?: string;
  buyerReason?: string;
  buyerReasonDetail?: string;
  enquiryStatus?: string;
  comResponse?: ComResponse | null;
  resResponse?: ResResponse | null;
};

export default function AllLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10; // changeable

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<Lead[]>("/getCreatedLeads");
      // newer leads on top by default (PDF hint)
      const sorted = res.data.slice().sort((a, b) => (b.enquiryId ?? 0) - (a.enquiryId ?? 0));
      setLeads(sorted);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  }

  async function markAssigned(id: number) {
    try {
      await axios.patch(`/markLeadAsAssigned/${id}`);
      setLeads((prev) => prev.map((l) => (l.enquiryId === id ? { ...l, enquiryStatus: "ASSIGNED" } : l)));
    } catch (err) {
      console.error(err);
      alert("Failed to mark lead as assigned");
    }
  }

  async function markRemoved(id: number) {
    try {
      await axios.patch(`/markLeadAsRemoved/${id}`);
      setLeads((prev) => prev.map((l) => (l.enquiryId === id ? { ...l, enquiryStatus: "REMOVED" } : l)));
    } catch (err) {
      console.error(err);
      alert("Failed to remove lead");
    }
  }

  // pagination helpers
  const totalPages = Math.max(1, Math.ceil(leads.length / pageSize));
  const visibleLeads = leads.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">All Leads</h1>
        <div className="text-sm text-gray-600">Newer leads shown on top by default</div>
      </header>

      {loading && <div className="py-8 text-center">Loading leads...</div>}
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4">Error: {error}</div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {visibleLeads.length === 0 && (
            <div className="text-center text-gray-600 p-8 bg-white rounded shadow">No leads found</div>
          )}

          {visibleLeads.map((lead) => (
            <div key={lead.enquiryId} className="bg-white rounded shadow p-4 flex gap-4">
              {/* Left: User avatar */}
              <div className="w-20 flex-shrink-0">
                <img
                  src={lead.user?.profileImageUrl || "/placeholder-avatar.png"}
                  alt="profile"
                  className="w-20 h-20 object-cover rounded-md border"
                />
              </div>

              {/* Middle: Lead & Property Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-medium">
                      {lead.buyerName || `${lead.user?.firstName} ${lead.user?.lastName || ""}`}
                    </div>
                    <div className="text-sm text-gray-600">{lead.buyerPhoneNumber}</div>
                    <div className="text-xs text-gray-500 mt-1">{lead.buyerType} • {lead.enquiryStatus}</div>
                  </div>

                  <div className="text-right text-sm text-gray-500">
                    <div>Enquiry ID: {lead.enquiryId}</div>
                    <div>{lead.user?.city}, {lead.user?.state}</div>
                  </div>
                </div>

                {/* Property preview (either residential or commercial) */}
                <div className="mt-3 border-t pt-3 flex gap-4">
                  <div className="w-40 h-28 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                    <img
                      src={
                        lead.resResponse?.mediaFiles?.[0]?.url || lead.comResponse?.mediaFiles?.[0]?.url || "/placeholder-property.png"
                      }
                      alt={lead.resResponse?.title || lead.comResponse?.title || "property"}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="font-semibold">
                      {lead.resResponse?.title || lead.comResponse?.title || "Untitled Property"}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {lead.resResponse?.locality || lead.comResponse?.locality} • {lead.resResponse?.city || lead.comResponse?.city}
                    </div>

                    <div className="text-sm text-gray-700 mt-2">
                      {lead.resResponse ? (
                        <span>
                          {lead.resResponse.bedrooms ?? "-"} BHK • {lead.resResponse.area ?? "-"} sqft • ₹{lead.resResponse.price ?? "-"}
                        </span>
                      ) : lead.comResponse ? (
                        <span>
                          {lead.comResponse.area ?? "-"} sqft • ₹{lead.comResponse.price ?? "-"}
                        </span>
                      ) : (
                        <span className="text-gray-500">No property data</span>
                      )}
                    </div>

                    <div className="mt-3 text-sm text-gray-600">Reason: {lead.buyerReason} {lead.buyerReasonDetail ? `- ${lead.buyerReasonDetail}` : ''}</div>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="w-48 flex flex-col justify-between items-stretch gap-3">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => markAssigned(lead.enquiryId)}
                    disabled={lead.enquiryStatus === "ASSIGNED"}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors border ${lead.enquiryStatus === "ASSIGNED" ? 'bg-gray-200 text-gray-600 border-gray-200' : 'bg-white hover:bg-green-50 border-green-500 text-green-600'}`}>
                    {lead.enquiryStatus === "ASSIGNED" ? "Lead Assigned to PropAdda Team" : "Lead Assigned to PropAdda Team"}
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to remove this lead?')) markRemoved(lead.enquiryId);
                    }}
                    disabled={lead.enquiryStatus === "REMOVED"}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors border ${lead.enquiryStatus === "REMOVED" ? 'bg-gray-200 text-gray-600 border-gray-200' : 'bg-white hover:bg-red-50 border-red-500 text-red-600'}`}>
                    Remove Lead
                  </button>
                </div>

                <div className="text-xs text-gray-500 text-right">{lead.user?.firstName} • {lead.user?.email}</div>
              </div>
            </div>
          ))}

          {/* Pagination controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded border text-sm disabled:opacity-50">
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded border text-sm disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
