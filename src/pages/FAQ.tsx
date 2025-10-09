import React, { useState } from "react";
import { Link } from "react-router-dom";
import PropertyAction from "../components/PropertyAction";
import Footer from "../components/Footer";
import Header from "../components/Header";
import faqicon from "../images/icon4.png";
import { ChevronDown } from "lucide-react";

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
  // Which items are open
  const [open, setOpen] = useState<Record<number, boolean>>({});

  const toggle = (idx: number) =>
    setOpen((prev) => ({ ...prev, [idx]: !prev[idx] }));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero/Header band with centered title (per PDF) */}
      <Header title="FAQ's" />
      {/* <section className="relative bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
            </div>

            <div className="absolute left-1/2 -translate-x-1/2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                FAQ&apos;s
              </h1>
            </div>

            <div />
          </div>
        </div>
      </section> */}

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
          {/* Left: Title block + illustration (per PDF) */}
          <div className="lg:col-span-5">
            <p className="text-black font-semibold uppercase tracking-wide">
              FAQ’s
            </p>
            <h2 className="mt-1 text-3xl md:text-4xl font-extrabold leading-tight text-gray-900">
              <span className="block">FREQUENTLY</span>
              <span className="block">
                <span className="text-themeOrange">ASKED QUESTIONS</span>
              </span>
            </h2>

            <div className="mt-8">
              {/* If you have the same icon as the HTML (assets/icon4.png), keep the path below. */}
              <img
                src={faqicon}
                alt="FAQ Illustration"
                className="max-w-56 w-full"
              />
            </div>
          </div>

          {/* Right: Accordion */}
          <div className="lg:col-span-7 space-y-4">
            {FAQS.map((item, idx) => {
              const isOpen = !!open[idx];
              return (
                <div
                  key={idx}
                  className="rounded-xl border-b-2 border-orange-200 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${idx}`}
                    onClick={() => toggle(idx)}
                    className="w-full text-left px-4 sm:px-5 py-4 sm:py-5 flex items-start justify-between gap-4"
                  >
                    <span className="text-gray-900 font-semibold">
                      {item.q}
                    </span>
                    <span
                      className={`mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-sm transition ${
                        isOpen
                          ? "text-orange-600"
                          : "text-gray-500"
                      }`}
                      aria-hidden="true"
                    >
                      <ChevronDown />
                    </span>
                  </button>

                  <div
                    id={`faq-panel-${idx}`}
                    role="region"
                    className={`px-4 sm:px-5 overflow-hidden transition-[max-height] duration-300 ${
                      isOpen ? "max-h-96 pb-5" : "max-h-0"
                    }`}
                  >
                    <p className="text-sm text-gray-700">{item.a}</p>
                  </div>
                </div>
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
