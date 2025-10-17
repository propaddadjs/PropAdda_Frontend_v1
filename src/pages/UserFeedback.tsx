import React from "react";
import AgentFeedback from "./Agent/AgentFeedback";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PropertyAction from "../components/PropertyAction";

const UserFeedback: React.FC = () => {
  return (
    <>
      <Header title="FEEDBACK" />
      <AgentFeedback />
      <PropertyAction />
      <Footer />
    </>
  );
};

export default UserFeedback;