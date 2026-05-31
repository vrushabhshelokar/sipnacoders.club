const Border = () => {
  return (
    <div className="absolute bottom-0 left-0 w-full border-y border-white/10 bg-black/20 py-2">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...Array(4)].map((_, i) => (
          <span
            key={i}
            className="mx-4 text-xs font-mono text-zinc-500 uppercase tracking-widest"
          >
            /// Coders Club /// Coders Club /// Coders Club /// Coders Club ///
             Coders Club /// Coders Club /// Coders Club /// Coders Club /// Coders Club ///
              Coders Club /// Coders Club /// Coders Club /// Coders Club /// Coders Club ///
               Coders Club /// Coders Club /// Coders Club /// Coders Club /// Coders Club ///
                Coders Club /// Coders Club /// Coders Club /// Coders Club /// Coders Club ///Coders Club /// Coders Club ///
          </span>
        ))}
      </div>

      <style jsx>{`
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
};


export default Border; 