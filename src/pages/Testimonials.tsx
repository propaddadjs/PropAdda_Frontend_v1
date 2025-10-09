import React from "react";
import Header_Pages from "../components/HeaderPages";
import Breadcrumb from "../components/Breadcrumb";
import TestimonialCarousel from "../components/TestimonialCarousel";
import PropertyAction from "../components/PropertyAction";
import Footer from "../components/Footer";
import Header from "../components/Header";

const Testimonials: React.FC = () => {
  return (
    <>
      <div>
        <Header title="TESTIMONIALS" />
      </div>

      <Breadcrumb
        items={[
          { label: "Home" },
          { label: "Testimonials" },
        ]}
      />

      <TestimonialCarousel />

      <PropertyAction />

      <Footer />
    </>
  );
};

export default Testimonials;
