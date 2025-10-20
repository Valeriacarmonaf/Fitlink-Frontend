// src/components/Header.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import FiltersModal from "./FiltersModal";

const stripEmojiPrefix = (s) =>
  s ? s.replace(/^[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+/, "").trim() : "";

export default function Header() {
  const [openFilters, setOpenFilters] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // sincroniza input con ?q= si ya viene en la URL
  useEffect(() => {
    setQ(searchParams.get("q") || "");
  }, [searchParams]);

  const submitSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (q && q.trim()) params.set("q", q.trim());
    else params.delete("q");
    // navega al dashboard para ver resultados
    navigate({ pathname: "/dashboard", search: params.toString() });
  };

  const handleApplyFilters = ({ categories = [], lugares = [] }) => {
    const params = new URLSearchParams(searchParams);

    // normaliza categorías (quitar emoji al inicio para que coincida con lo que hay en BD)
    const normCats = categories.map(stripEmojiPrefix);

    if (normCats.length) params.set("categorias", normCats.join(","));
    else params.delete("categorias");

    if (lugares.length) params.set("lugares", lugares.join(","));
    else params.delete("lugares");

    navigate({ pathname: "/dashboard", search: params.toString() });
    setOpenFilters(false);
  };

  return (
    <header className="sticky top-0 z-20 bg-[#6BA8FF] text-white">
      <div className="flex items-center gap-2 px-4 py-3 md:gap-4 md:px-6 md:py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="font-extrabold tracking-wider text-lg md:text-xl whitespace-nowrap">
          FitLink
        </Link>

        {/* Buscador + Filtros */}
        <form onSubmit={submitSearch} className="flex-1 flex items-center justify-center gap-2" role="search" aria-label="Buscar">
          <input
            type="search"
            placeholder="Buscar actividades…"
            aria-label="Buscar actividades"
            className="w-full max-w-xl h-[38px] border-none rounded-full px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/80 text-sm bg-white"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          {/* Botón Filtros */}
          <button
            type="button"
            onClick={() => setOpenFilters(true)}
            className="flex items-center gap-2 text-white font-extrabold rounded-full px-4 py-2 hover:bg-white/30 cursor-pointer transition-colors duration-200"
          >
            <span className="hidden sm:inline">Filtros</span>
            <SlidersHorizontal size={18} />
          </button>
        </form>

        {/* --- NUEVO: Grupo de botones de Autenticación --- */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Botón Iniciar Sesión */}
          <Link
            to="/login"
            className="px-3 py-2 md:px-4 md:py-2.5 rounded-full font-bold text-sm md:text-base whitespace-nowrap transition duration-200 hover:bg-white/20"
            aria-label="Iniciar Sesión"
          >
            Log In
          </Link>

          {/* Botón Registrarme (CTA Principal) */}
          <Link
            to="/register"
            className="bg-white text-[#6BA8FF] border-2 border-white px-3 py-2 md:px-4 md:py-2.5 rounded-full font-bold text-sm md:text-base whitespace-nowrap transition duration-200 hover:bg-white/90"
            aria-label="Registrarme"
          >
            Registrarme
          </Link>
        </div>
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