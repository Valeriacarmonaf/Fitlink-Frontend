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
  /** Próximos eventos (para Landing / carrusel) */
  upcomingEvents(limit = 50) {
    return http(`${API}/api/events/upcoming?limit=${limit}`);
  },

  /** Listado general con filtros opcionales (por si lo necesitas) */
  events(params = {}) {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && `${v}`.length)
      )
    );
    const url = qs.toString() ? `${API}/api/events?${qs}` : `${API}/api/events`;
    return http(url);
  },

  /** KPIs del dashboard (si tu backend lo expone; si no, bórralo donde lo uses) */
  stats() {
    return http(`${API}/api/stats`).catch(() => ({ usuarios: 0, categorias: 0, eventosProximos: 0 }));
  },
};
