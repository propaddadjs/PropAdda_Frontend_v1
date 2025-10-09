import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import PropertyAction from "../components/PropertyAction";
import Footer from "../components/Footer";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header title="PRIVACY POLICY" />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 text-sm">
          <Link to="/" className="text-gray-500 hover:text-gray-800">
            Home
          </Link>
          <span className="mx-2 text-gray-400">&gt;</span>
          <span className="text-gray-800 font-medium">Privacy Policy</span>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 flex-1">
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 sm:p-10 space-y-8">
          <h1>Privacy Policy to be added here.</h1>
        </div>
      </main>
      <PropertyAction />
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
