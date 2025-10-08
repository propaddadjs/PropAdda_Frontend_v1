import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { token } from "../lib/api";
import logo from "../images/logo.png";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as any;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const valid = /\S+@\S+\.\S+/.test(email) && password.length >= 1;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await login(email, password);
      token.set(
        localStorage.getItem("accessToken") ?? sessionStorage.getItem("accessToken") ?? undefined,
        localStorage.getItem("refreshToken") ?? sessionStorage.getItem("refreshToken") ?? undefined,
        remember ? "local" : "session"
      );
      // keep user logged in until logout/clear cache -> token is in localStorage
      if (!remember) {
        // if you want "session-like" behavior, move tokens to sessionStorage
        const at = localStorage.getItem("accessToken");
        const rt = localStorage.getItem("refreshToken");
        if (at) { sessionStorage.setItem("accessToken", at); localStorage.removeItem("accessToken"); }
        if (rt) { sessionStorage.setItem("refreshToken", rt); localStorage.removeItem("refreshToken"); }
      }
      nav(loc.state?.from?.pathname || "/", { replace: true });
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Invalid email or password");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top nav (simple) */}
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
            <Link to="/policy" className="hover:text-themeOrange">PRIVACY POLICY</Link>
            <Link to="/faq" className="hover:text-themeOrange">FAQ’S</Link>
          </nav>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 grid lg:grid-cols-2 gap-8 py-10">
          {/* Left “hero” */}
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

          {/* Right: Login card */}
          <section className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8">
            <div className="flex items-baseline justify-between">
              <h1 className="bg-gradient-to-r from-themeOrange to-[#046A38] text-transparent bg-clip-text text-2xl font-semibold">LOGIN</h1>
              <div className="text-sm text-gray-600">
                Don&apos;t have account?{" "}
                <Link to="/signup" className="underline">Sign up</Link>
              </div>
            </div>


            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm mb-1">Username</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Email"
                  value={email}
                  onChange={e=>setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Password</label>
                <input
                  type="password"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Password"
                  value={password}
                  onChange={e=>setPassword(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} />
                  <span>Remember</span>
                </label>
                <Link to="/forgot" className="underline">Forgot password?</Link>
              </div>
              {err && <p className="text-sm text-red-600">{err}</p>}
              <button className="w-full bg-orange-500 text-white rounded-lg py-2 disabled:opacity-50" disabled={!valid}>
                Log in
              </button>
            </form>
          </section>
        </div>
      </main>

      {/* Footer (minimal) */}
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
    </div>
  );
}
