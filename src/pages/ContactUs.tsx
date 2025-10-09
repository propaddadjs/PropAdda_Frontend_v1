// src/pages/ContactUs.tsx
import React, { useState } from "react";
import { Phone, Mail, MapPin, Send, Home, Shield, MessageSquare, Instagram, Youtube, Facebook } from "lucide-react";
import facebookLogo from '../images/facebook.png';
import twitterLogo from '../images/twitter.png';
import instagramLogo from '../images/instagram.png';
import linkedinLogo from '../images/linkedin.png';
import youtubeLogo from '../images/youtube.png';
import Header from "../components/Header";
import Footer from "../components/Footer";
import PropertyAction from "../components/PropertyAction";

const ORANGE = {
  base: "bg-orange-500",
  baseHover: "hover:bg-orange-600",
  ring: "focus:border-orange-500 focus:ring-orange-500",
  text: "text-orange-600",
};

const COMPANY = {
  phone: "+91 8595511411",
  email: "sales@propadda.in",
  address: "New Delhi",
  // Address per PDF for general contact block
  postalAddress: "F5, Manish Plaza 3, Plot No. 12, Sector 10, Dwarka, New Delhi",
  // Map address (exactly as user requested)
  mapAddress: "28.59051502965873, 77.0574798424859",
};

const ContactUs: React.FC = () => {



  const encodedAddress = encodeURIComponent(COMPANY.mapAddress);
  const mapSrc = `https://www.google.com/maps?q=${encodedAddress}&output=embed`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Optional site header */}
      <Header title="CONTACT US" />

      {/* Hero */}
      <section className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-orange-700 bg-orange-50 px-3 py-1 rounded-full">Contact Us</div>
            <h1 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              your perfect <span className="text-orange-600">home</span> awaits
            </h1>
            <p className="mt-2 text-gray-600">We're here to help with enquiries, feedback, or partnerships.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
            <div className="rounded-2xl border-orange-100 bg-orange-50 flex flex-col items-center p-4 shadow-sm transition duration-300 hover:shadow-lg hover:scale-[1.03]">
              <Phone className="w-5 h-5 text-orange-600" />
              <div className="mt-2 text-sm text-gray-600">Call</div>
              <div className="font-semibold">{COMPANY.phone}</div>
            </div>
            <div className="rounded-2xl border-orange-100 bg-orange-50 flex flex-col items-center p-4 shadow-sm transition duration-300 hover:shadow-lg hover:scale-[1.03]">
              <Mail className="w-5 h-5 text-orange-600" />
              <div className="mt-2 text-sm text-gray-600">Mail</div>
              <div className="font-semibold break-all">{COMPANY.email}</div>
            </div>
            <div className="rounded-2xl border-orange-100 bg-orange-50 flex flex-col items-center p-4 shadow-sm transition duration-300 hover:shadow-lg hover:scale-[1.03]">
              <MapPin className="w-5 h-5 text-orange-600" />
              <div className="mt-2 text-sm text-gray-600">Address</div>
              <div className="font-semibold">{COMPANY.address}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact + Map in one wide row */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Contact + socials */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm flex flex-col">
            <h2 className="text-lg font-semibold">Reach us at</h2>
            <div className="mt-4 space-y-4 text-sm text-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center"><Phone className="w-4 h-4 text-white" /></div>
                <span className="font-medium">{COMPANY.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center"><Mail className="w-4 h-4 text-white" /></div>
                <span className="font-medium break-all">{COMPANY.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center"><MapPin className="w-4 h-4 text-white" /></div>
                <span className="font-medium">{COMPANY.postalAddress}</span>
              </div>
            </div>

          {/* Socials + "Open in Maps" link */}
          <div className="social-links mt-6 flex flex-wrap items-center gap-3">
            <div className="transition duration-300 hover:scale-[1.2]">
            <a href="https://www.facebook.com/PropAddaIndia" target="_blank" rel="noopener noreferrer"><img src={facebookLogo} alt="Facebook" /></a> </div>
            <div className="transition duration-300 hover:scale-[1.2]">
            <a href="https://x.com/Propaddaindia" target="_blank" rel="noopener noreferrer"><img src={twitterLogo} alt="Twitter" /></a> </div>
            <div className="transition duration-300 hover:scale-[1.2]">
            <a href="https://www.instagram.com/propadda/" target="_blank" rel="noopener noreferrer"><img src={instagramLogo} alt="Instagram" /></a> </div>
            <div className="transition duration-300 hover:scale-[1.2]">
            <a href="#" target="_blank" rel="noopener noreferrer"><img src={linkedinLogo} alt="LinkedIn" /></a> </div>
            <div className="transition duration-300 hover:scale-[1.2]">
            <a href="https://www.youtube.com/@Propaddaindia" target="_blank" rel="noopener noreferrer"><img src={youtubeLogo} alt="YouTube" /></a> </div>
          </div>

          {/* Optional: Secondary info blocks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

            {/* Card 1: Centered Icon & Hover Effect */}
            <div className="rounded-2xl border-orange-100 bg-orange-50 p-6 shadow-sm transition duration-300 hover:shadow-lg hover:scale-[1.03]">
                <div className="flex flex-col items-center gap-3"> {/* CHANGED: Added flex-col and items-center */}
                    <Home className="w-6 h-6 text-orange-600 mb-2" /> {/* Increased size, added mb-2 for spacing */}
                    <div className="text-center"> {/* ADDED: text-center */}
                        <div className="text-base font-semibold">Residential & Commercial</div> {/* Increased font size slightly */}
                        <p className="text-sm text-gray-600">Expert help finding your perfect place.</p> {/* Increased font size slightly */}
                    </div>
                </div>
            </div>

            {/* Card 2: Centered Icon & Hover Effect */}
            <div className="rounded-2xl border-orange-100 bg-orange-50 p-6 shadow-sm transition duration-300 hover:shadow-lg hover:scale-[1.03]">
                <div className="flex flex-col items-center gap-3"> {/* CHANGED: Added flex-col and items-center */}
                    <Shield className="w-6 h-6 text-orange-600 mb-2" /> {/* Increased size, added mb-2 for spacing */}
                    <div className="text-center"> {/* ADDED: text-center */}
                        <div className="text-base font-semibold">Verified Listings</div>
                        <p className="text-sm text-gray-600">RERA-aligned checks for peace of mind.</p>
                    </div>
                </div>
            </div>

            {/* Card 3: Centered Icon & Hover Effect */}
            <div className="rounded-2xl border-orange-100 bg-orange-50 p-6 shadow-sm transition duration-300 hover:shadow-lg hover:scale-[1.03]">
                <div className="flex flex-col items-center gap-3"> {/* CHANGED: Added flex-col and items-center */}
                    <MessageSquare className="w-6 h-6 text-orange-600 mb-2" /> {/* Increased size, added mb-2 for spacing */}
                    <div className="text-center"> {/* ADDED: text-center */}
                        <div className="text-base font-semibold">Fast Support</div>
                        <p className="text-sm text-gray-600">Sales & support teams ready to assist.</p>
                    </div>
                </div>
            </div>
        </div>

        </div>
          {/* Map (wider and next to socials) */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold mb-2">Our Location</h3>
            <p className="text-xs text-gray-600 mb-3">{COMPANY.postalAddress}</p>
            <div className="relative overflow-hidden rounded-xl border mb-4">
              <iframe
                title="PropAdda Location"
                src={mapSrc}
                width="100%"
                height="360"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                aria-label="Map with selected location"
              />
            </div>
            <a
                className="ml-auto text-sm font-semibold text-orange-700 hover:underline"
              href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
              target="_blank" rel="noreferrer"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      </section>

      {/* Optional site footer */}
      <PropertyAction />
      <Footer />
    </div>
  );
};

export default ContactUs;
