import React from "react";
import img1 from "../images/img_1.png";
import { TrendingUp, Building2, Users, Award, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const WhyChoose: React.FC = () => {
  return (
    <section className="py-12 md:py-20 bg-white">
      {/* Centered Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h4 className="text-sm font-semibold tracking-widest text-gray-500 uppercase">
          BENEFITS OF PROPADDA
        </h4>
        <h2 className="mt-2 text-3xl font-bold text-gray-800 sm:text-4xl">
          WHY CHOOSE <span className="text-orange-600">PROPADDA</span>
        </h2>
      </div>

      {/* Full-Width Image Container */}
      <div className="mt-10 md:mt-16 w-full h-20 sm:h-24 lg:h-36">
        <img
          src={img1}
          alt="A modern house representing PropAdda's properties"
          className="w-full h-full object-cover object-right md:object-center transition-transform duration-300 ease-in-out scale-110 md:scale-100"
        />
      </div>

      {/* Centered Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content: 70/30 Split on Desktop */}
        <div className="mt-10 md:mt-16 flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* Left text (70% width on desktop) */}
          <div className="md:w-[70%] pt-8 md:border-t-0 md:pt-0 border-gray-800">
            <div className="border-l-2 border-gray-800 pl-8 space-y-4">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
                Think real estate is complicated?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                At PropAdda.in, we simplify the journey. Whether you're buying, selling, or investing,
                we bring you verified listings, trusted agents, and modern tools to help you make confident decisions — fast. <br />
                From spiritual retreats to smart city homes, your ideal property is just a click away.
              </p>
            </div>
          </div>

          {/* Right button (30% width on desktop) */}
          <div className="md:w-[30%] flex justify-center md:justify-end pt-4 md:pt-0">
            <Link
              to="/aboutUs"
              className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-white font-semibold transition hover:bg-orange-600 hover:shadow-lg transform hover:-translate-y-0.5"
            >
              More About Us
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          <div className="p-4 rounded-lg border bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <TrendingUp className="mx-auto h-8 w-8 text-orange-500 mb-2" />
            <h2 className="text-3xl font-bold text-gray-800">1M+</h2>
            <p className="text-sm text-gray-600 mt-1">PropAdda outreach Analytics</p>
          </div>
          <div className="p-4 rounded-lg border bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <Building2 className="mx-auto h-8 w-8 text-orange-500 mb-2" />
            <h2 className="text-3xl font-bold text-gray-800">10+</h2>
            <p className="text-sm text-gray-600 mt-1">Flagship Projects</p>
          </div>
          <div className="p-4 rounded-lg border bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <Users className="mx-auto h-8 w-8 text-orange-500 mb-2" />
            <h2 className="text-3xl font-bold text-gray-800">100+</h2>
            <p className="text-sm text-gray-600 mt-1">Channel Partners</p>
          </div>
          <div className="p-4 rounded-lg border bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <Award className="mx-auto h-8 w-8 text-orange-500 mb-2" />
            <h2 className="text-3xl font-bold text-gray-800">50+</h2>
            <p className="text-sm text-gray-600 mt-1">Years of experience</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;