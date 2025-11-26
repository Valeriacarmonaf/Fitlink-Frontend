// src/pages/EventDetailsModal.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

// ===== Helpers UI =====

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
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(val);
  } catch {
    return Number(val).toFixed(2);
  }
}

// Helper seguro para obtener nombre de categoría (Maneja Objetos y Strings)
function getCategoryName(cat) {
  if (!cat) return "Sin categoría";
  if (typeof cat === "string") return cat;
  if (typeof cat === "object") {
    // Intenta leer .nombre o .Nombre, o devuelve "Sin nombre" si está vacío
    return cat.nombre || cat.Nombre || "Categoría sin nombre";
  }
  return String(cat);
}

const estadoClass = (estado) => {
  const e = (estado || "").toLowerCase();
  const base = "inline-flex items-center justify-center px-2.5 py-1 rounded-full font-bold text-sm border";
  if (e === "activo") return `${base} bg-green-100 text-green-700 border-green-300`;
  if (e === "cancelado") return `${base} bg-red-100 text-red-600 border-red-300`;
  if (e === "finalizado") return `${base} bg-indigo-100 text-indigo-700 border-indigo-300`;
  return `${base} bg-orange-100 text-orange-600 border-orange-300`;
};

// Usa la misma var que en chatApi.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function EventDetailsModal({ isOpen, onClose, event }) {
  const navigate = useNavigate();
  // Estado para mensajes inline (avisos amistosos)
  const [infoMsg, setInfoMsg] = useState("");
  
  function showInfo(msg, ms = 3600) {
    setInfoMsg(msg);
    if (!msg) return;
    setTimeout(() => setInfoMsg(""), ms);
  }

  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = original);
  }, [isOpen]);

  if (!isOpen || !event) return null;

  // Llama al endpoint de join (idempotente) y navega al chat devuelto
  async function ensureJoinAndGo() {
    const { data } = await supabase.auth.getSession();
    if (!data?.session) {
      alert("Inicia sesión para continuar.");
      return navigate("/login");
    }
    const token = data.session.access_token;

    try {
      const res = await fetch(`${API_URL}/api/events/${event.id}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error("join failed:", res.status, txt);
        if (res.status === 401) alert("Inicia sesión para continuar.");
        else alert("No se pudo inscribir/abrir el chat.");
        return;
      }

      const payload = await res.json().catch(() => ({}));
      const chatId =
        payload?.chat_id ??
        payload?.chatId ??
        payload?.data?.chat_id ??
        payload?.data?.chatId ??
        payload?.chat?.id ??
        payload?.chat?.chat_id;

      if (!chatId) {
        console.error("Respuesta sin chat_id:", payload);
        alert("Inscripción ok, pero no se obtuvo el chat. Revisa 'Mis chats'.");
        return;
      }

      onClose?.();
      navigate(`/chats/${chatId}`);
    } catch (error) {
      console.error("Error de red al unirse:", error);
      alert("Error de conexión al intentar unirse.");
    }
  }

  // “Inscribirme e ir al chat”
  async function handleJoinAndGoChat() {
    await ensureJoinAndGo();
  }

  // “Ir al chat” (si ya estaba inscrito): reutilizamos join, es idempotente
  async function ensureSuscriptionToEventAndGo() {
    // 1) Validación de sesión (igual que ensureJoinAndGo)
    const { data } = await supabase.auth.getSession();
    if (!data?.session) {
      alert("Inicia sesión para continuar.");
      return navigate("/login");
    }

    const user = data.session.user;
    const userId = user?.id;
    if (!userId) {
      console.error("No se pudo obtener user id desde la sesión");
      alert("No se pudo verificar la sesión. Intenta de nuevo.");
      return;
    }

    // 2) Verificar en la tabla public.event_participants si existe registro
    try {
      const { data: rows, error } = await supabase
        .from("event_participants")
        .select("id")
        .eq("evento_id", event.id)
        .eq("user_id", userId)
        .limit(1);

      if (error) {
        console.error("Error consultando event_participants:", error);
        alert("No se pudo comprobar la inscripción. Intenta de nuevo más tarde.");
        return;
      }

      const isRegistered = Array.isArray(rows) && rows.length > 0;
      if (!isRegistered) {
        // Mensaje amistoso en la vista
        showInfo("No te has inscrito en este evento", 4500);
        return;
      }

      // 3) Si está inscrito, procedemos como ensureJoinAndGo para obtener/navegar al chat
      await ensureJoinAndGo();
    } catch (err) {
      console.error("Fallo comprobando inscripción:", err);
      alert("Error al verificar inscripción. Vuelve a intentarlo.");
    }
  }

  async function handleGoChat() {
    await ensureSuscriptionToEventAndGo();
  }

  return (
    <div className="fixed inset-0 bg-black/55 backdrop-blur-[2px] grid place-items-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="relative w-[92vw] max-w-xl bg-white rounded-[18px] shadow-[0_10px_35px_rgba(0,0,0,.25)] p-[18px] pb-20 sm:pb-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[clamp(1.1rem,2.8vw,1.6rem)] font-extrabold">
            {event.nombre_evento || "Evento"}
          </h2>
          <button
            className="text-[1.6rem] leading-none border-0 bg-transparent cursor-pointer text-gray-600 font-bold hover:text-gray-900 hover:scale-105"
            aria-label="Cerrar"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="h-1 bg-blue-700 opacity-80 rounded mt-2 mb-3" />
        {infoMsg ? (
          <div className="mb-3">
            <div className="w-full rounded-md border px-3 py-2 text-sm bg-yellow-50 border-yellow-200 text-yellow-800" role="status">
              {infoMsg}
            </div>
          </div>
        ) : null}


        <div className="text-[clamp(.95rem,2.4vw,1.05rem)] text-gray-800 max-h-[60vh] overflow-y-auto">
          <div className="flex items-start gap-2 my-2">
            <span className="font-bold">Organizador:</span>
            <span className="break-words">{event.creador_id ? event.creador_id.split("-")[0] : "N/A"}</span>
          </div>

          {event.descripcion ? <p className="my-[10px] mb-3 leading-snug">“{event.descripcion}”.</p> : null}

          <div className="flex items-start gap-2 my-2"><span aria-hidden>📍</span><span className="break-words">{event.municipio || "Ubicación N/A"}</span></div>
          <div className="flex items-start gap-2 my-2"><span aria-hidden>📅</span><span className="break-words">{formatDate(event.inicio)}</span></div>
          <div className="flex items-start gap-2 my-2"><span aria-hidden>🕔</span><span className="break-words">{formatTime(event.inicio)}</span></div>
          <div className="flex items-start gap-2 my-2"><span aria-hidden>🎫</span><span className="break-words">Cupos: {event.cupos ?? "N/A"}</span></div>
          <div className="flex items-start gap-2 my-2"><span aria-hidden>💲</span><span className="break-words">{formatMoney(event.precio)}</span></div>
          
          {/* 👇 AQUÍ ESTÁ EL CAMBIO CLAVE PARA EVITAR EL ERROR DE OBJETO */}
          <div className="flex items-start gap-2 my-2">
            <span aria-hidden>🏷️</span>
            <span className="break-words">{getCategoryName(event.categoria)}</span>
          </div>

          <div className="flex items-start gap-2 my-2"><span aria-hidden>ℹ️</span><span className={estadoClass(event.estado)}>{event.estado || "Pendiente"}</span></div>
        </div>

        <div className="static mt-3 sm:absolute sm:right-4 sm:bottom-4 sm:mt-0">
          <div className="flex gap-2 mt-3">
            <button onClick={handleJoinAndGoChat} className="px-4 py-2 rounded-lg bg-black text-white">
              Inscribirme e ir al chat
            </button>
            <button onClick={handleGoChat} className="px-4 py-2 rounded-lg border">
              Ir al chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}