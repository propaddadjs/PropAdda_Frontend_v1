import React, { useState } from "react";
import { Link } from "react-router-dom";
import PropertyAction from "../components/PropertyAction";
import Footer from "../components/Footer";
import Header from "../components/Header";
import faqicon from "../images/icon4.png";
import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion, type Variants, AnimatePresence } from "framer-motion";

type FaqItem = {
  q: string;
  a: string;
};

const FAQS: FaqItem[] = [
  {
    q: "How do I search for properties on the site?",
    a: "You can search for properties directly from the homepage by selecting your preferred property type (Buy, Rent, PG, Plot) and entering the location or landmark in the search bar. Apply filters to narrow down results and find exactly what you need.",
  },
  {
    q: "Are the listings updated regularly?",
    a: "Yes, all listings are kept up to date. Properties automatically expire after 90 days unless renewed, ensuring only active and relevant listings are displayed.",
  },
  {
    q: "How do I contact a real estate agent?",
    a: "You can contact the agent by clicking on any property listing and using the enquiry form provided. Once submitted, our team will forward your enquiry to the respective agent, and they will reach out to you.",
  },
  {
    q: "How do I list my property on your site?",
    a: "To list your property, simply click on “Post Property” on the homepage. Sign up as an agent or owner, fill in the details, upload photos and videos, and submit your listing for approval. Once approved, your property will go live.",
  },
  {
    q: "Is there a fee to use this website?",
    a: "No, Propadda.in is free to use for browsing and posting property listings. You can explore, enquire, and even list your property without any cost.",
  },
];

const FAQ: React.FC = () => {
  const reduceMotion = useReducedMotion();

  // Which items are open
  const [open, setOpen] = useState<Record<number, boolean>>({});

  const toggle = (idx: number) =>
    setOpen((prev) => ({ ...prev, [idx]: !prev[idx] }));

  // ---------- Motion variants (balanced feel) ----------
  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.12,
        duration: 0.7,
        ease: [0.25, 0.8, 0.25, 1],
      },
    },
  };

  const itemEntrance: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const collapseVariants: Variants = {
    collapsed: { height: 0, opacity: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
    expanded: { height: "auto", opacity: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  };

  const chevronVariants: Variants = {
    closed: { rotate: 0, transition: { duration: 0.35, ease: "easeInOut" } },
    open: { rotate: 180, transition: { duration: 0.45, ease: "easeOut" } },
  };

  const sectionVar = reduceMotion ? undefined : sectionVariants;
  const itemVar = reduceMotion ? undefined : itemEntrance;
  const collapseVar = reduceMotion ? undefined : collapseVariants;
  const chevVar = reduceMotion ? undefined : chevronVariants;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="FAQ's" />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 text-sm">
          <Link to="/" className="text-gray-500 hover:text-themeOrange">
            Home
          </Link>
          <span className="mx-2 text-gray-400">&gt;</span>
          <span className="text-gray-800 font-medium">FAQ&apos;s</span>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 lg:py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-10">
          {/* Left: Title block + illustration */}
          <motion.div
            className="lg:col-span-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVar}
          >
            <motion.p className="text-black font-semibold uppercase tracking-wide" variants={itemVar}>
              FAQ’s
            </motion.p>

            <motion.h2 className="mt-1 text-3xl md:text-4xl font-extrabold leading-tight text-gray-900" variants={itemVar}>
              <span className="block">FREQUENTLY</span>
              <span className="block">
                <span className="text-themeOrange">ASKED QUESTIONS</span>
              </span>
            </motion.h2>

            <motion.div className="mt-8" variants={itemVar}>
              <img src={faqicon} alt="FAQ Illustration" className="max-w-56 w-full" />
            </motion.div>
          </motion.div>

          {/* Right: Accordion */}
          <div className="lg:col-span-7 space-y-4">
            {FAQS.map((item, idx) => {
              const isOpen = !!open[idx];

              return (
                <motion.div
                  key={idx}
                  className="rounded-xl border-b-2 border-orange-200 bg-white shadow-sm overflow-hidden"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.18 }}
                  variants={itemVar}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${idx}`}
                    onClick={() => toggle(idx)}
                    className="w-full text-left px-4 sm:px-5 py-4 sm:py-5 flex items-start justify-between gap-4"
                  >
                    <span className="text-gray-900 font-semibold">{item.q}</span>

                    <motion.span
                      className={`mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                        isOpen ? "text-orange-600" : "text-gray-500"
                      }`}
                      aria-hidden="true"
                      variants={chevVar}
                      animate={isOpen ? "open" : "closed"}
                    >
                      <ChevronDown />
                    </motion.span>
                  </button>

                  {/* Collapsible content: Animate height + opacity */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-panel-${idx}`}
                        role="region"
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        variants={collapseVar}
                        style={{ overflow: "hidden" }}
                        className="px-4 sm:px-5 pb-5"
                      >
                        <motion.p className="text-sm text-gray-700" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          {item.a}
                        </motion.p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      <PropertyAction />
      <Footer />
    </div>
  );
};

export default FAQ;
