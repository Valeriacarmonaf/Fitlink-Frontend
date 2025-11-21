// src/lib/api.js

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
// Renombramos para consistencia si se usa en línea.
const API = API_URL; 

/**
 * Helper HTTP JSON
 * Realiza una solicitud fetch y maneja cabeceras de Content-Type, Authorization, 
 * Query Strings, y la gestión de errores HTTP.
 */
async function httpJSON(path, { method = "GET", token, body, qs } = {}) {
 const url = new URL(
  path.startsWith("http") ? path : `${API_URL}${path}`
 );
 
 // 1. Construir Query String (parámetros URL)
 if (qs && typeof qs === "object") {
  Object.entries(qs).forEach(([k, v]) => {
   if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  });
 }

 // 2. Cabeceras
 const headers = { "Content-Type": "application/json" };
 if (token) headers.Authorization = `Bearer ${token}`; // <-- Agrega el token de autorización

 // 3. Petición fetch
 const res = await fetch(url.toString(), {
  method,
  headers,
  // Serializar el cuerpo solo si existe
  body: body ? JSON.stringify(body) : undefined,
 });

 // 4. Manejo de errores
 if (!res.ok) {
  const text = await res.text().catch(() => "");
  // Lanza un error detallado incluyendo el status y la respuesta del servidor
  throw new Error(`${method} ${url} -> ${res.status} ${text}`);
 }
 
 // 5. Intento de parseo de JSON (maneja respuestas 204 No Content)
 try {
  return await res.json();
 } catch {
  return {}; // Retorna objeto vacío si no hay JSON
 }
}

// ===== ENDPOINTS PRIVADOS (Requieren token) =====

/** Obtiene KPIs/Estadísticas del backend. */
async function stats(token) {
 return httpJSON("/api/stats", { token }); // Pasa el token
}

/** Obtiene eventos próximos. */
async function upcomingEvents(limit = 100, token) {
 return httpJSON("/api/events/upcoming", { qs: { limit }, token }); // Pasa el token
}

/** Busca eventos (actualmente llama al endpoint de próximos eventos). */
async function searchEvents({ q = "", categorias = "", lugares = "", limit = 100 }, token) {
 // Pasa todos los filtros y el token
 return httpJSON("/api/events/upcoming", { qs: { limit, q, categorias, lugares }, token });
}

/** Obtiene lista de eventos de éxito. */
async function successEventsList(token) {
 return httpJSON("/api/success-events", { token });
}

/** Crea un evento de éxito con archivos adjuntos. */
async function successEventsCreate({ titulo, descripcion, fecha, municipio, files = [] }, token) {
  const fd = new FormData();
  fd.append("titulo", titulo);
  fd.append("descripcion", descripcion);
  fd.append("fecha", fecha); 
  fd.append("municipio", municipio);
  (files || []).forEach((f) => fd.append("files", f));

  // Usamos fetch directo, ya que FormData requiere que Content-Type NO sea 'application/json'
  const res = await fetch(`${API_URL}/api/success-events`, {
   method: "POST",
   headers: {
    Authorization: `Bearer ${token}`, // Pasa el token
   },
   body: fd,
  });
  if (!res.ok) {
   const txt = await res.text().catch(() => "");
   throw new Error(txt || `HTTP ${res.status}`);
  }
  return res.json();
}

// ===== ENDPOINTS PÚBLICOS o de Entidad (No requieren token por defecto) =====

/** Obtiene lista general de usuarios. */
async function listUsers() {
 return httpJSON("/users"); 
}


// -------------------------------------------------------------
// EXPORTACIÓN FINAL
// -------------------------------------------------------------

export const api = {
 /** ------------------ EVENTOS --------------------- */
 // AHORA: Aceptan el token del llamador (Dashboard.jsx)
 upcomingEvents(limit = 50, token) {
  return upcomingEvents(limit, token);
 },

 // Acepta un objeto de parámetros para el Query String
 events(params = {}, token) {
  return httpJSON("/api/events", { qs: params, token });
 },

 // Acepta el token
 stats(token) {
  return stats(token).catch(() => ({
   usuarios: 0,
   categorias: 0,
   eventosProximos: 0,
  }));
 },

 /** ------------------ NOTIFICACIONES --------------------- */

 // Estos endpoints están expuestos sin token, o bien, el token debe ser incluido manualmente 
 // por el llamador si son privados. Por defecto, no paso token.

 /** Obtener notificaciones del usuario */
 getNotifications(email, token) {
  return httpJSON(`/api/notificaciones/${email}`, { token });
 },

 /** Marcar una notificación como leída */
 markAsRead(id, token) {
  return httpJSON(`/api/notificaciones/leer/${id}`, {
   method: "POST",
   token
  });
 },

 /** Obtener preferencias del usuario */
 getNotificationPreferences(email, token) {
  return httpJSON(`/api/notificaciones/preferencias/${email}`, { token });
 },
  
 listUsers, // Público

 /** Guardar preferencias del usuario */
 saveNotificationPreferences(email, prefs, token) {
  return httpJSON(`/api/notificaciones/preferencias/${email}`, {
   method: "POST",
   body: prefs, 
   token
  });
 },
 
 // Funciones de éxito
 successEventsList,
 successEventsCreate,
};

export default api;