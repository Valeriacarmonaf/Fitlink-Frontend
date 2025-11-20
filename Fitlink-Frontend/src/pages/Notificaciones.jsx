// src/pages/Notificaciones.jsx
import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Notificaciones({ session }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    async function load() {
      try {
        const data = await api.getNotifications();
        setNotifs(data);
      } catch (error) {
        console.error("Error cargando notificaciones:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [session]);

  const marcarLeida = async (id) => {
    try {
      await api.markAsRead(id);
      setNotifs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
    } catch (error) {
      alert("Error marcando como leída");
    }
  };

  if (loading) return <p className="text-center p-10">Cargando...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Mis Notificaciones</h1>

      {notifs.length === 0 ? (
        <p className="text-gray-600 text-center">No tienes notificaciones.</p>
      ) : (
        <ul className="space-y-3">
          {notifs.map((n) => (
            <li
              key={n.id}
              className={`p-4 rounded-lg border ${
                n.leida ? "bg-gray-100" : "bg-blue-100"
              }`}
            >
              <p className="font-semibold">{n.titulo}</p>
              <p className="text-gray-700">{n.mensaje}</p>

              {!n.leida && (
                <button
                  onClick={() => marcarLeida(n.id)}
                  className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Marcar como leída
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
