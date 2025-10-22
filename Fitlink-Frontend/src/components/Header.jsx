import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, LogOut, Search } from "lucide-react"; // Importar icono de Search
import FiltersModal from "./FiltersModal";

const stripEmojiPrefix = (s) =>
  s ? s.replace(/^[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+/, "").trim() : "";

// 1. Aceptar 'session' y 'onLogout' como props
export default function Header({ session, onLogout }) {
  const [openFilters, setOpenFilters] = useState(false);
  const [q, setQ] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileInputRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (mobileSearchOpen && mobileInputRef.current) mobileInputRef.current.focus();
  }, [mobileSearchOpen]);

  // (El resto de tus funciones de búsqueda y filtros no necesitan cambios)
  useEffect(() => {
    setQ(searchParams.get("q") || "");
  }, [searchParams]);

  const submitSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (q && q.trim()) params.set("q", q.trim());
    else params.delete("q");
    navigate({ pathname: "/dashboard", search: params.toString() });
  };

  const handleApplyFilters = ({ categories = [], lugares = [] }) => {
    const params = new URLSearchParams(searchParams);
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

        {/* Botón búsqueda (solo móvil) */}
        <button
          type="button"
          onClick={() => setMobileSearchOpen(true)}
          className="sm:hidden ml-2 p-2 rounded-full hover:bg-white/20 transition"
          aria-label="Buscar"
        >
          <Search size={18} />
        </button>

        {/* Botón filtros (solo móvil) */}
        <button
          type="button"
          onClick={() => setOpenFilters(true)}
          className="sm:hidden ml-2 p-2 rounded-full hover:bg-white/20 transition"
          aria-label="Filtros"
        >
          <SlidersHorizontal size={18} />
        </button>

        {/* Buscador + Filtros (oculto en móvil) */}
        <form onSubmit={submitSearch} className="hidden sm:flex flex-1 items-center justify-center gap-2" role="search">
          <input
            type="search"
            placeholder="Buscar actividades…"
            className="w-full max-w-xl h-[38px] border-none rounded-full px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/80 text-sm bg-white"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setOpenFilters(true)}
            className="flex items-center gap-2 text-white font-extrabold rounded-full px-4 py-2 hover:bg-white/30 cursor-pointer transition-colors duration-200"
          >
            <span className="hidden sm:inline">Filtros</span>
            <SlidersHorizontal size={18} />
          </button>
        </form>

        {/* 2. LÓGICA CONDICIONAL PARA LOS BOTONES DE AUTENTICACIÓN */}
        <div className="flex items-center ml-auto">
          {session ? (
            // Si el usuario ha iniciado sesión, muestra el botón de Cerrar Sesión
            <button
              onClick={onLogout}
              className="bg-white text-[#6BA8FF] border-2 border-white px-3 py-2 md:px-4 md:py-2.5 rounded-full font-bold text-sm md:text-base whitespace-nowrap transition duration-200 hover:bg-white/90 flex items-center gap-2 cursor-pointer"
              aria-label="Cerrar Sesión"
            >
              <span className="hidden sm:inline">Cerrar Sesión</span>
              <LogOut size={18} />
            </button>
          ) : (
            // Si no, muestra los botones de Log In y Registrarse
            <div className="flex items-center gap-1 md:gap-2">
              <Link
                to="/login"
                className="px-3 py-2 md:px-4 md:py-2.5 rounded-full font-bold text-sm md:text-base whitespace-nowrap transition duration-200 hover:bg-white/20 cursor-pointer"
                aria-label="Iniciar Sesión"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-white text-[#6BA8FF] border-2 border-white px-3 py-2 md:px-4 md:py-2.5 rounded-full font-bold text-sm md:text-base whitespace-nowrap transition duration-200 hover:bg-white/90 cursor-pointer"
                aria-label="Registrarme"
              >
                Registrarme
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Panel de búsqueda móvil (se abre al tocar la lupa) */}
      {mobileSearchOpen && (
        <div className="sm:hidden bg-[#6BA8FF] p-3 border-t border-white/10">
          <form
            onSubmit={(e) => {
              submitSearch(e);
              setMobileSearchOpen(false);
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={mobileInputRef}
              type="search"
              placeholder="Buscar actividades…"
              className="flex-1 h-10 px-3 rounded-full text-gray-800 focus:outline-none"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="p-2 text-white rounded-full hover:bg-white/20"
              aria-label="Cerrar búsqueda"
            >
              ✕
            </button>
          </form>
        </div>
      )}

      {/* Modal de Filtros */}
      <FiltersModal
        open={openFilters}
        onClose={() => setOpenFilters(false)}
        onApply={handleApplyFilters}
      />
    </header>
  );
}