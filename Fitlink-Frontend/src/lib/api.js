// src/lib/api.js
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function http(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  /** ------------------ EVENTOS --------------------- */
  upcomingEvents(limit = 50) {
    return http(`${API}/api/events/upcoming?limit=${limit}`);
  },

  events(params = {}) {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(
          ([, v]) => v !== undefined && v !== null && `${v}`.length
        )
      )
    );
    const url = qs.toString()
      ? `${API}/api/events?${qs}`
      : `${API}/api/events`;
    return http(url);
  },

  stats() {
    return http(`${API}/api/stats`).catch(() => ({
      usuarios: 0,
      categorias: 0,
      eventosProximos: 0,
    }));
  },

  /** ------------------ NOTIFICACIONES --------------------- */

  /** Obtener notificaciones del usuario */
  getNotifications(email) {
    return http(`${API}/api/notificaciones/${email}`);
  },

  /** Marcar una notificación como leída */
  markAsRead(id) {
    return http(`${API}/api/notificaciones/leer/${id}`, {
      method: "POST",
    });
  },

  /** Obtener preferencias del usuario */
  getNotificationPreferences(email) {
    return http(`${API}/api/notificaciones/preferencias/${email}`);
  },

  /** Guardar preferencias del usuario */
  saveNotificationPreferences(email, prefs) {
    return http(`${API}/api/notificaciones/preferencias/${email}`, {
      method: "POST",
      body: JSON.stringify(prefs),
    });
  },
};
