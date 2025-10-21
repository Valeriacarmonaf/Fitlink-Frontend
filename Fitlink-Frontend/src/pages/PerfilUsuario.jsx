import React, { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { supabase } from "../lib/supabase.js"; // usa tu cliente existente

export default function PerfilUsuario() {
  const [perfil, setPerfil] = useState({
    nombre: "",
    apellido: "",
    edad: "",
    cedula: "",
    telefono: "",
    nivelDeportivo: "",
  });
  const [loading, setLoading] = useState(false);

  // 🧠 Cargar datos del perfil (opcional: luego lo asociaremos a un usuario logueado)
  useEffect(() => {
    const cargarPerfil = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error al obtener perfil:", error.message);
      } else if (data) {
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

    setLoading(false);
    if (error) {
      alert("❌ Error al guardar el perfil: " + error.message);
    } else {
      alert("✅ Perfil guardado correctamente");
    }
  };

  const escanearCedula = async () => {
    alert("Función de escaneo de cédula aún no implementada (placeholder).");
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
          <div className="grid grid-cols-2 gap-4">
            <input
              name="nombre"
              value={perfil.nombre}
              onChange={handleChange}
              placeholder="Nombre"
              className="border rounded-lg p-2 w-full"
              required
            />
            <input
              name="apellido"
              value={perfil.apellido}
              onChange={handleChange}
              placeholder="Apellido"
              className="border rounded-lg p-2 w-full"
              required
            />
          </div>

          <input
            type="number"
            name="edad"
            value={perfil.edad}
            onChange={handleChange}
            placeholder="Edad"
            className="border rounded-lg p-2 w-full"
            required
          />

          <div className="flex items-center gap-2">
            <input
              name="cedula"
              value={perfil.cedula}
              onChange={handleChange}
              placeholder="Cédula"
              className="border rounded-lg p-2 w-full"
              required
            />
            <button
              type="button"
              onClick={escanearCedula}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Camera size={18} /> Escanear
            </button>
          </div>

          <input
            name="telefono"
            value={perfil.telefono}
            onChange={handleChange}
            placeholder="Teléfono (10 dígitos)"
            className="border rounded-lg p-2 w-full"
            required
          />

          <select
            name="nivelDeportivo"
            value={perfil.nivelDeportivo}
            onChange={handleChange}
            className="border rounded-lg p-2 w-full"
          >
            <option value="">Selecciona tu nivel deportivo</option>
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>

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
