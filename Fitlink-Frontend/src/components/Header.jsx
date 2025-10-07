// Header.jsx
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import FiltersModal from "./FiltersModal";

export default function Header() {
  const [openFilters, setOpenFilters] = useState(false);

  const handleApplyFilters = ({ categories, lugares }) => {
    // Conecta aquí con tu lógica (estado global / Supabase / URL params)
    // console.log({ categories, lugares });
  };

  return (
    <header className="sticky top-0 z-20 bg-[#6BA8FF] text-white">
      <div className="flex items-center gap-2 px-4 py-3 md:gap-4 md:px-6 md:py-4 max-w-7xl mx-auto">
        
        {/* Logo */}
        <div className="font-extrabold tracking-wider text-lg md:text-xl whitespace-nowrap">
          FitLink
        </div>

        {/* Buscador + Filtros */}
        <form className="flex-1 flex items-center justify-center gap-2" role="search" aria-label="Buscar">
          <input
            type="search"
            placeholder="Buscar actividades…"
            aria-label="Buscar actividades"
            className="w-full max-w-xl h-[38px] border-none rounded-full px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/80 text-sm bg-white"
          />

          {/* Botón Filtros */}
          <button
            type="button"
            onClick={() => setOpenFilters(true)}
            className="flex items-center gap-2 text-white font-extrabold rounded-full px-4 py-2 
                       hover:bg-white/20 cursor-pointer transition-colors duration-200"
          >
            <span>Filtros</span>
            <SlidersHorizontal size={18} />
          </button>
        </form>

        {/* CTA Registrarme */}
        <a
          className="bg-transparent text-white border-2 border-white/90 px-3 py-2 md:px-4 md:py-2.5 rounded-full font-bold text-sm md:text-base whitespace-nowrap transition duration-200 hover:bg-white/10"
          href="#"
          aria-label="Registrarme"
        >
          Registrarme
        </a>
      </div>

      {/* Modal de Filtros */}
      <FiltersModal
        open={openFilters}
        onClose={() => setOpenFilters(false)}
        onApply={handleApplyFilters}
      />
    </header>
  );
}
