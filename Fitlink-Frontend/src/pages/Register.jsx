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

  // Manejar cambios de texto
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar subida de imagen
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

  // Validaciones del formulario
  const validate = () => {
    let newErrors = {};
    if (!formData.id.trim()) newErrors.id = "El ID es obligatorio";
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!formData.biografia.trim())
      newErrors.biografia = "La biografía es obligatoria";
    if (!formData.fechaNacimiento)
      newErrors.fechaNacimiento = "La fecha de nacimiento es obligatoria";
    if (!formData.ciudad.trim()) newErrors.ciudad = "La ciudad es obligatoria";
    return newErrors;
  };

  // Guardar en localStorage
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];

    // Evitar duplicados en ID
    if (storedUsers.some((user) => user.id === formData.id)) {
      setErrors({ id: "Este ID ya está en uso" });
      return;
    }

    storedUsers.push(formData);
    localStorage.setItem("users", JSON.stringify(storedUsers));

    setFormData({
      id: "",
      nombre: "",
      biografia: "",
      fechaNacimiento: "",
      ciudad: "",
      foto: "",
    });

    setErrors({});
    setMessage("✅ Usuario registrado con éxito");

    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow-lg rounded-2xl">
      <h2 className="text-2xl font-bold mb-4">Registro de Usuario</h2>

      {message && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ID */}
        <div>
          <label className="block font-medium">ID:</label>
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
          <label className="block font-medium">Ciudad:</label>
          <input
            type="text"
            name="ciudad"
            value={formData.ciudad}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
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
