import React from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";

import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";

import Home from "./pages/Home";
import Testimonials from "./pages/Testimonials";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import AllListings from "./pages/Admin/AllListings";
import AdminLayout from "./components/AdminLayout";
import PendingListings from "./pages/Admin/PendingListings";
import ExpiredListings from "./pages/Admin/ExpiredListings";
import VipListings from "./pages/Admin/VipListings";
import ListingDetail from "./pages/Admin/ListingDetail";
import PropertySeekers from "./pages/Admin/PropertySeekers";
import AgentBroker from "./pages/Admin/AgentBroker";
import KycRequests from "./pages/Admin/KycRequests";
import AdminNotifications from "./pages/Admin/AdminNotifications";

import AgentLayout from "./components/AgentLayout";
import AgentDashboard from "./pages/Agent/AgentDashboard";
import AgentAllListings from "./pages/Agent/AgentAllListings";
import AgentPendingListings from "./pages/Agent/AgentPendingListings";
import AgentExpiredListings from "./pages/Agent/AgentExpiredListings";
import AgentNotifications from "./pages/Agent/AgentNotifications";
import AgentFeedback from "./pages/Agent/AgentFeedback";
import AgentHelp from "./pages/Agent/AgentHelp";
import KycStatus from "./pages/Agent/KycStatus";
import AgentProfile from "./pages/Agent/AgentProfile";
import AgentChangePassword from "./pages/Agent/AgentChangePassword";
import AgentListingDetail from "./pages/Agent/AgentListingDetail";
import AgentSoldListings from "./pages/Agent/AgentSoldListings";
import PostPropPage from "./pages/Agent/PostPropertyPage";
import EditPropertyPage from "./pages/Agent/EditPropertyPage";

import BuyerLayout from "./components/BuyerLayout";
import BuyerDashboard from "./pages/Buyer/BuyerDashboard";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Logout from "./pages/Logout";
import AgentKycInit from "./pages/AgentKycInit";
import AgentKycStatus from "./pages/AgentKycStatus";
// import SearchResults from "./pages/SearchResults";
import FilteredPropertiesPage from "./pages/FilteredPropertiesPage";
import PropertyDetailsPage from "./pages/PropertyDetailsPage";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import FAQ from "./pages/FAQ";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/search-results" element={<FilteredPropertiesPage />} />
          <Route path="/properties/:category/:listingId" element={<PropertyDetailsPage />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacyPolicy" element={<PrivacyPolicy />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/aboutUs" element={<AboutUs />} />
          <Route path="/contactUs" element={<ContactUs />} />

          {/* Account area for any authenticated user */}
          <Route
            path="/account"
            element={
              <ProtectedRoute allow={["BUYER","AGENT","ADMIN"]}>
                <div className="mx-auto max-w-6xl px-4 py-6">
                  <Outlet />
                </div>
              </ProtectedRoute>
            }
          >
            <Route index element={<AgentProfile />} />               {/* Manage Account */}
            <Route path="change-password" element={<AgentChangePassword />} />
            <Route path="feedback" element={<AgentFeedback />} />
            <Route path="help" element={<AgentHelp />} />
            <Route path="initiateKyc" element={<AgentKycInit />} />
            <Route path="checkKycStatus" element={<AgentKycStatus />} />
          </Route>

          {/* Admin (ADMIN only) */}
          <Route path="/admin" element={
            <ProtectedRoute allow={["ADMIN"]}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="listings">
              <Route path="active" element={<AllListings />} />
              <Route path="pending" element={<PendingListings />} />
              <Route path="expired" element={<ExpiredListings />} />
              <Route path="sold" element={<AgentSoldListings />} />
              <Route path="vip" element={<VipListings />} />
              <Route path="/admin/listings/view/:category/:id" element={<ListingDetail />} />
            </Route>
            <Route path="leads">
              <Route path="active" element={<AllListings />} />
              <Route path="pending" element={<PendingListings />} />
              <Route path="expired" element={<ExpiredListings />} />
              <Route path="vip" element={<VipListings />} />
            </Route>
            <Route path="users">
              <Route path="propertySeekers" element={<PropertySeekers />} />
              <Route path="agentsBrokersBuilders" element={<AgentBroker />} />
              <Route path="KYC" element={<KycRequests />} />
            </Route>
            <Route path="notifications" element={<AdminNotifications />} />
          </Route>

          {/* Agent area (any logged-in user can enter /agent, but actions are further gated) */}
          <Route path="/agent" element={
            <ProtectedRoute allow={["BUYER","AGENT","ADMIN"]}>
              <AgentLayout />
            </ProtectedRoute>
          }>
            {/* <Route index element={<AgentDashboard />} /> */}
           <Route
              index
              element={
                <ProtectedRoute allow={["AGENT","ADMIN"]} requireApprovedKyc>
                  <AgentDashboard />
                </ProtectedRoute>
              }
            />
            {/* KYC init & status (reachable by BUYER/AGENT/ADMIN) */}
            {/* <Route path="initiateKyc" element={
              <ProtectedRoute allow={["BUYER","AGENT","ADMIN"]}>
                <AgentKycInit />
              </ProtectedRoute>
            } />
            <Route path="kycStatus" element={
              <ProtectedRoute allow={["BUYER","AGENT","ADMIN"]}>
                <KycStatus />
              </ProtectedRoute>
            } /> */}

            {/* Listings visible; posting/editing requires APPROVED KYC */}
            <Route path="listings">
              <Route path="active" element={<AgentAllListings />} />
              <Route path="pending" element={<AgentPendingListings />} />
              <Route path="expired" element={<AgentExpiredListings />} />
              <Route path="sold" element={<AgentSoldListings />} />
              <Route path="/agent/listings/view/:category/:id" element={<AgentListingDetail />} />
              <Route path="/agent/listings/edit/:category/:id" element={
                <ProtectedRoute allow={["AGENT","ADMIN"]} requireApprovedKyc>
                  <EditPropertyPage />
                </ProtectedRoute>
              } />
            </Route>
            <Route path="kycStatus" element={<KycStatus />} />
            <Route path="notifications" element={<AgentNotifications />} />
            <Route path="support">
              <Route path="feedback" element={<AgentFeedback />} />
              <Route path="help" element={<AgentHelp />} />
              <Route path="manageProfile" element={<AgentProfile />} />
            </Route>

            <Route path="postproperty" element={
              <ProtectedRoute allow={["AGENT","ADMIN"]} requireApprovedKyc>
                <PostPropPage />
              </ProtectedRoute>
            } />
            <Route path="changePassword" element={<AgentChangePassword />} />
          </Route>

          {/* Buyer (any authenticated role is allowed) */}
          <Route path="/buyer" element={
            <ProtectedRoute allow={["BUYER","AGENT","ADMIN"]}>
              <BuyerLayout />
            </ProtectedRoute>
          }>
            <Route index element={<BuyerDashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
