import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase'; // Solo para autenticación
import EventDetailsModal from '../components/EventDetailsModal';
import { Link } from 'react-router-dom'; // Importar Link para el perfil de usuario

// --- Insignia de Sugerencia de Evento ---
function EventSuggestionBadge({ reason }) {
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

// --- Tarjeta de Evento ---
function EventCard({ event, onClick }) {
  const eventDate = new Date(event.inicio).toLocaleString('es-ES', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
  });
  return (
    <div 
      onClick={() => onClick(event)} 
      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 cursor-pointer"
    >
      <div className="p-4">
        <EventSuggestionBadge reason={event.suggestion_reason} />
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

// --- NUEVO: Insignia de Sugerencia de Usuario ---
function UserSuggestionBadge({ reason }) {
  if (!reason) return null;
  const styles = {
    municipio_y_habilidad: "bg-green-100 text-green-800",
    municipio_y_categoria: "bg-blue-100 text-blue-800",
    municipio: "bg-purple-100 text-purple-800",
    habilidad: "bg-yellow-100 text-yellow-800",
  };
  const text = {
    municipio_y_habilidad: "Mismo municipio y habilidad",
    municipio_y_categoria: "Mismo municipio e interés",
    municipio: "Mismo municipio",
    habilidad: "Misma habilidad",
  };
  return (
    <div className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${styles[reason] || ''} mb-2 inline-block`}>
      {text[reason]}
    </div>
  );
}

// --- NUEVO: Tarjeta de Usuario ---
function UserCard({ user }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // cerrar menú si se hace click fuera
  useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 cursor-default" // Cambiado a cursor-default
    >
      {/* Botón de 3 puntos en esquina superior derecha */}
      <div className="relative">
        <div className="absolute right-2 top-2" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Opciones"
          >
            {/* Icono 3 puntos verticales */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="5" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="19" r="1.5" fill="currentColor" />
            </svg>
          </button>

          {menuOpen && (
            <div className="mt-2 w-44 bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5">
              <button
                className="w-full text-left px-4 py-3 hover:bg-gray-50"
                onClick={() => {
                  // emitir evento personalizado para que el padre muestre modal
                  const ev = new CustomEvent('open-report-modal', { detail: { user } });
                  window.dispatchEvent(ev);
                  setMenuOpen(false);
                }}
              >
                Reportar usuario
              </button>
            </div>
          )}
        </div>
      </div>
      <img 
        src={user.foto_url || `https://ui-avatars.com/api/?name=${user.nombre}&background=random`} 
        alt={`Foto de ${user.nombre}`}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <UserSuggestionBadge reason={user.suggestion_reason} />
        <h3 className="text-lg font-bold text-gray-800">{user.nombre}</h3>
        <p className="text-sm text-gray-600">{user.municipio}</p>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{user.biografia}</p>
      </div>
    </div>
  );
}

// --- Componente Principal de la Página (MODIFICADO) ---
export default function Sugerencias() {
  // Estados separados para cada tipo de sugerencia
  const [eventSuggestions, setEventSuggestions] = useState([]);
  const [userSuggestions, setUserSuggestions] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados del Modal (sin cambios)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  // --- Estados para reportes de usuario ---
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportedUser, setReportedUser] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('Usuario reportado');
  const [confirmationType, setConfirmationType] = useState('success'); // 'success' | 'info' | 'error'

  useEffect(() => {
    function handleOpen(e) {
      const { user } = e.detail || {};
      setReportedUser(user);
      setReportReason("");
      setShowReportModal(true);
    }
    window.addEventListener('open-report-modal', handleOpen);
    return () => window.removeEventListener('open-report-modal', handleOpen);
  }, []);

  const closeReportModal = () => {
    setShowReportModal(false);
    setReportedUser(null);
    setReportReason("");
  };

  const handleConfirmReport = async () => {
    if (!reportedUser) return;
    if (!reportReason || reportReason.trim().length === 0) return;
    setSubmittingReport(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) throw new Error('No estás autenticado.');
      const token = session.access_token;

      const payload = {
        reported_id: reportedUser.id,
        reason: reportReason.trim().slice(0, 50),
      };

      // Mostrar en consola los ids solicitados: quien reporta y quien es reportado
      const reporterId = session.user?.id || null;
      console.log('Reportando usuario - reporter_id:', reporterId, 'reported_id:', payload.reported_id);

      const res = await fetch(`${API_URL}/reports/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      // Manejo de respuestas específicas
      if (res.status === 409) {
        // Ya reportado por este usuario
        let body = {};
        try { body = await res.json(); } catch (e) { /* ignore */ }
        const msg = body?.message || 'Ya reportaste este usuario';
        setConfirmationMessage(msg);
        setConfirmationType('info');
        setShowConfirmation(true);
        closeReportModal();
        setTimeout(() => setShowConfirmation(false), 2500);
        return;
      }

      if (!res.ok) {
        // Otros errores: mostrar toast de error
        let text = 'Error al enviar el reporte';
        try { text = await res.text(); } catch (e) { /* ignore */ }
        setConfirmationMessage(text || 'No se pudo enviar el reporte. Intenta de nuevo.');
        setConfirmationType('error');
        setShowConfirmation(true);
        closeReportModal();
        setTimeout(() => setShowConfirmation(false), 3000);
        return;
      }

      // Éxito
      const respJson = await res.json();
      setConfirmationMessage('Usuario reportado');
      setConfirmationType('success');
      setShowConfirmation(true);
      closeReportModal();
      setTimeout(() => setShowConfirmation(false), 2000);
      console.log('Reporte enviado:', respJson);

    } catch (err) {
      console.error('Error reportando usuario:', err);
      alert('No se pudo enviar el reporte. Intenta de nuevo.');
    } finally {
      setSubmittingReport(false);
    }
  };

  useEffect(() => {
    const loadAllSuggestions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Get Token
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) throw new Error("No estás autenticado.");
        const token = session.access_token;

        // 2. Setup Fetch options
        const fetchOptions = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };

        // 3. Fetch ambos en paralelo
        const [eventsRes, usersRes] = await Promise.all([
          fetch(`${API_URL}/events/suggestions`, fetchOptions),
          fetch(`${API_URL}/users/suggestions`, fetchOptions) // Nuevo endpoint
        ]);

        // 4. Procesar Eventos
        if (eventsRes.ok) {
          const eventData = await eventsRes.json();
          setEventSuggestions(eventData || []);
        } else {
          console.error("Error fetching events", await eventsRes.text());
        }

        // 5. Procesar Usuarios
        if (usersRes.ok) {
          const userData = await usersRes.json();
          setUserSuggestions(userData || []);
        } else {
          console.error("Error fetching users", await usersRes.text());
        }

      } catch (err) {
        console.error("Error cargando sugerencias:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAllSuggestions();
  }, [API_URL]);

  // Funciones del Modal (sin cambios)
  const handleOpenModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => { setSelectedEvent(null); }, 300); 
  };

  if (loading) {
    return <div className="p-8 text-center">Buscando sugerencias... 🔎</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* --- SECCIÓN 1: EVENTOS SUGERIDOS --- */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Eventos sugeridos</h1>
      <p className="text-lg text-gray-600 mb-8">
        Eventos que podrían interesarte, ordenados por relevancia para ti.
      </p>

      {eventSuggestions.length === 0 ? (
        <div className="text-center bg-white p-10 rounded-lg shadow mb-12">
          <p className="text-xl text-gray-700">No se encontraron eventos sugeridos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {eventSuggestions.map(event => (
            <EventCard key={event.id} event={event} onClick={handleOpenModal} />
          ))}
        </div>
      )}

      {/* --- SECCIÓN 2: USUARIOS SUGERIDOS --- */}
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Usuarios sugeridos</h2>
      <p className="text-lg text-gray-600 mb-8">
        Compañeros para entrenar que comparten tus intereses y están cerca de ti.
      </p>

      {userSuggestions.length === 0 ? (
        <div className="text-center bg-white p-10 rounded-lg shadow">
          <p className="text-xl text-gray-700">No se encontraron usuarios sugeridos.</p>
          <p className="text-gray-500 mt-2">Asegúrate de tener tu municipio, categorías y niveles guardados en tu perfil.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {userSuggestions.map(user => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}

      {/* Modal de reporte */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black opacity-40" onClick={closeReportModal}></div>
          <div className="relative w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 z-10">
            <h3 className="text-lg font-semibold mb-2">Reportar usuario</h3>
            <p className="text-sm text-gray-600 mb-4">Indica brevemente el motivo (máx. 50 caracteres)</p>
            <input
              className="w-full border rounded-md px-3 py-2 mb-4"
              placeholder="Motivo del reporte"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value.slice(0,50))}
              maxLength={50}
            />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded-md bg-gray-200" onClick={closeReportModal} disabled={submittingReport}>Cancelar</button>
              <button
                className="px-4 py-2 rounded-md bg-red-600 text-white"
                onClick={handleConfirmReport}
                disabled={submittingReport || reportReason.trim().length === 0}
              >
                {submittingReport ? 'Enviando...' : 'Confirmar reporte'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación breve (toast responsivo) */}
      {showConfirmation && (
        <div className="fixed z-50 bottom-6 left-1/2 transform -translate-x-1/2 md:left-auto md:right-6 pointer-events-none">
          <div className="pointer-events-auto">
            <div className={`flex items-center px-4 py-2 rounded-full shadow-md max-w-xs ${confirmationType === 'success' ? 'bg-green-50 border border-green-200 text-green-900' : ''} ${confirmationType === 'info' ? 'bg-yellow-50 border border-yellow-200 text-yellow-900' : ''} ${confirmationType === 'error' ? 'bg-red-50 border border-red-200 text-red-900' : ''}`}>
              <span className="mr-3 text-2xl">
                {confirmationType === 'success' && '✅'}
                {confirmationType === 'info' && '⚠️'}
                {confirmationType === 'error' && '❌'}
              </span>
              <div className="text-sm font-medium">{confirmationMessage}</div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL (sin cambios) --- */}
      <EventDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
      />
    </div>
  );
}