// Author-Hemant Arora
import React, { useMemo, useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Header from "../components/Header";
import PropertyAction from "../components/PropertyAction";
import Footer from "../components/Footer";
import quotes from "../images/quote.png";
import headerImg from "../images/Banners/testimonials.png";

// --- Responsive Breakpoint Hook ---
const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState("sm");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setBreakpoint("lg");
      } else if (window.innerWidth >= 768) {
        setBreakpoint("md");
      } else {
        setBreakpoint("sm");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return breakpoint;
};

type Testimonial = {
  text: string;
  name: string;
  role: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    text:
      "PropAdda has brought structure and accountability to property investments. The verified listings and ROI-driven approach reflect financial discipline and genuine transparency. It’s a trustworthy platform that blends real estate with smart investment logic.",
    name: "Rahul",
    role: "Chartered Accountant – Delhi, India",
  },
  {
    text:
      "PropAdda is redefining investment opportunities in sacred destinations like Vrindavan. Their blend of professionalism, devotion, and transparency makes them a trusted choice for investors and developers alike. A refreshing vision for modern India.",
    name: "Sanathan Sharma",
    role: "General Manager – Radisson, Vrindavan",
  },
  {
    text:
      "As a legal professional, I value PropAdda’s commitment to verified documentation and ethical dealings. Their focus on transparency, compliance, and trust sets a strong precedent for how real estate platforms should function in today’s digital age.",
    name: "Ishika Rajput",
    role: "Advocate – Mumbai, Maharashtra",
  },
  {
    text:
      "PropAdda’s model bridges traditional investment with modern property opportunities. The clarity of returns, verified partnerships, and investor confidence they bring is commendable. It’s an ecosystem built for genuine, long-term growth.",
    name: "Atul Tanwar",
    role: "Investment Banker – Kundli, Haryana",
  },
  {
    text:
      "Working with PropAdda has been a game-changer. Their marketing, presentation, and lead quality far exceed industry standards. The team’s transparency and creative approach have given BhaktiKunj remarkable visibility and investor trust.",
    name: "Ankur Sharma",
    role: "BhaktiKunj-Owner/Partner, Kosi Mathura, Uttar Pradesh",
  },
  {
    text:
      "PropAdda stands apart for its verified property showcasing and client-centric approach. Their professionalism and clarity in communication make them one of the most reliable names in the real estate ecosystem today.",
    name: "Bhupendar Dhawan",
    role: "Civil Engineer & Interior Advisor – Dwarka, India",
  },
];

const TestimonialCard: React.FC<Testimonial> = ({ text, name, role }) => {
  return (
    <div className="bg-gradient-to-b from-orange-600 to-white border border-orange-200 shadow-sm rounded-xl px-5 py-6 text-center h-full flex flex-col">
      <div className="mb-3 mx-auto">
        <img src={quotes} alt="Quotes" className="w-8 h-8 object-contain" />
      </div>
      <p className="text-black text-sm leading-relaxed flex-grow">{text}</p>
      <div className="mt-4">
        <div className="font-semibold text-gray-900">{name}</div>
        <div className="text-xs text-gray-500">{role}</div>
      </div>
    </div>
  );
};

const Testimonials: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const breakpoint = useBreakpoint();

  const grouped: Testimonial[][] = useMemo(() => {
    const itemsPerSlide =
      breakpoint === "lg" ? 3 : breakpoint === "md" ? 2 : 1;
    const g: Testimonial[][] = [];
    for (let i = 0; i < TESTIMONIALS.length; i += itemsPerSlide) {
      g.push(TESTIMONIALS.slice(i, i + itemsPerSlide));
    }
    return g;
  }, [breakpoint]);

  const totalSlides = grouped.length;

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    setCurrent(0);
  }, [totalSlides]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header headerImage={headerImg} />

      <nav aria-label="Breadcrumb" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 text-sm">
          <Link to="/" className="text-gray-500 hover:text-orange-600">
            Home
          </Link>
          <span className="mx-2 text-gray-400">&gt;</span>
          <span className="text-gray-800 font-medium">Testimonials</span>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-10 flex-1">
        <section className="mx-auto max-w-6xl">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={goPrev}
              aria-label="Previous testimonials"
              className="shrink-0 rounded-full border-2 border-orange-500 text-orange-600 bg-white hover:bg-orange-50 p-2 sm:px-3 sm:py-2 text-xl font-bold"
            >
              ‹
            </button>

            <div className="flex-1 overflow-hidden">
              <Carousel
                showThumbs={false}
                showStatus={false}
                showIndicators={false}
                showArrows={false}
                infiniteLoop
                emulateTouch
                swipeable
                useKeyboardArrows
                autoPlay={true}
                selectedItem={current}
                onChange={(idx) => setCurrent(idx)}
              >
                {grouped.map((group, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2 py-2"
                  >
                    {group.map((t, j) => (
                      <TestimonialCard key={j} {...t} />
                    ))}
                  </div>
                ))}
              </Carousel>
            </div>

            <button
              onClick={goNext}
              aria-label="Next testimonials"
              className="shrink-0 rounded-full border-2 border-orange-500 text-orange-600 bg-white hover:bg-orange-50 p-2 sm:px-3 sm:py-2 text-xl font-bold"
            >
              ›
            </button>
          </div>

          <ul className="mt-6 flex justify-center items-center">
            {grouped.map((_, idx) => (
              <li key={idx} className="mx-1">
                <button
                  onClick={() => setCurrent(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
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
