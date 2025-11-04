import React, { useEffect } from "react";
import { Link } from "react-router-dom";
// Ya no necesitamos importar el CSS
// import "./EventDetailsModal.css";

// --- Helper Functions (sin cambios) ---
function formatDate(ts) {
  if (!ts) return "N/A";
  const d = new Date(ts);
  return d.toLocaleDateString("es-VE", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function formatTime(ts) {
  if (!ts) return "N/A";
  const d = new Date(ts);
  return d.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" });
}
function formatMoney(val) {
  if (val === null || val === undefined) return "N/A";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(val);
  } catch {
    return Number(val).toFixed(2);
  }
}

// --- Helper Function (Actualizada a Tailwind) ---
const estadoClass = (estado) => {
  const e = (estado || "").toLowerCase();
  // Clases base de Tailwind para todas las insignias
  const baseClasses = "inline-flex items-center justify-center px-2.5 py-1 rounded-full font-bold text-sm border";

  if (e === "activo") return `${baseClasses} bg-green-100 text-green-700 border-green-300`;
  if (e === "cancelado") return `${baseClasses} bg-red-100 text-red-600 border-red-300`;
  if (e === "finalizado") return `${baseClasses} bg-indigo-100 text-indigo-700 border-indigo-300`;
  // Default a pendiente
  return `${baseClasses} bg-orange-100 text-orange-600 border-orange-300`;
};

export default function EventDetailsModal({ isOpen, onClose, event }) {
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = original);
  }, [isOpen]);

  if (!isOpen || !event) return null;

  return (
    // Overlay: Traducido de .edm-overlay
    <div
      className="fixed inset-0 bg-black/55 backdrop-blur-[2px] grid place-items-center z-50 p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Card: Traducido de .edm-card y media query */}
      <div className="relative w-[92vw] max-w-xl bg-white rounded-[18px] shadow-[0_10px_35px_rgba(0,0,0,.25)] p-[18px] pb-20 sm:pb-6">
        
        {/* Header: Traducido de .edm-header, .edm-title, .edm-close */}
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[clamp(1.1rem,2.8vw,1.6rem)] font-extrabold">
            {event.nombre_evento || "Evento"}
          </h2>
          <button
            className="text-[1.6rem] leading-none border-0 bg-transparent cursor-pointer text-gray-600 font-bold hover:text-gray-900 hover:scale-105"
            aria-label="Cerrar"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Divider: Traducido de .edm-divider */}
        <div className="h-1 bg-blue-700 opacity-80 rounded mt-2 mb-3" />

        {/* Body: Traducido de .edm-body, .edm-row, etc. */}
        <div className="text-[clamp(.95rem,2.4vw,1.05rem)] text-gray-800 max-h-[60vh] overflow-y-auto">
          <div className="flex items-start gap-2 my-2">
            <span className="font-bold">Organizador:</span>
            <span className="break-words">{event.creador_id ? event.creador_id.split('-')[0] : "N/A"}</span>
          </div>

          {event.descripcion ? (
            <p className="my-[10px] mb-3 leading-snug">“{event.descripcion}”.</p>
          ) : null}

          <div className="flex items-start gap-2 my-2">
            <span aria-hidden>📍</span>
            <span className="break-words">{event.municipio || "Ubicación N/A"}</span>
          </div>

          <div className="flex items-start gap-2 my-2">
            <span aria-hidden>📅</span>
            <span className="break-words">{formatDate(event.inicio)}</span>
          </div>

          <div className="flex items-start gap-2 my-2">
            <span aria-hidden>🕔</span>
            <span className="break-words">{formatTime(event.inicio)}</span>
          </div>

          <div className="flex items-start gap-2 my-2">
            <span aria-hidden>🎫</span>
            <span className="break-words">Cupos: {event.cupos ?? "N/A"}</span>
          </div>

          <div className="flex items-start gap-2 my-2">
            <span aria-hidden>💲</span>
            <span className="break-words">{formatMoney(event.precio)}</span>
          </div>

          <div className="flex items-start gap-2 my-2">
            <span aria-hidden>🏷️</span>
            <span className="break-words">{event.categoria ? event.categoria.nombre : "Sin categoría"}</span>
          </div>

          <div className="flex items-start gap-2 my-2">
            <span aria-hidden>ℹ️</span>
            <span className={estadoClass(event.estado)}>
              {event.estado || "Pendiente"}
            </span>
          </div>
        </div>

        {/* Footer: Traducido de .edm-footer, .edm-match-btn y media query */}
        <div className="static mt-3 sm:absolute sm:right-4 sm:bottom-4 sm:mt-0">
          <Link
            to="/register"
            className="inline-block w-full text-center sm:w-auto px-4 py-2.5 bg-green-500 text-white font-extrabold rounded-full shadow-[0_6px_16px_rgba(34,197,94,.35)] no-underline hover:brightness-95 hover:-translate-y-px transition-all"
          >
            ¡Match!
          </Link>
        </div>
      </div>
    </div>
  );
}