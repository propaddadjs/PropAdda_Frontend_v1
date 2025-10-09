import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReactDOM from "react-dom";
import logo from "../images/logo.png";
import userAvatar from "../images/userAvatar.png";
import FilterExplorerModal, { type Filters as ExploreFilters } from "./FilterExplorerModal";
import { useAuth } from "../auth/AuthContext";
import { api } from "../lib/api";
import { ChevronDown, UserCircle2 } from "lucide-react";

type HeaderProps = {
  /** Pass a title on inner pages. Omit on homepage to show nothing. */
  title?: string;
};

const Header: React.FC<HeaderProps> = ({ title }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const toggle = () => setMenuOpen((v) => !v);
  const close = () => setMenuOpen(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [appliedStateName, setAppliedStateName] = useState<string>("");

  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  // Open modal from the "All India" button
  const openFilters = () => setModalOpen(true);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  // Explore → call backend, navigate to results page
  const handleExplore = async (filters: ExploreFilters) => {
    const payload = {
      ...filters,
      preference: filters.preference === "Buy" ? "Sale" : filters.preference,
    };

    try {
      const { data } = await api.post("/user/getFilteredProperties", payload);
      setAppliedStateName(filters.stateName || "");
      navigate("/search-results", { state: { filters, results: data } });
    } catch (e) {
      console.error("Filter explore failed", e);
    }
  };

  const onPostProperty = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      setLoginPromptOpen(true);
      return;
    }
    if (user.role === "BUYER") {
      if (user.kycVerified === "INAPPLICABLE") {
        navigate("/account/initiateKyc");
        return;
      }
      if (user.kycVerified === "PENDING") {
        navigate("/kycStatus");
        return;
      }
      // If Buyer is APPROVED/REJECTED etc., send to agent flow only if approved as agent.
      // Assuming only AGENT/ADMIN can post property per your rule:
      // do nothing here; fall through below for AGENT/ADMIN
    }
    if (user.role === "AGENT" || user.role === "ADMIN") {
      navigate("/agent/postproperty");
      return;
    }
    // If role is BUYER and KYC is not pending/inapplicable, you can choose a behavior.
    // For now, default to initiate KYC.
    navigate("/account/initiateKyc");
  };

  // Derive avatar URL if present; support a few common field names
  const avatarUrl =
    (user as any)?.avatarUrl ||
    (user as any)?.profileImage ||
    (user as any)?.profileImageUrl ||
    "";

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || undefined;
  const displayHandle = fullName || user?.email?.split("@")[0] || "User";

  // Role checks
  const isAdmin = user?.role === "ADMIN";
  const isAgent = user?.role === "AGENT";
  const isBuyer = user?.role === "BUYER";

  return (
    <div className="hero-wrapper w-full">
      <div className="header relative flex items-center justify-between px-4 py-3">
        {/* Left: Logo + Location */}
        <div className="logo flex items-center gap-3">
          {/* 1) Logo navigates to home */}
          <Link to="/" className="inline-flex items-center">
            <img src={logo} alt="PropAdda Logo" className="max-h-sm max-w-sm" />
          </Link>
          <div className="vl h-6 w-px bg-gray-200" />
          {/* 2) All India button with ChevronDown */}
          <button
            className="location-select inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm"
            onClick={openFilters}
          >
            {appliedStateName || "All India"}
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Post + Auth / Profile */}
        <div className="header-buttons relative flex items-center gap-3">
          {/* 6) Post Property */}
          <Link to="/postproperty" className="post-btn" onClick={onPostProperty}>
            {/* <span className="inline-flex items-center gap-1 rounded-md bg-orange-500 text-white px-3 py-1.5 text-lg font-medium hover:opacity-95"> */}
              Post Property <span className="ml-1 rounded bg-white/20 px-1 py-0.5 font-semibold text-xs">FREE</span>
            {/* </span> */}
          </Link>

          {/* Auth area */}
          {!user ? (
            <Link to="/login" className="login-btn">
              <span className="inline-flex items-center rounded-md px-3 py-1 text-sm">
                Log In
              </span>
            </Link>
          ) : (
            <div className="relative">
              {/* 3) Profile image (or fallback) + chevron */}
              <button
                ref={buttonRef}
                className="inline-flex items-center gap-1"
                onClick={toggle}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                {/* <img
                  src={avatarUrl || userAvatar}
                  alt="Profile"
                  className="h-10 w-10 bg-orange-400 rounded-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = userAvatar;
                  }}
                /> */}
                <UserCircle2 className="bg-orange-500 text-white rounded-full w-12 h-12" />
                <ChevronDown className="w-4 h-4" />
              </button>

              {menuOpen && buttonRef.current &&
                ReactDOM.createPortal(
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-lg border bg-white shadow-lg z-[9999]"
                    style={{
                      top: buttonRef?.current?.getBoundingClientRect().bottom + window.scrollY,
                      left: buttonRef?.current?.getBoundingClientRect().right - 256 + window.scrollX, // 256px = w-64
                    }}
                    onMouseLeave={close}
                    role="menu"
                  >
                  {/* Header with name */}
                  <div className="px-4 py-3 bg-orange-50 border-b">
                    <div className="text-sm font-semibold text-orange-600">
                      {fullName || displayHandle}
                    </div>
                    {user?.email ? (
                      <div className="text-xs text-gray-600 truncate">{user.email}</div>
                    ) : null}
                  </div>

                  {/* 4) Updated options */}
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-orange-300 text-sm"
                    onClick={() => {
                      close();
                      navigate("/");
                    }}
                  >
                    Home
                  </button>

                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-orange-300 text-sm"
                    onClick={() => {
                      close();
                      navigate("/account");
                    }}
                  >
                    Manage Account
                  </button>

                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-orange-300 text-sm"
                    onClick={() => {
                      close();
                      navigate("/account/shortlisted");
                    }}
                  >
                    Shortlisted Properties
                  </button>

                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-orange-300 text-sm"
                    onClick={() => {
                      close();
                      navigate("/account/enquiries");
                    }}
                  >
                    Enquiries
                  </button>

                  {/* Become an Agent / Agent Panel */}
                  {(isAgent || isAdmin) ? (
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-orange-300 text-sm"
                      onClick={() => {
                        close();
                        navigate("/agent");
                      }}
                    >
                      Agent Panel
                    </button>
                  ) : isBuyer ? (
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-orange-300 text-sm"
                      onClick={() => {
                        close();
                        if (user.kycVerified === "INAPPLICABLE") navigate("/account/initiateKyc");
                        else if (user.kycVerified === "PENDING" || user.kycVerified === "REJECTED") navigate("/account/checkKycStatus");
                        else navigate("/")
                      }}
                    >
                      Become an Agent
                    </button>
                  ) : null}

                  {/* Admin Panel (ADMIN only) */}
                  {isAdmin && (
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-orange-300 text-sm"
                      onClick={() => {
                        close();
                        navigate("/admin");
                      }}
                    >
                      Admin Panel
                    </button>
                  )}

                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-orange-300 text-sm"
                    onClick={() => {
                      close();
                      navigate("/account/change-password");
                    }}
                  >
                    Change Password
                  </button>

                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-orange-300 text-sm"
                    onClick={() => {
                      close();
                      navigate("/account/feedback");
                    }}
                  >
                    Add Feedback
                  </button>

                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-orange-300 text-sm"
                    onClick={() => {
                      close();
                      navigate("/account/help");
                    }}
                  >
                    Help Desk
                  </button>

                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 text-sm"
                    onClick={() => {
                      close();
                      logout();
                      navigate("/logout", { replace: true });
                    }}
                  >
                    Logout
                  </button>
                </div>,
                document.body
              )}
            </div>
          )}
        </div>
      </div>

       {/* 5) Center: dynamic page title (omit on homepage by not passing title) */}
        {title ? (
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
    <h1 className="text-white text-4xl font-bold text-center [text-shadow:2px_2px_5px_rgba(0,0,0,0.5)]">
      {/* Visual styles from the CSS are applied here */}
      {title}
    </h1>
  </div>
) : null}

      {/* The minimal filter modal */}
      <FilterExplorerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onExplore={handleExplore}
        initial={{
          category: "All",
          preference: "All",
          propertyTypes: [],
        }}
      />

      {/* 6) Login prompt modal for Post Property */}
      {loginPromptOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setLoginPromptOpen(false)}
        >
          <div
            className="w-[90%] max-w-sm rounded-lg bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900">You are not logged in</h3>
            <p className="mt-1 text-sm text-gray-600">
              Log in or sign up to post your property.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                className="inline-flex items-center rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:opacity-95"
                onClick={() => {
                  setLoginPromptOpen(false);
                  navigate("/login");
                }}
              >
                Log in / Sign up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
