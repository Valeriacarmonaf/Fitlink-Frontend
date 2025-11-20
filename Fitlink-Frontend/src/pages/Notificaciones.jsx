import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";

export default function Notificaciones() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const email = supabase.auth.getUser()?.data?.user?.email;

  useEffect(() => {
    if (!email) return;

    api.getNotifications(email)
      .then((data) => setNotifs(data))
      .finally(() => setLoading(false));
  }, [email]);

  const marcarLeida = async (id) => {
    await api.markAsRead(id);
    setNotifs((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, leida: true } : n
      )
    );
  };

  if (!email) return <p className="text-center p-10">Inicia sesión.</p>;
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
                  className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
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
