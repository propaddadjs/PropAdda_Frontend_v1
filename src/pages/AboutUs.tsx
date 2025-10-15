import React from 'react';
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
import Footer from '../components/Footer';
import Header from '../components/Header';
import PropertyAction from '../components/PropertyAction';
import Breadcrumb from '../components/Breadcrumb';

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
      <img src={src} alt={alt} className="h-auto w-40 object-cover" />
      <div className="mt-2 rounded-[30px] border-2 border-[#e15000] bg-white px-5 py-2.5 text-center shadow-lg">
        <strong className="text-base text-[#e15000]">{name}</strong>
        <br />
        <span className="text-sm text-[#e15000]">{role}</span>
      </div>
    </div>
  );
}

interface AboutHeaderProps {
  description: string[];
}

function AboutHeader({ description }: AboutHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
      {/* UPDATED: Now full-width on mobile */}
      <img src={ribbon} alt="Ribbon Background" className="w-full md:w-[35%] md:-ml-10" />
      <div className="flex-1 space-y-8">
        {description.map((para, i) => (
          <p key={i} className="text-[17px] text-gray-600 text-justify leading-relaxed">{para}</p>
        ))}
      </div>
    </div>
  );
}

interface IconRowProps {
  items: IconCardProps[];
}

function IconRow({ items }: IconRowProps) {
  return (
    <div className="mt-12 flex flex-wrap justify-center gap-5">
      {items.map((item, i) => (
        <IconCard key={i} {...item} />
      ))}
    </div>
  );
}

interface AboutImagesProps {
  mainSrc: string;
  mainAlt: string;
  overlaySrc: string;
  overlayAlt: string;
}

function AboutImages({ mainSrc, mainAlt, overlaySrc, overlayAlt }: AboutImagesProps) {
  return (
    <div className="mt-24 relative">
      <img src={mainSrc} alt={mainAlt} className="w-full rounded-2xl lg:w-[70%]" />
      <img 
        src={overlaySrc} 
        alt={overlayAlt} 
        className="w-3/4 rounded-[50px] bg-white absolute -bottom-16 left-1/2 -translate-x-1/2 
                   lg:left-auto lg:right-0 lg:bottom-[100px] lg:w-[500px] lg:-translate-x-0" 
      />
    </div>
  );
}


interface TeamSectionProps {
  titleSmall?: string;
  title?: React.ReactNode;
  intro?: string;
  members: TeamCardProps[];
  conclusion?: string;
}

function TeamSection({
  titleSmall = "OUR TEAM",
  title = <><span>TEAM</span> MEMBERS</>,
  intro,
  members,
  conclusion,
}: TeamSectionProps) {
  return (
    <section className="bg-gray-500/10 py-10 px-5 text-center text-2xl">
      <h2 className="font-medium text-[#e15000]">
        <span className="text-black">{title}</span>
      </h2>
      {intro && <p className="mx-auto mt-4 max-w-7xl text-lg text-gray-700">{intro}</p>}

      <div className="mt-8 mb-8 flex flex-wrap justify-center gap-x-16 gap-y-12 lg:gap-x-24">
        {members.map((m, i) => (
          <TeamCard key={i} {...m} />
        ))}
      </div>

      {conclusion && <p className="mx-auto mt-4 max-w-7xl text-lg text-gray-700">{conclusion}</p>}
    </section>
  );
}

interface TeamBannerProps {
  text: React.ReactNode;
}

function TeamBanner({ text }: TeamBannerProps) {
  const bannerStyle = { backgroundImage: `url(${bannerBg})` };
  
  return (
    <section 
      className="mt-14 mb-10 bg-gray-700 bg-cover bg-center py-24 px-5 text-center text-white sm:py-36"
      style={bannerStyle}
    >
      <div className="mx-auto max-w-5xl text-4xl font-bold">{text}</div>
    </section>
  );
}

export default function AboutUs() {
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

  return (
    <div>
      <Header title="ABOUT US" />
      <Breadcrumb items={[{ label: "Home" }, { label: "About Us" }]} />
      <main>
        <section className="bg-white p-8 pb-12 font-[sans-serif]">
          <AboutHeader description={aboutParagraphs} />
          <IconRow items={iconItems} />
          <AboutImages mainSrc={handshake} mainAlt="handshake" overlaySrc={handshakeOverlay} overlayAlt="house-hands" />
        </section>

        {/* <TeamSection
          intro="PropAdda.in is proudly promoted by Dada Jaisingh and Sons, known for trusted ventures in land and development."
          members={teamMembers}
          conclusion="Our leadership combines vision, expertise, and execution, ensuring every project under PropAdda is delivered with excellence."
        /> */}

        <TeamBanner text={<>AT PROPADDA.IN, WE DON’T JUST SELL LAND <br />— WE HELP BUILD LEGACIES.</>} />
      </main>
      <PropertyAction />
      <Footer />
    </div>
  );
}