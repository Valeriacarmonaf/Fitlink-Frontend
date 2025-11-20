// src/lib/api.js
const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

// Helper HTTP JSON
async function httpJSON(path, { method = "GET", token, body, qs } = {}) {
  const url = new URL(
    path.startsWith("http") ? path : `${API_URL}${path}`
  );
  if (qs && typeof qs === "object") {
    Object.entries(qs).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    });
  }

  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${method} ${url} -> ${res.status} ${text}`);
  }
  // Algunos endpoints devuelven vacío (204); intenta parsear JSON y si falla, retorna {}
  try {
    return await res.json();
  } catch {
    return {};
  }
}

// ===== ENDPOINTS =====
async function stats() {
  // IMPORTANTE: tu backend expone /api/stats (no /stats a secas)
  return httpJSON("/api/stats");
}

async function upcomingEvents(limit = 100) {
  return httpJSON("/api/events/upcoming", { qs: { limit } });
}

async function searchEvents({ q = "", categorias = "", lugares = "", limit = 100 } = {}) {
  // Si tienes un endpoint de búsqueda dedicado, apúntalo aquí.
  // Mientras tanto, podrías reutilizar /api/events/upcoming y filtrar en el front.
  return httpJSON("/api/events/upcoming", { qs: { limit } });
}

async function listUsers() {
  return httpJSON("/users"); // ya tienes este endpoint en FastAPI
}

async  function successEventsList(token) {
    const res = await fetch(`${API}/api/success-events`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `HTTP ${res.status}`);
    }
    return res.json();
  }

  
async function successEventsCreate({ titulo, descripcion, fecha, municipio, files = [] }, token) {
    const fd = new FormData();
    fd.append("titulo", titulo);
    fd.append("descripcion", descripcion);
    fd.append("fecha", fecha);        // mm/dd/yyyy
    fd.append("municipio", municipio);
    (files || []).forEach((f) => fd.append("files", f));

    const res = await fetch(`${API}/api/success-events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
    
      },
      body: fd,
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
    
  listUsers,
    
  /** Guardar preferencias del usuario */
  saveNotificationPreferences(email, prefs) {
    return http(`${API}/api/notificaciones/preferencias/${email}`, {
      method: "POST",
      body: JSON.stringify(prefs),
    });
  },
};

export default api;
