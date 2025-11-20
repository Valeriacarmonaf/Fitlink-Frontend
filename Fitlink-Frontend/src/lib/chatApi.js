// src/api/chatApi.js
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// Helper común para fetch JSON
async function httpJSON(url, { method = "GET", accessToken, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`${method} ${url} -> ${res.status} ${txt}`);
  }
  return res.json();
}

// === CHATS ===
export function listMyChats(accessToken) {
  return httpJSON(`${API_URL}/api/chats`, { accessToken });
}

export function getMessages(chatId, { accessToken, limit = 30, before } = {}) {
  const qs = new URLSearchParams();
  if (limit) qs.set("limit", String(limit));
  if (before) qs.set("before", before);
  return httpJSON(`${API_URL}/api/chats/${chatId}/messages?${qs.toString()}`, {
    accessToken,
  });
}

export function sendMessage(chatId, content, accessToken) {
  return httpJSON(`${API_URL}/api/chats/${chatId}/messages`, {
    method: "POST",
    accessToken,
    body: { content },
  });
}

// === EVENTS ===  👇 nuevo: para "Inscribirme e ir al chat"
export function joinEvent(eventId, accessToken) {
  return httpJSON(`${API_URL}/api/events/${eventId}/join`, {
    method: "POST",
    accessToken,
  });
}
