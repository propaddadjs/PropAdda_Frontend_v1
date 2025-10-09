import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AgentHelp from "./Agent/AgentHelp";
import PropertyAction from "../components/PropertyAction";

const UserHelp: React.FC = () => {
  return (
    <>
      <Header title="HELPDESK" />
      <AgentHelp />
      <PropertyAction />
      <Footer />
    </>
  );
};

export default UserHelp;