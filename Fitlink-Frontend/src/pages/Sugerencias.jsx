import React, { useState, useEffect } from 'react';
// Sacamos 'Link' de EventCard, así que ya no se necesita aquí
import { supabase } from '../lib/supabase'; // Solo para autenticación

// --- IMPORTA EL MODAL ---
import EventDetailsModal from '../components/EventDetailsModal';

// --- Etiqueta de Sugerencia ---
function SuggestionBadge({ reason }) {
  // ... (código sin cambios)
  if (!reason) return null;
  const styles = {
    municipio_y_categoria: "bg-green-100 text-green-800",
    municipio: "bg-purple-100 text-purple-800",
    categoria: "bg-yellow-100 text-yellow-800",
  };
  const text = {
    municipio_y_categoria: "En tu municipio e intereses",
    municipio: "En tu municipio",
    categoria: "Coincide con tus intereses",
  };
  return (
    <div className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${styles[reason] || ''} mb-2 inline-block`}>
      {text[reason]}
    </div>
  );
}

// --- Tarjeta de Evento (MODIFICADA) ---
// Ahora acepta 'onClick' en lugar de ser un 'Link'
function EventCard({ event, onClick }) {
  const eventDate = new Date(event.inicio).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    // CAMBIO: De 'Link' a 'div' con 'onClick'
    <div 
      onClick={() => onClick(event)} 
      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 cursor-pointer"
    >
      <div className="p-4">
        <SuggestionBadge reason={event.suggestion_reason} />
        <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full block w-fit">
          {event.categoria ? event.categoria.nombre : 'Sin Categoría'}
        </span>
        <h3 className="text-lg font-bold text-gray-800 mt-3">{event.nombre_evento}</h3>
        <p className="text-sm text-gray-600 mt-1">{event.municipio}</p>
        <p className="text-sm font-bold text-gray-700 mt-2">{eventDate}</p>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{event.descripcion}</p>
      </div>
    </div>
  );
}

// --- Componente Principal de la Página (MODIFICADO) ---
export default function Sugerencias() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- NUEVOS ESTADOS PARA EL MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    // ... (tu lógica de fetchSuggestions no cambia)
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) throw new Error("No estás autenticado.");
        const token = session.access_token;
        const response = await fetch(`${API_URL}/events/suggestions`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || `Error ${response.status}`);
        }
        const data = await response.json();
        setSuggestions(data || []); 
      } catch (err) {
        console.error("Error obteniendo sugerencias:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, [API_URL]);

  // --- NUEVAS FUNCIONES PARA CONTROLAR EL MODAL ---
  const handleOpenModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Un pequeño retraso para la animación de cierre antes de borrar los datos
    setTimeout(() => {
      setSelectedEvent(null);
    }, 300); 
  };

  if (loading) {
    return <div className="p-8 text-center">Buscando eventos... 📅</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }

  return (
    // Añadimos 'relative' si el modal necesita un contexto, aunque 'fixed' lo saca del flujo
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Eventos sugeridos</h1>
      <p className="text-lg text-gray-600 mb-8">
        Eventos que podrían interesarte, ordenados por relevancia para ti.
      </p>

      {suggestions.length === 0 ? (
        <div className="text-center bg-white p-10 rounded-lg shadow">
          {/* ... (mensaje de 'no encontrado' sin cambios) ... */}
          <p className="text-xl text-gray-700">No se encontraron eventos sugeridos.</p>
          <p className="text-gray-500 mt-2">Asegúrate de tener tu municipio e intereses guardados en tu perfil.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {suggestions.map(event => (
            // CAMBIO: Pasamos el handler 'onClick'
            <EventCard key={event.id} event={event} onClick={handleOpenModal} />
          ))}
        </div>
      )}

      {/* --- RENDERIZA EL MODAL AQUÍ --- */}
      <EventDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
      />
    </div>
  );
}