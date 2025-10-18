import React from "react";
import AgentFeedback from "./Agent/AgentFeedback";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PropertyAction from "../components/PropertyAction";
import headerImg from "../images/Banners/Feedback.png";

const UserFeedback: React.FC = () => {
  return (
    <>
      <Header headerImage={headerImg} />
      <AgentFeedback />
      <PropertyAction />
      <Footer />
    </>
  );
};

export default UserFeedback;