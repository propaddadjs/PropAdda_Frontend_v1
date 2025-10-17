import React, { useState } from "react";
import TestimonialCard from "./TestimonialCard";

const Testimonials = [
  {
    text: "PropAdda has brought structure and accountability to property investments. The verified listings and ROI-driven approach reflect financial discipline and genuine transparency. It’s a trustworthy platform that blends real estate with smart investment logic.",
    name: "Rahul",
    role: "Chartered Accountant – Delhi, India",
    avatar: "assets/avatar_male.png",
  },
  {
    text: "PropAdda is redefining investment opportunities in sacred destinations like Vrindavan. Their blend of professionalism, devotion, and transparency makes them a trusted choice for investors and developers alike. A refreshing vision for modern India.",
    name: "Sanathan Sharma",
    role: "General Manager – Radisson, Vrindavan",
    avatar: "assets/avatar_male.png",
  },
  {
    text: "As a legal professional, I value PropAdda’s commitment to verified documentation and ethical dealings. Their focus on transparency, compliance, and trust sets a strong precedent for how real estate platforms should function in today’s digital age.",
    name: "Ishika Rajput",
    role: "Advocate – Mumbai, Maharashtra",
    avatar: "assets/avatar_male.png",
  },
    {
    text: "PropAdda’s model bridges traditional investment with modern property opportunities. The clarity of returns, verified partnerships, and investor confidence they bring is commendable. It’s an ecosystem built for genuine, long-term growth.",
    name: "Atul Tanwar",
    role: "Investment Banker – Kundli, Haryana",
    avatar: "assets/avatar_male.png",
  },
    {
    text: "Working with PropAdda has been a game-changer. Their marketing, presentation, and lead quality far exceed industry standards. The team’s transparency and creative approach have given BhaktiKunj remarkable visibility and investor trust.",
    name: "Ankur Sharma",
    role: "BhaktiKunj-Owner/Partner, Kosi Mathura, Uttar Pradesh",
    avatar: "assets/avatar_male.png",
  },
    {
    text: "PropAdda stands apart for its verified property showcasing and client-centric approach. Their professionalism and clarity in communication make them one of the most reliable names in the real estate ecosystem today.",
    name: "Bhupendar Dhawan",
    role: "Civil Engineer & Interior Advisor – Dwarka, India",
    avatar: "assets/avatar_male.png",
  },
];

const TestimonialCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const updateIndex = (newIndex: number) => {
    if (newIndex < 0) newIndex = Testimonials.length - 1;
    if (newIndex >= Testimonials.length) newIndex = 0;
    setCurrentIndex(newIndex);
  };

  return (
    <section className="testimonial-section">
      <div className="testimonial-carousel">
        {Testimonials.map((t, index) => (
          <div
            key={index}
            style={{ display: index === currentIndex ? "block" : "none" }}
          >
            <TestimonialCard {...t} />
          </div>
        ))}

        {/* Navigation */}
        <button className="carousel-prev" onClick={() => updateIndex(currentIndex - 1)}>
          &#10094;
        </button>
        <button className="carousel-next" onClick={() => updateIndex(currentIndex + 1)}>
          &#10095;
        </button>
      </div>

      {/* Dots */}
      <div className="testimonial-dots">
        {Testimonials.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => updateIndex(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default TestimonialCarousel;
