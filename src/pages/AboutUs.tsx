import React from 'react';


// -- Utility types
interface IconCardProps {
  src: string;
  alt: string;
  title: string;
  subtitle: string;
}

function IconCard({ src, alt, title, subtitle }: IconCardProps) {
  return (
    <div className="icon-card">
      <div className="icon-circle">
        <img src={src} alt={alt} />
      </div>
      <div className="icon-text">
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
    <div className="team-card">
      <img src={src} alt={alt} />
      <div className="team-label">
        <strong>{name}</strong>
        <br />
        <span>{role}</span>
      </div>
    </div>
  );
}

interface AboutHeaderProps {
  description: string[];
}

function AboutHeader({ description }: AboutHeaderProps) {
  return (
    <div className="about-header">
      <img src="assets/ribbon.png" alt="Ribbon Background" className="ribbon-img" />
      <div className="about-description">
        {description.map((para, i) => (
          <p key={i}>{para}</p>
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
    <div className="icon-row">
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
    <div className="about-images">
      <img src={mainSrc} alt={mainAlt} className="main-image" />
      <img src={overlaySrc} alt={overlayAlt} className="overlay-image" />
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
  title = (
    <>
      <span>TEAM</span> MEMBERS
    </>
  ),
  intro,
  members,
  conclusion,
}: TeamSectionProps) {
  return (
    <section className="team-section">
      <h4>{titleSmall}</h4>
      <h2>{title}</h2>
      {intro && <p className="team-intro">{intro}</p>}

      <div className="team-members">
        {members.map((m, i) => (
          <TeamCard key={i} {...m} />
        ))}
      </div>

      {conclusion && <p className="team-conclusion">{conclusion}</p>}
    </section>
  );
}

interface TeamBannerProps {
  text: React.ReactNode;
}

function TeamBanner({ text }: TeamBannerProps) {
  return (
    <section className="team-banner">
      <div className="banner-text">{text}</div>
    </section>
  );
}

export default function AboutUs() {
  const aboutParagraphs: string[] = [
    "PropAdda.in is a next-generation digital real estate platform dedicated to transforming how India buys, sells, and invests in property. With a foundation built on trust, transparency, and technology, we aim to bridge the gap between traditional real estate and the evolving needs of the modern buyer.",
    "Rooted in the belief that every Indian deserves access to a reliable, localized property solution, PropAdda.in brings a “Desi” touch to the digital space. From verified listings and plot-wise sales to digital marketing tools for agents, we make real estate accessible, simple, and efficient.",
  ];

  const iconItems: IconCardProps[] = [
    {
      src: "assets/icon1.png",
      alt: "Individual Buyers Icon",
      title: "Individual buyers",
      subtitle: "& first-time homeowners",
    },
    {
      src: "assets/icon2.png",
      alt: "Verified Agents Icon",
      title: "Verified agents",
      subtitle: "& realtors",
    },
    {
      src: "assets/icon3.png",
      alt: "Land Developers Icon",
      title: "Land developers",
      subtitle: "& layout promoters",
    },
  ];

  const teamMembers: TeamCardProps[] = [
    {
      src: "assets/img_5.png",
      alt: "Pawan Rajput",
      name: "Mr. Pawan Rajput",
      role: "Owner & Director",
    },
    {
      src: "assets/img_5.png",
      alt: "Dhruv Rajput",
      name: "Mr. Dhruv Rajput",
      role: "CEO",
    },
    {
      src: "assets/img_5.png",
      alt: "Pritham Singh",
      name: "Mr. Pritham Singh",
      role: "Chairman",
    },
    {
      src: "assets/img_5.png",
      alt: "K.P. Sharan Rao",
      name: "Mr. K.P. Sharan Rao",
      role: "Operations Manager",
    },
  ];

  return (
    <main>
      <section className="about-section">
        <AboutHeader description={aboutParagraphs} />
        <IconRow items={iconItems} />
        <AboutImages
          mainSrc="assets/img_3.png"
          mainAlt="handshake"
          overlaySrc="assets/img_4.png"
          overlayAlt="house-hands"
        />
      </section>

      <TeamSection
        intro="PropAdda.in is proudly promoted by Dada Jaisingh and Sons, known for trusted ventures in land and development."
        members={teamMembers}
        conclusion="Our leadership combines vision, expertise, and execution, ensuring every project under PropAdda is delivered with excellence."
      />

      <TeamBanner
        text={
          <>AT PROPADDA.IN, WE DON’T JUST SELL LAND <br />— WE HELP BUILD LEGACIES.</>
        }
      />
    </main>
  );
}


// export default AboutUs;