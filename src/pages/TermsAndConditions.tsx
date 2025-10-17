import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import PropertyAction from "../components/PropertyAction";
import Footer from "../components/Footer";

const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header title="TERMS & CONDITIONS" />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 text-sm">
          <Link to="/" className="text-gray-500 hover:text-gray-800">
            Home
          </Link>
          <span className="mx-2 text-gray-400">&gt;</span>
          <span className="text-gray-800 font-medium">Terms & Conditions</span>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 flex-1">
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 sm:p-10 space-y-8 ">
          <header>
          <h1 className="font-bold mb-6 font-times ">PropAdda Terms &amp; Conditions</h1>
          <p className="lead font-times ">Please read this document carefully. By accessing or using PropAdda, you agree to be bound by the terms and conditions set forth below.</p>
          <p className="font-times ">
          Questions? Contact <a className="hover:text-themeOrange" href="mailto:sales@propadda.com">sales@propadda.com</a>.
          </p>
          </header>


          <section>
            <h2 className="mb-4 font-bold font-times ">Introduction</h2>
            <p className="mb-4 font-times ">
              This website <strong>propadda.in</strong>, including subdomains, mobile and smart device applications,
              and APIs (collectively “PropAdda”) is owned, hosted, and operated by Prop Adda India Pvt Ltd, incorporated
              in India under applicable law, having its registered office at 43, Mansa Ram Park, Dwarka Mor, Delhi 110059.
              These terms and conditions, privacy policy, and community guidelines constitute a legally binding agreement
              between PropAdda and the User (the “Agreement”).
            </p>
            <p className="mb-4 font-times ">
              PropAdda and/or any affiliated websites linked to this website provide online real estate information and
              communication services to you, subject to your compliance with these terms. 
            </p>
            <p className="mb-4 font-times ">
              PropAdda reserves the right toamend or modify these terms at any time, effective immediately upon posting on the website. Your continued
              use implies acceptance of such modifications. PropAdda may suspend operations temporarily for maintenance or
              updates without prior notice. 
            </p>
            <p className=" font-times">
              Misuse of the Platform may result in termination or blocking of your access.
            </p>
          </section>
          <section>  
            <h1 className="mb-4 font-bold font-times ">Contents </h1>
            <h2 className="mb-4 font-bold font-times ">Definitions </h2>
            <ul className="list-disc list-inside mb-10 ">
              <li className="mb-2 font-times ">Subscriber/User: Any individual or legal entity subscribing to services on PropAdda (paid or free), requiring login credentials.</li>
              <li className="mb-2 font-times ">Browser/Visitor: Any person accessing non-restricted portions of PropAdda without an account.</li>
              <li className="mb-2 font-times ">Advertiser: A Subscriber/User uploading or relaying content.</li>
              <li className="mb-2 font-times ">User/Customer: Includes Subscribers/Advertisers and Browsers/Visitors collectively.</li>             
              <li className="mb-2 font-times ">Service: The interactive online platform of PropAdda, including listings, search tools, and panels.</li>
              <li className="mb-2 font-times ">RERDA: The Real Estate (Regulation and Development) Act, 2016, as amended.</li>             
            </ul>

            <h2 className="mb-4 font-bold font-times ">Submission and Administration of Listings/Advertisements </h2>
            <ul className="list-disc list-inside mb-10">
              <li className="mb-2 font-times ">Users agree not to submit property descriptions, photographs, or other content without securing all necessary rights and consents from property owners, copyright holders, or authorized agents.</li>
              <li className="mb-2 font-times ">PropAdda does not claim ownership of listings or banners and does not independently verify their authenticity unless required.</li>
              <li className="mb-2 font-times ">Some listings may contain third-party audio/video content provided solely for informational purposes without guarantees.</li>
            </ul>

            <h2 className="mb-4 font-bold font-times">Submission and Administration of Listings / Advertisements</h2>
            <ul className="list-disc list-inside mb-10">
              <li className="mb-2 font-times">Users agree not to submit property descriptions, photographs, or other content without securing all necessary rights and consents.</li>
              <li className="mb-2 font-times">PropAdda does not claim ownership of listings or banners and does not independently verify their authenticity unless required.</li>
              <li className="mb-2 font-times">Some listings may contain third-party audio/video content provided solely for informational purposes without guarantees.</li>
              <li className="mb-2 font-times">Users provide content rights to PropAdda to use, modify, or sublicense voice recordings or other media for platform functionalities.</li>
              <li className="mb-2 font-times">Users subject to RERDA must ensure full compliance by obtaining all necessary licenses, permits, and registrations.</li>
              <li className="mb-2 font-times">Users must disclose all material facts including title, ownership status, encumbrances, property dimensions, and RERDA registration status.</li>
              <li className="mb-2 font-times">PropAdda may require affidavits or documentation supporting the listing’s authenticity and may remove listings violating these terms.</li>
              <li className="mb-2 font-times">PropAdda reserves the right to modify listing presentation and usage.</li>
              <li className="mb-2 font-times">Users must ensure truthful representation and authorized posting under appropriate names.</li>
              <li className="mb-2 font-times">PropAdda may remove listings without notice and disclaims responsibility for verifying accuracy.</li>
              <li className="mb-2 font-times">Buyers/renters must verify property ownership, title, liens, and other details independently.</li>
              <li className="mb-2 font-times">The "Verified" tag indicates advertisement verification only, not legal or financial verification.</li>
            </ul>

            <h2 className="mb-4 font-bold font-times">Content Moderation and AI Tools</h2>
            <ul className="list-disc list-inside mb-10">
              <li className="mb-2 font-times">Proprietary and third-party AI tools are utilized to detect and address harmful or illegal content.</li>
              <li className="mb-2 font-times">Automated moderation operates with varying degrees of human oversight.</li>
              <li className="mb-2 font-times">Users may appeal moderation decisions as per PropAdda’s grievance policies.</li>
              <li className="mb-2 font-times">The tools are provided "as is" and continuously refined to meet legal and platform standards.</li>
            </ul>

            <h2 className="mb-4 font-bold font-times">Payment Terms</h2>
            <ul className="list-disc list-inside mb-10">
              <li className="mb-2 font-times">Payment terms relevant only if/when paid services are introduced. Currently, PropAdda operates as a free platform.</li>
              <li className="mb-2 font-times">Any payments for future services, if applicable, are generally non-refundable unless at PropAdda’s sole discretion.</li>
              <li className="mb-2 font-times">Payment transactions may be processed through third-party gateways, and PropAdda does not store financial information.</li>
              <li className="mb-2 font-times">PropAdda limits liability for transaction errors or refund delays due to external factors. </li>
              <li className="mb-2 font-times">PropAdda does not guarantee server uptime or uninterrupted services; services are on a best-effort basis.</li>
            </ul>

            <h2 className="mb-4 font-bold font-times">CPL Marketing Campaigns (If applicable)</h2>
            <ul className="list-disc list-inside mb-10">
              <li className="mb-2 font-times">PropAdda may conduct CPL marketing campaigns and deliver leads at agreed costs.</li>
              <li className="mb-2 font-times">Campaign management and delivery methods are at PropAdda’s sole discretion.</li>
              <li className="mb-2 font-times">Payments for campaigns are non-refundable.</li>
              <li className="mb-2 font-times">Leads protection and customer data privacy must comply with applicable laws.</li>
              <li className="mb-2 font-times">Duplicate lead handling policies apply.</li>
              <li className="mb-2 font-times">PropAdda disclaims liability for lead conversion or results from campaigns.</li>
            </ul>

            <h2 className="mb-4 font-bold font-times">Video Community Guidelines</h2>
            <ul className="list-disc list-inside mb-10">
              <li className="mb-2 font-times">Videos must be original, free from copyright issues, and adhere to decency norms.</li>
              <li className="mb-2 font-times">Videos containing personal information or offensive content are prohibited.</li>
              <li className="mb-2 font-times">Videos undergo multi-layer screening; violative content is removed.</li>
            </ul>

            <h2 className="mb-4 font-bold font-times">Use of Information</h2>
            <ul className="list-disc list-inside mb-10">
              <li className="mb-2 font-times">Information from listings, member directories, or other services is proprietary and confidential to PropAdda. </li>
              <li className="mb-2 font-times">Users may only use the content for personal/internal evaluation, excluding redistribution or commercial use without authorization.</li>
              <li className="mb-2 font-times">Automated or excessive scraping/searching is prohibited and may lead to immediate termination.</li>
            </ul>

            <h2 className="mb-4 font-bold font-times">Intellectual Property Rights</h2>
            <ul className="list-disc list-inside mb-10">
              <li className="mb-2 font-times">All trademarks, service marks, and logos belong to PropAdda or its licensors.</li>
              <li className="mb-2 font-times">Use of PropAdda’s marks without permission is strictly prohibited and may lead to legal action.</li>
              <li className="mb-2 font-times">PropAdda respects others' intellectual property and will act against infringement.</li>
              <li className="mb-2 font-times">Users receive a limited license to access services compliant with these terms.</li>
            </ul>

            <h2 className="mb-2 font-bold font-times">Restrictions and Prohibitions</h2>
            <p className="mb-4 font-times">Users must not:</p>
            <ul className="list-disc list-inside mb-3">
              <li className="mb-2 font-times">Act in ways that impair PropAdda functionality or violate laws including RERDA.</li>
              <li className="mb-2 font-times">Copy, share, or exploit PropAdda data or content commercially or competitively without consent.</li>
              <li className="mb-2 font-times">Use automated tools to extract data without prior permission.</li>
              <li className="mb-2 font-times">Attempt unauthorized access or hack PropAdda’s systems.</li>
              <li className="mb-2 font-times">Modify or simulate PropAdda’s services or interface.</li>
              <li className="mb-2 font-times">Impersonate others or misrepresent affiliations.</li>
              <li className="mb-2 font-times">Distribute malicious software or harmful content.</li>
              <li className="mb-2 font-times">Spam or harass other users.</li>
              <li className="mb-2 font-times">Violate intellectual property or privacy rights.</li>
              <li className="mb-2 font-times">Bypass technological protections or limits.</li>
            </ul>
            <p className="mb-10 font-times">Violations may result in civil or criminal liability.</p>

            <h2 className="mb-2 font-bold font-times">Links to Third-party Websites</h2>
            <ul className="list-disc list-inside mb-10">
              <li className="mb-2 font-times">PropAdda may link to third-party websites but does not endorse or control their content. </li>
              <li className="mb-2 font-times">Users should review their privacy policies separately.</li>
            </ul>

            <h2 className="mb-2 font-bold font-times">Disclaimer and Warranties</h2>
            <ul className="list-disc list-inside mb-10">
              <li className="mb-2 font-times">PropAdda operates as an intermediary under the Information Technology Act, 2000.</li>
              <li className="mb-2 font-times">Services and content are offered "as is" without warranties on accuracy, timeliness, or completeness.</li>
              <li className="mb-2 font-times">PropAdda disclaims liability for damages arising from use or inability to use the platform.</li>
              <li className="mb-2 font-times">Views expressed by users are their own.</li>
              <li className="mb-2 font-times">Users must independently verify property and service information.</li>
              <li className="mb-2 font-times">PropAdda does not guarantee transaction outcomes or responses to listings.</li>
              <li className="mb-2 font-times">Investment decisions are users’ responsibility; PropAdda does not endorse unlaunched projects.</li>
              <li className="mb-2 font-times">Reference to products or services of PropAdda in one region does not guarantee availability elsewhere.</li>
            </ul>

            <h2 className="mb-2 font-bold font-times">Limitation of Liability</h2>
            <ul className="list-disc list-inside mb-10">
              <li className="mb-2 font-times">PropAdda is not liable for direct, indirect, incidental, consequential, or punitive damages related to the platform.</li>
              <li className="mb-2 font-times">PropAdda disclaims responsibility for technical issues, data loss, or unauthorized access impacting users. </li>
              <li className="mb-2 font-times">Limitations apply regardless of legal theories and include force majeure events.</li>
            </ul>

            <h2 className="mb-2 font-bold font-times">Termination</h2>
            <ul className="list-disc list-inside mb-10">
              <li className="mb-2 font-times">PropAdda may terminate or restrict your access at its sole discretion without notice, especially for violations of these terms or applicable laws.</li>
            </ul>

            <h2 className="mb-2 font-bold font-times">Indemnification</h2>
            <ul className="list-disc list-inside mb-10">
              <li className="mb-2 font-times">You agree to indemnify, defend, and hold harmless PropAdda and its affiliates from claims, damages, or costs resulting from your use of the platform or breach of these terms.</li>
              <li className="mb-2 font-times">PropAdda is not a party to disputes between users.</li>
            </ul>

            <h2 className="mb-2 font-bold font-times">Privacy Policy</h2>
            <ul className="list-disc list-inside mb-10">
              <li className="mb-2 font-times">Your personal data is managed as per PropAdda’s Privacy Policy. </li>
              <li className="mb-2 font-times">Profile visibility and communication preferences are user-configurable.</li>
              <li className="mb-2 font-times">Feedback and submissions are non-confidential. </li>
            </ul>

            <h2 className="mb-2 font-bold font-times">User Terms of Use</h2>
            <ul className="list-disc list-inside mb-10">
              <li className="mb-2 font-times">PropAdda may contact you with related property information even if you are registered under Do Not Call (DNC) or National Preference Register (NPR). </li>
              <li className="mb-2 font-times">Publicly posted information may be accessed globally, including in jurisdictions with different privacy protections.</li>
            </ul>

            <p className=" font-times">
              Users with grievances may contact PropAdda at <a className="hover:text-themeOrange" href="mailto:sales@propadda.in">sales@propadda.in</a>. Complaints will be addressed promptly according to established timelines.
              Disputes will be governed by the laws of India and under the jurisdiction of courts located at the company’s registered office.
            </p>

          </section>
          


        </div>
      </main>
      <PropertyAction />
      <Footer />
    </div>
  );
};

export default TermsAndConditions;
