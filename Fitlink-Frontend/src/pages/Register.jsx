import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    carnet: "",
    nombre: "",
    biografia: "",
    fechaNacimiento: "",
    ciudad: "",
    foto: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const API_URL = "http://127.0.0.1:8000";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const validate = () => {
    let newErrors = {};
    if (!formData.identifier.trim()) newErrors.email = "El email o carnet es obligatorio";
    if (!formData.password.trim()) newErrors.password = "La contraseña es obligatoria";
    else if (formData.password.length < 6) newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    if (!formData.carnet.trim()) newErrors.carnet = "El carnet es obligatorio";
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!formData.fechaNacimiento) newErrors.fechaNacimiento = "La fecha de nacimiento es obligatoria";
    if (!formData.ciudad.trim()) newErrors.ciudad = "La ciudad es obligatoria";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setMessage("");
      return;
    }

    setErrors({});
    setMessage("Registrando usuario...");

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.detail || "Ocurrió un error desconocido";
        setMessage(`❌ ${errorMessage}`);
        return;
      }

      setMessage(`✅ ${data.message || "Usuario registrado con éxito."}`);
      // Limpiar formulario
      setFormData({
        carnet: "", nombre: "", biografia: "", fechaNacimiento: "",
        ciudad: "", foto: "", email: "", password: "",
      });
      setTimeout(() => setMessage(""), 5000);

    } catch (error) {
      console.error("Error de conexión:", error);
      setMessage("❌ Error de conexión. No se pudo contactar al servidor.");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow-lg rounded-2xl mt-6">
      <h2 className="text-2xl font-bold mb-4">Registro de Usuario</h2>

      {message && (
        <div className={`mb-4 p-2 rounded text-center ${
          message.startsWith("✅") ? "bg-green-100 text-green-700" :
          message.startsWith("❌") ? "bg-red-100 text-red-700" :
          "bg-blue-100 text-blue-700"
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Datos de Perfil */}
        <div>
          <label className="block font-medium">Email o Carnet:</label>
          <input
            type="text" // Cambiado de "email" a "text" para aceptar carnet
            name="identifier" // antes era 'email'
            value={formData.identifier}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
          {/* ... */}
        </div>
        <div>
          <label className="block font-medium">Contraseña:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} className="border p-2 w-full rounded" />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>
        
        <div>
          <label className="block font-medium">Nombre Completo:</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="border p-2 w-full rounded" />
          {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre}</p>}
        </div>
        
        <div>
          <label className="block font-medium">Biografía:</label>
          <textarea name="biografia" value={formData.biografia} onChange={handleChange} className="border p-2 w-full rounded" />
        </div>

        <div>
          <label className="block font-medium">Fecha de nacimiento:</label>
          <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} className="border p-2 w-full rounded" />
          {errors.fechaNacimiento && <p className="text-red-500 text-sm">{errors.fechaNacimiento}</p>}
        </div>
        
        <div>
          <label className="block font-medium">Municipio:</label>
          <select name="ciudad" value={formData.ciudad} onChange={handleChange} className="border p-2 w-full rounded">
            <option value="">Selecciona un municipio</option>
            <option value="Libertador">Libertador</option>
            <option value="Chacao">Chacao</option>
            <option value="Baruta">Baruta</option>
            <option value="Sucre">Sucre</option>
            <option value="El Hatillo">El Hatillo</option>
          </select>
          {errors.ciudad && <p className="text-red-500 text-sm">{errors.ciudad}</p>}
        </div>

        <p className="text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta? <Link to="/login" className="font-medium text-blue-600 hover:underline">Inicia sesión aquí</Link>
        </p>
      </form>
    </div>
  );
}