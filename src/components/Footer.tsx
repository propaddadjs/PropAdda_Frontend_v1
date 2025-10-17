import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import propaddaLogo from '../images/logo.png';
import facebookLogo from '../images/facebook.png';
import twitterLogo from '../images/twitter.png';
import instagramLogo from '../images/instagram.png';
import linkedinLogo from '../images/linkedin.png';
import youtubeLogo from '../images/youtube.png';
import whatsappLogo from '../images/whatsapp.png';
import { Link } from "react-router-dom";

const handleClick = () => {
  window.scrollTo(0, 0);
};

const Footer: React.FC = () => {
  const reduceMotion = useReducedMotion();

  // Variants
  const parentInView: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.06 } },
  };

  const flyLeft: Variants = {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const flyRight: Variants = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const flyUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  };

  const listItemVariants: Variants | undefined = reduceMotion ? undefined : flyLeft;
  const brandVariants: Variants | undefined = reduceMotion ? undefined : flyRight;
  const logoVariants: Variants | undefined = reduceMotion ? undefined : flyUp;
  const parentVariants: Variants | undefined = reduceMotion ? undefined : parentInView;

  const social = [
    { href: "https://www.facebook.com/PropAddaIndia", src: facebookLogo, alt: "Facebook" },
    { href: "https://x.com/Propaddaindia", src: twitterLogo, alt: "Twitter" },
    { href: "https://www.instagram.com/propadda/", src: instagramLogo, alt: "Instagram" },
    { href: "#", src: linkedinLogo, alt: "LinkedIn" },
    { href: "https://www.youtube.com/@Propaddaindia", src: youtubeLogo, alt: "YouTube" },
    { href: "https://wa.me/message/6HWMKGPSPC6TP1", src: whatsappLogo, alt: "WhatsApp" },
  ];

  return (
    <footer className="bg-white px-5 py-8 md:px-8 md:py-12 font-[Arial,sans-serif]">
      <div className="max-w-7xl mx-auto">
        {/* Top section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={parentVariants}
          className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-8 border-b border-gray-200 pb-8 text-center lg:text-center"
        >
          {/* Links (fly from left) */}
          <motion.div
            variants={flyLeft}
            viewport={{ once: true, amount: 0.3 }}
            className="w-full lg:w-auto border-b border-gray-300 sm:border-b-0 lg:border-r lg:border-gray-300 py-8 sm:py-0 lg:px-8"
          >
            <ul className="space-y-2">
              {[
                { path: "/", label: "HOME" },
                { path: "/aboutUs", label: "ABOUT US" },
                { path: "/testimonials", label: "TESTIMONIALS" },
                { path: "/terms", label: "TERMS & CONDITIONS" },
                { path: "/account/feedback", label: "FEEDBACK" },
                { path: "/privacyPolicy", label: "PRIVACY POLICY" },
                { path: "/faq", label: "FAQ’S" },
                { path: "/contactUs", label: "CONTACT US" },
              ].map((link) => (
                <motion.li
                  key={link.label}
                  variants={flyLeft}
                  whileHover={reduceMotion ? undefined : { scale: 1.03, x: 5 }}
                >
                  <Link
                    to={link.path}
                    onClick={handleClick}
                    className="font-light text-black hover:text-orange-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-12 w-full lg:w-auto">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">CONTACT</p>
              <p className="text-gray-800">+91 8595511411</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">MAIL</p>
              <p className="text-gray-800">sales@propadda.in</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">ADDRESS</p>
              <p className="text-gray-800">NEW DELHI</p>
            </div>
          </div>

          {/* Brand (fly from right) */}
          <motion.div
            variants={flyRight}
            viewport={{ once: true, amount: 0.3 }}
            className="flex flex-col items-center text-center w-full lg:w-auto border-t border-gray-300 sm:border-t-0 lg:border-l lg:border-gray-300 py-8 sm:py-0 lg:px-8"
          >
            <motion.img
              src={propaddaLogo}
              alt="PropAdda Logo"
              className="h-20 w-auto mb-4"
              variants={brandVariants}
            />
            <motion.h4 className="text-xl font-light text-gray-800" variants={brandVariants}>
              <span className="text-themeOrange">BHAARAT </span>
              <span className="text-green-700">KA <br />APNA PROPERTY <br />ADDA</span>
            </motion.h4>
            <motion.div variants={brandVariants} className="mt-4">
              <Link
                to="/contactUs"
                onClick={handleClick}
                className="bg-themeOrange text-white rounded-full px-6 py-2.5 text-sm font-semibold transition hover:opacity-90"
              >
                Contact Us →
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom social section (fly up when visible) */}
        <motion.div
          className="text-center pt-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={parentVariants}
        >
          <motion.div
            className="flex justify-center items-center gap-4 mb-5"
            variants={parentVariants}
          >
            {social.map((s) => (
              <motion.a
                key={s.alt}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                variants={logoVariants}
                whileHover={reduceMotion ? undefined : { scale: 1.15 }}
                className="transition duration-300"
              >
                <img src={s.src} alt={s.alt} className="h-8 w-8" />
              </motion.a>
            ))}
          </motion.div>

          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} PropAdda. All Rights Reserved. Powered by
            <a href="https://studiobyrelabel.com/" className="text-black hover:text-orange-600 font-medium"> Studio by ReLabel</a>
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
