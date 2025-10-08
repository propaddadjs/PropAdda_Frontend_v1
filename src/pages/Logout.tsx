// src/pages/Logout.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Logout() {
  const { logout } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    logout();
    // small delay so user sees message, then go home (replace history)
    const t = setTimeout(() => nav("/", { replace: true }), 800);
    return () => clearTimeout(t);
  }, [logout, nav]);

  return (
    <div className="mx-auto max-w-xl p-6">
      <div className="rounded-lg border bg-white p-4">You’ve been logged out.</div>
    </div>
  );
}
