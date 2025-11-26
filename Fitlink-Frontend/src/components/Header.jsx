import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, LogOut } from "lucide-react"; 
import FiltersModal from "./FiltersModal";
import { supabase } from "../lib/supabase";

const stripEmojiPrefix = (s) =>
  s ? s.replace(/^[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+/, "").trim() : "";

export default function Header({ session, onLogout }) {
  // Estado local para mostrar/ocultar botones según sesión
  const [isLogged, setIsLogged] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  
  // Estado del buscador
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Sincronizar estado de sesión (aunque recibimos session por props, mantenemos el listener por seguridad)
  useEffect(() => {
    let mounted = true;
    if (session !== undefined) {
        setIsLogged(!!session);
    } else {
        // Fallback si no se pasan props
        (async () => {
        const { data } = await supabase.auth.getSession();
        if (mounted) setIsLogged(!!data?.session);
        })();
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLogged(!!session);
    });
    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, [session]);

  // Sincronizar input con URL
  useEffect(() => {
    setQ(searchParams.get("q") || "");
  }, [searchParams]);

  // FUNCIÓN DE BÚSQUEDA
  // Envía el término 'q' a la URL. El Dashboard.jsx lo leerá y filtrará por 'nombre_evento'.
  const submitSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    
    if (q && q.trim()) {
        params.set("q", q.trim());
    } else {
        params.delete("q");
    }
    
    // Navegamos al dashboard con la query actualizada
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
    <header className="sticky top-0 z-20 bg-[#6BA8FF] text-white shadow-md">
      <div className="flex items-center gap-2 px-4 py-3 md:gap-4 md:px-6 md:py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="font-extrabold tracking-wider text-lg md:text-xl whitespace-nowrap hover:opacity-90 transition">
          FitLink
        </Link>

        {/* Buscador + Filtros */}
        <form onSubmit={submitSearch} className="flex-1 flex items-center justify-center gap-2" role="search">
          <div className="relative w-full max-w-xl">
            <input
              type="search"
              // CAMBIO AQUÍ: Placeholder específico para eventos
              placeholder="Buscar evento por nombre..." 
              className="w-full h-[38px] border-none rounded-full px-4 pr-10 text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/80 text-sm bg-white shadow-inner placeholder:text-gray-400"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {/* Lupa opcional visual (puedes agregar icono aquí si gustas) */}
          </div>
          
          <button
            type="button"
            onClick={() => setOpenFilters(true)}
            className="flex items-center gap-2 text-white font-bold rounded-full px-4 py-2 hover:bg-white/20 cursor-pointer transition-colors duration-200 border border-white/30"
            aria-label="Abrir filtros"
          >
            <span className="hidden sm:inline text-sm">Filtros</span>
            <SlidersHorizontal size={18} />
          </button>
        </form>

        {/* Link a Mis chats (solo si hay sesión) */}
        {isLogged && (
          <Link to="/chats" className="hidden md:block ml-2 px-3 py-2 rounded-lg hover:bg-white/20 transition-colors text-sm font-medium">
            Mis chats
          </Link>
        )}

        {/* Botones de Autenticación */}
        <div className="flex items-center ml-1 md:ml-2">
          {isLogged ? (
            <button
              onClick={onLogout}
              className="bg-white text-[#6BA8FF] border-2 border-white px-3 py-2 md:px-4 md:py-2 rounded-full font-bold text-xs md:text-sm whitespace-nowrap transition duration-200 hover:bg-gray-50 flex items-center gap-2 cursor-pointer shadow-sm"
              aria-label="Cerrar Sesión"
            >
              <span className="hidden sm:inline">Salir</span>
              <LogOut size={16} />
            </button>
          ) : (
            <div className="flex items-center gap-1 md:gap-2">
              <Link
                to="/login"
                className="px-3 py-2 md:px-4 md:py-2 rounded-full font-bold text-xs md:text-sm whitespace-nowrap transition duration-200 hover:bg-white/20 cursor-pointer"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-white text-[#6BA8FF] border-2 border-white px-3 py-2 md:px-4 md:py-2 rounded-full font-bold text-xs md:text-sm whitespace-nowrap transition duration-200 hover:bg-gray-50 cursor-pointer shadow-sm"
              >
                Registrarme
              </Link>
            </div>
          )}
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