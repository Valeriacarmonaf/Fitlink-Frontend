// src/pages/LandingPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import EventReal from "../components/EventReal";
import EventDetailsModal from "../components/EventDetailsModal";
import CreateEventModal from "../components/CreateEventModal";

const PrimaryButtonClasses =
  "inline-block px-10 py-4 text-lg bg-indigo-600 text-white font-bold rounded-xl shadow-xl hover:bg-indigo-700 transition duration-300 transform hover:scale-[1.02]";

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
      return null;
  }
}

function getEventImage(ev) {
  if (!ev || typeof ev !== "object") return "/img/placeholder-event.jpg";

  const direct =
    ev.portada_url ||
    ev.banner_url ||
    ev.image_url ||
    ev.imagen_url ||
    ev.cover_url ||
    ev.foto_url;

  if (direct) return direct;

  const byCat =
    imageByCategory(ev.categoria) ||
    imageByCategory(ev.category) ||
    imageByCategory(ev?.categoria?.nombre) ||
    imageByCategory(ev?.category?.name);

  if (byCat) return byCat;

  return "/img/placeholder-event.jpg";
}

function EventCard({ ev, onMatch }) {
  return (
    <div className="rounded-2xl bg-[#d9e6ff] p-4 shadow-sm mb-4">
      <div className="text-sm text-gray-600">
        {ev.categoria} · {ev.nivel}
      </div>
      <h3 className="text-lg font-semibold mt-1">{ev.descripcion}</h3>
      <div className="text-sm text-gray-700 mt-2">
        {new Date(ev.inicio).toLocaleString()}{" "}
        {ev.municipio ? "· Municipio " + ev.municipio : ""}
      </div>
      <div className="flex justify-end mt-3">
        <button
          className="px-4 py-2 rounded-xl bg-blue-500 text-white"
          onClick={() => onMatch(ev)}
        >
          ¡MATCH!
        </button>
      </div>
    </div>
  );
}

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
          setEvents([]);
          setLoading(false);
          return;
        }

        setLoading(true);
        setErr("");

        const token = sess.access_token;
        const res = await fetch("/api/events/latest", {
          headers: { Authorization: `Bearer ${token}` },
        });
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
      // recarga feed al entrar/salir
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
    if (!token) return;
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

      // usa tu endpoint join del backend: POST /api/events/{id}/join
      const res = await fetch(`/api/events/${ev.id}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("No se pudo hacer match");
      const { chat_id } = await res.json(); // tu backend devuelve {"ok":true,"event_id":...,"chat_id":...}
      if (chat_id) {
        // aquí podrías mostrar tu modal "match" y luego:
        navigate(`/chats/${chat_id}`);
      } else {
        // fallback si la respuesta no trae chat_id
        navigate(`/chats`);
      }
    } catch (e) {
      console.error(e);
      alert(e?.message || "No se pudo hacer match");
    }
  }

  return (
    <main className="flex-grow p-10 bg-gray-50">
      {/* Hero */}
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

      {/* Próximos eventos: filtro + carrusel */}
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

        {/* Estados */}
        {err && (
          <div className="p-3 mb-4 rounded bg-red-100 text-red-700">{err}</div>
        )}
        {loading && <div className="text-gray-500 p-6">Cargando eventos…</div>}

        {/* Carrusel paginado */}
        {!loading && filtered.length > 0 && (
          <div className="relative max-w-7xl mx-auto">
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

            <div className="w-full overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center transition-all duration-300">
                {pageEvents.map((e) => (
                  <EventReal
                    key={e.id}
                    event={{ ...e, imageUrl: getEventImage(e) }}
                    onShowDetails={handleShowDetails}
                  />
                ))}
              </div>
            </div>

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

      {/* Sección de invitaciones + botón + modal */}
      <section className="max-w-3xl mx-auto mt-8 px-4">
        <div className="flex items-center justify-between mt-6 mb-3">
          <h2 className="text-lg font-semibold">
            ¡No te pierdas estas invitaciones!
          </h2>
          {session ? (
            <button
              onClick={() => setOpenCreate(true)}
              className="px-4 py-2 rounded-xl bg-[#0e2a5c] text-white"
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
            events.map((ev) => <EventCard key={ev.id} ev={ev} onMatch={handleMatch} />)
          )
        ) : (
          <div className="text-gray-500">
            Inicia sesión para ver y publicar invitaciones.
          </div>
        )}
      </section>

      {/* Modal de detalles */}
      <EventDetailsModal
        isOpen={openDetails}
        onClose={() => setOpenDetails(false)}
        event={selected}
      />

      {/* Modal crear evento */}
      <CreateEventModal
        open={!!openCreate && !!session}
         onClose={() => setOpenCreate(false)}
         onCreated={handleCreated}
      />

    </main>
  );
}
