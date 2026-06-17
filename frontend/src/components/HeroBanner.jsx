export default function HeroBanner({ title, subtitle }) {
  return (
    <div className="h-52 sm:h-64 md:h-72 flex-shrink-0 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#D4DCE8] via-[#9BAEC8] to-[#5A7BA8]" />
      <div className="absolute top-0 left-0 right-0 flex justify-around pt-4 opacity-30">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-12 h-20 rounded-t-full border-2 border-white/40 bg-white/10" />
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#3A5A88] to-transparent" />
      <svg className="absolute bottom-0 left-0 right-0 w-full h-24 opacity-40" viewBox="0 0 400 96" preserveAspectRatio="none">
        <line x1="160" y1="96" x2="195" y2="40" stroke="white" strokeWidth="2" />
        <line x1="240" y1="96" x2="205" y2="40" stroke="white" strokeWidth="2" />
        <line x1="100" y1="96" x2="192" y2="40" stroke="white" strokeWidth="1" opacity="0.5" />
        <line x1="300" y1="96" x2="208" y2="40" stroke="white" strokeWidth="1" opacity="0.5" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white font-black text-5xl sm:text-6xl tracking-tight drop-shadow-lg">
          {title}
        </span>
        {subtitle && (
          <span className="text-white/90 font-semibold text-sm uppercase tracking-widest mt-1 drop-shadow">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
