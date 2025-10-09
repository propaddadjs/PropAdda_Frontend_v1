// src/pages/Signup.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
import logo from "../images/logo.png";
import {
  User,
  Mail,
  Phone as PhoneIcon,
  MapPin,
  Building2,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ChevronRight,
  ShieldCheck,
  MapPinned,
} from "lucide-react";

const CSC_API_KEY =
  (import.meta.env.VITE_CSC_API_KEY as string) ||
  "ZXBOVkxVdmVaNjhiMHlqQm5PZXpxWmRSanlIUHB4a0hCSHBwNGRFRA==";

export type StateItem = { iso2: string; name: string };
export type CityItem = { name: string };

export default function Signup() {
  const nav = useNavigate();
  const { register } = useAuth();

  // form state
  const [firstName, setFirstName] = useState("");
  const [lastName , setLastName ] = useState("");
  const [email    , setEmail    ] = useState("");
  const [phone    , setPhone    ] = useState(""); // store 10 digits only
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
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  // Fetch states
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

  // Fetch cities
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
  const passOk  = password.length >= 8; // ONLY min 8 chars as requested
  const same    = password === confirm;

  const stateName = useMemo(
    () => states.find(s => s.iso2 === stateIso)?.name ?? "",
    [states, stateIso]
  );

  const canSubmit =
    firstName && lastName && emailOk && phoneOk && stateIso && city && passOk && same && agree;

  // submit
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || busy) return;
    setBusy(true); setError(null);
    try {
      await register({
        firstName, lastName, email,
        // If backend expects +91 included, change to: phoneNumber: `+91${phone}`
        phoneNumber: phone,
        state: stateName,
        city,
        password,
      });
      if (wantAgent) nav("/account/initiateKyc"); else nav("/");
    } catch (e:any) {
      setError(e?.response?.data?.message ?? "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top nav */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <img src={logo} alt="PropAdda" title="PropAdda" className="h-14 w-auto" />
          <nav className="text-sm flex items-center gap-5 text-gray-600">
            <Link to="/" className="hover:text-themeOrange transition">HOME</Link>
            <Link to="/testimonials" className="hover:text-themeOrange transition">TESTIMONIALS</Link>
            <Link to="/terms" className="hover:text-themeOrange transition">TERMS & CONDITIONS</Link>
            <Link to="/policy" className="hover:text-themeOrange transition">PRIVACY POLICY</Link>
            <Link to="/faq" className="hover:text-themeOrange transition">FAQ’S</Link>
          </nav>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 grid lg:grid-cols-2 gap-8">
          {/* Left hero */}
          <section className="hidden lg:flex flex-col justify-top mt-16">
            {/* logo above headline */}
            <div className="flex flex-col items-center">
            <img
              src={logo}
              alt="PropAdda"
              className="max-h-56 max-w-56 mb-6 opacity-90 transition hover:opacity-100"
            /> </div>
            <h2 className="text-4xl font-extrabold leading-tight mt-4 mb-4">
              <span className="text-themeOrange">your perfect </span>
              {/* <br /> */}
              <span className="text-[#046A38]">home awaits</span>
            </h2>
            <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
              <div className="group">
                <div className="text-gray-400">CONTACT</div>
                <div className="font-medium inline-flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-orange-600 group-hover:scale-110 transition" />
                  +91 8595511411
                </div>
              </div>
              <div className="group">
                <div className="text-gray-400">MAIL</div>
                <div className="font-medium inline-flex items-center gap-2">
                  <Mail className="w-4 h-4 text-orange-600 group-hover:scale-110 transition" />
                  sales@propadda.in
                </div>
              </div>
              <div className="group">
                <div className="text-gray-400">ADDRESS</div>
                <div className="font-medium inline-flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-600 group-hover:scale-110 transition" />
                  NEW DELHI
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4 text-sm text-gray-600">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              <span>Secure sign up • Encrypted • Verified marketplace</span>
            </div>
          </section>

          {/* Right: Signup card */}
          <section className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8 relative overflow-hidden">
            {/* gradient stripe */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-themeOrange via-orange-400 to-[#046A38]" />
            <div className="flex items-baseline justify-between">
              <h1 className="bg-gradient-to-r from-themeOrange to-[#046A38] text-transparent bg-clip-text text-2xl font-semibold">
                SIGN UP
              </h1>
              <div className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="underline hover:text-themeOrange transition">
                  Sign in
                </Link>
              </div>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-5">
              {/* Name row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="first" className="block text-sm mb-1">First name</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      id="first"
                      className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 border-orange-100 bg-orange-50"
                      value={firstName}
                      onChange={e=>setFirstName(e.target.value)}
                      autoComplete="given-name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="last" className="block text-sm mb-1">Last name</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      id="last"
                      className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 border-orange-100 bg-orange-50"
                      value={lastName}
                      onChange={e=>setLastName(e.target.value)}
                      autoComplete="family-name"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm mb-1">Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 border-orange-100 bg-orange-50"
                    value={email}
                    onChange={e=>setEmail(e.target.value)}
                    required
                    aria-invalid={email.length > 0 && !emailOk}
                  />
                </div>
                {email.length > 0 && !emailOk && (
                  <p className="text-xs text-red-600 mt-1">Please enter a valid email address.</p>
                )}
              </div>

              {/* Phone (with hardcoded +91 prefix, UI only) */}
              <div>
                <label htmlFor="phone" className="block text-sm mb-1">Phone number</label>
                <div className="flex">
                  <span className="inline-flex items-center gap-1 px-3 rounded-l-lg border border-orange-100 bg-orange-50 text-gray-700 text-sm">
                    <PhoneIcon className="w-4 h-4 text-orange-600" />
                    +91
                  </span>
                  <input
                    id="phone"
                    className="w-full border border-l-0 rounded-r-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 border-orange-100 bg-orange-50"
                    value={phone}
                    onChange={e=>setPhone(e.target.value.replace(/\D/g,""))}
                    placeholder="10 digits"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    aria-invalid={phone.length > 0 && !phoneOk}
                    required
                  />
                </div>
                {phone.length > 0 && !phoneOk && (
                  <p className="text-xs text-red-600 mt-1">Enter a 10-digit phone number.</p>
                )}
              </div>

              {/* State / City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="state" className="block text-sm mb-1">State</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <select
                      id="state"
                      className="w-full border rounded-lg pl-10 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 border-orange-100 bg-orange-50"
                      value={stateIso}
                      onChange={e=>setStateIso(e.target.value)}
                      required
                    >
                      <option value="">Select state</option>
                      {states.map(s => <option key={s.iso2} value={s.iso2}>{s.name}</option>)}
                    </select>
                    {loadingGeo && <Loader2 className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-gray-500" />}
                  </div>
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm mb-1">City</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400">
                      <MapPinned className="w-4 h-4" />
                    </span>
                    <select
                      id="city"
                      className="w-full border rounded-lg pl-10 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 border-orange-100 bg-orange-50 disabled:opacity-60"
                      value={city}
                      onChange={e=>setCity(e.target.value)}
                      disabled={!stateIso || loadingGeo}
                      required
                    >
                      <option value="">{stateIso ? "Select city" : "Select state first"}</option>
                      {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                    {loadingGeo && <Loader2 className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-gray-500" />}
                  </div>
                </div>
              </div>

              {/* Passwords (only min 8 char rule) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="password" className="block text-sm mb-1">Create password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="password"
                      type={showPwd ? "text" : "password"}
                      className="w-full border rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 border-orange-100 bg-orange-50"
                      value={password}
                      onChange={e=>setPassword(e.target.value)}
                      placeholder="min 8 characters"
                      autoComplete="new-password"
                      aria-invalid={password.length > 0 && !passOk}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(s => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-orange-100 text-gray-600"
                      aria-label={showPwd ? "Hide password" : "Show password"}
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password.length > 0 && !passOk && (
                    <p className="text-xs text-red-600 mt-1">Password must be at least 8 characters.</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirm" className="block text-sm mb-1">Repeat password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="confirm"
                      type={showPwd2 ? "text" : "password"}
                      className="w-full border rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 border-orange-100 bg-orange-50"
                      value={confirm}
                      onChange={e=>setConfirm(e.target.value)}
                      autoComplete="new-password"
                      aria-invalid={confirm.length > 0 && !same}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd2(s => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-orange-100 text-gray-600"
                      aria-label={showPwd2 ? "Hide password" : "Show password"}
                    >
                      {showPwd2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirm.length > 0 && !same && (
                    <p className="text-xs text-red-600 mt-1">Passwords don’t match.</p>
                  )}
                </div>
              </div>

              {/* Agent toggle + Terms */}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={wantAgent}
                  onChange={e=>setWantAgent(e.target.checked)}
                  className="accent-orange-600"
                />
                <span>I want to be an agent</span>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={e=>setAgree(e.target.checked)}
                  className="accent-orange-600"
                  required
                />
                <span>
                  I agree to the
                  <button type="button" className="underline hover:text-themeOrange" onClick={()=>setShowTnC(true)}>
                    Terms and Conditions
                  </button>
                </span>
              </label>

              {/* Errors / Loaders */}
              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
              {loadingGeo && (
                <div className="inline-flex items-center gap-2 text-xs text-gray-600">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading states/cities…
                </div>
              )}

              {/* Submit */}
              <button
                className="w-full bg-orange-500 text-white rounded-lg py-2 font-semibold flex items-center justify-center gap-2 hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!canSubmit || busy}
              >
                {busy ? "Registering…" : wantAgent ? "Register and initiate KYC" : "Register"}
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                Your information is encrypted and secure.
              </div>
            </form>

            <div className="mt-4 text-center text-sm">
              Already registered? <Link className="underline hover:text-themeOrange" to="/login">Sign in</Link>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-gray-500 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} PropAdda. All Rights Reserved. Powered by{" "}
            <a className="hover:text-themeOrange" href="https://studiobyrelabel.com/">Studio by ReLabel</a>
          </p>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-themeOrange transition">TERMS & CONDITIONS</Link>
            {/* <Link to="/feedback" className="hover:text-themeOrange transition">FEEDBACK</Link> */}
          </div>
        </div>
      </footer>

      {/* Terms modal */}
      {showTnC && (
        <div className="fixed inset-0 bg-black/50 grid place-items-center z-50">
          <div className="bg-white rounded-2xl p-5 max-w-2xl w-full animate-in fade-in-0 zoom-in-95 duration-200">
            <h2 className="text-lg font-semibold mb-3">Terms & Conditions</h2>
            <div className="h-64 overflow-auto text-sm space-y-2">
              <p>By creating an account you agree to …</p>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="px-4 py-2 rounded-lg border hover:bg-gray-50" onClick={()=>setShowTnC(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
