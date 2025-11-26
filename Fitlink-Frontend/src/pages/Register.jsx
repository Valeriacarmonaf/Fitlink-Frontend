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
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Crear una Cuenta</h2>
      
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
        
        {/* --- INICIO DE LA SECCIÓN DE FOTO MEJORADA --- */}
        <div>
          <label className="block font-medium mb-2 text-gray-700">Foto de Perfil</label>
          <div className="flex items-center space-x-6">
            <div className="shrink-0">
              {formData.foto ? (
                <img 
                  className="h-16 w-16 object-cover rounded-full border-2 border-gray-200" 
                  src={formData.foto} 
                  alt="Foto actual" 
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                  {/* Icono SVG por defecto cuando no hay foto */}
                  <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              )}
            </div>
            <label className="block">
              <span className="sr-only">Elige una foto de perfil</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer transition-colors"
              />
            </label>
          </div>
          {errors.foto && <p className="text-red-500 text-sm mt-1">{errors.foto}</p>}
        </div>
        {/* --- FIN DE LA SECCIÓN DE FOTO MEJORADA --- */}

        <div>
          <label className="block font-medium text-gray-700">Carnet de Estudiante:</label>
          <input type="text" name="carnet" value={formData.carnet} onChange={handleChange} className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition" required />
          {errors.carnet && <p className="text-red-500 text-sm mt-1">{errors.carnet}</p>}
        </div>
        
        <div>
          <label className="block font-medium text-gray-700">Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition" required />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        
        <div>
          <label className="block font-medium text-gray-700">Contraseña:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition" required />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block font-medium text-gray-700">Nombre Completo:</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition" required />
          {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
        </div>

        <div>
          <label className="block font-medium text-gray-700">Biografía (opcional):</label>
          <textarea name="biografia" value={formData.biografia} onChange={handleChange} className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
            <label className="block font-medium text-gray-700">Fecha de Nacimiento:</label>
            <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition" required />
            {errors.fechaNacimiento && <p className="text-red-500 text-sm mt-1">{errors.fechaNacimiento}</p>}
            </div>
            
            <div>
            <label className="block font-medium text-gray-700">Municipio:</label>
            <select name="ciudad" value={formData.ciudad} onChange={handleChange} className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition" required>
                <option value="">Selecciona</option>
                <option value="Libertador">Libertador</option>
                <option value="Chacao">Chacao</option>
                <option value="Baruta">Baruta</option>
                <option value="Sucre">Sucre</option>
                <option value="El Hatillo">El Hatillo</option>
            </select>
            {errors.ciudad && <p className="text-red-500 text-sm mt-1">{errors.ciudad}</p>}
            </div>
        </div>
        
        <button
          type="submit"
          className="bg-blue-600 text-white font-bold px-4 py-3 rounded hover:bg-blue-700 w-full transition-colors duration-200 shadow-md"
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