import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import PropertyAction from "../components/PropertyAction";
import Footer from "../components/Footer";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header title="PRIVACY POLICY" />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 text-sm">
          <Link to="/" className="text-gray-500 hover:text-gray-800">
            Home
          </Link>
          <span className="mx-2 text-gray-400">&gt;</span>
          <span className="text-gray-800 font-medium">Privacy Policy</span>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 flex-1">
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 sm:p-10 space-y-8">
          <h1 className="font-bold font-times">PropAdda — Privacy Policy</h1>
          <p className="lead font-times">Effective Date: October 2025</p>
          <p className=" font-times">
          PropAdda (“Company”, “we”, “our”, or “us”) respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and protect your information when you access our website <a className="hover:text-themeOrange font-times font-bold" href="www.propadda.in">www.propadda.in</a> (the “Platform”).
          </p>

          <section>
            <h2 className="mb-2 font-bold font-times">1. Personal Data We Collect</h2>
            <p className="mb-2 font-times">We collect the following categories of data:</p>
            <h3 className="mb-2 font-times ">A. Information you provide</h3>
            <ul className="list-disc list-inside mb-10">
              <li className="mb-2 font-times">Personal details: name, phone number, email, and location.</li>
              <li className="mb-2 font-times">Property details: title, description, price, location, size, media (photos/videos/brochures), amenities, and ownership information.</li>
              <li className="mb-2 font-times">KYC documents: PAN, Aadhaar, RERA registration, or similar identification (for verification of agents, brokers, and owners).</li>
              <li className="mb-2 font-times">Communication records: messages, enquiries, or feedback submitted through our forms.</li>
              <li className="mb-2 font-times">Profile details: business name, logo, bio, and service areas (for verified agents).</li>
            </ul>

            <h3 className="mb-2 font-times">B. Information collected automatically</h3>
            <ul className="list-disc list-inside mb-10">
              <li className="mb-2 font-times">Usage data: page visits, listings viewed, time spent, and click activity.</li>
              <li className="mb-2 font-times">Technical data: IP address, browser type, operating system, device type.</li>
              <li className="mb-2 font-times">Cookies: see section 4 for details.</li>
            </ul>

            <h3 className="mb-2 font-times">C. Information from third parties</h3>
            <ul className="list-disc list-inside mb-10"><li className=" font-times">External advertising or property campaign data (with consent where applicable).</li></ul>
          </section>

          <section>
            <h2 className="mb-2 font-bold font-times">2. Purpose and Use of Personal Data</h2>
            <p className=" font-times">Your data is used for:</p>
            <ul className="list-disc list-inside mb-4">
              <li className="mb-2 font-times">Enabling account creation and management.</li>
              <li className="mb-2 font-times">Publishing and moderating property listings.</li>
              <li className="mb-2 font-times">Connecting property seekers with verified owners and brokers (via admin-approved leads).</li>
              <li className="mb-2 font-times">Sending email or notifications about enquiries and approvals.</li>
              <li className="mb-2 font-times">Protecting against fraud and ensuring data authenticity through KYC.</li>
              <li className="mb-2 font-times">Improving Platform performance, content, and relevance.</li>
              <li className="mb-2 font-times">Responding to user support requests or feedback.</li>
              <li className="mb-2 font-times">Complying with applicable data protection laws in India.</li>
            </ul>
            <p className=" font-times">No data is sold, rented, or shared for unsolicited marketing.</p>
          </section>

          <section>
            <h2 className="mb-2 font-bold font-times">3. Who We Share Your Data With</h2>
            <p className=" font-times">We may share your data only as necessary with:</p>
            <ul className="list-disc list-inside mb-4">
              <li className="mb-2 font-times">Service providers: backend hosting, and communication APIs.</li>
              <li className="mb-2 font-times">Verified agents/brokers: limited contact data as per your enquiry intent.</li>
              <li className="mb-2 font-times">Legal authorities: only when required by law or to protect Platform integrity.</li>
              <li className="mb-2 font-times">Corporate restructuring: if ownership or management of PropAdda changes.</li>
            </ul>
            <p className=" font-times">We do not share your Personal Data with advertisers or banks for promotional use.</p>
          </section>

          <section>
            <h2 className="mb-2 font-bold font-times">4. Cookies and Tracking</h2>
            <p className=" font-times">
              Cookies are used to recognize returning users, remember preferences, and optimise Platform functionality. You may disable cookies using your browser settings, but some features may not work correctly.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-bold font-times">5. Data Retention and Storage</h2>
            <ul className="list-disc list-inside mb-10">
              <li className="mb-2 font-times">Data is stored securely in Indian data centers using encrypted channels.</li>
              <li className="mb-2 font-times">Only authorized PropAdda admin staff have access to user records.</li>
              <li className="mb-2 font-times">Property listings, communications, and user profiles remain active as long as your account exists or as necessary to provide services.</li>
              <li className="mb-2 font-times">Upon request, we delete your data except where legally required for record-keeping or dispute resolution.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-bold font-times">6. Your Rights</h2>
            <p className=" font-times">You have the right to:</p>
            <ul className="list-disc list-inside mb-10">
              <li className="mb-2 font-times">Access and review your information.</li>
              <li className="mb-2 font-times">Request correction or deletion of inaccurate data.</li>
              <li className="mb-2 font-times">Withdraw consent for marketing or data use.</li>
              <li className="mb-2 font-times">Raise privacy-related concerns via our grievance channel.</li>
            </ul>
            <p className=" font-times">
              <span className="font-bold mb-4 font-times">Contact:</span>
              <br />
              Privacy Support - PropAdda
              <br />
              Email: <a className="hover:text-themeOrange font-times" href="mailto:sales@propadda.in">sales@propadda.in</a>
              <br />
              Address: F 5, Manish Plaza 3, Sector 10, Dwaraka, Delhi -110075
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-bold font-times">7. Data Protection and Security</h2>
            <ul className="list-disc list-inside mb-10">
              <li className="mb-2 font-times">All communication is conducted over secure HTTPS connections.</li>
              <li className="mb-2 font-times">KYC and identity documents are stored with restricted access and end-to-end encryption.</li>
              <li className="mb-2 font-times">Passwords are hashed before storage.</li>
              <li className="mb-2 font-times">Regular audits ensure compliance with data protection norms.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-bold font-times">8. Third-Party Website Links</h2>
            <p className=" font-times">
              Our Platform may show property videos, maps, or embedded content from services like YouTube or Google Maps. Such services operate under their own privacy policies. PropAdda is not responsible for the practices of third-party websites.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-bold font-times">9. Children</h2>
            <p className=" font-times">
              PropAdda is intended for individuals aged 18 years or older. Users under 18 may access the website only under parental supervision. We do not knowingly collect personal data from minors.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-bold  font-times">10. Policy Updates</h2>
            <p className=" font-times">
              This Policy may be updated periodically to reflect changes to our processes or legal requirements. Any revisions will be posted on this page with an updated effective date.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-bold font-times">11. Contact – Grievance Redressal</h2>
            <p className=" font-times">
              For any privacy-related concerns, please contact:
              <br />
              PropAdda
              <br />
              Email: <a className="hover:text-themeOrange font-times" href="mailto:sales@propadda.in">sales@propadda.in</a>
              <br />
              Address: F 5, Manish Plaza 3, Sector 10, Dwaraka, Delhi -110075
            </p>
          </section>
        </div>
      </main>
      <PropertyAction />
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
