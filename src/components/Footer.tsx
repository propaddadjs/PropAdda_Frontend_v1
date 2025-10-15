import React from "react";
import propaddaLogo from '../images/logo.png';
import facebookLogo from '../images/facebook.png';
import twitterLogo from '../images/twitter.png';
import instagramLogo from '../images/instagram.png';
import linkedinLogo from '../images/linkedin.png';
import youtubeLogo from '../images/youtube.png';
import { Link, useLocation } from "react-router-dom";

const handleClick = () => {
  window.scrollTo(0, 0);
};


const Footer: React.FC = () => {
  return (
    <footer className="bg-white px-5 py-8 md:px-8 md:py-12 font-[Arial,sans-serif]">
      <div className="max-w-7xl mx-auto">
        {/* Top section with links, contact, and brand */}
        <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-10 lg:gap-8 border-b border-gray-200 pb-8 text-center lg:text-center">
          
          {/* Column 1: Links */}
          <div className="w-full lg:w-auto border-b border-gray-300 sm:border-b-0 lg:border-r lg:border-gray-300 py-8 sm:py-0 lg:px-8">
            {/* <ul className="space-y-2">
              {['HOME', 'ABOUT US', 'TESTIMONIALS', 'TERMS & CONDITIONS', 'FEEDBACK', 'PRIVACY POLICY', 'FAQ’S', 'CONTACT US'].map(item => (
                <li key={item}>
                  <Link 
                    to={`/${item.toLowerCase().replace(/[\s&’]/g, '')}`} 
                    className="font-light text-black hover:text-orange-600 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul> */}
            <ul className="space-y-2">
              <li><Link to="/" onClick={handleClick} className="font-light text-black hover:text-orange-600 transition-colors">HOME</Link></li>
              <li><Link to="/aboutUs" onClick={handleClick} className="font-light text-black hover:text-orange-600 transition-colors">ABOUT US</Link></li>
              <li><Link to="/testimonials" onClick={handleClick} className="font-light text-black hover:text-orange-600 transition-colors">TESTIMONIALS</Link></li>
              <li><Link to="/terms" onClick={handleClick} className="font-light text-black hover:text-orange-600 transition-colors">TERMS & CONDITIONS</Link></li>
              <li><Link to="/account/feedback" onClick={handleClick} className="font-light text-black hover:text-orange-600 transition-colors">FEEDBACK</Link></li>
              <li><Link to="/privacyPolicy" onClick={handleClick} className="font-light text-black hover:text-orange-600 transition-colors">PRIVACY POLICY</Link></li>
              <li><Link to="/faq" onClick={handleClick} className="font-light text-black hover:text-orange-600 transition-colors">FAQ’S</Link></li>
              <li><Link to="/contactUs" onClick={handleClick} className="font-light text-black hover:text-orange-600 transition-colors">CONTACT US</Link></li>
            </ul>
          </div>
          
          {/* Column 2: Contact Info with responsive directions */}
          {/* THIS IS THE UPDATED LINE */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-12 w-full lg:w-auto">
            <div className="contact-box">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">CONTACT</p>
              <p className="text-gray-800">+91 8595511411</p>
            </div>
            <div className="contact-box">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">MAIL</p>
              <p className="text-gray-800">sales@propadda.in</p>
            </div>
            <div className="contact-box">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">ADDRESS</p>
              <p className="text-gray-800">NEW DELHI</p>
            </div>
          </div>

          {/* Column 3: Brand */}
          <div className="flex flex-col items-center text-center w-full lg:w-auto border-t border-gray-300 sm:border-t-0 lg:border-l lg:border-gray-300 py-8 sm:py-0 lg:px-8">
            <img src={propaddaLogo} alt="PropAdda Logo" className="h-28 w-auto mb-4" />
            <h4 className="text-2xl font-light text-gray-800">
              YOUR PERFECT <br />
              <span className="text-[#e74c1c] font-medium">HOME AWAITS</span>
            </h4>
            <Link 
              to="/contactUs" 
              className="mt-4 bg-[#e74c1c] text-white rounded-full px-6 py-2.5 text-sm font-semibold transition hover:opacity-90"
            >
              Contact Us →
            </Link>
          </div>
        </div>

        {/* Bottom section with social links and copyright */}
        <div className="text-center pt-8">
          <div className="flex justify-center items-center gap-4 mb-5">
            {[
              { href: "https://www.facebook.com/PropAddaIndia", src: facebookLogo, alt: "Facebook" },
              { href: "https://x.com/Propaddaindia", src: twitterLogo, alt: "Twitter" },
              { href: "https://www.instagram.com/propadda/", src: instagramLogo, alt: "Instagram" },
              { href: "#", src: linkedinLogo, alt: "LinkedIn" },
              { href: "https://www.youtube.com/@Propaddaindia", src: youtubeLogo, alt: "YouTube" }
            ].map(social => (
              <a 
                key={social.alt}
                href={social.href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition duration-300 hover:scale-125"
              >
                <img src={social.src} alt={social.alt} className="h-8 w-8" />
              </a>
            ))}
          </div>

          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} PropAdda. All Rights Reserved. Powered by  
            <a href="https://studiobyrelabel.com/" className="text-black hover:text-orange-600 font-medium"> Studio by ReLabel</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;