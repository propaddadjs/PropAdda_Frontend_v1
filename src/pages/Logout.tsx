// src/pages/Logout.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { LogOut } from "lucide-react";

export default function Logout() {
  const { logout } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    logout();
    const t = setTimeout(() => nav("/", { replace: true }), 1200);
    return () => clearTimeout(t);
  }, [logout, nav]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
            <LogOut className="w-7 h-7 text-orange-600" />
          </div>
        </div>
        <h1 className="text-xl font-semibold text-gray-800">You’ve been logged out</h1>
        <p className="mt-2 text-sm text-gray-500">
          Redirecting you to the home page…
        </p>
      </div>
    </div>
  );
}

