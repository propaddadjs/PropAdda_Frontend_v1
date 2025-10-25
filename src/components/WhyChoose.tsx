// Author-Hemant Arora
import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import img1 from "../images/img_1.png";
import { TrendingUp, Building2, Users, Award, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const WhyChoose: React.FC = () => {
  const reduceMotion = useReducedMotion();

  // Variants typed as Variants
  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
  };

  const slideFromLeft: Variants = {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: "easeOut" } },
  };

  const slideFromRight: Variants = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: "easeOut" } },
  };

  const statCard: Variants = {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" } },
  };

  // Use undefined when reduced motion is preferred
  const container: Variants | undefined = reduceMotion ? undefined : containerVariants;
  const leftVariants: Variants | undefined = reduceMotion ? undefined : slideFromLeft;
  const rightVariants: Variants | undefined = reduceMotion ? undefined : slideFromRight;
  const statVariants: Variants | undefined = reduceMotion ? undefined : statCard;

  const stats = [
    {
      icon: <TrendingUp className="mx-auto h-8 w-8 text-orange-500 mb-2" />,
      number: "1M+",
      label: "PropAdda outreach Analytics",
    },
    {
      icon: <Building2 className="mx-auto h-8 w-8 text-orange-500 mb-2" />,
      number: "10+",
      label: "Flagship Projects",
    },
    {
      icon: <Users className="mx-auto h-8 w-8 text-orange-500 mb-2" />,
      number: "100+",
      label: "Channel Partners",
    },
    {
      icon: <Award className="mx-auto h-8 w-8 text-orange-500 mb-2" />,
      number: "50+",
      label: "Years of experience",
    },
  ];

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
          {/* Left text (70% width on desktop) - slide in from left when in view */}
          <motion.div
            className="md:w-[70%] pt-8 md:border-t-0 md:pt-0 border-gray-800"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={leftVariants ?? {}}
          >
            <motion.div
              className="border-l-2 border-gray-800 pl-8 space-y-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={container}
            >
              <motion.h3 variants={leftVariants ?? {}} className="text-xl md:text-2xl font-semibold text-gray-800">
                Think real estate is complicated?
              </motion.h3>
              <motion.p variants={leftVariants ?? {}} className="text-gray-600 leading-relaxed">
                At PropAdda.in, we simplify the journey. Whether you're buying, selling, or investing,
                we bring you verified listings, trusted agents, and modern tools to help you make confident decisions — fast. <br />
                From spiritual retreats to smart city homes, your ideal property is just a click away.
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Right button (30% width on desktop) - slide in from right when in view */}
          <motion.div
            className="md:w-[30%] flex justify-center md:justify-end pt-4 md:pt-0"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={rightVariants ?? {}}
          >
            <motion.div variants={rightVariants ?? {}}>
              <Link
                to="/aboutUs"
                className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-white font-semibold transition hover:bg-orange-600 hover:shadow-lg transform hover:-translate-y-0.5"
              >
                More About Us
                <ChevronRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <motion.div
          className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={container}
        >
          {stats.map((s, idx) => (
            <motion.div
              key={idx}
              className="p-4 rounded-lg border bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              variants={statVariants ?? {}}
            >
              {s.icon}
              <h2 className="text-3xl font-bold text-gray-800">{s.number}</h2>
              <p className="text-sm text-gray-600 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChoose;
