import React from "react";
import img1 from "../images/img_1.png";
import { TrendingUp, Building2, Users, Award, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const WhyChoose: React.FC = () => {
  return (
    <>
      {/* Header */}
      <section className="why-choose-header text-center my-10">
        <h4 className="text-sm font-semibold tracking-widest text-orange-500 uppercase">
          BENEFITS OF PROPADDA
        </h4>
        <h2 className="mt-2 text-3xl font-bold text-gray-800">
          WHY CHOOSE <span className="text-orange-600">PROPADDA</span>
        </h2>
      </section>

      {/* Image */}
      <div className="why-image flex justify-center mb-10">
        <img
          src={img1}
          alt="Why Choose PropAdda"
          className="rounded-xl shadow-md scale-[1.02]"
        />
      </div>

      {/* Text & Stats */}
      <section className="why-choose-text max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="why-content grid md:grid-cols-2 gap-8 items-start mb-10">
          {/* Left text */}
          <div className="why-text space-y-4">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
              Think real estate is complicated?
            </h3>
            <p className="text-gray-600 leading-relaxed">
              At PropAdda.in, we simplify the journey. Whether you’re buying, selling, or investing,
              we bring you verified listings, trusted agents, and modern tools to help you make confident decisions — fast.
            </p>
            <p className="text-gray-600 leading-relaxed">
              From spiritual retreats to smart city homes, your ideal property is just a click away.
            </p>
          </div>

          {/* Right button */}
          <div className="why-text-button-container flex md:justify-end items-center">
              <Link
              to="/aboutUs"
              className="about-btn inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-white font-medium transition hover:bg-orange-600 hover:shadow-md"
              >
              More About Us
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-20">
          <div className="stat p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition">
            <TrendingUp className="mx-auto h-6 w-6 text-orange-500 mb-2" />
            <h2 className="text-2xl font-bold text-gray-800">1M+</h2>
            <p className="text-sm text-gray-600">PropAdda outreach Analytics</p>
          </div>
          <div className="stat p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition">
            <Building2 className="mx-auto h-6 w-6 text-orange-500 mb-2" />
            <h2 className="text-2xl font-bold text-gray-800">10+</h2>
            <p className="text-sm text-gray-600">Flagship Projects</p>
          </div>
          <div className="stat p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition">
            <Users className="mx-auto h-6 w-6 text-orange-500 mb-2" />
            <h2 className="text-2xl font-bold text-gray-800">100+</h2>
            <p className="text-sm text-gray-600">Channel Partners</p>
          </div>
          <div className="stat p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition">
            <Award className="mx-auto h-6 w-6 text-orange-500 mb-2" />
            <h2 className="text-2xl font-bold text-gray-800">50+</h2>
            <p className="text-sm text-gray-600">Years of experience</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default WhyChoose;
