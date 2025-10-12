import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Phone,
  Mail,
  MapPin,
  Building2,
  Briefcase,
  Star,
  ShieldCheck,
  Maximize2,
  BedDouble,
  Bath,
  Projector,
  Home,
  ClipboardCheck,
  ArrowRight,
  User2,
} from "lucide-react";
import { api } from "../../lib/api";

type User = { userId: number; firstName?: string; lastName?: string; email?: string; phoneNumber?: string; profileImageUrl?: string | null; city?: string; state?: string; role?: string };

type MediaFile = { url: string; filename?: string; ord?: number };

type ResResponse = { listingId: number; category?: string; preference?: string; propertyType?: string; title?: string; description?: string; price?: number; area?: number; bedrooms?: number | null; bathrooms?: number | null; locality?: string; city?: string; state?: string; vip?: boolean; residentialOwner?: { firstName?: string; lastName?: string; email?: string; phoneNumber?: string } | null; mediaFiles?: MediaFile[]; reraVerified?: boolean; lifts?: boolean; pool?: boolean; gym?: boolean; parking?: boolean; petFriendly?: boolean };

type ComResponse = { listingId: number; category?: string; preference?: string; propertyType?: string; title?: string; description?: string; price?: number; area?: number; cabins?: number | null; meetingRoom?: boolean | null; locality?: string; city?: string; state?: string; vip?: boolean; commercialOwner?: { firstName?: string; lastName?: string; email?: string; phoneNumber?: string } | null; mediaFiles?: MediaFile[]; reraVerified?: boolean; lifts?: boolean; pool?: boolean; gym?: boolean; parking?: boolean; petFriendly?: boolean };

type Lead = { enquiryId: number; user: User; buyerName?: string; buyerPhoneNumber?: string; buyerType?: string; buyerReason?: string; buyerReasonDetail?: string; enquiryStatus?: string; comResponse?: ComResponse | null; resResponse?: ResResponse | null };

function FeatureChip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-orange-50 text-orange-700">{children}</span>;
}

function currency(n?: number) { return n == null ? "" : n.toLocaleString('en-IN'); }

export default function AssignedLeads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [selected, setSelected] = useState<Lead | null>(null);

  useEffect(() => { fetchLeads(); }, []);

  async function fetchLeads() {
    setLoading(true); setError(null);
    try {
      const res = await api.get('/admin/getAssignedLeads');

      // normalize response to an array safely
      let list: Lead[] = [];

      if (Array.isArray(res.data)) {
        list = res.data;
      } else if (res.data && typeof res.data === 'object') {
        // common wrappers: { data: [...] } or { content: [...] }
        if (Array.isArray((res.data as any).data)) {
          list = (res.data as any).data;
        } else if (Array.isArray((res.data as any).content)) {
          list = (res.data as any).content;
        } else {
          // try to find the first array property in the object
          const vals = Object.values(res.data);
          const firstArray = vals.find(v => Array.isArray(v));
          if (firstArray) list = firstArray as Lead[];
        }
      }

      if (!Array.isArray(list)) list = [];

      const sorted = (list ?? []).slice().sort((a,b) => (b.enquiryId ?? 0) - (a.enquiryId ?? 0));
      setLeads(sorted);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch leads');
    } finally { setLoading(false); }
  }

  async function markSold(id: number) {
    try { await api.patch(`/admin/markLeadAsSold/${id}`); setLeads(p=>p.map(l=>l.enquiryId===id?{...l,enquiryStatus:'SOLD'}:l)); }
    catch(e){ console.error(e); alert('Failed to mark property bought'); }
  }
  async function markAsNotInterested(id: number) {
    try { await api.patch(`/admin/markLeadAsNotInterested/${id}`); setLeads(p=>p.map(l=>l.enquiryId===id?{...l,enquiryStatus:'NOT_INTERESTED'}:l)); }
    catch(e){ console.error(e); alert('Failed to mark property not interested'); }
  }

  // pagination
  const totalPages = Math.max(1, Math.ceil(leads.length / size));
  const total = totalPages || 1;
  const current = page + 1;
  const windowStart = Math.floor((current - 1) / 10) * 10 + 1;
  const windowEnd = Math.min(windowStart + 9, total);
  const numbers = useMemo(() => Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i), [windowStart, windowEnd]);

  const itemsToRender = leads.slice(page * size, page * size + size);

  function pickMediaOrd1(m?: MediaFile[]){ if(!m||m.length===0) return null; const byOrd = m.find(x=>x.ord===1); return byOrd ?? null; }
  function initials(u?: User){ const fn = u?.firstName ?? ''; const ln = u?.lastName ?? ''; const chars = `${fn.charAt(0)||''}${ln.charAt(0)||''}`.toUpperCase(); return chars || 'U'; }

  // Utility function to convert a string (like "SALES_MANAGER") to PascalCase ("SalesManager")
const toPascalCase = (str: string): string => {
    if (!str) return '';
    
    // 1. Replace underscores/dashes with space (for multi-word roles like "SALES_MANAGER")
    // 2. Convert to lowercase
    // 3. Split by spaces
    // 4. Capitalize the first letter of each word
    // 5. Join them back without spaces
    return str.toLowerCase()
              .split(/[\s_-]+/)
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join('');
};

  // PropertyCard: uses only ord===1 image, view navigates to listing detail route
  function PropertyCard({ p }: { p: ResResponse|ComResponse }){
    if(!p) return <div className="p-4 text-gray-500">No property data</div>;
    const isRes = (p as any).category?.toLowerCase?.() === 'residential';
    const priceLabel = p.price != null ? `₹ ${currency(p.price)}` : 'Price on request';
    const localityLine = [p.locality, p.city, p.state].filter(Boolean).join(' • ');
    const media = pickMediaOrd1(p.mediaFiles as MediaFile[]|undefined);
    const img = media?.url ?? 'https://via.placeholder.com/640x360?text=No+Image';

    const hasNum = (n: unknown)=> typeof n==='number' && (n as number) > 0;
    const hasTrue = (b: unknown)=> (typeof b==='boolean' && b) || (typeof b==='number' && (b as number) > 0);

    return (
      <div className="rounded-xl shadow-md border-2 border-orange-100 bg-white overflow-hidden">
        <div className="relative">
          <img src={img} alt={String(p.title ?? 'Property')} className="h-44 w-full object-cover" loading="lazy" />

          <span className={["absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm", isRes? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'].join(' ')}>
            {isRes ? <Home className="h-3.5 w-3.5" /> : <Building2 className="h-3.5 w-3.5" />}
            {isRes ? 'Residential' : 'Commercial'}
          </span>

          {(p as any).vip && <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-semibold shadow-sm"><Star className="h-3.5 w-3.5"/> Featured</span>}
          {(p as any).reraVerified && <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-1 text-xs font-semibold shadow-sm"><ShieldCheck className="h-3.5 w-3.5"/> RERA</span>}
        </div>

        <div className="p-4">
          <h3 className="line-clamp-1 text-base font-semibold">{String(p.title ?? 'Untitled')}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {p.preference && <FeatureChip>{p.preference}</FeatureChip>}
            {p.propertyType && <FeatureChip>{p.propertyType}</FeatureChip>}
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-gray-600">{p.description ?? '—'}</p>
          <div className="mt-2 text-xs text-gray-500 inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5"/>{localityLine || '—'}</div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-700">
            {hasNum(p.area) && (<span className="inline-flex items-center gap-1"><Maximize2 className="h-4 w-4"/> {p.area} sq.ft</span>)}
            {isRes ? (
              <>
                {hasNum((p as ResResponse).bedrooms) && (<span className="inline-flex items-center gap-1"><BedDouble className="h-4 w-4"/> {(p as ResResponse).bedrooms} Beds</span>)}
                {hasNum((p as ResResponse).bathrooms) && (<span className="inline-flex items-center gap-1"><Bath className="h-4 w-4"/> {(p as ResResponse).bathrooms} Baths</span>)}
              </>
            ) : (
              <>
                {hasNum((p as ComResponse).cabins) && (<span className="inline-flex items-center gap-1"><Briefcase className="h-4 w-4"/> {(p as ComResponse).cabins} Cabins</span>)}
                {hasTrue((p as ComResponse).meetingRoom) && (<span className="inline-flex items-center gap-1"><Projector className="h-4 w-4"/> Meeting Rooms</span>)}
              </>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-700">
            {isRes ? (
              <>
                {(p as ResResponse).residentialOwner?.firstName && (p as ResResponse).residentialOwner?.lastName && (<span className="inline-flex items-center gap-1"><User2 className="h-4 w-4"/> {(p as ResResponse).residentialOwner?.firstName} {(p as ResResponse).residentialOwner?.lastName} </span>)}
                {(p as ResResponse).residentialOwner?.email && (<span className="inline-flex items-center gap-1"><Mail className="h-4 w-4"/> {(p as ResResponse).residentialOwner?.email} </span>)}
                {(p as ResResponse).residentialOwner?.phoneNumber && (<span className="inline-flex items-center gap-1"><Phone className="h-4 w-4"/> {(p as ResResponse).residentialOwner?.phoneNumber} </span>)}
              </>
            ) : (
              <>
                {(p as ComResponse).commercialOwner?.firstName && (p as ComResponse).commercialOwner?.lastName && (<span className="inline-flex items-center gap-1"><User2 className="h-4 w-4"/> {(p as ComResponse).commercialOwner?.firstName} {(p as ComResponse).commercialOwner?.lastName} </span>)}
                {(p as ComResponse).commercialOwner?.email && (<span className="inline-flex items-center gap-1"><Mail className="h-4 w-4"/> {(p as ComResponse).commercialOwner?.email} </span>)}
                {(p as ComResponse).commercialOwner?.phoneNumber && (<span className="inline-flex items-center gap-1"><Phone className="h-4 w-4"/> {(p as ComResponse).commercialOwner?.phoneNumber} </span>)}
              </>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-orange-600 text-xl font-bold">{priceLabel}</div>
              {/* <div className="text-xs text-gray-500">{p.area ? `${p.area} sqft` : ''}</div> */}
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate(`/admin/listings/view/${(p.category ?? 'unknown').toString().toLowerCase()}/${p.listingId}`)} className="flex rounded-lg bg-orange-500 border px-3 py-1.5 text-sm text-white font-semibold hover:bg-orange-600 items-center gap-2"><Eye className="w-4 h-4"/> View</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Assigned Leads</h1>
        <div className="text-sm text-gray-600">{leads.length} leads</div>
      </header>

      {loading && <div className="py-8 text-center">Loading leads...</div>}
      {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4">Error: {error}</div>}

      {!loading && (
        <div className="space-y-4">
          {itemsToRender.length === 0 && <div className="text-gray-600 p-6 bg-white rounded">No leads found.</div>}

          {itemsToRender.map(lead => {
            const prop = lead.resResponse ?? lead.comResponse ?? null;
            return (
              <div key={lead.enquiryId} className="bg-white rounded-lg shadow p-4 flex items-stretch gap-4">
                {/* Left container: property */}
                <div className="flex-1">
                  <PropertyCard p={prop as any} />
                </div>

                {/* Arrow / divider */}
                <div className="flex items-center justify-center w-12">
                  <div className="flex flex-col items-center text-orange-500">
                    {/* <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">➜</div>
                    <div className="text-xs text-gray-400 mt-2">Lead</div> */}
                    <ArrowRight className="h-10 w-12" />
                  </div>
                </div>

                {/* Right container: user card with flexible height */}
                <div className="w-80 flex-shrink-0 rounded-xl shadow-md border-2 border-orange-100 bg-white overflow-hidden flex flex-col"> {/* REMOVED: Fixed height, MAINTAINED: flex flex-col */}
                    
                    {/* Top Section: Image/Placeholder Area (2/7ths of container height) */}
                    <div className="w-full h-[40%] bg-gray-100 flex-shrink-0">
                        {lead.user?.profileImageUrl ? (
                            <img 
                                src={lead.user.profileImageUrl} 
                                alt="user" 
                                className="w-full h-full object-cover" 
                            />
                        ) : ( 
                            <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-8xl">
                                {initials(lead.user)}
                            </div>
                        )}
                    </div>

                    {/* Bottom Section: Content Area (5/7ths of container height, flexible) */}
                    <div className="p-3 flex flex-col flex-grow"> {/* flex-grow ensures it fills the remaining 5/7ths */}
                        
                    {/* New Flex Container for Name/Role (Left) and Button (Right) */}
                    <div className="relative flex items-start justify-between"> 
                        
                        {/* Left side: User Name and Role */}
                        <div>
                            <div className="text-md font-semibold">{lead.user?.firstName} {lead.user?.lastName}</div>
                            {lead.user?.role && (
                                <div className="text-xs px-2 py-0.5 rounded-lg bg-orange-50 text-orange-700 font-semibold inline-block mt-1">
                                    PropAdda {toPascalCase(lead.user.role)}
                                </div>
                            )}
                        </div>

                        {/* Right side: View button */}
                        <div className="flex-shrink-0"> {/* Use flex-shrink-0 to prevent button from shrinking */}
                            <button 
                                onClick={()=> setSelected(lead)} 
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white bg-orange-500 hover:bg-orange-600 border border-orange-500">
                                <Eye size={16}/> View
                            </button>
                        </div>
                        
                    </div>
                        {/* Contact Details */}
                        <div className="mt-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2 mt-2"><Mail size={14}/> <span>{lead.user?.email ?? '-'}</span></div>
                            <div className="flex items-center gap-2 mt-2"><Phone size={14}/> <span>{lead.user?.phoneNumber ?? '-'}</span></div>
                            <div className="flex items-center gap-2 mt-2"><MapPin size={14}/> <span>{lead.user?.city ?? '-'}, {lead.user?.state ?? '-'}</span></div>
                        </div>

                        {/* Buyer Name */}
                        {/* <div className="mt-3 text-xs text-gray-500">Buyer: {lead.buyerName ?? '-'}</div> */}

                        {/* Buttons Container: Pushed to bottom, controls left/right alignment */}
                        {/* The 'mt-auto' or 'flex-grow' on this div ensures it is at the very bottom */}
                        <div className="mt-1 flex flex-grow items-end justify-between"> 
                            
                            {/* Left buttons (Assign, Remove) */}
                            <div className="flex gap-2">
                                <button 
                                    onClick={()=> markSold(lead.enquiryId)} 
                                    disabled={lead.enquiryStatus==='SOLD'} 
                                    className={`px-3 py-2 ml-2 rounded text-sm font-medium transition-colors border ${lead.enquiryStatus==='SOLD' ? 'bg-gray-200 text-gray-600 border-gray-200' : 'bg-green-500 hover:bg-green-600 border-green-500 text-white'}`}>
                                    {lead.enquiryStatus==='SOLD' ? 'Property Bought' : 'Property Bought'}
                                </button>
                                <button 
                                    onClick={()=>{ if(confirm('Mark lead as Not Interested?')) markAsNotInterested(lead.enquiryId); }} 
                                    disabled={lead.enquiryStatus==='NOT_INTERESTED'} 
                                    className={`px-3 py-2 ml-2 rounded text-sm font-medium transition-colors border ${lead.enquiryStatus==='NOT_INTERESED' ? 'bg-gray-200 text-gray-600 border-gray-200' : 'bg-red-500 hover:bg-red-600 border-red-500 text-white'}`}>
                                    Not Interested
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#fff7f0] px-4 py-3 border border-orange-100">
            <div className="text-sm text-gray-600">Page <span className="font-medium">{current}</span> of <span className="font-medium">{total}</span></div>

            <div className="flex items-center gap-2">
              <button onClick={()=> setPage(p=> Math.max(0,p-1))} disabled={page===0 || loading} className="text-sm text-gray-700 disabled:opacity-50">‹ Previous Page</button>

              <div className="flex items-center">
                {numbers.map(n => {
                  const active = n===current;
                  return (
                    <button key={n} onClick={()=> setPage(n-1)} disabled={loading} className={["mx-1 w-9 h-9 text-sm rounded-full border transition", active? 'bg-orange-600 text-white border-orange-600' : 'bg-white hover:bg-gray-50'].join(' ')}>{n}</button>
                  );
                })}
              </div>

              <button onClick={()=> setPage(p=> Math.min(p+1, Math.max(0,total-1)))} disabled={current>=total || loading} className="text-sm text-gray-700 disabled:opacity-50">Next Page ›</button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Per page:</span>
              <select value={size} onChange={(e)=>{ setSize(Number(e.target.value)); setPage(0); }} className="border rounded-lg px-2 py-1 text-sm bg-white">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
            </div>
          </div>
        </div>
      )}

        {/* Modal: orange themed */}
        {selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={()=> setSelected(null)} />
            <div className="relative z-10 w-full max-w-lg bg-white rounded-lg shadow-lg overflow-hidden border-2 border-orange-100">
                <div className="h-28 bg-gradient-to-r from-orange-400 to-orange-500 p-4 text-white">
                <div className="flex items-start justify-center">
                    <div>
                    <h2 className="text-3xl font-semibold mt-5">LEAD DETAILS</h2>
                    {/* <div className="text-sm opacity-90">ID: {selected.enquiryId}</div> */}
                    </div>
                    {/* <button onClick={()=> setSelected(null)} className="text-white opacity-90">Close</button> */}
                </div>
                </div>

            <div className="p-8 bg-white rounded-xl shadow-2xl border border-gray-100">
        
            {/* Header (Optional, but adds clarity) */}
            <h3 className="flex text-xl font-bold text-gray-800 border-b pb-3 mb-6"><ClipboardCheck className="mr-2" />Enquirer Details</h3>

            {/* Key-Value Grid */}
            {/* Changed to a 2-column grid to put labels and values side-by-side */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            
            {/* Row 1: Enquirer Name */}
            <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase text-orange-400 tracking-wider">Name</span>
                <span className="text-base text-gray-800">{selected.buyerName ?? '-'}</span>
            </div>
            
            {/* Row 2: Phone Number */}
            <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase text-orange-400 tracking-wider">Phone Number</span>
                <span className="text-base text-gray-800">+91 {selected.buyerPhoneNumber ?? '-'}</span>
            </div>
            
            {/* Row 3: Enquirer Type */}
            <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase text-orange-400 tracking-wider">Enquirer is </span>
                <span className="text-base text-gray-800 font-medium">{selected.buyerType ?? '-'}</span>
            </div>
            
            {/* Row 4: Buyer Reason */}
            <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase text-orange-400 tracking-wider">Property is required for</span>
                <span className="text-base text-gray-800">{selected.buyerReason ?? '-'}</span>
            </div>
            
            {/* Row 5: Enquiry Detail (Spanning full width) */}
            <div className="col-span-2 flex flex-col mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-[10px] font-semibold uppercase text-orange-400 tracking-wider mb-2">Detailed Enquiry Note</span>
                <p className="text-sm text-gray-700 italic">
                    {selected.buyerReasonDetail ?? 'No additional details provided.'}
                </p>
            </div>
            
        </div>

        {/* Footer/Action Button */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-right">
            <button 
                onClick={()=> setSelected(null)} 
                className="px-6 py-2.5 rounded-lg bg-orange-500 text-white font-semibold 
                        shadow-md transition duration-200 hover:bg-orange-600 hover:shadow-lg">
                Close
            </button>
        </div>
    </div>
          </div>
        </div>
      )}
    </div>
  );
}
