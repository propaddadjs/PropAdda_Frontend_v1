import React, { useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Header from "../components/Header";
import PropertyAction from "../components/PropertyAction";
import Footer from "../components/Footer";
import quotes from "../images/quote.png";

type Testimonial = {
  text: string;
  name: string;
  role: string;
};

const TESTIMONIALS: Testimonial[] = Array.from({ length: 6 }).map(() => ({
  text:
    "My experience with Propadda was excellent. The quality of the leads were superb. I never thought my property would have been sold so fast. Thank you Propadda! Even after selling the property I am flooded with enquiries.",
  name: "Rajarajeshwar Shetty",
  role: "Owner Brahmagiri, Udupi",
}));

const TestimonialCard: React.FC<Testimonial> = ({ text, name, role }) => {
  return (
    <div className="bg-gradient-to-b from-orange-600 to-white border border-orange-200 shadow-sm rounded-xl px-5 py-6 text-center h-full">
      <div className="mb-3">
        {/* The span is actually not strictly needed if the img is directly sized */}
        <img 
          src={quotes} 
          alt="Quotes" 
          className="w-8 h-8 object-contain" 
          />
      </div>
      <p className="text-black text-sm leading-relaxed">{text}</p>
      <div className="mt-4">
        <div className="font-semibold text-gray-900">{name}</div>
        <div className="text-xs text-gray-500">{role}</div>
      </div>
    </div>
  );
};

const Testimonials: React.FC = () => {
  const [current, setCurrent] = useState(0);

  // Group testimonials into chunks of 3 per slide
  const grouped: Testimonial[][] = useMemo(() => {
    const g: Testimonial[][] = [];
    for (let i = 0; i < TESTIMONIALS.length; i += 3) {
      g.push(TESTIMONIALS.slice(i, i + 3));
    }
    return g;
  }, []);

  const totalSlides = grouped.length;

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="TESTIMONIALS" />

      {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="bg-white">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 text-sm">
                <Link to="/" className="text-gray-500 hover:text-themeOrange">
                  Home
                </Link>
                <span className="mx-2 text-gray-400">&gt;</span>
                <span className="text-gray-800 font-medium">Testimonials</span>
              </div>
            </nav>

      {/* Carousel */}
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-10 flex-1">
        {/* FLEX WRAPPER places buttons completely outside the carousel */}
        <section className="mx-auto max-w-6xl">
          <div className="flex items-center gap-4">
            {/* Prev button (outside) */}
            <button
              onClick={goPrev}
              aria-label="Previous testimonials"
              className="shrink-0 rounded-full border-2 border-orange-500 text-orange-600 bg-white hover:bg-orange-50 px-3 py-2"
            >
              ‹
            </button>

            {/* Carousel (no built-in arrows/indicators) */}
            <div className="flex-1">
              <Carousel
                showThumbs={false}
                showStatus={false}
                showIndicators={false}  // we'll render custom dots below
                showArrows={false}      // we use external buttons
                infiniteLoop
                emulateTouch
                swipeable
                useKeyboardArrows
                autoPlay={false}
                selectedItem={current}
                onChange={(idx) => setCurrent(idx)}
              >
                {grouped.map((group, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.map((t, j) => (
                      <TestimonialCard key={j} {...t} />
                    ))}
                  </div>
                ))}
              </Carousel>
            </div>

            {/* Next button (outside) */}
            <button
              onClick={goNext}
              aria-label="Next testimonials"
              className="shrink-0 rounded-full border-2 border-orange-500 text-orange-600 bg-white hover:bg-orange-50 px-3 py-2"
            >
              ›
            </button>
          </div>

          {/* Custom dots below (no overlap) */}
          <ul className="mt-6 flex justify-center">
            {grouped.map((_, idx) => (
              <li key={idx} className="mx-1">
                <button
                  onClick={() => setCurrent(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all ${
                    current === idx
                      ? "bg-orange-600 w-6"
                      : "bg-orange-200 w-2.5 hover:bg-orange-300"
                  }`}
                  style={{ display: "inline-block" }}
                />
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-12">
          <PropertyAction />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Testimonials;
