// Author-Hemant Arora
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import headerImg from "../images/Banners/change-password.png";
import AgentChangePassword from "./Agent/AgentChangePassword";
import PropertyAction from "../components/PropertyAction";

const UserChangePassword: React.FC = () => {
  return (
    <>
      <Header headerImage={headerImg} />
      <AgentChangePassword />
      <PropertyAction />
      <Footer />
    </>
  );
};

export default UserChangePassword;