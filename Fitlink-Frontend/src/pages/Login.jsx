import React, { useState } from "react";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const API_URL = import.meta.env.VITE_API_URL

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.email.trim()) newErrors.email = "El email es obligatorio";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "El email no es válido";
    if (!formData.password.trim())
      newErrors.password = "La contraseña es obligatoria";
    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setMessage(""); // Limpiar mensaje de éxito/error anterior
      return;
    }

    setErrors({});
    setMessage("Iniciando sesión...");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.detail || "Error desconocido al iniciar sesión";
        setMessage(`❌ ${errorMessage}`);
        return;
      }

      // Login exitoso
      setMessage("✅ Sesión iniciada con éxito");
      console.log("Datos del usuario:", data.user);
      console.log("Token de acceso:", data.access_token);
      
      // Aquí podrías guardar el token de acceso en localStorage o context/redux
      localStorage.setItem("supabase_access_token", data.access_token);
      localStorage.setItem("supabase_refresh_token", data.refresh_token);
      // Redirigir al usuario al dashboard o a donde corresponda
      // window.location.href = "/dashboard"; 

      setTimeout(() => setMessage(""), 3000);
      setFormData({ email: "", password: "" }); // Limpiar formulario
    } catch (error) {
      console.error("Error de conexión:", error);
      setMessage("❌ Error de conexión. No se pudo contactar al servidor.");
    }
  };

  const handleGoogleLogin = async () => {
    setMessage("Redirigiendo a Google...");
    try {
      // 1. Pedir a FastAPI la URL de OAuth de Supabase para Google
      const response = await fetch(`${API_URL}/auth/google`, {
        method: "GET",
      });
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.detail || "Error al iniciar sesión con Google";
        setMessage(`❌ ${errorMessage}`);
        return;
      }

      // 2. Redirigir al navegador a la URL proporcionada por FastAPI
      if (data.oauth_url) {
        window.location.href = data.oauth_url;
      } else {
        setMessage("❌ No se pudo obtener la URL de Google. Intente de nuevo.");
      }

    } catch (error) {
      console.error("Error al redirigir a Google:", error);
      setMessage("❌ Error de conexión al intentar iniciar sesión con Google.");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow-lg rounded-2xl mt-6">
      <h2 className="text-2xl font-bold mb-4">Iniciar Sesión</h2>

      {message && (
        <div className={`mb-4 p-2 rounded ${
          message.startsWith("✅") ? "bg-green-100 text-green-700" :
          message.startsWith("❌") ? "bg-red-100 text-red-700" :
          "bg-blue-100 text-blue-700" // Para el mensaje "Iniciando sesión..."
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block font-medium">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        {/* Contraseña */}
        <div>
          <label className="block font-medium">Contraseña:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
        >
          Iniciar Sesión
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="mb-4">O inicia sesión con:</p>
        <button
          onClick={handleGoogleLogin}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center justify-center w-full"
        >
          <img src="https://www.svgrepo.com/show/353526/google-icon.svg" alt="Google" className="w-5 h-5 mr-2"/>
          Iniciar Sesión con Google
        </button>
      </div>

    </div>
  );
}