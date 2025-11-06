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

export const api = {
  stats,
  upcomingEvents,
  searchEvents,
  listUsers,
};

export default api;
