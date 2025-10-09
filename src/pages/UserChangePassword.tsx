import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AgentChangePassword from "./Agent/AgentChangePassword";
import PropertyAction from "../components/PropertyAction";

const UserChangePassword: React.FC = () => {
  return (
    <>
      <Header title="CHANGE PASSWORD" />
      <AgentChangePassword />
      <PropertyAction />
      <Footer />
    </>
  );
};

export default UserChangePassword;