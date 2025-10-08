import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
import logo from "../images/logo.png";

const CSC_API_KEY = (import.meta.env.VITE_CSC_API_KEY as string) || "ZXBOVkxVdmVaNjhiMHlqQm5PZXpxWmRSanlIUHB4a0hCSHBwNGRFRA==";
export type StateItem = { iso2: string; name: string };
export type CityItem = { name: string };
export default function Signup() {
  const nav = useNavigate();
  const { register } = useAuth();

  // form state
  const [firstName, setFirstName] = useState("");
  const [lastName , setLastName ] = useState("");
  const [email    , setEmail    ] = useState("");
  const [phone    , setPhone    ] = useState("");
  const [stateIso , setStateIso ] = useState("");
  const [city     , setCity     ] = useState("");
  const [password , setPassword ] = useState("");
  const [confirm  , setConfirm  ] = useState("");
  const [wantAgent, setWantAgent] = useState(false);
  const [agree    , setAgree    ] = useState(false);

  // UI
  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTnC, setShowTnC] = useState(false);
  const [busy, setBusy] = useState(false);

  // --- 2. Fetch states (external API) ---
  const fetchStates = useCallback(async () => {
    if (!CSC_API_KEY || CSC_API_KEY === "YOUR_CSC_API_KEY_HERE") {
      setError("CSC API key is required to load states. Please set VITE_CSC_API_KEY.");
      return;
    }
    setLoadingGeo(true);
    try {
      const res = await axios.get<StateItem[]>(
        "https://api.countrystatecity.in/v1/countries/IN/states",
        { headers: { "X-CSCAPI-KEY": CSC_API_KEY } }
      );
      const stateList = (res.data || []).map((s: any) => ({ iso2: s.iso2, name: s.name }));
      stateList.sort((a,b)=>a.name.localeCompare(b.name));
      setStates(stateList);
    } catch (err) {
      console.error("Failed to load states:", err);
      setError("Failed to load states from external API.");
    } finally {
      setLoadingGeo(false);
    }
  }, []);

  // --- 3. Fetch cities for selected state ---
  const fetchCities = useCallback(async (iso2: string) => {
    if (!CSC_API_KEY || !iso2) {
      setCities([]);
      return;
    }
    setLoadingGeo(true);
    try {
      const res = await axios.get<any[]>(
        `https://api.countrystatecity.in/v1/countries/IN/states/${iso2}/cities`,
        { headers: { "X-CSCAPI-KEY": CSC_API_KEY } }
      );
      const cityList: CityItem[] = (res.data || []).map((c: any) => ({ name: c.name }));
      cityList.sort((a,b)=>a.name.localeCompare(b.name));
      setCities(cityList);
    } catch (err) {
      console.error("Failed to load cities:", err);
      setError("Failed to load cities for selected state.");
      setCities([]);
    } finally {
      setLoadingGeo(false);
    }
  }, []);

  useEffect(() => { void fetchStates(); }, [fetchStates]);
  useEffect(() => { setCity(""); if (stateIso) void fetchCities(stateIso); }, [stateIso, fetchCities]);

  // validations
  const emailOk = /\S+@\S+\.\S+/.test(email);
  const phoneOk = /^\d{10}$/.test(phone);
  const passOk  = password.length >= 8;
  const same    = password === confirm;
  const canSubmit = firstName && lastName && emailOk && phoneOk && stateIso && city && passOk && same && agree;

  // submit
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true); setError(null);
    try {
      await register({
        firstName, lastName, email,
        phoneNumber: phone, state: stateName, city, password
      });
      if (wantAgent) nav("/account/initiateKyc"); else nav("/");
    } catch (e:any) {
      setError(e?.response?.data?.message ?? "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  // try to show selected state's readable name
  const stateName = useMemo(() => states.find(s => s.iso2 === stateIso)?.name ?? "", [states, stateIso]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top nav */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <img
            src={logo}
            alt="PropAdda"
            title="PropAdda"
            className="h-14 w-auto"
            />
          <nav className="text-sm flex items-center gap-5 text-gray-600">
            <Link to="/" className="hover:text-themeOrange">HOME</Link>
            <Link to="/testimonials" className="hover:text-themeOrange">TESTIMONIALS</Link>
            <Link to="/terms" className="hover:text-themeOrange">TERMS & CONDITIONS</Link>
            <Link to="/policy" className="hover:text-themeOrange">PRIVACY POLICY</Link>
            <Link to="/faq" className="hover:text-themeOrange">FAQ’S</Link>
          </nav>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 grid lg:grid-cols-2 gap-8 py-10">
          {/* Left hero (from your PDF) */}
          <section className="hidden lg:flex flex-col justify-center">
            <h2 className="text-4xl font-extrabold leading-tight text-themeOrange">
              your perfect<br /><span className="text-[#046A38]">home awaits</span>
            </h2>
            <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-400">CONTACT</div>
                <div className="font-medium">+91 8595511411</div>
              </div>
              <div>
                <div className="text-gray-400">MAIL</div>
                <div className="font-medium">sales@propadda.in</div>
              </div>
              <div>
                <div className="text-gray-400">ADDRESS</div>
                <div className="font-medium">NEW DELHI</div>
              </div>
            </div>
          </section>

          {/* Right: Signup card */}
          <section className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8">
            <div className="flex items-baseline justify-between">
              <h1 className="bg-gradient-to-r from-themeOrange to-[#046A38] text-transparent bg-clip-text text-2xl font-semibold">SIGN UP</h1>
              <div className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="underline">Sign in</Link>
              </div>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">First name</label>
                  <input className="w-full border rounded-lg px-3 py-2" value={firstName} onChange={e=>setFirstName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Last name</label>
                  <input className="w-full border rounded-lg px-3 py-2" value={lastName} onChange={e=>setLastName(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">Email</label>
                <input className="w-full border rounded-lg px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} />
                <p className="text-xs text-gray-500 mt-1">We&apos;ll never share your email with anyone else.</p>
              </div>

              <div>
                <label className="block text-sm mb-1">Phone number</label>
                <input className="w-full border rounded-lg px-3 py-2"
                       value={phone}
                       onChange={e=>setPhone(e.target.value.replace(/\D/g,""))}
                       placeholder="10 digits" />
                <p className="text-xs text-gray-500 mt-1">We&apos;ll never share your phone number with anyone else.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">State</label>
                  <select className="w-full border rounded-lg px-3 py-2"
                          value={stateIso}
                          onChange={e=>setStateIso(e.target.value)}>
                    <option value="">Select state</option>
                    {states.map(s => <option key={s.iso2} value={s.iso2}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">City</label>
                  <select className="w-full border rounded-lg px-3 py-2"
                          value={city}
                          onChange={e=>setCity(e.target.value)}
                          disabled={!stateIso || loadingGeo}>
                    <option value="">{stateIso ? "Select city" : "Select state first"}</option>
                    {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Create password</label>
                  <input type="password" className="w-full border rounded-lg px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} placeholder="min 8 characters" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Repeat password</label>
                  <input type="password" className="w-full border rounded-lg px-3 py-2" value={confirm} onChange={e=>setConfirm(e.target.value)} />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={wantAgent} onChange={e=>setWantAgent(e.target.checked)} />
                <span>I want to be an agent</span>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)} />
                <span>I agree to the{" "}
                  <button type="button" className="underline" onClick={()=>setShowTnC(true)}>
                    Terms and Conditions
                  </button>
                </span>
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}
              {loadingGeo && <p className="text-xs text-gray-500">Loading states/cities…</p>}

              <button className="w-full bg-orange-500 text-white rounded-lg py-2 disabled:opacity-50"
                      disabled={!canSubmit || busy}>
                {wantAgent ? "Register and initiate KYC" : "Register"}
              </button>
            </form>

            <div className="mt-4 text-center text-sm">
              Already registered? <Link className="underline" to="/login">Sign in</Link>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-gray-500 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} PropAdda. All Rights Reserved. Powered by  
          <a className="hover:text-themeOrange" href="https://studiobyrelabel.com/"> Studio by ReLabel</a>
        </p>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-themeOrange">TERMS & CONDITIONS</Link>
            <Link to="/feedback" className="hover:text-themeOrange">FEEDBACK</Link>
          </div>
        </div>
      </footer>

      {/* Terms modal */}
      {showTnC && (
        <div className="fixed inset-0 bg-black/50 grid place-items-center z-50">
          <div className="bg-white rounded-2xl p-5 max-w-2xl w-full">
            <h2 className="text-lg font-semibold mb-3">Terms & Conditions</h2>
            <div className="h-64 overflow-auto text-sm space-y-2">
              <p>By creating an account you agree to …</p>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="px-4 py-2 rounded-lg border" onClick={()=>setShowTnC(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
