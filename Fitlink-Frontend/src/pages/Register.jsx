import React, { useState } from "react";

export default function Register() {
  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    biografia: "",
    fechaNacimiento: "",
    ciudad: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    const { id, nombre, fechaNacimiento, ciudad } = formData;

    if (!id || !nombre || !fechaNacimiento || !ciudad) {
      return "Todos los campos obligatorios deben completarse.";
    }

    const fecha = new Date(fechaNacimiento);
    if (isNaN(fecha.getTime()) || fecha > new Date()) {
      return "La fecha de nacimiento no es válida.";
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const exists = users.find((user) => user.id === id);
    if (exists) {
      return "El ID ya existe. Por favor elige otro.";
    }

    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    users.push(formData);
    localStorage.setItem("users", JSON.stringify(users));

    setSuccess("Usuario registrado con éxito ✅");
    setFormData({
      id: "",
      nombre: "",
      biografia: "",
      fechaNacimiento: "",
      ciudad: "",
    });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-2xl">
      <h2 className="text-2xl font-bold mb-4">Registro de Usuario</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="id"
          placeholder="ID de usuario"
          value={formData.id}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          name="biografia"
          placeholder="Biografía"
          value={formData.biografia}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="date"
          name="fechaNacimiento"
          value={formData.fechaNacimiento}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          name="ciudad"
          placeholder="Ciudad"
          value={formData.ciudad}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Registrarse
        </button>
      </form>
    </div>
  );
}
