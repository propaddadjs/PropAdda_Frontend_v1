// Header.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReactDOM from "react-dom";
import logo from "../images/logo.png";
import headerImg from "../images/header.jpg";
import FilterExplorerModal, { type Filters as ExploreFilters } from "./FilterExplorerModal";
import { useAuth } from "../auth/AuthContext";
import { api } from "../lib/api";
import userAvatar from "../images/profileIcon.png";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";

type HeaderProps = {
  title?: string;
};

const Header: React.FC<HeaderProps> = ({ title }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false); // desktop avatar menu
  const [modalOpen, setModalOpen] = useState(false); // filter modal
  const [appliedStateName, setAppliedStateName] = useState<string>("");
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false); // mobile drawer

  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const toggleMenu = () => setMenuOpen((v) => !v);
  const closeMenu = () => setMenuOpen(false);

  const openFilters = () => setModalOpen(true);

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
    }
    if (user.role === "AGENT" || user.role === "ADMIN") {
      navigate("/agent/postproperty");
      return;
    }
    navigate("/account/initiateKyc");
  };

  const avatarUrl =
    (user as any)?.avatarUrl ||
    (user as any)?.profileImage ||
    (user as any)?.profileImageUrl ||
    "";

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || undefined;
  const displayHandle = fullName || user?.email?.split("@")[0] || "User";

  const isAdmin = user?.role === "ADMIN";
  const isAgent = user?.role === "AGENT";
  const isBuyer = user?.role === "BUYER";

  return (
    <header className="w-full">
      {/* Hero with background image + gradient overlay */}
      <div
        className="relative w-full h-[220px] sm:h-[300px] md:h-[400px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 50%), url(${headerImg})`,
        }}
      >
        {/* Top bar */}
        <div className="absolute top-0 left-0 z-20 flex w-full items-center justify-between px-4 sm:px-6 md:px-10 py-3 md:py-5">
          {/* LEFT: Logo + (md+) location */}
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center">
              <img src={logo} alt="PropAdda Logo" className="h-8 w-auto sm:h-12 md:h-16 object-contain" />
            </Link>

            {/* vertical separator for md+ */}
            <div className="hidden md:block h-16 w-px bg-gray-200" />

            {/* Location selector: visible on md and up; hidden on small (moved to drawer) */}
            <button
              onClick={openFilters}
              className="hidden md:inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm bg-transparent hover:bg-white/5"
              aria-label="Choose location"
            >
              <span className="truncate max-w-[12rem]">{appliedStateName || "All India"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* RIGHT: desktop controls + mobile drawer toggle */}
          <div className="flex items-center gap-3">
            {/* Post Property: visible on md+ in top bar; hidden on small (moved to drawer) */}
            <Link
              to="/postproperty"
              onClick={onPostProperty}
              className="hidden md:inline-flex items-center gap-1 rounded-3xl border border-orange-500 bg-white text-black px-4 py-2 text-sm font-semibold hover:opacity-95"
            >
              Post Property
              <span className="ml-1 rounded-full bg-yellow-300 px-1.5 py-1 text-xs text-gray-600">FREE</span>
            </Link>

            {/* Desktop auth area: avatar + dropdown */}
            {!user ? (
              <Link to="/login" className="hidden md:inline-flex">
                <span className="inline-flex items-center rounded-3xl px-3 py-1 text-md font-semibold text-white bg-orange-500">
                  Log In
                </span>
              </Link>
            ) : (
              <div className="hidden md:block relative">
                <button
                  ref={buttonRef}
                  className="inline-flex items-center gap-2"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <img
                    src={avatarUrl || userAvatar}
                    alt="Profile"
                    className="h-12 w-12 rounded-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = userAvatar;
                    }}
                  />
                  <ChevronDown className="w-4 h-4 text-gray-700" />
                </button>

                {/* Desktop portal dropdown */}
                {menuOpen && buttonRef.current &&
                  ReactDOM.createPortal(
                    <div
                      className="absolute right-0 mt-2 w-64 rounded-lg border bg-white shadow-lg z-[9999]"
                      style={{
                        top: buttonRef?.current?.getBoundingClientRect().bottom + window.scrollY,
                        left: buttonRef?.current?.getBoundingClientRect().right - 256 + window.scrollX,
                      }}
                      onMouseLeave={closeMenu}
                      role="menu"
                    >
                      <div className="px-4 py-3 bg-orange-50 border-b">
                        <div className="text-sm font-semibold text-orange-600">{fullName || displayHandle}</div>
                        {user?.email ? <div className="text-xs text-gray-600 truncate">{user.email}</div> : null}
                      </div>

                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-orange-300 text-sm"
                        onClick={() => {
                          closeMenu();
                          navigate("/");
                        }}
                      >
                        Home
                      </button>

                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-orange-300 text-sm"
                        onClick={() => {
                          closeMenu();
                          navigate("/account");
                        }}
                      >
                        Manage Profile
                      </button>

                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-orange-300 text-sm"
                        onClick={() => {
                          closeMenu();
                          navigate("/account/shortlisted");
                        }}
                      >
                        Shortlisted Properties
                      </button>

                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-orange-300 text-sm"
                        onClick={() => {
                          closeMenu();
                          navigate("/account/enquiries");
                        }}
                      >
                        Enquiries
                      </button>

                      {(isAgent || isAdmin) ? (
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-orange-300 text-sm"
                          onClick={() => {
                            closeMenu();
                            navigate("/agent");
                          }}
                        >
                          Agent Panel
                        </button>
                      ) : isBuyer ? (
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-orange-300 text-sm"
                          onClick={() => {
                            closeMenu();
                            if (user.kycVerified === "INAPPLICABLE") navigate("/account/initiateKyc");
                            else if (user.kycVerified === "PENDING" || user.kycVerified === "REJECTED") navigate("/account/checkKycStatus");
                            else navigate("/");
                          }}
                        >
                          Become an Agent
                        </button>
                      ) : null}

                      {isAdmin && (
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-orange-300 text-sm"
                          onClick={() => {
                            closeMenu();
                            navigate("/admin");
                          }}
                        >
                          Admin Panel
                        </button>
                      )}

                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-orange-300 text-sm"
                        onClick={() => {
                          closeMenu();
                          navigate("/account/change-password");
                        }}
                      >
                        Change Password
                      </button>

                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-orange-300 text-sm"
                        onClick={() => {
                          closeMenu();
                          navigate("/account/feedback");
                        }}
                      >
                        Add Feedback
                      </button>

                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-orange-300 text-sm"
                        onClick={() => {
                          closeMenu();
                          navigate("/account/help");
                        }}
                      >
                        Help Desk
                      </button>

                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 text-sm"
                        onClick={() => {
                          closeMenu();
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

            {/* MOBILE: drawer toggle (visible on small screens only) */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden inline-flex items-center rounded-md p-2 bg-orange-500 text-white"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Centered title */}
        {title && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <h1
              className="pointer-events-auto text-center text-white text-3xl sm:text-4xl md:text-5xl font-bold [text-shadow:2px_2px_5px_rgba(0,0,0,1)]"
              style={{ lineHeight: 1.05 }}
            >
              {title}
            </h1>
          </div>
        )}
      </div>

      {/* MOBILE DRAWER / SLIDE-OVER */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div className="fixed inset-0 bg-black/40" />
          <aside
            className="relative ml-auto w-80 max-w-full bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src={logo} alt="PropAdda Logo" className="h-8 w-auto" />
                {/* <div className="text-sm font-medium text-gray-900">{appliedStateName || "All India"}</div> */}
              </div>
              <button onClick={() => setMobileDrawerOpen(false)} aria-label="Close menu">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Location selector moved into drawer */}
              <button
                onClick={() => {
                  openFilters();
                  setMobileDrawerOpen(false);
                }}
                className="w-full text-center text-semibold rounded-md px-3 py-2 hover:bg-gray-100"
              >
                Choose Location
              </button>

              {/* Post Property moved into drawer */}
              <Link
                to="/postproperty"
                onClick={(e) => {
                  onPostProperty(e as any);
                  setMobileDrawerOpen(false);
                }}
                className="inline-flex w-full items-center justify-between rounded-md border border-orange-500 bg-white text-black px-4 py-2 text-sm font-semibold hover:opacity-95"
              >
                <span>Post Property</span>
                <span className="ml-2 rounded-full bg-yellow-300 px-2 py-1 text-xs text-gray-600">FREE</span>
              </Link>

              {/* Auth / Account */}
              {!user ? (
                <Link
                  to="/login"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="block w-full text-center rounded-md px-3 py-2 hover:bg-gray-100"
                >
                  Log In
                </Link>
              ) : (
                <>
                  <div className="border-t pt-3">
                    <div className="text-sm font-semibold text-center text-orange-600">{fullName || displayHandle}</div>
                    {user?.email && <div className="text-xs text-center text-gray-600 truncate">{user.email}</div>}
                  </div>

                  <button
                    className="w-full text-center rounded-md px-3 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      navigate("/account");
                    }}
                  >
                    Manage Profile
                  </button>

                  <button
                    className="w-full text-center rounded-md px-3 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      navigate("/account/shortlisted");
                    }}
                  >
                    Shortlisted Properties
                  </button>

                  <button
                    className="w-full text-center rounded-md px-3 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      navigate("/account/enquiries");
                    }}
                  >
                    Enquiries
                  </button>

                  {(isAgent || isAdmin) ? (
                    <button
                      className="w-full text-center rounded-md px-3 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        navigate("/agent");
                      }}
                    >
                      Agent Panel
                    </button>
                  ) : isBuyer ? (
                    <button
                      className="w-full text-center rounded-md px-3 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        if (user.kycVerified === "INAPPLICABLE") navigate("/account/initiateKyc");
                        else if (user.kycVerified === "PENDING" || user.kycVerified === "REJECTED") navigate("/account/checkKycStatus");
                        else navigate("/");
                      }}
                    >
                      Become an Agent
                    </button>
                  ) : null}

                  {isAdmin && (
                    <button
                      className="w-full text-center rounded-md px-3 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        navigate("/admin");
                      }}
                    >
                      Admin Panel
                    </button>
                  )}

                  <button
                    className="w-full text-center rounded-md px-3 py-2 hover:bg-gray-100 text-left"
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      navigate("/account/change-password");
                    }}
                  >
                    Change Password
                  </button>

                  <button
                    className="w-full text-center rounded-md px-3 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      navigate("/account/feedback");
                    }}
                  >
                    Add Feedback
                  </button>

                  <button
                    className="w-full text-center rounded-md px-3 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      navigate("/account/help");
                    }}
                  >
                    Help Desk
                  </button>

                  <button
                    className="w-full text-center rounded-md px-3 py-2 hover:bg-red-50 text-red-600"
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      logout();
                      navigate("/logout", { replace: true });
                    }}
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Filter modal */}
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

      {/* Login prompt modal */}
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
            <p className="mt-1 text-sm text-gray-600">Log in or sign up to post your property.</p>
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
    </header>
  );
};

export default Header;
