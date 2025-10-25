// Author-Hemant Arora
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { token } from "../lib/api";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  Phone,
  MapPin,
  ShieldCheck,
  LogIn,
  Menu,
  X,
} from "lucide-react";
import logo from "../images/logo.png";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as any;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const valid = /\S+@\S+\.\S+/.test(email) && password.length >= 1;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setErr(null);
    try {
      await login(email, password);
      token.set(
        localStorage.getItem("accessToken") ?? sessionStorage.getItem("accessToken") ?? undefined,
        localStorage.getItem("refreshToken") ?? sessionStorage.getItem("refreshToken") ?? undefined,
        remember ? "local" : "session"
      );
      if (!remember) {
        const at = localStorage.getItem("accessToken");
        const rt = localStorage.getItem("refreshToken");
        if (at) { sessionStorage.setItem("accessToken", at); localStorage.removeItem("accessToken"); }
        if (rt) { sessionStorage.setItem("refreshToken", rt); localStorage.removeItem("refreshToken"); }
      }
      nav(loc.state?.from?.pathname || "/", { replace: true });
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  }

  const navLinks = [
    { to: "/", label: "HOME" },
    { to: "/testimonials", label: "TESTIMONIALS" },
    { to: "/terms", label: "TERMS & CONDITIONS" },
    { to: "/privacyPolicy", label: "PRIVACY POLICY" },
    { to: "/faq", label: "FAQ’S" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="border-b bg-white sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link to="/">
            <img src={logo} alt="PropAdda" title="PropAdda" className="h-12 sm:h-14 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-sm text-gray-600">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className="hover:text-orange-600 transition">{link.label}</Link>
            ))}
          </nav>
          <button onClick={() => setIsDrawerOpen(true)} className="md:hidden rounded-md bg-orange-500 p-2">
            {/* UPDATED: Hamburger icon color */}
            <Menu className="w-6 h-6 text-white" />
          </button>
        </div>
      </header>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/40" onClick={() => setIsDrawerOpen(false)}></div>
          <aside className="fixed inset-y-0 right-0 z-50 w-72 bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <Link to="/" onClick={() => setIsDrawerOpen(false)}>
                <img src={logo} alt="PropAdda" className="h-12 w-auto" />
              </Link>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2">
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>
            <nav className="flex flex-col space-y-4">
              {navLinks.map(link => (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  className="px-3 py-2 rounded-md text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition text-center"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 grid lg:grid-cols-2 gap-8 py-10">
          <section className="hidden lg:flex flex-col justify-center">
            <div className="flex flex-col items-center">
              <img src={logo} alt="PropAdda" className="max-h-56 max-w-56 mb-6 opacity-90 transition hover:opacity-100" />
            </div>
            <h2 className="text-2xl font-extrabold leading-tight mt-4 mb-4">
              <span className="text-themeOrange">BHARAT </span>
              <span className="text-green-700">KA APNA PROPERTY ADDA</span> 
               
            </h2>
            <ul className="mt-6 grid grid-cols-3 gap-4 text-sm">
              <li className="group"><div className="text-gray-400">CONTACT</div><div className="font-medium inline-flex items-center gap-2"><Phone className="w-4 h-4 text-orange-600 group-hover:scale-110 transition" /> +91 8595511411</div></li>
              <li className="group"><div className="text-gray-400">MAIL</div><div className="font-medium inline-flex items-center gap-2"><Mail className="w-4 h-4 text-orange-600 group-hover:scale-110 transition" /> sales@propadda.in</div></li>
              <li className="group"><div className="text-gray-400">ADDRESS</div><div className="font-medium inline-flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-600 group-hover:scale-110 transition" /> NEW DELHI</div></li>
            </ul>
            <div className="mt-8 flex items-center gap-4 text-sm text-gray-600"><ShieldCheck className="w-5 h-5 text-green-600" /><span>Secure login • Encrypted • Trusted by property owners</span></div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-green-700" />
            {/* UPDATED: Centered on mobile */}
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-baseline sm:justify-between">
              <h1 className="bg-gradient-to-r from-orange-500 to-green-700 text-transparent bg-clip-text text-2xl font-semibold">
                LOGIN
              </h1>
              <div className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="underline hover:text-orange-600 transition">
                  Sign up
                </Link>
              </div>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm mb-1">Email</label>
                <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400"><Mail className="w-4 h-4" /></span><input id="email" type="email" inputMode="email" autoComplete="email" required className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 border-orange-100 bg-orange-50" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} aria-invalid={!!err} /></div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm mb-1">Password</label>
                <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400"><Lock className="w-4 h-4" /></span><input id="password" type={showPwd ? "text" : "password"} autoComplete="current-password" required className="w-full border rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 border-orange-100 bg-orange-50" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} aria-invalid={!!err} /><button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-orange-100 text-orange-600" aria-label={showPwd ? "Hide password" : "Show password"}>{showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>
              </div>
              <div className="flex items-center justify-between text-sm"><label className="flex items-center gap-2 select-none"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="accent-orange-600" /><span>Remember me</span></label><Link to="/forgot" className="underline hover:text-orange-600 transition">Forgot password?</Link></div>
              {err && (<div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</div>)}
              <button className="w-full bg-orange-500 text-white rounded-lg py-2 font-semibold flex items-center justify-center gap-2 hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={!valid || submitting}><LogIn className="w-5 h-5" />{submitting ? "Signing in..." : "Log in"}<ChevronRight className="w-4 h-4" /></button>
            </form>
            <div className="mt-6 text-xs text-gray-500 flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-orange-600" />Secure portal</div>
          </section>
        </div>
      </main>

      <footer className="border-t bg-white">
        {/* UPDATED: Centered on mobile */}
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-gray-500 flex flex-col items-center sm:flex-row gap-2 sm:items-center sm:justify-between">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} PropAdda. All Rights Reserved. Powered by{" "}
            <a className="hover:text-orange-600" href="https://studiobyrelabel.com/">Studio by ReLabel</a>
          </p>
          {/* UPDATED: Hidden on mobile */}
          <div className="hidden sm:flex gap-4">
            <Link to="/terms" className="hover:text-orange-600 transition">TERMS & CONDITIONS</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}