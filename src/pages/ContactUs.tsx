import React from "react";
import { Phone, Mail, MapPin, Home, Shield, MessageSquare } from "lucide-react";
// Re-importing the original logo images
import facebookLogo from "../images/facebook.png";
import twitterLogo from "../images/twitter.png";
import instagramLogo from "../images/instagram.png";
import linkedinLogo from "../images/linkedin.png";
import youtubeLogo from "../images/youtube.png";
import whatsappLogo from "../images/whatsapp.png";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PropertyAction from "../components/PropertyAction";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const COMPANY = {
  phone: "+91 8595511411",
  email: "sales@propadda.in",
  address: "New Delhi",
  postalAddress: "F5, Manish Plaza 3, Plot No. 12, Sector 10, Dwarka, New Delhi",
  mapAddress: "28.59051502965873, 77.0574798424859",
};

const ContactUs: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const encodedAddress = encodeURIComponent(COMPANY.mapAddress);
  const mapSrc = `https://www.google.com/maps?q=${encodedAddress}&output=embed`;

  // ---------- Motion variants (balanced) ----------
  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { when: "beforeChildren", staggerChildren: 0.12, duration: 0.7, ease: [0.25, 0.8, 0.25, 1] },
    },
  };

  const cardPop: Variants = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  const smallCard: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.33, 1, 0.68, 1] } },
  };

  const socialVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, staggerChildren: 0.06 } },
  };

  const iconVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const mapVariants: Variants = {
    hidden: { opacity: 0, x: 16 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.25, 0.8, 0.25, 1] } },
  };

  // If user prefers reduced motion, pass undefined so motion is disabled
  const sectionVar = reduceMotion ? undefined : sectionVariants;
  const cardVar = reduceMotion ? undefined : cardPop;
  const smallVar = reduceMotion ? undefined : smallCard;
  const socialsVar = reduceMotion ? undefined : socialVariants;
  const iconVar = reduceMotion ? undefined : iconVariants;
  const mapVar = reduceMotion ? undefined : mapVariants;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="CONTACT US" />

      {/* Hero */}
      <motion.section
        className="bg-white border-b"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.18 }}
        variants={sectionVar}
      >
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <motion.div className="md:w-1/2 text-center md:text-left" variants={cardVar}>
            <motion.div
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-orange-700 bg-orange-50 px-3 py-1 rounded-full"
              variants={cardVar}
            >
              Contact Us
            </motion.div>

            <motion.h1
              className="mt-3 text-3xl md:text-3xl font-bold text-gray-900 leading-tight"
              variants={cardVar}
            >
              <motion.span className="text-themeOrange" variants={cardVar}>BHAARAT </motion.span>
              <motion.span className="text-green-700" variants={cardVar}>KA APNA PROPERTY ADDA</motion.span>
            </motion.h1>

            <motion.p className="mt-2 text-gray-600" variants={cardVar}>
              We're here to help with enquiries, feedback, or partnerships.
            </motion.p>
          </motion.div>

          <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto" variants={cardVar}>
            {/* Call Card */}
            <motion.div
              className="rounded-2xl border-orange-100 bg-orange-50 flex flex-col items-center p-4 shadow-sm transition duration-300 hover:shadow-lg hover:scale-[1.03]"
              variants={cardVar}
              whileHover={reduceMotion ? undefined : { scale: 1.03 }}
            >
              <Phone className="w-5 h-5 text-orange-600" />
              <div className="mt-2 text-sm text-gray-600">Call</div>
              <div className="text-sm font-semibold">{COMPANY.phone}</div>
            </motion.div>

            {/* Mail Card */}
            <motion.div
              className="rounded-2xl border-orange-100 bg-orange-50 flex flex-col items-center p-4 shadow-sm transition duration-300 hover:shadow-lg hover:scale-[1.03]"
              variants={cardVar}
              whileHover={reduceMotion ? undefined : { scale: 1.03 }}
            >
              <Mail className="w-5 h-5 text-orange-600" />
              <div className="mt-2 text-sm text-gray-600">Mail</div>
              <div className="font-semibold text-sm break-all">{COMPANY.email}</div>
            </motion.div>

            {/* Address Card */}
            <motion.div
              className="rounded-2xl border-orange-100 bg-orange-50 flex flex-col items-center p-4 shadow-sm transition duration-300 hover:shadow-lg hover:scale-[1.03]"
              variants={cardVar}
              whileHover={reduceMotion ? undefined : { scale: 1.03 }}
            >
              <MapPin className="w-5 h-5 text-orange-600" />
              <div className="mt-2 text-sm text-gray-600">Address</div>
              <div className="font-semibold text-sm">{COMPANY.address}</div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Contact + Map in one wide row */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left contact pane */}
          <motion.div
            className="rounded-2xl border bg-white p-6 shadow-sm flex flex-col"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.18 }}
            variants={sectionVar}
          >
            {/* "Reach us at" block - Hidden on mobile */}
            <motion.div className="hidden lg:block" variants={cardVar}>
              <h2 className="text-lg font-semibold">Reach us at</h2>
              <motion.div className="mt-4 space-y-4 text-sm text-gray-700" variants={smallVar}>
                <motion.div className="flex items-center gap-3" variants={smallVar}>
                  <motion.div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center" variants={iconVar}>
                    <Phone className="w-4 h-4 text-white" />
                  </motion.div>
                  <span className="font-medium">{COMPANY.phone}</span>
                </motion.div>

                <motion.div className="flex items-center gap-3" variants={smallVar}>
                  <motion.div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center" variants={iconVar}>
                    <Mail className="w-4 h-4 text-white" />
                  </motion.div>
                  <span className="font-medium break-all">{COMPANY.email}</span>
                </motion.div>

                <motion.div className="flex items-center gap-3" variants={smallVar}>
                  <motion.div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center" variants={iconVar}>
                    <MapPin className="w-4 h-4 text-white" />
                  </motion.div>
                  <span className="font-medium">{COMPANY.postalAddress}</span>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Socials - Pushed to the bottom */}
            <motion.div className="mt-auto pt-8 flex flex-wrap items-center justify-center lg:justify-center gap-3" variants={socialsVar}>
              {[
                { href: "https://www.facebook.com/PropAddaIndia", src: facebookLogo, alt: "Facebook" },
                { href: "https://x.com/Propaddaindia", src: twitterLogo, alt: "Twitter" },
                { href: "https://www.instagram.com/propadda/", src: instagramLogo, alt: "Instagram" },
                { href: "#", src: linkedinLogo, alt: "LinkedIn" },
                { href: "https://www.youtube.com/@Propaddaindia", src: youtubeLogo, alt: "YouTube" },
                { href: "https://wa.me/message/6HWMKGPSPC6TP1", src: whatsappLogo, alt: "Whatsapp" },
              ].map((s, i) => (
                <motion.a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition duration-300 hover:scale-[1.2]"
                  variants={iconVar}
                  whileHover={reduceMotion ? undefined : { scale: 1.15 }}
                >
                  <img src={s.src} alt={s.alt} className="h-8 w-8" />
                </motion.a>
              ))}
            </motion.div>

            {/* Three small cards */}
            <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6" variants={sectionVar}>
              <motion.div className="rounded-2xl border-orange-100 bg-orange-50 p-6 shadow-sm transition duration-300 hover:shadow-lg hover:scale-[1.03]" variants={smallVar} whileHover={reduceMotion ? undefined : { scale: 1.03 }}>
                <div className="flex flex-col items-center text-center gap-2">
                  <Home className="w-6 h-6 text-orange-600" />
                  <div className="text-base font-semibold">Residential & Commercial</div>
                  <p className="text-sm text-gray-600">Expert help finding your perfect place.</p>
                </div>
              </motion.div>

              <motion.div className="rounded-2xl border-orange-100 bg-orange-50 p-6 shadow-sm transition duration-300 hover:shadow-lg hover:scale-[1.03]" variants={smallVar} whileHover={reduceMotion ? undefined : { scale: 1.03 }}>
                <div className="flex flex-col items-center text-center gap-2">
                  <Shield className="w-6 h-6 text-orange-600" />
                  <div className="text-base font-semibold">Verified Listings</div>
                  <p className="text-sm text-gray-600">RERA-aligned checks for peace of mind.</p>
                </div>
              </motion.div>

              <motion.div className="rounded-2xl border-orange-100 bg-orange-50 p-6 shadow-sm transition duration-300 hover:shadow-lg hover:scale-[1.03]" variants={smallVar} whileHover={reduceMotion ? undefined : { scale: 1.03 }}>
                <div className="flex flex-col items-center text-center gap-2">
                  <MessageSquare className="w-6 h-6 text-orange-600" />
                  <div className="text-base font-semibold">Fast Support</div>
                  <p className="text-sm text-gray-600">Sales & support teams ready to assist.</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Map */}
          <motion.div
            className="rounded-2xl border bg-white p-6 shadow-sm flex flex-col"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.18 }}
            variants={mapVar}
          >
            <motion.h3 className="text-base font-semibold mb-2" variants={mapVar}>
              Our Location
            </motion.h3>
            <motion.p className="text-xs text-gray-600 mb-3" variants={mapVar}>
              {COMPANY.postalAddress}
            </motion.p>

            <motion.div className="relative overflow-hidden rounded-xl border mb-4 flex-grow" variants={mapVar}>
              <iframe
                title="PropAdda Location"
                src={mapSrc}
                className="w-full h-64 sm:h-80 lg:h-full"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                aria-label="Map with selected location"
              />
            </motion.div>

            <motion.a
              className="ml-auto text-sm font-semibold text-orange-700 hover:underline"
              href={`https://www.google.com/maps?q=${encodedAddress}`}
              target="_blank"
              rel="noreferrer"
              variants={mapVar}
            >
              Open in Google Maps
            </motion.a>
          </motion.div>
        </div>
      </section>

      <PropertyAction />
      <Footer />
    </div>
  );
};

export default ContactUs;
