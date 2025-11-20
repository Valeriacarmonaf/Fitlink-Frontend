// src/lib/api.js
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function http(url, options = {}) {
  const token = localStorage.getItem("sb-access-token");

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
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
      eventosProximos: 0
    }));
  },

  // ---------------- NOTIFICACIONES ----------------
  getNotifications() {
    return http(`${API}/notificaciones`);
  },

  markAsRead(id) {
    return http(`${API}/notificaciones/${id}/leer`, {
      method: "PUT"
    });
  },

  getNotificationPreferences() {
    return http(`${API}/notificaciones/preferencias`);
  },

  saveNotificationPreferences(prefs) {
    return http(`${API}/notificaciones/preferencias`, {
      method: "PUT",
      body: JSON.stringify(prefs)
    });
  }
};
