import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation, type Location } from "react-router-dom";
import logo from "../images/logo.png";
import {
  LayoutDashboard,
  Building2,
  Bell,
  IdCard,
  LifeBuoy,
  ChevronRight,
  LogOut,
  HousePlus,
} from "lucide-react";

type FlyoutNavItemProps = {
  children: React.ReactNode;
  icon: React.ReactNode;
  label: string;
  isSectionActive: boolean;
  collapsed: boolean;
  location: Location;
};

const FlyoutNavItem: React.FC<FlyoutNavItemProps> = ({
  children,
  icon,
  label,
  isSectionActive,
  collapsed,
  location,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const flyoutContentRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!collapsed) setIsOpen(isSectionActive);
  }, [isSectionActive, collapsed]);

  useEffect(() => setIsOpen(false), [collapsed]);
  useEffect(() => setIsOpen(false), [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        anchorRef.current &&
        !anchorRef.current.contains(target) &&
        flyoutContentRef.current &&
        !flyoutContentRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen && collapsed) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, collapsed]);

  const handleButtonClick = () => {
    if (collapsed && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({ top: rect.top, left: rect.right + 8 });
    }
    setIsOpen((v) => !v);
  };

  const parentBtnClass = [
    "flex items-center gap-3 px-3 py-2 rounded-lg my-1 text-sm w-full transition",
    isOpen && !collapsed ? "bg-gray-100 text-black" : "text-gray-700 hover:bg-gray-100",
  ].join(" ");

  return (
    <div className="relative">
      <button ref={anchorRef} onClick={handleButtonClick} className={parentBtnClass} title={label}>
        <div className="flex items-center justify-center w-6 h-6">{icon}</div>
        {!collapsed && (
          <div className="flex-1 flex items-center justify-between overflow-hidden whitespace-nowrap">
            <span>{label}</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
          </div>
        )}
      </button>

      {isOpen && collapsed && position &&
        createPortal(
          <div
            ref={flyoutContentRef}
            style={{ position: "fixed", top: position.top, left: position.left }}
            className="w-48 bg-white border rounded-lg shadow-xl z-50 animate-in fade-in-5 slide-in-from-left-2 duration-150"
          >
            <div className="font-bold text-sm p-2 border-b">{label}</div>
            <div className="flex flex-col p-1">{children}</div>
          </div>,
          document.body
        )}

      {isOpen && !collapsed && (
        <div className="ml-8 mb-2 flex flex-col animate-in fade-in-0 zoom-in-95 duration-150">
          {children}
        </div>
      )}
    </div>
  );
};

type SidebarProps = {
  collapsed?: boolean;
  className?: string;
  mobileOpen?: boolean; // open drawer on small screens
  onRequestClose?: () => void; // request to close drawer
  onNavLinkClick?: () => void; // notify when a nav link was clicked (to close drawer)
};

const AgentSidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  className = '',
  mobileOpen = false,
  onRequestClose,
  onNavLinkClick,
}) => {
  const location = useLocation();

  const navItemClass = (isActive: boolean) =>
    [
      "group flex items-center gap-3 px-3 py-2 rounded-lg my-1 text-sm transition",
      isActive ? "bg-themeOrange text-white shadow-sm" : "text-gray-700 hover:bg-gray-100",
    ].join(" ");

  const subItemClass = (isActive: boolean) =>
    [
      "px-3 py-1.5 rounded-md text-xs transition text-left w-full",
      isActive ? "bg-themeOrange text-white" : "text-gray-700 hover:bg-gray-100",
    ].join(" ");

  // lock body scroll while mobile drawer open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) onRequestClose?.();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [mobileOpen, onRequestClose]);

  // When rendering the mobile drawer, force expanded view (labels visible).
  // effectiveCollapsed = true only on desktop when user toggles collapse.
  const effectiveCollapsed = mobileOpen ? false : collapsed;

  // Manage mount/unmount so we can animate out before removing from DOM
  const [mounted, setMounted] = useState<boolean>(mobileOpen);
  useEffect(() => {
    if (mobileOpen) {
      setMounted(true);
    } else {
      // Wait for animation to finish before unmounting
      const t = setTimeout(() => setMounted(false), 220); // slightly > transition duration
      return () => clearTimeout(t);
    }
  }, [mobileOpen]);

  const sidebarContent = (
    <div className={`h-full flex flex-col ${effectiveCollapsed ? "w-16" : "w-56"} bg-white`}>
      {/* Brand */}
      <div className="flex items-center justify-between px-3 py-2 border-b overflow-visible">
        <Link to="/" onClick={() => onNavLinkClick?.()} className="flex items-center gap-2">
          {/* Logo: keep large size on md+ even when sidebar is collapsed; smaller on mobile */}
          <img
            src={logo}
            alt="PropAdda"
            title="PropAdda"
            className="object-contain transition-all duration-200 md:w-20 md:h-16 w-10 h-10"
          />
        </Link>

        {/* Only show close X in the drawer header (mobile) */}
        {mobileOpen && (
          <button
            onClick={() => onRequestClose?.()}
            aria-label="Close menu"
            className="md:hidden p-2 rounded hover:bg-gray-100"
            title="Close"
          >
            <span className="block w-4 h-4 relative">
              <span className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-600 rotate-45 transform origin-center" />
              <span className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-600 -rotate-45 transform origin-center" />
            </span>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <NavLink to="/agent" end className={({ isActive }) => navItemClass(isActive)} title="Dashboard" onClick={() => onNavLinkClick?.()}>
          <div className="flex items-center justify-center w-6 h-6">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          {!effectiveCollapsed && <div className="flex-1">Dashboard</div>}
        </NavLink>

        <FlyoutNavItem
          collapsed={effectiveCollapsed}
          label="Listings"
          icon={<Building2 className="w-5 h-5" />}
          isSectionActive={location.pathname.startsWith("/agent/listings")}
          location={location}
        >
          <NavLink to="/agent/listings/active" className={({ isActive }) => subItemClass(isActive)} onClick={() => onNavLinkClick?.()}>
            Active
          </NavLink>
          <NavLink to="/agent/listings/pending" className={({ isActive }) => subItemClass(isActive)} onClick={() => onNavLinkClick?.()}>
            Pending
          </NavLink>
          <NavLink to="/agent/listings/expired" className={({ isActive }) => subItemClass(isActive)} onClick={() => onNavLinkClick?.()}>
            Expired
          </NavLink>
          <NavLink to="/agent/listings/sold" className={({ isActive }) => subItemClass(isActive)} onClick={() => onNavLinkClick?.()}>
            Sold
          </NavLink>
        </FlyoutNavItem>

        <NavLink to="/agent/kycStatus" className={({ isActive }) => navItemClass(isActive)} title="KYC Status" onClick={() => onNavLinkClick?.()}>
          <div className="flex items-center justify-center w-6 h-6">
            <IdCard className="w-5 h-5" />
          </div>
          {!effectiveCollapsed && <div className="flex-1">KYC Status</div>}
        </NavLink>

        <NavLink to="/agent/notifications" className={({ isActive }) => navItemClass(isActive)} title="Notifications" onClick={() => onNavLinkClick?.()}>
          <div className="flex items-center justify-center w-6 h-6">
            <Bell className="w-5 h-5" />
          </div>
          {!effectiveCollapsed && <div className="flex-1">Notifications</div>}
        </NavLink>

        <FlyoutNavItem
          collapsed={effectiveCollapsed}
          label="Support"
          icon={<LifeBuoy className="w-5 h-5" />}
          isSectionActive={location.pathname.startsWith("/agent/support")}
          location={location}
        >
          <NavLink to="/agent/support/feedback" className={({ isActive }) => subItemClass(isActive)} onClick={() => onNavLinkClick?.()}>
            Feedback
          </NavLink>
          <NavLink to="/agent/support/help" className={({ isActive }) => subItemClass(isActive)} onClick={() => onNavLinkClick?.()}>
            Help
          </NavLink>
          <NavLink to="/agent/support/manageProfile" className={({ isActive }) => subItemClass(isActive)} onClick={() => onNavLinkClick?.()}>
            Manage Profile
          </NavLink>
        </FlyoutNavItem>

        <NavLink to="/agent/postproperty" className={({ isActive }) => navItemClass(isActive)} title="Post a Property" onClick={() => onNavLinkClick?.()}>
          <div className="flex items-center justify-center w-6 h-6">
            <HousePlus className="w-5 h-5" />
          </div>
          {!effectiveCollapsed && <div className="flex-1">Post a Property</div>}
        </NavLink>

        <NavLink to="/logout" className={({ isActive }) => navItemClass(isActive)} title="Logout" onClick={() => onNavLinkClick?.()}>
          <div className="flex items-center justify-center w-6 h-6">
            <LogOut className="w-5 h-5" />
          </div>
          {!effectiveCollapsed && <div className="flex-1">Logout</div>}
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t">
        {!effectiveCollapsed && (
          <div className="text-xs text-gray-500">
            <p>
              © {new Date().getFullYear()} PropAdda. All Rights Reserved. Powered by
              <a className="hover:text-themeOrange ml-1" href="https://studiobyrelabel.com/"> Studio by ReLabel</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Desktop permanent sidebar (md+): show the same as before
  const desktopSidebar = (
    <aside
      className={`hidden md:block bg-white border-r border-gray-200 ${collapsed ? "w-16" : "w-56"} h-screen fixed top-0 left-0 transition-[width] duration-200 ${className}`}
      aria-label="Agent sidebar"
    >
      {sidebarContent}
    </aside>
  );

  // Mobile drawer (smaller than md): slide over with backdrop + animation
  const mobileDrawer = mounted
    ? createPortal(
        <>
          {/* backdrop - fade in/out */}
          <div
            className={`fixed inset-0 z-40 md:hidden transition-opacity duration-200 ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            onClick={() => onRequestClose?.()}
            aria-hidden="true"
          />

          {/* slide-in panel - translate animation */}
          <div
            className={`fixed top-0 left-0 h-full z-50 md:hidden w-72 max-w-[90%] transform transition-transform duration-200 ${
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            role="dialog"
            aria-modal="true"
          >
            <div className="h-full overflow-y-auto">
              {sidebarContent}
            </div>
          </div>
        </>,
        document.body
      )
    : null;

  return (
    <>
      {/* Desktop permanent sidebar */}
      {desktopSidebar}

      {/* Mobile drawer portal */}
      {mobileDrawer}
    </>
  );
};

export default AgentSidebar;
