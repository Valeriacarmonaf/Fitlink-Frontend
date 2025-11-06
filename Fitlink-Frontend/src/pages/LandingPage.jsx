// src/pages/LandingPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EventReal from "../components/EventReal";
import EventDetailsModal from "../components/EventDetailsModal";
import { api } from "../lib/api";

const PrimaryButtonClasses =
  "inline-block px-10 py-4 text-lg bg-indigo-600 text-white font-bold rounded-xl shadow-xl hover:bg-indigo-700 transition duration-300 transform hover:scale-[1.02]";

export default function LandingPage() {
  // ----- datos -----
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ----- modal -----
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const handleShowDetails = (ev) => {
    setSelected(ev);
    setOpen(true);
  };

  // ----- carga desde backend -----
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await api.upcomingEvents(60);
        setEvents(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setErr(e?.message || "Error cargando eventos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ----- filtro por zona (municipio) -----
  const [selectedZone, setSelectedZone] = useState("Todas");
  const zones = useMemo(() => {
    const unique = new Set(events.map((e) => e.municipio).filter(Boolean));
    return ["Todas", ...Array.from(unique).sort()];
  }, [events]);

  const filtered = useMemo(() => {
    return selectedZone === "Todas"
      ? events
      : events.filter((e) => e.municipio === selectedZone);
  }, [selectedZone, events]);

  // Mapea una categoría textual a una imagen local (asegúrate de que existan en /public/img/)
  function imageByCategory(cat) {
    const catString =
      typeof cat === "string"
        ? cat.toLowerCase()
        : typeof cat === "object" && cat?.nombre
        ? String(cat.nombre).toLowerCase()
        : "";

    switch (catString) {
      case "fútbol":
      case "futbol":
        return "/img/futbol.jpg";
      case "baloncesto":
        return "/img/baloncesto.jpg";
      case "ciclismo":
        return "/img/ciclismo.jpg";
      case "yoga":
        return "/img/yoga.jpg";
      case "cocina":
        return "/img/cocina.jpg";
      default:
        return null; // importante: que pueda seguir al siguiente fallback
    }
  }

  // Prioriza URL del evento y luego el mapping por categoría.
  // Ajusta los nombres de propiedades según tu shape real.
  function getEventImage(ev) {
    if (!ev || typeof ev !== "object") return "/img/placeholder-event.jpg";

    // 1) URLs directas que vengan del backend/DB
    const direct =
      ev.portada_url ||
      ev.banner_url ||
      ev.image_url ||
      ev.imagen_url ||
      ev.cover_url ||
      ev.foto_url;

    if (direct) return direct;

    // 2) Por categoría (string u objeto)
    const byCat =
      imageByCategory(ev.categoria) ||
      imageByCategory(ev.category) ||
      imageByCategory(ev?.categoria?.nombre) ||
      imageByCategory(ev?.category?.name);

    if (byCat) return byCat;

    // 3) Fallback final local
    return "/img/placeholder-event.jpg";
  }

  // ---------- CARRUSEL POR PÁGINAS (máx 3 visibles) ----------
  const PAGE_SIZE = 3; // 1 en móvil (grid), 2 en tablet, 3 en desktop -> máx 3 por página
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const [page, setPage] = useState(0);

  // resetea a la primera página cuando cambie el filtro o la cantidad
  useEffect(() => {
    setPage(0);
  }, [selectedZone, filtered.length]);

  const pageEvents = useMemo(() => {
    const start = page * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filtered.slice(start, end);
  }, [filtered, page]);

  const goPrev = () => setPage((p) => (p - 1 + totalPages) % totalPages);
  const goNext = () => setPage((p) => (p + 1) % totalPages);

  return (
    <main className="flex-grow p-10 bg-gray-50">
      <section className="max-w-4xl mx-auto py-20 px-8 text-center rounded-2xl bg-white shadow-2xl mb-12">
        <h1 className="text-6xl font-extrabold text-gray-900 mb-6">
          Bienvenido a FitLink
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          Conecta con personas para entrenar, correr o jugar en equipo.
        </p>
        <Link to="/dashboard" className={PrimaryButtonClasses}>
          Ir al Panel de Control
        </Link>
      </section>

      <section className="max-w-7xl mx-auto py-8 px-4 bg-white rounded-2xl shadow-xl">
        {/* Título + Filtro */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-4xl font-bold text-gray-800 text-center sm:text-left">
            Próximos Eventos
          </h2>

          <div className="flex items-center justify-center sm:justify-end gap-2">
            <label htmlFor="zona" className="text-sm font-medium text-gray-700">
              Zona:
            </label>
            <select
              id="zona"
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full sm:w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z === "Todas" ? "Todas las zonas" : z}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Estados */}
        {err && (
          <div className="p-3 mb-4 rounded bg-red-100 text-red-700">{err}</div>
        )}
        {loading && <div className="text-gray-500 p-6">Cargando eventos…</div>}

        {/* Carrusel paginado (máx 3 tarjetas visibles) */}
        {!loading && filtered.length > 0 && (
          <div className="relative max-w-7xl mx-auto">
            {/* Flecha izquierda – separada del contenido */}
            {totalPages > 1 && (
              <button
                onClick={goPrev}
                className="hidden sm:flex absolute -left-10 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-4 rounded-full shadow-xl hover:bg-gray-700 focus:outline-none z-20 transition-all duration-200"
                aria-label="Anterior"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* PÁGINA ACTUAL */}
            <div className="w-full overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center transition-all duration-300">
                {pageEvents.map((e) => (
                  <EventReal
                    key={e.id}
                    event={{
                      ...e,
                      imageUrl: getEventImage(e),
                    }}
                    onShowDetails={handleShowDetails}
                  />
                ))}
              </div>
            </div>

            {/* Flecha derecha – separada del contenido */}
            {totalPages > 1 && (
              <button
                onClick={goNext}
                className="hidden sm:flex absolute -right-10 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-4 rounded-full shadow-xl hover:bg-gray-700 focus:outline-none z-20 transition-all duration-200"
                aria-label="Siguiente"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}

            {/* Indicadores de página */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Ir a página ${i + 1}`}
                    onClick={() => setPage(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === page
                        ? "bg-indigo-600 w-6"
                        : "bg-gray-300 w-2 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sin eventos */}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            No hay eventos para esta zona.
          </p>
        )}
      </section>

      {/* Modal detalles */}
      <EventDetailsModal
        isOpen={open}
        onClose={() => setOpen(false)}
        event={selected}
      />
    </main>
  );
}
