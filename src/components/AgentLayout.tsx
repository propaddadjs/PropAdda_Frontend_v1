import React, { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import AgentSidebar from "./AgentSidebar";
import { Menu, Bell, ChevronDown } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { api } from "../lib/api";

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  if (pathnames.length <= 1) {
    return <div className="text-lg font-semibold tracking-tight">Agent Dashboard</div>;
  }

  return (
    <div className="flex items-center text-sm">
      <Link to="/agent" className="text-gray-500 hover:text-gray-800">Home</Link>
      {pathnames.slice(1).map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 2).join("/")}`;
        const isLast = index === pathnames.length - 2;
        const displayName = name.charAt(0).toUpperCase() + name.slice(1);
        return (
          <React.Fragment key={`${name}-${index}`}>
            <span className="mx-1 text-gray-400">/</span>
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

const AgentLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // affects md+ layout
  const [mobileOpen, setMobileOpen] = useState(false); // drawer for <md
  const [hasUnread, setHasUnread] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { user } = useAuth();
  const agentId = user?.userId ?? null;
  const isAdmin = String((user as any)?.role ?? "").toUpperCase() === "ADMIN";

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get<number>("/agent/getUnreadNotificationCountForAgent");
      setHasUnread((data ?? 0) > 0);
    } catch (e) {
      console.error("Failed to fetch agent unread count", e);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const id = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  useEffect(() => {
    const handler = () => setHasUnread(false);
    window.addEventListener("agent:markAllRead", handler);
    return () => window.removeEventListener("agent:markAllRead", handler);
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

  // Only apply left margin on md+ (desktop). Use responsive class.
  const mainContentClass = sidebarCollapsed ? "md:ml-16" : "md:ml-56";

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <AgentSidebar
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
            {/* Mobile Menu */}
            <button
              className="p-2 rounded-lg bg-orange-500 transition hover:scale-[1.08] md:hidden"
              title="Menu"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>

            {/* Desktop collapse toggle (md+) */}
            <button
              className="p-2 rounded-lg bg-orange-500 transition hover:scale-[1.08] hidden md:inline-flex"
              title="Toggle sidebar"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              aria-pressed={sidebarCollapsed}
            >
              <Menu className="w-5 h-5 text-white" />
            </button>

            {/* Breadcrumbs (hidden on mobile) */}
            <div className="hidden md:flex">
              <Breadcrumbs />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button
              title="Notifications"
              className="relative p-2 rounded-lg bg-orange-100 transition hover:scale-[1.08] hover:border-orange-500 border-2 z-50"
              onClick={() => navigate("/agent/notifications")}
            >
              <Bell className="w-5 h-5 text-black" />
              {hasUnread && (
                <span className="pointer-events-none select-none absolute bottom-1 right-1 w-2 h-2 rounded-full bg-themeOrange" />
              )}
            </button>

            {/* Profile */}
            <div ref={profileRef} className="relative z-50">
              <button
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setProfileOpen((prev) => !prev)}
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
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 hidden sm:block transition-transform ${profileOpen ? "rotate-180" : ""}`}
                />
              </button>

              {profileOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border rounded-lg shadow-xl z-50 animate-in fade-in-0 zoom-in-95">
                  <div className="p-1">
                    <Link onClick={() => setProfileOpen(false)} to="/" className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded">Home</Link>
                    <Link onClick={() => setProfileOpen(false)} to="/agent" className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded">Agent Dashboard</Link>
                    {isAdmin && <Link onClick={() => setProfileOpen(false)} to="/admin" className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded">Admin Dashboard</Link>}
                    <Link onClick={() => setProfileOpen(false)} to="/agent/postproperty" className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded">Post a Property</Link>
                    <Link onClick={() => setProfileOpen(false)} to="/agent/changePassword" className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded">Change Password</Link>
                    <div className="h-px bg-gray-200 my-1" />
                    <Link onClick={() => setProfileOpen(false)} to="/logout" className="block px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded">Logout</Link>
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

export default AgentLayout;
