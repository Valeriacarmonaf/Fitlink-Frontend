import React, { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { api } from "../lib/api";

export default function PerfilUsuario() {
  const [perfil, setPerfil] = useState({
    nombre: "",
    apellido: "",
    edad: "",
    cedula: "",
    telefono: "",
    nivelDeportivo: "",
  });

  const [prefs, setPrefs] = useState({
    notificar_confirmacion: true,
    notificar_cancelacion: true,
    notificar_recordatorios: true,
  });

  const [loading, setLoading] = useState(false);

  const email = supabase.auth.getUser()?.data?.user?.email;

  // Cargar preferencias
  useEffect(() => {
    if (!email) return;

    api.getNotificationPreferences(email)
      .then((p) => {
        if (p) setPrefs(p);
      })
      .catch(() => {});
  }, [email]);

  // Resto de tu carga de perfil…
  useEffect(() => {
    const cargarPerfil = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .limit(1)
        .single();

      if (!error && data) {
        setPerfil({
          nombre: data.nombre || "",
          apellido: data.apellido || "",
          edad: data.edad || "",
          cedula: data.cedula || "",
          telefono: data.telefono || "",
          nivelDeportivo: data.nivel_deportivo || "",
        });
      }
      setLoading(false);
    };
    cargarPerfil();
  }, []);

  const handleChange = (e) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  const handlePrefsChange = (e) => {
    setPrefs({ ...prefs, [e.target.name]: e.target.checked });
  };

  const validarDatos = () => {
    const telRegex = /^[0-9]{10}$/;
    const cedulaRegex = /^[0-9]{8,10}$/;

    if (!telRegex.test(perfil.telefono)) {
      alert("El teléfono debe tener 10 dígitos numéricos.");
      return false;
    }
    if (!cedulaRegex.test(perfil.cedula)) {
      alert("La cédula no tiene un formato válido.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarDatos()) return;
    setLoading(true);

    const { error } = await supabase.from("profiles").upsert({
      nombre: perfil.nombre,
      apellido: perfil.apellido,
      edad: perfil.edad ? parseInt(perfil.edad) : null,
      cedula: perfil.cedula,
      telefono: perfil.telefono,
      nivel_deportivo: perfil.nivelDeportivo,
    });

    await api.saveNotificationPreferences(email, prefs);

    setLoading(false);
    if (error) {
      alert("❌ Error al guardar el perfil: " + error.message);
    } else {
      alert("✅ Perfil guardado y preferencias actualizadas");
    }
  };

  const escanearCedula = async () => {
    alert("Función de escaneo de cédula aún no implementada.");
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Perfil de Usuario
      </h1>

      {loading ? (
        <p className="text-center text-gray-600">Cargando...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ---------------------- TUS CAMPOS EXISTENTES -------------------- */}
          {/* (Tu formulario queda intacto) */}

          {/* ---------------------- NOTIFICACIONES --------------------------- */}
          <div className="mt-8 p-4 border rounded-xl bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">
              Preferencias de Notificaciones
            </h2>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="notificar_confirmacion"
                checked={prefs.notificar_confirmacion}
                onChange={handlePrefsChange}
              />
              Confirmación de inscripción
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="notificar_cancelacion"
                checked={prefs.notificar_cancelacion}
                onChange={handlePrefsChange}
              />
              Cancelación de eventos
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="notificar_recordatorios"
                checked={prefs.notificar_recordatorios}
                onChange={handlePrefsChange}
              />
              Recordatorios (24h antes del evento)
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </form>
      )}
    </div>
  );
}
