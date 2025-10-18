// src/pages/KycInfo.tsx
import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Sparkles,
  ShieldCheck,
  Eye,
} from "lucide-react";

import kyc1 from "../images/kycInfo1.png";
import kyc2 from "../images/kycInfo2.png";
import kyc3 from "../images/kycInfo3.png";
import kyc4 from "../images/kycInfo4.png";
import kyc5 from "../images/kycInfo5.png";
import kyc6 from "../images/kycInfo6.png";
import Header from "../components/Header";
import headerImg from "../images/Banners/property-onboarding.png";
import PropertyAction from "../components/PropertyAction";
import Footer from "../components/Footer";

/**
 * KycInfo.tsx
 *
 * Notes:
 * - Header & Footer excluded (you will add them around this component).
 * - Both Get Started buttons point to /account/initiateKyc (Link).
 * - Uses Tailwind classes; assumes tailwind is configured.
 * - Uses framer-motion's useInView so animations start when section scrolls into view.
 * - Uses orange-500 as the primary highlight color.
 */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } }, // medium speed
};

const imageFade = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

const FAQS: { q: string; a: string }[] = [
  {
    q: "What documents do I need to submit for verification?",
    a: `You need to upload your Aadhaar card and provide your name and contact details. Adding a RERA registration number is optional but helps build more trust for your listing.`,
  },
  {
    q: "Do I need to upload photos or videos when posting a property?",
    a: `You can upload your own photos and videos while posting. We also offer professional photo shoots, drone footage, videos, and graphic design services that help you present your property in the best possible way. High-quality visuals boost your profile’s credibility and attract more serious inquiries.`,
  },
  {
    q: "How long does the verification process take?",
    a: `Once you submit the required documents, your account will be verified and approved within one day.`,
  },
  {
    q: "Can I post multiple properties before completing KYC?",
    a: `Yes! You can post as many properties as you want even before your KYC is verified. However, your listings will only appear on the platform once your account is verified.`,
  },
  {
    q: "What happens after I submit my property details?",
    a: `After submission, each property is reviewed by our team to ensure it meets our guidelines. Verified users’ listings are then approved and made visible to buyers and tenants.`,
  },
];

export default function KycInfo(): React.ReactNode {
  // FAQ open state
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  // Refs & in-view for sections to stagger animation when scrolled to
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true, margin: "-120px" });

  const whyRef = useRef(null);
  const whyInView = useInView(whyRef, { once: true, margin: "-120px" });

  const howRef = useRef(null);
  const howInView = useInView(howRef, { once: true, margin: "-120px" });

  const readyRef = useRef(null);
  const readyInView = useInView(readyRef, { once: true, margin: "-120px" });

  const creativesRef = useRef(null);
  const creativesInView = useInView(creativesRef, { once: true, margin: "-120px" });

  const faqRef = useRef(null);
  const faqInView = useInView(faqRef, { once: true, margin: "-120px" });

  return (
    <main className="w-full text-gray-800">
      <Header headerImage={headerImg}/>
      {/* HERO: Start Posting Properties with a Verified Account */}
      <section className="w-full bg-white">
        <div
          ref={heroRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 flex flex-col md:flex-row items-center gap-8"
        >
          <motion.div
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="flex-1"
          >
            <h1 className="text-xl md:text-2xl text-center md:text-left font-bold text-gray-900">
              Start <span className="text-orange-600">Posting Properties</span> with a Verified Account
            </h1>
            <p className="mt-4 text-gray-700 text-center md:text-left font-semibold max-w-xl text-sm leading-relaxed">
              To maintain trust and safety across the platform, every user must complete a simple verification process before listing their properties. Once verified, you can post properties with full support from our team.
            </p>

            <div className="mt-6 text-center md:text-left">
              <Link
                to="/account/initiateKyc"
                className="inline-flex items-center px-10 py-3 sm:px-6 sm:py-3 rounded-full bg-orange-500 text-white font-bold shadow hover:brightness-95 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                Get Started
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={imageFade}
            className="flex-1 flex justify-center md:justify-end"
          >
            <img
              src={kyc1}
              alt="KYC illustration"
              className="w-full max-w-lg object-contain"
              draggable={false}
            />
          </motion.div>
        </div>
      </section>

      {/* full-width image (kycInfo2) with overlay text container */}
      <section className="w-full mt-16">
        <motion.div
          ref={whyRef}
          initial="hidden"
          animate={whyInView ? "visible" : "hidden"}
          variants={imageFade}
          className="relative"
        >
          <img src={kyc2} alt="verification banner" className="w-full object-cover" draggable={false} />

          {/* overlay card halfway from under */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -translate-y-20 sm:-translate-y-28">
            <motion.div
              variants={fadeUp}
              className="bg-white/95 backdrop-blur-md shadow-lg rounded-2xl p-6 md:p-8"
            >
              <h2 className="text-2xl text-center font-semibold text-gray-900">Why Verification is Important?</h2>
              <p className="mt-3 text-gray-600 text-center">
                We verify every user to ensure that only genuine property owners and agents list properties on PropAdda. This helps maintain a safe and reliable marketplace where serious inquiries lead to successful deals.
              </p>

              <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-orange-500 mt-1" />
                  <span className="text-gray-700">Trusted platform for property seekers</span>
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-orange-500 mt-1" />
                  <span className="text-gray-700">Secure interactions between users</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-6 h-6 text-orange-500 mt-1" />
                  <span className="text-gray-700">Verified profiles build credibility</span>
                </li>
                <li className="flex items-start gap-3">
                  <Eye className="w-6 h-6 text-orange-500 mt-1" />
                  <span className="text-gray-700">Every listing undergoes thorough review for accuracy</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* How It Works section: image left (desktop), text right */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
        <div
          ref={howRef}
          className="flex flex-col md:flex-row items-center gap-8"
        >
          <motion.div
            initial="hidden"
            animate={howInView ? "visible" : "hidden"}
            variants={imageFade}
            className="w-full md:w-1/2 flex justify-center"
          >
            <img src={kyc3} alt="how it works" className="w-full max-w-lg object-contain" draggable={false} />
          </motion.div>

          <motion.div
            initial="hidden"
            animate={howInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="w-full md:w-1/2"
          >
            <h2 className="text-3xl font-semibold text-center md:text-end text-gray-900">How It Works</h2>

            <div className="mt-4 grid gap-4 text-center md:text-end">
              <div>
                <h3 className="font-semibold text-orange-600">Create an Account</h3>
                <p className="text-gray-600 text-sm">Sign up using your mobile number or email</p>
              </div>

              <div>
                <h3 className="font-semibold text-orange-600">Complete KYC</h3>
                <p className="text-gray-600 text-sm">Upload Aadhaar and provide basic details</p>
              </div>

              <div>
                <h3 className="font-semibold text-orange-600">Get Verified</h3>
                <p className="text-gray-600 text-sm">Our team will review your information and approve your account</p>
              </div>

              <div>
                <h3 className="font-semibold text-orange-600">Post Your Property</h3>
                <p className="text-gray-600 text-sm">Add property details like location, price, and images</p>
              </div>

              <div>
                <h3 className="font-semibold text-orange-600">Listings Get Reviewed</h3>
                <p className="text-gray-600 text-sm">Our team verifies each listing before it goes live</p>
              </div>

              <div>
                <h3 className="font-semibold text-orange-600">Manage Listings</h3>
                <p className="text-gray-600 text-sm">Manage profile, edit details, and grow your portfolio through your agent panel</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ready to list (kycInfo4) — centered heading over full-width image (fixed responsive height) */}
      <section className="w-full mb-16">
        <motion.div
          ref={readyRef}
          initial="hidden"
          animate={readyInView ? "visible" : "hidden"}
          variants={imageFade}
          className="relative"
        >
          {/* Container with explicit heights so image/bg doesn't collapse on small screens */}
          <div className="relative w-full h-[220px] sm:h-[280px] md:h-[280px] lg:h-[320px] overflow-hidden rounded-none">
            {/* Background image fills the container */}
            <img
              src={kyc4}
              alt="ready to list background"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
              aria-hidden="true"
            />

            {/* Overlay with centered content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-6 max-w-3xl">
                {/* responsive heading sizes: smaller on phones so it doesn't wrap outside */}
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-black drop-shadow-lg leading-tight">
                  Ready to <span className="text-orange-600">List your Property</span>?
                </h2>

                <div className="mt-5">
                  <Link
                    to="/account/initiateKyc"
                    className="inline-flex items-center px-10 py-3 sm:px-6 sm:py-3 rounded-full bg-orange-500 text-white font-bold shadow hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

    {/* Photos/video help + creative graphics section (kyc5 + kyc6) */}
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      {/* --- kycInfo5 block: text (70%) left on desktop, image (30%) right --- */}
      <div
        ref={creativesRef}
        className="flex flex-col md:flex-row items-center justify-center md:space-x-8 space-y-8 md:space-y-0"
      >
        {/* Text - stays first on mobile, takes 70% on desktop */}
        <motion.div
          initial="hidden"
          animate={creativesInView ? "visible" : "hidden"}
          variants={fadeUp}
          className="md:px-6 order-1 md:order-1 w-full md:w-[70%]"
        >
          <h2 className="text-2xl text-center md:text-left font-bold text-gray-900">
            Don’t worry if you don’t have <span className="text-orange-600">photos or videos</span> of your property yet!
          </h2>
          <p className="mt-4 text-gray-800 text-center md:text-left text-sm font-semibold leading-relaxed">
            Simply sign up and share the property details. Through your agent panel, you can request professional
            photo shoots, video shoots, drone footage, and even graphic services to showcase your property in the
            best way possible. We’re here to help you every step of the way.
          </p>
        </motion.div>

        {/* Image - stays second on mobile, takes 30% on desktop */}
        <motion.div
          initial="hidden"
          animate={creativesInView ? "visible" : "hidden"}
          variants={imageFade}
          className="order-2 md:order-2 w-[54%] md:w-[16%] flex justify-center md:justify-end "
        >
          <img src={kyc5} alt="photo services" className="w-full max-w-sm object-contain" draggable={false} />
        </motion.div>
      </div>

        {/* --- kycInfo6 block: on desktop image left (30%) and text right (70%);
         on mobile we want Text then Image, so use order-1/2 toggles --- */}
        <div className="flex flex-col md:flex-row items-center md:items-center md:space-x-8 space-y-8 md:space-y-0">
          {/* Text - on mobile should appear first (order-1), on desktop appear second (order-2) */}
          <motion.div
            initial="hidden"
            animate={creativesInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="md:px-6 order-1 md:order-2 w-full md:w-[60%]"
          >
            <h3 className="text-2xl font-bold text-center md:text-end text-gray-900">Get <span className="text-orange-600">Creative Graphics</span> to Boost Your Reach</h3>
            <p className="mt-4 text-gray-800 font-semibold text-center md:text-right text-sm leading-relaxed">
              To help you stay connected and advertise effectively, we provide a collection of ready-to-use graphics for festivals, wishes, and events — absolutely free! You can easily share these on social media or with potential buyers to keep your profile active and engaging.
            </p>

            <p className="mt-4 text-gray-800 font-semibold text-center md:text-right text-sm leading-relaxed">
              If you want more customized visuals for your property, we also offer professional graphic design services. From eye-catching advertisements to personalized content, our team is here to help you create a lasting impression.
            </p>

            <p className="mt-4 text-gray-800 font-semibold text-center md:text-right text-sm leading-relaxed">
              Use our free designs to promote your listings and stay connected, or choose professional services to create standout advertisements tailored to your property.
            </p>
          </motion.div>

          {/* Image - on mobile should appear after the text (order-2), on desktop should appear first (order-1) */}
          <motion.div
            initial="hidden"
            animate={creativesInView ? "visible" : "hidden"}
            variants={imageFade}
            className="order-2 md:order-1 w-[82%] md:w-[30%] flex justify-center md:justify-start"
          >
            <img src={kyc6} alt="creative graphics" className="w-full max-w-sm object-contain" draggable={false} />
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-2 py-12" aria-labelledby="faq-heading">
        <div ref={faqRef} className="w-full text-center md:text-left">
          <motion.h2
            initial="hidden"
            animate={faqInView ? "visible" : "hidden"}
            variants={fadeUp}
            id="faq-heading"
            className="text-3xl font-extrabold text-black"
          >
            <span className="text-orange-500 text-xs">KNOW MORE ABOUT POSTING ON PROPADDA</span> <br />
            Frequently Asked Questions
          </motion.h2>

          <motion.div
            initial="hidden"
            animate={faqInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="mt-6 space-y-4"
          >
            {FAQS.map((item, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div key={idx} className="rounded-xl border-b-2 border-orange-200 bg-white shadow-sm overflow-hidden">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full text-left px-4 sm:px-5 py-4 sm:py-5 flex items-start justify-between gap-4"
                  >
                    <div className="text-left">
                      <div className="flex items-center gap-3">
                        <h3 className="text-left text-md font-semibold text-gray-900">{item.q}</h3>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <span className="sr-only">{isOpen ? "Collapse" : "Expand"}</span>
                      {isOpen ? (
                        <ChevronUp className="w-6 h-6 text-orange-500" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-orange-500" />
                      )}
                    </div>
                  </button>

                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="px-4"
                    style={{ overflow: "hidden" }}
                  >
                    <div className="py-3 pb-6 text-gray-700">{item.a}</div>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <PropertyAction />
      <Footer />

    </main>
  );
}
