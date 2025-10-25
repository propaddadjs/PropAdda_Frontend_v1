// Author-Hemant Arora
import React, { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { Menu, Bell, ChevronDown, ChevronsRight } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length <= 1) {
    return <div className="text-lg font-semibold tracking-tight">Admin Dashboard</div>;
  }

  return (
    <div className="flex items-center text-sm">
      <Link to="/admin" className="text-gray-500 hover:text-gray-800">Home</Link>
      {pathnames.slice(1).map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 2).join("/")}`;
        const isLast = index === pathnames.length - 2;
        const displayName = name.charAt(0).toUpperCase() + name.slice(1);
        return (
          <React.Fragment key={`${name}-${index}`}>
            <ChevronsRight className="w-4 h-4 text-gray-400 mx-1" />
            {isLast ? (
              <span className="font-semibold text-gray-800">{displayName}</span>
            ) : (
              <Link to={routeTo} className="text-gray-500 hover:text-gray-800">{displayName}</Link>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const MiniAvatar: React.FC<{
  src?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}> = ({ src, firstName, lastName }) => {
  const hasSrc = typeof src === "string" && src.trim() !== "";
  const initials =
    `${firstName?.[0]?.toUpperCase() ?? ""}${lastName?.[0]?.toUpperCase() ?? ""}` || "U";

  if (hasSrc) {
    return (
      <img
        src={src as string}
        alt="Profile"
        className="w-9 h-9 rounded-full object-cover shadow-sm ring-2 ring-orange-100"
      />
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-themeOrange text-white flex items-center justify-center font-bold shadow-sm ring-2 ring-orange-100">
      {initials}
    </div>
  );
};

const AdminLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop collapse
  const [mobileOpen, setMobileOpen] = useState(false); // drawer for <md
  const [hasUnread, setHasUnread] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const adminId = user?.userId ?? null;

  const fetchUnreadCount = async () => {
    try {
      const resp = await api.get<number>("/admin/getNotificationCount");
      setHasUnread((resp.data ?? 0) > 0);
    } catch (e) {
      console.error("Failed to fetch notification count", e);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const id = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(id);
  }, [adminId]);

  useEffect(() => {
    const handler = () => setHasUnread(false);
    window.addEventListener("admin:markAllRead", handler);
    return () => window.removeEventListener("admin:markAllRead", handler);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // close mobile drawer on route change
  const location = useLocation();
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Only add left margin on md+ so small screen has no gutter
  const mainContentClass = sidebarCollapsed ? "md:ml-16" : "md:ml-56";

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar: permanent on md+, drawer on <md */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        className="fixed top-0 left-0 h-full z-40"
        mobileOpen={mobileOpen}
        onRequestClose={() => setMobileOpen(false)}
        onNavLinkClick={() => setMobileOpen(false)}
      />

      {/* Main */}
      <div className={`flex-1 flex flex-col ${mainContentClass}`}>
        {/* Top bar */}
        <header className="bg-white border-b px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50 w-full">
          <div className="flex items-center gap-3">
            {/* Mobile Menu for drawer (small screens) */}
            <button
              className="p-2 rounded-lg bg-orange-500 transition hover:scale-[1.08] md:hidden"
              title="Menu"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              className="p-2 rounded-lg bg-orange-500 transition hover:scale-[1.08] hidden md:inline-flex"
              title="Toggle sidebar"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              aria-pressed={sidebarCollapsed}
            >
              <Menu className="w-5 h-5 text-white" />
            </button>

            {/* Breadcrumbs (hidden on very small screens automatically by layout if you prefer) */}
            <div className="hidden md:flex">
              <Breadcrumbs />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button
              title="Notifications"
              className="relative p-2 rounded-lg bg-orange-100 transition hover:scale-[1.08] hover:border-orange-500 border-2 z-50"
              onClick={() => navigate("/admin/notifications")}
            >
              <Bell className="w-5 h-5 text-black" />
              {hasUnread && <span className="pointer-events-none select-none absolute bottom-1 right-1 w-2 h-2 rounded-full bg-themeOrange" />}
            </button>

            {/* Profile with dropdown */}
            <div ref={profileRef} className="relative z-50">
              <button
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setProfileOpen((p) => !p)}
              >
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium leading-4">{user?.firstName} {user?.lastName}</div>
                  <div className="text-xs text-gray-500 leading-4">{user?.email}</div>
                </div>
                <MiniAvatar
                  src={(user as any)?.profileImageUrl}
                  firstName={user?.firstName}
                  lastName={user?.lastName}
                />
                <ChevronDown className={`w-4 h-4 text-gray-500 hidden sm:block transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border rounded-lg shadow-xl z-50 animate-in fade-in-0 zoom-in-95">
                  <div className="p-1">
                    <Link onClick={() => setProfileOpen(false)} to="/" className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded">Home</Link>

                    {/* --- RESTORED: Agent Dashboard link --- */}
                    <Link onClick={() => setProfileOpen(false)} to="/agent" className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded">Agent Dashboard</Link>

                    <Link onClick={() => setProfileOpen(false)} to="/admin" className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded">Admin Dashboard</Link>

                    <div className="h-px bg-gray-200 my-1" />
                    <Link onClick={() => setProfileOpen(false)} to="/logout" className="block w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded">Logout</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
