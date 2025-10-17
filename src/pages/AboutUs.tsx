import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import ribbon from "../images/ribbon.png";
import icon1 from "../images/icon1.png";
import icon2 from "../images/icon2.png";
import icon3 from "../images/icon3.png";
import img1 from "../images/img_5.png";
import img2 from "../images/img_5.png";
import img3 from "../images/img_5.png";
import img4 from "../images/img_5.png";
import handshake from "../images/img_3.png";
import handshakeOverlay from "../images/img_4.png";
import bannerBg from "../images/banner.png";
import Footer from "../components/Footer";
import Header from "../components/Header";
import PropertyAction from "../components/PropertyAction";
import Breadcrumb from "../components/Breadcrumb";

// -- Utility types
interface IconCardProps {
  src: string;
  alt: string;
  title: string;
  subtitle: string;
}

function IconCard({ src, alt, title, subtitle }: IconCardProps) {
  return (
    <div className="flex flex-1 items-center gap-4 rounded-[30px] bg-white p-4 shadow-md min-w-[280px] max-w-xs">
      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-[#d35400]">
        <img src={src} alt={alt} className="h-8 w-8" />
      </div>
      <div className="text-lg leading-tight text-gray-600/90">
        <strong>{title}</strong>
        <br />
        {subtitle}
      </div>
    </div>
  );
}

interface TeamCardProps {
  src: string;
  alt: string;
  name: string;
  role: string;
}

function TeamCard({ src, alt, name, role }: TeamCardProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <img src={src} alt={alt} className="h-auto w-40 object-cover rounded" />
      <div className="mt-2 rounded-[30px] border-2 border-[#e15000] bg-white px-5 py-2.5 text-center shadow-lg">
        <strong className="text-base text-[#e15000]">{name}</strong>
        <br />
        <span className="text-sm text-[#e15000]">{role}</span>
      </div>
    </div>
  );
}

export default function AboutUs() {
  const reduceMotion = useReducedMotion();

  const aboutParagraphs: string[] = [
    "PropAdda.in is a next-generation digital real estate platform dedicated to transforming how India buys, sells, and invests in property. With a foundation built on trust, transparency, and technology, we aim to bridge the gap between traditional real estate and the evolving needs of the modern buyer.",
    "Rooted in the belief that every Indian deserves access to a reliable, localized property solution, PropAdda.in brings a “Desi” touch to the digital space. From verified listings and plot-wise sales to digital marketing tools for agents, we make real estate accessible, simple, and efficient.",
  ];

  const iconItems: IconCardProps[] = [
    { src: icon1, alt: "Individual Buyers Icon", title: "Individual buyers", subtitle: "& first-time homeowners" },
    { src: icon2, alt: "Verified Agents Icon", title: "Verified agents", subtitle: "& realtors" },
    { src: icon3, alt: "Land Developers Icon", title: "Land developers", subtitle: "& layout promoters" },
  ];

  const teamMembers: TeamCardProps[] = [
    { src: img1, alt: "Pawan Rajput", name: "Mr. Pawan Rajput", role: "Owner & Director" },
    { src: img2, alt: "Dhruv Rajput", name: "Mr. Dhruv Rajput", role: "CEO" },
    { src: img3, alt: "Pritham Singh", name: "Mr. Pritham Singh", role: "Chairman" },
    { src: img4, alt: "K.P. Sharan Rao", name: "Mr. K.P. Sharan Rao", role: "Operations Manager" },
  ];

  // ---------- Balanced-slower motion variants ----------
  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.16, // a bit slower stagger
        duration: 0.9,
        ease: [0.25, 0.8, 0.25, 1],
      },
    },
  };

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] }, // slower
    },
  };

  const cardPop: Variants = {
    hidden: { opacity: 0, scale: 0.97, y: 12 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const overlayUp: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.95, ease: [0.33, 1, 0.68, 1] },
    },
  };

  const bannerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.995 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1.1, ease: "easeInOut" },
    },
  };

  // If reduced motion requested, disable variants (pass undefined)
  const sectionVar = reduceMotion ? undefined : sectionVariants;
  const fadeVar = reduceMotion ? undefined : fadeInUp;
  const popVar = reduceMotion ? undefined : cardPop;
  const overlayVar = reduceMotion ? undefined : overlayUp;
  const bannerVar = reduceMotion ? undefined : bannerVariants;

  return (
    <div>
      <Header title="ABOUT US" />
      <Breadcrumb items={[{ label: "Home" }, { label: "About Us" }]} />

      <main>
        {/* About header section - animate when visible */}
        <motion.section
          className="bg-white p-8 pb-12 font-[sans-serif]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.20 }}
          variants={sectionVar}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div className="flex flex-col md:flex-row items-center md:items-start gap-8" variants={fadeVar}>
              <motion.img src={ribbon} alt="Ribbon Background" className="w-full md:w-[35%] md:-ml-10" variants={fadeVar} />
              <motion.div className="flex-1 space-y-8" variants={fadeVar}>
                {aboutParagraphs.map((para, i) => (
                  <motion.p key={i} className="text-[17px] text-gray-600 text-justify leading-relaxed" variants={fadeVar}>
                    {para}
                  </motion.p>
                ))}
              </motion.div>
            </motion.div>

            {/* Icons row - each card pops in as it scrolls into view */}
            <motion.div
              className="mt-12 flex flex-wrap justify-center gap-5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.20 }}
              variants={sectionVar}
            >
              {iconItems.map((it, i) => (
                <motion.div
                  key={i}
                  className="flex flex-1 items-center gap-4 rounded-[30px] bg-white p-4 shadow-md min-w-[280px] max-w-xs"
                  variants={popVar}
                  whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                >
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-[#d35400]">
                    <img src={it.src} alt={it.alt} className="h-8 w-8" />
                  </div>
                  <div className="text-lg leading-tight text-gray-600/90">
                    <strong>{it.title}</strong>
                    <br />
                    {it.subtitle}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Images block */}
            <motion.div
              className="mt-24 relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.20 }}
              variants={sectionVar}
            >
              <motion.img src={handshake} alt="handshake" className="w-full rounded-2xl lg:w-[70%]" variants={fadeVar} />
              <motion.img
                src={handshakeOverlay}
                alt="house-hands"
                className="w-3/4 rounded-[50px] bg-white absolute -bottom-16 left-1/2 -translate-x-1/2 lg:left-auto lg:right-0 lg:bottom-[100px] lg:w-[500px] lg:-translate-x-0"
                variants={overlayVar}
              />
            </motion.div>
          </div>
        </motion.section>

        {/* Team section - animates when visible */}
        {/* <motion.section
          className="bg-gray-500/10 py-10 px-5 text-center text-2xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.20 }}
          variants={sectionVar}
        >
          <motion.h2 className="font-medium text-[#e15000]" variants={fadeVar}>
            <span className="text-black">TEAM MEMBERS</span>
          </motion.h2>

          <motion.p className="mx-auto mt-4 max-w-7xl text-lg text-gray-700" variants={fadeVar}>
            PropAdda.in is proudly promoted by dedicated professionals with decades of experience.
          </motion.p>

          <motion.div className="mt-8 mb-8 flex flex-wrap justify-center gap-x-16 gap-y-12 lg:gap-x-24" variants={sectionVar}>
            {teamMembers.map((m, i) => (
              <motion.div key={i} className="w-auto" variants={popVar} whileHover={reduceMotion ? undefined : { y: -6, scale: 1.02 }}>
                <TeamCard {...m} />
              </motion.div>
            ))}
          </motion.div>

          <motion.p className="mx-auto mt-4 max-w-7xl text-lg text-gray-700" variants={fadeVar}>
            Our leadership combines vision, expertise, and execution, ensuring every project under PropAdda is delivered with excellence.
          </motion.p>
        </motion.section> */}

        {/* Banner - animate when it scrolls into view */}
        <motion.section
          className="mt-14 mb-10 bg-gray-700 bg-cover bg-center py-24 px-5 text-center text-white sm:py-36"
          style={{ backgroundImage: `url(${bannerBg})` }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.20 }}
          variants={bannerVar}
        >
          <motion.div className="mx-auto max-w-5xl text-4xl font-bold" variants={bannerVar}>
            AT PROPADDA.IN, WE DON’T JUST SELL LAND <br />— WE HELP BUILD LEGACIES.
          </motion.div>
        </motion.section>
      </main>

      <PropertyAction />
      <Footer />
    </div>
  );
}
