// src/lib/api.js

const API_URL = import.meta.env.VITE_API_URL; // viene de tu archivo .env

// Función auxiliar para peticiones GET
async function getJSON(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${await res.text()}`);
  return res.json();
}

// API del backend
export const api = {
  stats: () => getJSON("/stats"),
  upcomingEvents: (limit = 20) => getJSON(`/events/upcoming?limit=${limit}`),

  users: {
    list: () => getJSON("/users"),
    update: async (id, payload) => {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} - ${await res.text()}`);
      return res.json();
    },

    remove: async (id) => {
      const res = await fetch(`${API_URL}/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status} - ${await res.text()}`);
      return res.json();
    },
  },
};
