export default function Header() {
  return (
    <header className="sticky top-0 z-20 bg-[#6BA8FF] text-white">
      <div className="flex items-center gap-2 px-4 py-3 md:gap-4 md:px-6 md:py-4 max-w-7xl mx-auto">
        
        <div className="font-extrabold tracking-wider text-lg md:text-xl whitespace-nowrap">
          FitLink
        </div>

        <form className="flex-1 flex justify-center" role="search" aria-label="Buscar">
          <input
            type="search"
            placeholder="Buscar actividades…"
            aria-label="Buscar actividades"
            // ADDED bg-white class here
            className="w-full max-w-xl h-[38px] border-none rounded-full px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/80 text-sm bg-white"
          />
        </form>

        <a 
          className="bg-transparent text-white border-2 border-white/90 px-3 py-2 md:px-4 md:py-2.5 rounded-full font-bold text-sm md:text-base whitespace-nowrap transition duration-200 hover:bg-white/10" 
          href="#" 
          aria-label="Registrarme"
        >
          Registrarme
        </a>
      </div>
    </header>
  );
}
