import React, { useEffect, useState } from "react";

const RegistrationForm = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative w-full min-h-screen text-white overflow-hidden selection:bg-white selection:text-black">

      {/* 🌌 Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
      </div>

      {/* 🌟 Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto mt-20 sm:mt-28 px-4 sm:px-6 pb-24">

        {/* Heading */}
        {/* <div
          className={`text-center transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
        >

          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
            Fill the form below to participate. Limited seats available.
          </p>
        </div> */}

        {/* 📝 Form Container */}
        <div className="mt-10 sm:mt-14">
          <div
            className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-8 shadow-2xl transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
          >
            <iframe
              src="https://tally.so/embed/J9OJGY?alignLeft=1&hideTitle=0&transparentBackground=1&dynamicHeight=1"
              className="w-full rounded-xl min-h-[900px] sm:min-h-[1500px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegistrationForm;
