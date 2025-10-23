// src/lib/api.js
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
import { supabase } from "./supabase.js";

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

export const chatApi = {
  async listChats() {
    const r = await fetch(`${import.meta.env.VITE_API_URL}/chats`, {
      headers: {
        "Content-Type": "application/json",
        "x-user-id": (await supabase.auth.getUser()).data.user?.id || "" // TEMP: mientras no hay RLS
      }
    });
    if (!r.ok) throw new Error("No se pudo cargar chats");
    return r.json();
  },

  async listMessages(chatId, { limit = 30, before } = {}) {
    const qs = new URLSearchParams({ limit });
    if (before) qs.set("before", before);
    const r = await fetch(`${import.meta.env.VITE_API_URL}/chats/${chatId}/messages?${qs}`, {
      headers: {
        "Content-Type": "application/json",
        "x-user-id": (await supabase.auth.getUser()).data.user?.id || ""
      }
    });
    if (!r.ok) throw new Error("No se pudo cargar mensajes");
    return r.json();
  },

  async sendMessage(chatId, content) {
    const r = await fetch(`${import.meta.env.VITE_API_URL}/chats/${chatId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": (await supabase.auth.getUser()).data.user?.id || ""
      },
      body: JSON.stringify({ content })
    });
    if (!r.ok) throw new Error("No se pudo enviar el mensaje");
    return r.json();
  },

  async createChat({ title, is_group = false, member_ids = [] }) {
    const r = await fetch(`${import.meta.env.VITE_API_URL}/chats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": (await supabase.auth.getUser()).data.user?.id || ""
      },
      body: JSON.stringify({ title, is_group, member_ids })
    });
    if (!r.ok) throw new Error("No se pudo crear el chat");
    return r.json();
  }
};