import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function CreateEventModal({ open, onClose, onCreated }) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [dia, setDia] = useState("");    // yyyy-mm-dd
  const [hora, setHora] = useState("");  // HH:mm
  const [meridiano, setMeridiano] = useState("AM");
  const [nivel, setNivel] = useState("principiante");
  const [municipio, setMunicipio] = useState("");

  if (!open) return null;

  const reset = () => {
    setNombre("");
    setDescripcion("");
    setCategoria("");
    setDia("");
    setHora("");
    setNivel("principiante");
    setMunicipio("");
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!nombre.trim() || !descripcion.trim() || !categoria.trim() || !dia || !hora) {
      alert("Completa título, descripción, categoría, fecha y hora");
      return;
    }

    // Token de Supabase para el backend
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) {
      alert("Debes iniciar sesión");
      return;
    }
    const nivelBackend =
      nivel === "principiante"
        ? "Principiante"
        : nivel === "intermedio"
        ? "Intermedio"
        : "Avanzado";

    let horaBackend = hora; // por si acaso
    if (hora) {
      const [hStr, mStr] = hora.split(":");
      let hNum = parseInt(hStr, 10);

      if (meridiano === "PM" && hNum < 12) {
        hNum += 12;
      }
      if (meridiano === "AM" && hNum === 12) {
        hNum = 0;
      }

      const hh = String(hNum).padStart(2, "0");
      horaBackend = `${hh}:${mStr}`;
    }

    // Preparamos el body EXACTAMENTE como lo espera FastAPI
    const body = {
      nombre,
      descripcion,
      categoria,
      fecha: dia,           // 👈 el backend espera 'fecha'
      hora: horaBackend,
      nivel: nivelBackend,  // 👈 capitalizado
      municipio: municipio || null,
    };

    const res = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const msg = await res.text();
      alert("Error creando evento: " + msg);
      return;
    }

    const created = await res.json();
    reset();
    onClose?.();
    onCreated?.(created);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* modal */}
      <form
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-5 space-y-4"
        onSubmit={handleSubmit}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">¡Publica tu invitación deportiva!</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        {/* TÍTULO DEL EVENTO */}
        <label className="block text-sm font-medium">Título del evento</label>
          <input
          type="text"
          className="w-full rounded-xl border border-gray-300 p-2 mb-2"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Fútbol en La Lagunita"
        />
        <label className="block text-sm font-medium">Descripción de la invitación</label>
        <textarea
          className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:ring"
          rows={3}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Ej: Fútbol en La Lagunita, 7 vs 7…"
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-medium">Categoría</label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 p-2"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Fútbol, Ping pong, Senderismo…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Fecha</label>
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 p-2"
              value={dia}
              onChange={(e) => setDia(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Hora</label>
            <div className="flex gap-2">
              <input
                type="time"
                className="w-full rounded-xl border border-gray-300 p-2"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                required
              />
              <select
                className="rounded-xl border border-gray-300 p-2"
                value={meridiano}
                onChange={(e) => setMeridiano(e.target.value)}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              El backend guarda la hora en formato 24h automáticamente.
            </p>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">Nivel</label>
            <select
              className="w-full rounded-xl border border-gray-300 p-2"
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
            >
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">Municipio (en Caracas)</label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 p-2"
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              placeholder="Sucre, Baruta, Chacao…"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-gray-200">Cancelar</button>
          <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white">Publicar</button>
        </div>
      </form>
    </div>
  );
}
