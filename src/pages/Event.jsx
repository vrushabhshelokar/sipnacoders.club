import React from "react";
import EventSection1 from "../components/common/EventsSection1";
import EventPipeLine from "../components/common/EventPipeLine";
import NavBar from "../components/navbars/NavBar";
import Footer from '../components/footer/Footer';

const Event = () => {
  return (
    <><NavBar />
      {/* Global Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
      </div>

      {/* Page Content */}
      <section className="relative w-full z-10">

        <EventSection1 />
      </section>

      {/* <section className="relative w-full z-10">
        <EventPipeLine />
      </section> */}
      <Footer />
    </>
  );
};

export default Event;
