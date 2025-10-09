import React, { useState } from "react";
import { Mail, Send, CheckCircle2, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import logo from "../images/logo.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const valid = /\S+@\S+\.\S+/.test(email);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true); setOk(null); setErr(null);
    try {
      await api.post("/auth/forgot-password", { email });
      setOk("If the email exists, a reset link has been sent.");
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Unable to process request right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <img src={logo} alt="PropAdda" className="h-14 w-auto" />
          <nav className="text-sm flex items-center gap-5 text-gray-600">
            <Link to="/" className="hover:text-themeOrange transition">HOME</Link>
            <Link to="/login" className="hover:text-themeOrange transition">LOGIN</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-xl px-4 py-10">
          <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-themeOrange via-orange-400 to-[#046A38]" />
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-themeOrange to-[#046A38] bg-clip-text text-transparent">
              Forgot Password
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email and we’ll send you a link to reset your password.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm mb-1">Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 border-orange-100 bg-orange-50"
                    value={email}
                    onChange={e=>setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {ok && (
                <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {ok}
                </div>
              )}
              {err && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {err}
                </div>
              )}

              <button
                className="w-full bg-orange-500 text-white rounded-lg py-2 font-semibold flex items-center justify-center gap-2 hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!valid || busy}
              >
                <Send className="w-4 h-4" />
                {busy ? "Sending…" : "Send Reset Link"}
              </button>
            </form>

            <div className="mt-4 text-sm">
              <Link to="/login" className="underline hover:text-themeOrange">Back to Login</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
