import React from "react";
import propaddaLogo from '../images/logo.png';
import facebookLogo from '../images/facebook.png';
import twitterLogo from '../images/twitter.png';
import instagramLogo from '../images/instagram.png';
import linkedinLogo from '../images/linkedin.png';
import youtubeLogo from '../images/youtube.png';
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="main-footer">
      <div className="footer-top">
        <div className="footer-links">
          <ul>
            <li><Link to="/">HOME</Link></li>
            <li><Link to="/aboutUs">ABOUT US</Link></li>
            <li><Link to="/testimonials">TESTIMONIALS</Link></li>
            <li><Link to="/terms">TERMS & CONDITIONS</Link></li>
            <li><Link to="/account/feedback">FEEDBACK</Link></li>
            <li><Link to="/privacyPolicy">PRIVACY POLICY</Link></li>
            <li><Link to="/faq">FAQ’S</Link></li>
            <li><Link to="/contactUs">CONTACT US</Link></li>
          </ul>
        </div>
        
        <div className="footer-contact">
          <div className="contact-box">
            <p className="headings">CONTACT</p>
            <p>+91 8595511411</p>
          </div>
          <div className="contact-box">
            <p className="headings">MAIL</p>
            <p>sales@propadda.in</p>
          </div>
          <div className="contact-box">
            <p className="headings">ADDRESS</p>
            <p>DELHI</p>
          </div>
        </div>

        <div className="footer-brand">
          <img src={propaddaLogo} alt="PropAdda Logo" />
          <h4>YOUR PERFECT <br /><span>HOME AWAITS</span></h4>
          <Link to="/contactUs" className="contact-us-btn">Contact Us →</Link>
        </div>
      </div>

      <hr />

      <div className="footer-bottom">
        <div className="social-links">
          <a href="https://www.facebook.com/PropAddaIndia"><img src={facebookLogo} alt="Facebook" /></a>
          <a href="https://x.com/Propaddaindia"><img src={twitterLogo} alt="Twitter" /></a>
          <a href="https://www.instagram.com/propadda/"><img src={instagramLogo} alt="Instagram" /></a>
          <a href="#"><img src={linkedinLogo} alt="LinkedIn" /></a>
          <a href="https://www.youtube.com/@Propaddaindia"><img src={youtubeLogo} alt="YouTube" /></a>
        </div>

        <p className="copyright">
          © {new Date().getFullYear()} PropAdda. All Rights Reserved. Powered by  
          <a href="https://studiobyrelabel.com/"> Studio by ReLabel</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
