import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./EventDetailsModal.css";

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
    return new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(val);
  } catch {
    return Number(val).toFixed(2);
  }
}

const estadoClass = (estado) => {
  const e = (estado || "").toLowerCase();
  if (e === "activo") return "status-badge status-active";
  if (e === "cancelado") return "status-badge status-cancelled";
  if (e === "finalizado") return "status-badge status-finished";
  return "status-badge status-pending";
};

export default function EventDetailsModal({ isOpen, onClose, event }) {
  // prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = original);
  }, [isOpen]);

  if (!isOpen || !event) return null;

  return (
    <div className="edm-overlay" role="dialog" aria-modal="true">
      <div className="edm-card">
        <div className="edm-header">
          <h2 className="edm-title">{event.nombre_evento || "Evento"}</h2>
          <button className="edm-close" aria-label="Cerrar" onClick={onClose}>×</button>
        </div>

        <div className="edm-divider" />

        <div className="edm-body">
          <div className="edm-row">
            <span className="edm-label">Organizador:&nbsp;</span>
            <span className="edm-value">{event.creador_id ?? "N/A"}</span>
          </div>

          {event.descripcion ? (
            <p className="edm-desc">“{event.descripcion}”.</p>
          ) : null}

          <div className="edm-row">
            <span className="edm-icon" aria-hidden>📍</span>
            <span className="edm-value">{event.municipio || "Ubicación N/A"}</span>
          </div>

          <div className="edm-row">
            <span className="edm-icon" aria-hidden>📅</span>
            <span className="edm-value">{formatDate(event.inicio)}</span>
          </div>

          <div className="edm-row">
            <span className="edm-icon" aria-hidden>🕔</span>
            <span className="edm-value">{formatTime(event.inicio)}</span>
          </div>

          <div className="edm-row">
            <span className="edm-icon" aria-hidden>🎫</span>
            <span className="edm-value">Cupos: {event.cupos ?? "N/A"}</span>
          </div>

          <div className="edm-row">
            <span className="edm-icon" aria-hidden>💲</span>
            <span className="edm-value">{formatMoney(event.precio)}</span>
          </div>

          <div className="edm-row">
            <span className="edm-icon" aria-hidden>🏷️</span>
            <span className="edm-value">{event.categoria || "Sin categoría"}</span>
          </div>

          <div className="edm-row">
            <span className="edm-icon" aria-hidden>ℹ️</span>
            <span className={estadoClass(event.estado)}>{event.estado || "Pendiente"}</span>
          </div>

          {/* espacio para que el botón flotante no tape contenido en mobile */}
          <div style={{ height: 64 }} />
        </div>

        <div className="edm-footer">
          <Link to="/register" className="edm-match-btn">¡Match!</Link>
        </div>
      </div>
    </div>
  );
}
