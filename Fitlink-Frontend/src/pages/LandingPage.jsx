// src/pages/LandingPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import EventReal from "../components/EventReal";
import EventDetailsModal from "../components/EventDetailsModal";
import CreateEventModal from "../components/CreateEventModal";

// Importa el botón de notificaciones
   import NotificationButton from "../components/NotificationButton"; 
   {/* Sección de Notificaciones */}
    <section className="max-w-4xl mx-auto mb-12 text-center">
        <NotificationButton session={session} />  {/* Aquí agregamos el botón de notificaciones */}
      </section>

const PrimaryButtonClasses =
  "inline-block px-10 py-4 text-lg bg-indigo-600 text-white font-bold rounded-xl shadow-xl hover:bg-indigo-700 transition duration-300 transform hover:scale-[1.02]";

/* ===== HELPERS GLOBALES (Fuera del componente para evitar errores) ===== */

/** Extrae el nombre de la categoría de forma segura (String u Objeto) */
function getCatName(cat) {
  if (!cat) return "";
  if (typeof cat === "string") return cat;
  if (typeof cat === "object") {
    return cat.nombre || cat.Nombre || "";
  }
  return String(cat);
}

/** Devuelve imagen estática basada en el nombre de la categoría */
function imageByCategory(cat) {
  const catString = getCatName(cat).toLowerCase();

  if (catString.includes("fútbol") || catString.includes("futbol")) return "/img/futbol.jpg";
  if (catString.includes("baloncesto") || catString.includes("basket")) return "/img/baloncesto.jpg";
  if (catString.includes("ciclismo") || catString.includes("bici")) return "/img/ciclismo.jpg";
  if (catString.includes("yoga") || catString.includes("mente")) return "/img/yoga.jpg";
  if (catString.includes("cocina")) return "/img/cocina.jpg";
  if (catString.includes("running") || catString.includes("correr")) return "https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=1200";
  
  // Imagen por defecto genérica
  return "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop";
}

/** Componente Tarjeta Simple para la sección de invitaciones */
function EventCard({ ev, onMatch }) {
  // Usamos el helper para evitar el error de "Object not valid"
  const categoryName = getCatName(ev.categoria);

  return (
    <div className="rounded-2xl bg-[#d9e6ff] p-4 shadow-sm mb-4">
      <div className="text-sm text-gray-600 capitalize">
        {/* AQUÍ ESTABA EL ERROR: Ahora usamos categoryName */}
        {categoryName || "Sin categoría"} · {ev.nivel || "General"}
      </div>
      <h3 className="text-lg font-semibold mt-1">{ev.nombre_evento || ev.descripcion}</h3>
      <div className="text-sm text-gray-700 mt-2">
        {new Date(ev.inicio).toLocaleString()}{" "}
        {ev.municipio ? "· " + ev.municipio : ""}
      </div>
      <div className="flex justify-end mt-3">
        <button
          className="px-4 py-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
          onClick={() => onMatch(ev)}
        >
          ¡MATCH!
        </button>
      </div>
    </div>
  );
}

/* ===== COMPONENTE PRINCIPAL ===== */
export default function LandingPage() {
  const navigate = useNavigate();

  // sesión
  const [session, setSession] = useState(null);

  // estado de eventos / UI
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // modal de detalles
  const [selected, setSelected] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const handleShowDetails = (ev) => {
    setSelected(ev);
    setOpenDetails(true);
  };

  // modal crear
  const [openCreate, setOpenCreate] = useState(false);

  // cargar sesión + feed
  useEffect(() => {
    let mounted = true;

    async function syncSessionAndLoad() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        const sess = data.session ?? null;
        setSession(sess);

        if (!sess) {
          // Si quieres mostrar eventos públicos aunque no haya sesión, quita este if
          // Pero tu lógica original limpiaba eventos si no hay sesión:
          // setEvents([]); 
          // setLoading(false);
          // return;
        }

        setLoading(true);
        setErr("");

        // Cargar eventos (públicos o privados según tu lógica)
        // Usamos token si existe, si no, fetch normal (si tu API lo permite)
        const headers = sess ? { Authorization: `Bearer ${sess.access_token}` } : {};
        
        const res = await fetch("/api/events/latest", { headers });
        
        if (!res.ok) throw new Error("No se pudo cargar eventos");
        const rows = await res.json();
        
        if (mounted) setEvents(Array.isArray(rows) ? rows : []);
      } catch (e) {
        console.error(e);
        if (mounted) setErr(e?.message || "Error cargando eventos");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    // primera carga
    syncSessionAndLoad();

    // suscripción a cambios de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess);
      syncSessionAndLoad();
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  // filtro por zona (municipio)
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

  // carrusel (máx 3 visibles)
  const PAGE_SIZE = 3;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const [page, setPage] = useState(0);
  
  useEffect(() => setPage(0), [selectedZone, filtered.length]);
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

  async function reloadEvents() {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) return; // O manejar lógica pública
    const res = await fetch("/api/events/latest", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const rows = await res.json();
    setEvents(Array.isArray(rows) ? rows : []);
  }

  async function handleCreated() {
    await reloadEvents();
    setOpenCreate(false);
  }

  async function handleMatch(ev) {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch(`/api/events/${ev.id}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("No se pudo hacer match");
      const { chat_id } = await res.json();
      if (chat_id) {
        navigate(`/chats/${chat_id}`);
      } else {
        navigate(`/chats`);
      }
    } catch (e) {
      console.error(e);
      alert(e?.message || "No se pudo hacer match");
    }
  }

  return (
    <main className="flex-grow p-4 sm:p-10 bg-gray-50">
      {/* Hero */}
      <section className="max-w-4xl mx-auto py-20 px-8 text-center rounded-2xl bg-white shadow-2xl mb-12">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 mb-6">
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

      {/* EVENTOS (Carrusel) */}
      <section className="max-w-7xl mx-auto py-8 px-4 bg-white rounded-2xl shadow-xl">
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

        {/* Estados de carga/error */}
        {err && (
          <div className="p-3 mb-4 rounded bg-red-100 text-red-700">{err}</div>
        )}
        {loading && <div className="text-gray-500 p-6 text-center">Cargando eventos…</div>}

        {/* Carrusel paginado */}
        {!loading && filtered.length > 0 && (
          <div className="relative max-w-7xl mx-auto">
            {totalPages > 1 && (
              <button
                onClick={goPrev}
                className="hidden sm:flex absolute -left-10 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-4 rounded-full shadow-xl hover:bg-gray-700 transition z-10"
              >
                ‹
              </button>
            )}

            <div className="w-full overflow-hidden py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                {pageEvents.map((e) => (
                  <EventReal
                    key={e.id}
                    event={{
                      ...e,
                      // Aseguramos que la imagen se genere bien aunque categoria sea un objeto
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
                className="hidden sm:flex absolute -right-10 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-4 rounded-full shadow-xl hover:bg-gray-700 transition z-10"
              >
                ›
              </button>
            )}

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

        {!loading && filtered.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            No hay eventos para esta zona.
          </p>
        )}
      </section>

      {/* Invitaciones (Lista vertical simple) */}
      <section className="max-w-3xl mx-auto mt-8 px-4">
        <div className="flex items-center justify-between mt-6 mb-3">
          <h2 className="text-lg font-semibold">
            ¡No te pierdas estas invitaciones!
          </h2>
          {session ? (
            <button
              onClick={() => setOpenCreate(true)}
              className="px-4 py-2 rounded-xl bg-[#0e2a5c] text-white font-medium hover:opacity-90 transition"
            >
              + Agregar
            </button>
          ) : (
            <Link to="/login" className="text-blue-600 underline">
              Inicia sesión
            </Link>
          )}
        </div>

        {session ? (
          events.length === 0 ? (
            <div className="text-gray-500">Aún no hay invitaciones.</div>
          ) : (
            // Aquí usamos el EventCard corregido que soporta objetos en categoria
            events.map((ev) => <EventCard key={ev.id} ev={ev} onMatch={handleMatch} />)
          )
        ) : (
          <div className="text-gray-500 p-4 bg-white rounded-lg shadow-sm border">
            Inicia sesión para ver y publicar invitaciones.
          </div>
        )}
      </section>

      {/* Modales */}
      <EventDetailsModal
        isOpen={openDetails}
        onClose={() => setOpenDetails(false)}
        event={selected}
      />

      <CreateEventModal
        open={!!openCreate && !!session}
        onClose={() => setOpenCreate(false)}
        onCreated={handleCreated}
      />
    </main>
  );
}
