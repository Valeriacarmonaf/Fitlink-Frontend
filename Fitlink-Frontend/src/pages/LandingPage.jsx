// src/pages/LandingPage.jsx
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import EventReal from '../components/EventReal';
import EventDetailsModal from '../components/EventDetailsModal';
import events from '../data/eventsDataDummy';

const PrimaryButtonClasses =
  "inline-block px-10 py-4 text-lg bg-indigo-600 text-white font-bold rounded-xl shadow-xl hover:bg-indigo-700 transition duration-300 transform hover:scale-[1.02]";

const SCROLL_AMOUNT = 352;     // Ancho exacto de una tarjeta (w-80 + márgenes)
const SCROLL_DURATION = 300;   // ms

// Mapea el dummy a la forma que espera el modal (nombres de BD)
function toDbEvent(dummy) {
  return {
    // campos de tu BD
    id: dummy.id,
    nombre_evento: dummy.title,
    creador_id: dummy.creador_id ?? "N/A",
    categoria: dummy.categoria ?? "General",
    descripcion: dummy.description,
    inicio: dummy.inicio ?? null,
    fin: dummy.fin ?? null,
    cupos: dummy.cupos ?? null,
    municipio: dummy.zona,
    precio: dummy.precio ?? null,
    estado: dummy.estado ?? "Activo",
    // opcional, para la tarjeta
    imageUrl: dummy.imageUrl,
  };
}

const LandingPage = () => {
  const scrollContainerRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // Estado del modal
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const handleShowDetails = (ev) => { setSelected(ev); setOpen(true); };

  // --- Filtro por zona ---
  const [selectedZone, setSelectedZone] = useState('Todas');
  const zones = useMemo(() => {
    const unique = new Set(events.map(e => e.zona).filter(Boolean));
    return ['Todas', ...Array.from(unique).sort()];
  }, []);

  const filtered = useMemo(() => {
    return selectedZone === 'Todas'
      ? events
      : events.filter(e => e.zona === selectedZone);
  }, [selectedZone]);

  // Usamos carrusel cuando hay 3+ eventos. Si hay 0,1,2 mostramos grilla responsiva.
  const useCarousel = filtered.length >= 3;

  // Clonado de extremos para loop infinito SOLO si hay carrusel
  const visibleEvents = useMemo(() => {
    if (!useCarousel) return filtered;
    return [
      ...filtered.slice(-2).map(e => ({ ...e, id: `${e.id}-clone-last` })),
      ...filtered,
      ...filtered.slice(0, 2).map(e => ({ ...e, id: `${e.id}-clone-first` })),
    ];
  }, [filtered, useCarousel]);

  // Límites de teletransporte (dependen del tamaño del filtro actual)
  const bounds = useMemo(() => {
    const len = filtered.length;
    return {
      SNAP_TO_START_POS: SCROLL_AMOUNT * 2,
      SNAP_TO_END_POS: SCROLL_AMOUNT * (len + 1),
      BOUNDARY_RIGHT: SCROLL_AMOUNT * (len + 2) - 1,
      BOUNDARY_LEFT: 1
    };
  }, [filtered.length]);

  // Al cambiar el filtro, reseteamos la posición del carrusel
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollLeft = useCarousel ? SCROLL_AMOUNT * 2 : 0;
  }, [useCarousel, selectedZone]);

  const scroll = (direction) => {
    if (!useCarousel) return;

    const container = scrollContainerRef.current;
    if (!container || isScrolling) return;

    setIsScrolling(true);
    const start = container.scrollLeft;
    const end = direction === 'left' ? start - SCROLL_AMOUNT : start + SCROLL_AMOUNT;

    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = ts - startTime;
      const pct = Math.min(progress / SCROLL_DURATION, 1);
      const eased = pct < 0.5 ? 2 * pct * pct : 1 - Math.pow(-2 * pct + 2, 2) / 2;
      container.scrollLeft = start + (end - start) * eased;

      if (progress < SCROLL_DURATION) {
        requestAnimationFrame(step);
      } else {
        const finalScroll = container.scrollLeft;

        if (finalScroll >= bounds.BOUNDARY_RIGHT) {
          container.scrollLeft = bounds.SNAP_TO_START_POS; // vuelve al primer real
        } else if (finalScroll <= bounds.BOUNDARY_LEFT) {
          container.scrollLeft = bounds.SNAP_TO_END_POS;   // salta al último real
        }

        setIsScrolling(false);
      }
    };

    requestAnimationFrame(step);
  };

  return (
    <main className="flex-grow p-10 bg-gray-50">
      <section className="max-w-4xl mx-auto py-20 px-8 text-center rounded-2xl bg-white shadow-2xl mb-12">
        <h1 className="text-6xl font-extrabold text-gray-900 mb-6">Bienvenido a FitLink</h1>
        <p className="text-xl text-gray-600 mb-10">
          Conecta con personas para entrenar, correr o jugar en equipo.
        </p>
        <Link to="/dashboard" className={PrimaryButtonClasses}>
          Ir al Panel de Control
        </Link>
      </section>

      <section className="max-w-6xl mx-auto py-8 px-4 bg-white rounded-2xl shadow-xl">
        {/* Título + Filtro responsive */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-4xl font-bold text-gray-800 text-center sm:text-left">Próximos Eventos</h2>

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
              {zones.map(z => (
                <option key={z} value={z}>{z === 'Todas' ? 'Todas las zonas' : z}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de eventos filtrados */}
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-10">No hay eventos para esta zona.</p>
        )}

        {/* Si hay 1 o 2, muestro grilla responsive */}
        {filtered.length > 0 && !useCarousel && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-center">
            {filtered.map((e) => {
              const ev = toDbEvent(e);
              return (
                <EventReal
                  key={ev.id}
                  event={ev}
                  onShowDetails={handleShowDetails}
                />
              );
            })}
          </div>
        )}

        {/* Si hay 3 o más, muestro carrusel infinito */}
        {useCarousel && (
          <div className="relative">
            <button
              onClick={() => scroll('left')}
              className={`absolute left-0 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 focus:outline-none z-20 ${isScrolling ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Scroll left"
              disabled={isScrolling}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="w-[352px] mx-auto overflow-hidden">
              <div ref={scrollContainerRef} className="flex overflow-x-auto hide-scrollbar p-4">
                {visibleEvents.map((e, index) => {
                  const ev = toDbEvent(e);
                  return (
                    <EventReal
                      key={ev.id + '-' + index}
                      event={ev}
                      onShowDetails={handleShowDetails}
                    />
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => scroll('right')}
              className={`absolute right-0 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 focus:outline-none z-20 ${isScrolling ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Scroll right"
              disabled={isScrolling}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </section>

      {/* Modal único */}
      <EventDetailsModal
        isOpen={open}
        onClose={() => setOpen(false)}
        event={selected}
      />
    </main>
  );
};

export default LandingPage;
