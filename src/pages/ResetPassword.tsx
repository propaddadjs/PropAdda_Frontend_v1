// Author-Hemant Arora
import React, { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Lock, Eye, EyeOff, CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react";
import logo from "../images/logo.png";

export default function ResetPassword() {
  const [sp] = useSearchParams();
  const token = sp.get("token") ?? "";
  const nav = useNavigate();

  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const minOk = pwd.length >= 8;
  const same = pwd === confirm;
  const canSubmit = token && minOk && same;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || busy) return;
    setBusy(true); setOk(null); setErr(null);
    try {
      await api.post("/auth/reset-password", { token, newPassword: pwd });
      setOk("Password updated successfully. Redirecting to login…");
      setTimeout(() => nav("/login", { replace: true }), 1200);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Reset link is invalid or expired.");
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
              Reset Password
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Set a new password (minimum 8 characters).
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {/* New password */}
              <div>
                <label className="block text-sm mb-1">New password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={show1 ? "text" : "password"}
                    className="w-full border rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 border-orange-100 bg-orange-50"
                    value={pwd}
                    onChange={e => setPwd(e.target.value)}
                    placeholder="min 8 characters"
                    required
                  />
                  <button type="button" onClick={() => setShow1(s => !s)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-orange-100 text-gray-600"
                          aria-label={show1 ? "Hide password" : "Show password"}>
                    {show1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pwd.length > 0 && !minOk && (
                  <p className="text-xs text-red-600 mt-1">Password must be at least 8 characters.</p>
                )}
              </div>

              {/* Confirm */}
              <div>
                <label className="block text-sm mb-1">Confirm password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={show2 ? "text" : "password"}
                    className="w-full border rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 border-orange-100 bg-orange-50"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShow2(s => !s)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-orange-100 text-gray-600"
                          aria-label={show2 ? "Hide password" : "Show password"}>
                    {show2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirm.length > 0 && !same && (
                  <p className="text-xs text-red-600 mt-1">Passwords don’t match.</p>
                )}
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
                disabled={!canSubmit || busy}
              >
                {busy ? "Updating…" : "Update Password"} <ChevronRight className="w-4 h-4" />
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
