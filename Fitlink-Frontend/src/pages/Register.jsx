import React, { useState } from "react";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    biografia: "",
    fechaNacimiento: "",
    ciudad: "",
    foto: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL

  // Manejar cambios de texto
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar subida de imagen (sin cambios)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors({ ...errors, foto: "El archivo debe ser una imagen" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, foto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Validaciones del formulario (sin cambios)
  const validate = () => {
    let newErrors = {};
    // NOTA: Si 'id' es un email, deberías añadir validación de formato de email aquí.
    if (!formData.id.trim()) newErrors.id = "El ID es obligatorio";
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!formData.biografia.trim())
      newErrors.biografia = "La biografía es obligatoria";
    if (!formData.fechaNacimiento)
      newErrors.fechaNacimiento = "La fecha de nacimiento es obligatoria";
    if (!formData.ciudad.trim()) newErrors.ciudad = "La ciudad es obligatoria";
    return newErrors;
  };

  // ***** handleSubmit (MODIFICADO) *****
  // Ahora es 'async' y usa fetch para llamar al backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Limpiar errores y mensajes anteriores
    setErrors({});
    setMessage("");

    try {
      // 1. Llamar al endpoint POST /users del backend
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // Enviamos el estado 'formData'
      });

      // 2. Obtener la respuesta del backend
      const data = await response.json();

      // 3. Manejar respuestas de error (ej. 409, 500)
      if (!response.ok) {
        // 'data.detail' es el mensaje de error que enviamos desde FastAPI
        const errorMessage = data.detail || "Ocurrió un error desconocido";

        if (response.status === 409) {
          // 409: Conflicto (ID ya existe)
          // Mostramos el error en el campo 'id'
          setErrors({ id: errorMessage });
        } else {
          // Otro error (500, 422, etc.)
          setMessage(`❌ Error: ${errorMessage}`);
        }
        return;
      }

      // 4. Manejar respuesta exitosa (status 201)
      setMessage("✅ Usuario registrado con éxito");
      setFormData({
        id: "",
        nombre: "",
        biografia: "",
        fechaNacimiento: "",
        ciudad: "",
        foto: "",
      });

      setTimeout(() => setMessage(""), 3000);

    } catch (error) {
      // 5. Manejar errores de red (ej. el backend está caído)
      console.error("Error de conexión:", error);
      setMessage("❌ Error de conexión. No se pudo contactar al servidor.");
    }
  };

  // --- El resto de tu JSX (Return) no necesita cambios ---
  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow-lg rounded-2xl mt-3">
      <h2 className="text-2xl font-bold mb-4">Registro de Usuario</h2>

      {message && (
        <div className={`mb-4 p-2 rounded ${
          message.startsWith("✅") 
            ? "bg-green-100 text-green-700" 
            : "bg-red-100 text-red-700"
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ID */}
        <div>
          <label className="block font-medium">ID (o Email):</label>
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
          {errors.id && <p className="text-red-500 text-sm">{errors.id}</p>}
        </div>

        {/* Nombre */}
        <div>
          <label className="block font-medium">Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
          {errors.nombre && (
            <p className="text-red-500 text-sm">{errors.nombre}</p>
          )}
        </div>

        {/* Biografía */}
        <div>
          <label className="block font-medium">Biografía:</label>
          <textarea
            name="biografia"
            value={formData.biografia}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
          {errors.biografia && (
            <p className="text-red-500 text-sm">{errors.biografia}</p>
          )}
        </div>

        {/* Fecha de nacimiento */}
        <div>
          <label className="block font-medium">Fecha de nacimiento:</label>
          <input
            type="date"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
          {errors.fechaNacimiento && (
            <p className="text-red-500 text-sm">{errors.fechaNacimiento}</p>
          )}
        </div>

        {/* Ciudad */}
        <div>
          <label className="block font-medium">Municipio:</label>
          <select
            name="ciudad"
            value={formData.ciudad}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          >
            <option value="">Selecciona un municipio</option>
            <option value="Libertador">Libertador</option>
            <option value="Chacao">Chacao</option>
            <option value="Baruta">Baruta</option>
            <option value="Sucre">Sucre</option>
            <option value="El Hatillo">El Hatillo</option>
          </select>
          {errors.ciudad && (
            <p className="text-red-500 text-sm">{errors.ciudad}</p>
          )}
        </div>

        {/* Foto */}
        <div>
          <label className="block font-medium">Foto de perfil:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full text-sm"
          />
          {errors.foto && <p className="text-red-500 text-sm">{errors.foto}</p>}
          {formData.foto && (
            <img
              src={formData.foto}
              alt="Vista previa"
              className="w-20 h-20 rounded-full object-cover mt-2"
            />
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Registrarse
        </button>
      </form>
    </div>
  );
}