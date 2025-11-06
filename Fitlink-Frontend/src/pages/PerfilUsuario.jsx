// src/pages/PerfilUsuario.jsx
import React, { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { supabase } from "../lib/supabase.js";

export default function PerfilUsuario() {
  const [perfil, setPerfil] = useState({
    nombre: "",
    biografia: "",
    fecha_nacimiento: "",
    municipio: "",
    foto_url: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  // Cargar el perfil del usuario logueado desde public.usuarios
  useEffect(() => {
    const cargarPerfil = async () => {
      setLoading(true);
      try {
        const { data: authData } = await supabase.auth.getUser();
        const uid = authData?.user?.id || null;
        const uemail = authData?.user?.email || null;
        if (!uid && !uemail) throw new Error("No hay sesión.");

        // Busca por id (preferible). Si tu RLS permite por email, también puedes filtrar por email.
        const { data, error } = await supabase
          .from("usuarios")
          .select("id,email,nombre,biografia,fecha_nacimiento,municipio,foto_url")
          .eq("id", uid)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setPerfil({
            nombre: data.nombre || "",
            biografia: data.biografia || "",
            fecha_nacimiento: data.fecha_nacimiento || "",
            municipio: data.municipio || "",
            foto_url: data.foto_url || "",
            email: data.email || uemail || "",
          });
        } else {
          // Si no hay fila aún, prellenamos con el email de auth
          setPerfil((p) => ({ ...p, email: uemail || "" }));
        }
      } catch (e) {
        console.error("Error al obtener perfil:", e?.message);
        alert("No se pudo cargar tu perfil.");
      } finally {
        setLoading(false);
      }
    };
    cargarPerfil();
  }, []);

  const handleChange = (e) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const uid = authData?.user?.id;
      const uemail = authData?.user?.email;

      // upsert a public.usuarios (usa la PK compuesta id,email de tu esquema)
      const { error } = await supabase.from("usuarios").upsert({
        id: uid,
        email: uemail,
        nombre: perfil.nombre || null,
        biografia: perfil.biografia || null,
        fecha_nacimiento: perfil.fecha_nacimiento || null, // YYYY-MM-DD
        municipio: perfil.municipio || null,
        foto_url: perfil.foto_url || null,
      });

      if (error) throw error;
      alert("✅ Perfil guardado correctamente");
    } catch (e) {
      console.error(e);
      alert("❌ Error al guardar el perfil: " + (e?.message || "desconocido"));
    } finally {
      setLoading(false);
    }
  };

  const escanearCedula = async () => {
    alert("Función de escaneo aún no implementada.");
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Perfil de Usuario
      </h1>

      {loading ? (
        <p className="text-center text-gray-600">Cargando...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="nombre"
            value={perfil.nombre}
            onChange={handleChange}
            placeholder="Nombre"
            className="border rounded-lg p-2 w-full"
            required
          />

          <textarea
            name="biografia"
            value={perfil.biografia}
            onChange={handleChange}
            placeholder="Biografía"
            className="border rounded-lg p-2 w-full min-h-24"
          />

          <input
            type="date"
            name="fecha_nacimiento"
            value={perfil.fecha_nacimiento || ""}
            onChange={handleChange}
            className="border rounded-lg p-2 w-full"
          />

          <input
            name="municipio"
            value={perfil.municipio}
            onChange={handleChange}
            placeholder="Municipio"
            className="border rounded-lg p-2 w-full"
          />

          <div className="flex gap-2">
            <input
              name="foto_url"
              value={perfil.foto_url}
              onChange={handleChange}
              placeholder="URL de foto"
              className="border rounded-lg p-2 w-full"
            />
            <button
              type="button"
              onClick={escanearCedula}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
              title="(placeholder) Cámara"
            >
              <Camera size={18} /> Foto
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            {loading ? "Guardando..." : "Guardar Perfil"}
          </button>
        </form>
      )}
    </div>
  );
}
