import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    carnet: "",
    email: "",
    password: "",
    nombre: "",
    biografia: "",
    fechaNacimiento: "",
    ciudad: "",
    foto: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

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
    if (!formData.carnet.trim()) newErrors.carnet = "El carnet es obligatorio";
    if (!formData.email.trim()) newErrors.email = "El email es obligatorio";
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "El formato del email no es válido";
    if (formData.password.length < 6) newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!formData.fechaNacimiento) newErrors.fechaNacimiento = "La fecha de nacimiento es obligatoria";
    if (!formData.ciudad) newErrors.ciudad = "Debes seleccionar un municipio";
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
    setMessage("Registrando, por favor espera...");

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Ocurrió un error durante el registro.");
      }

      setMessage("✅ ¡Registro exitoso! Serás redirigido para iniciar sesión.");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow-lg rounded-2xl mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Crear una Cuenta</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded text-center font-medium ${
          message.startsWith("✅") ? "bg-green-100 text-green-800" :
          message.startsWith("❌") ? "bg-red-100 text-red-800" :
          "bg-blue-100 text-blue-800"
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Carnet de Estudiante:</label>
          <input type="text" name="carnet" value={formData.carnet} onChange={handleChange} className="border p-2 w-full rounded" required />
          {errors.carnet && <p className="text-red-500 text-sm mt-1">{errors.carnet}</p>}
        </div>
        
        <div>
          <label className="block font-medium">Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="border p-2 w-full rounded" required />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        
        <div>
          <label className="block font-medium">Contraseña:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} className="border p-2 w-full rounded" required />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block font-medium">Nombre Completo:</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="border p-2 w-full rounded" required />
          {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
        </div>

        <div>
          <label className="block font-medium">Biografía (opcional):</label>
          <textarea name="biografia" value={formData.biografia} onChange={handleChange} className="border p-2 w-full rounded" />
        </div>
        
        <div>
          <label className="block font-medium">Fecha de Nacimiento:</label>
          <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} className="border p-2 w-full rounded" required />
          {errors.fechaNacimiento && <p className="text-red-500 text-sm mt-1">{errors.fechaNacimiento}</p>}
        </div>
        
        <div>
          <label className="block font-medium">Municipio:</label>
          <select name="ciudad" value={formData.ciudad} onChange={handleChange} className="border p-2 w-full rounded" required>
            <option value="">Selecciona un municipio</option>
            <option value="Libertador">Libertador</option>
            <option value="Chacao">Chacao</option>
            <option value="Baruta">Baruta</option>
            <option value="Sucre">Sucre</option>
            <option value="El Hatillo">El Hatillo</option>
          </select>
          {errors.ciudad && <p className="text-red-500 text-sm mt-1">{errors.ciudad}</p>}
        </div>

        <div>
          <label className="block font-medium">Foto de Perfil (opcional):</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm" />
          {errors.foto && <p className="text-red-500 text-sm mt-1">{errors.foto}</p>}
          {formData.foto && (
            <img src={formData.foto} alt="Vista previa" className="w-20 h-20 rounded-full object-cover mt-2" />
          )}
        </div>
        
        <button
          type="submit"
          className="bg-blue-600 text-white font-bold px-4 py-3 rounded hover:bg-blue-700 w-full transition-colors duration-200"
        >
          Registrarse
        </button>

        <p className="text-center text-sm text-gray-600 !mt-4">
          ¿Ya tienes una cuenta? <Link to="/login" className="font-medium text-blue-600 hover:underline">Inicia sesión aquí</Link>
        </p>
      </form>
    </div>
  );
}