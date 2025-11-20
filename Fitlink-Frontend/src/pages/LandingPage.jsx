import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EventReal from "../components/EventReal";
import EventDetailsModal from "../components/EventDetailsModal";
import { api } from "../lib/api";

const PrimaryButtonClasses =
  "inline-block px-10 py-4 text-lg bg-indigo-600 text-white font-bold rounded-xl shadow-xl hover:bg-indigo-700 transition duration-300 transform hover:scale-[1.02]";

export default function LandingPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const handleShowDetails = (ev) => {
    setSelected(ev);
    setOpen(true);
  };

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

  const imageByCategory = (cat) => {
    let categoryName = ""; // 1. Empezar con un string vacío

    if (typeof cat === 'string') {
      // 2. Si es un string, usarlo
      categoryName = cat;
    } else if (typeof cat === 'object' && cat !== null && cat.nombre) {
      // 3. Si es un objeto como { nombre: "Yoga" }, usar .nombre
      categoryName = cat.nombre;
    } else if (typeof cat === 'number') {
      // 4. Si es un número, convertirlo a string (no fallará)
      categoryName = String(cat);
    }
    // 5. Si es null o undefined, categoryName seguirá siendo ""

    // 'k' ahora siempre será un string en minúsculas.
    const k = (categoryName || "").toLowerCase();

    if (k.includes("yoga") || k.includes("mente"))
      return "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop";
    if (k.includes("running") || k.includes("caminata"))
      return "https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=1200&auto=format&fit=crop";
    if (k.includes("cicl"))
      return "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1200&auto=format&fit=crop";
    if (k.includes("equipo"))
      return "https://images.unsplash.com/photo-1521417531039-94eaa7b5456f?q=80&w=1200&auto=format&fit=crop";
    
    // Imagen por defecto
    return "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop";
  };
  // ----- FIN DE LA CORRECCIÓN -----

  const PAGE_SIZE = 3;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const [page, setPage] = useState(0);

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
      
      {/* HERO */}
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

      {/* 🔥 BLOQUE NUEVO: Explorar usuarios */}
      <section className="max-w-3xl mx-auto mb-12 bg-white shadow-xl rounded-2xl p-8 text-center">
        <h2 className="text-3xl font-semibold mb-4 text-gray-800">
          Explorar Usuarios
        </h2>
        <p className="text-gray-600 mb-6">
          Descubre deportistas de tu zona, ve sus perfiles públicos y calificaciones.
        </p>

        <Link
          to="/users"
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition"
        >
          Ver Usuarios
        </Link>
      </section>

      {/* EVENTOS */}
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

        {/* Carrusel */}
        {!loading && filtered.length > 0 && (
          <div className="relative max-w-7xl mx-auto">
            {totalPages > 1 && (
              <button
                onClick={goPrev}
                className="hidden sm:flex absolute -left-10 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-4 rounded-full shadow-xl hover:bg-gray-700 transition"
              >
                ‹
              </button>
            )}

            <div className="w-full overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                {pageEvents.map((e) => (
                  <EventReal
                    key={e.id}
                    event={{
                      ...e,
                      // Esta línea ya no fallará
                      imageUrl: e.imageUrl || imageByCategory(e.categoria),
                    }}
                    onShowDetails={handleShowDetails}
                  />
                ))}
              </div>
            </div>

            {totalPages > 1 && (
              <button
                onClick={goNext}
                className="hidden sm:flex absolute -right-10 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-4 rounded-full shadow-xl hover:bg-gray-700 transition"
              >
                ›
              </button>
            )}

            <div className="mt-6 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`h-2 rounded-full ${
                    i === page ? "bg-indigo-600 w-6" : "bg-gray-300 w-2"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            No hay eventos para esta zona.
          </p>
        )}
      </section>

      <EventDetailsModal
        isOpen={open}
        onClose={() => setOpen(false)}
        event={selected}
      />
    </main>
  );
}