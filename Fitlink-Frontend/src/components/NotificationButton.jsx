// src/components/NotificationButton.jsx
import React, { useState } from "react";
import Notificaciones from "../pages/Notificaciones";  // Ajustamos la ruta
 // Asegúrate de que la ruta de Notificaciones.jsx sea correcta

export default function NotificationButton({ session }) {
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div>
      {session ? (
        <button
          onClick={toggleNotifications}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700"
        >
          Ver Notificaciones
        </button>
      ) : (
        <p className="text-sm text-gray-500">Inicia sesión para ver notificaciones.</p>
      )}

      {showNotifications && <Notificaciones session={session} />}
    </div>
  );
}
