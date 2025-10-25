// Author-Hemant Arora
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AgentHelp from "./Agent/AgentHelp";
import PropertyAction from "../components/PropertyAction";
import headerImg from "../images/Banners/help-desk.png";

const UserHelp: React.FC = () => {
  return (
    <>
      <Header headerImage={headerImg} />
      <AgentHelp />
      <PropertyAction />
      <Footer />
    </>
  );
};

export default UserHelp;