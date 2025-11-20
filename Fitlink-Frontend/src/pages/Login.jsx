import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export default function LoginForm() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isBlocked, setIsBlocked] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El formato del email no es válido";
    }
    if (!formData.password.trim()) {
      newErrors.password = "La contraseña es obligatoria";
    }
    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setMessage("");
      return;
    }

    setErrors({});
    setMessage("Iniciando sesión...");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        // Cuenta bloqueada por reportes
        if (response.status === 403) {
          const detail = data.detail || 'Cuenta deshabilitada.';
          setMessage(`❌ ${detail}`);
          setIsBlocked(true);
          return;
        }
        throw new Error(data.detail || "Error desconocido");
      }

      // Sincroniza sesión con Supabase
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      setMessage("✅ Sesión iniciada con éxito. Redirigiendo...");
      navigate("/"); // ✅ redirige al landing

    } catch (error) {
      console.error("Error de inicio de sesión:", error);
      setMessage(`❌ ${error.message}`);
    }
  };

  const handleGoogleLogin = async () => {
    setMessage("Redirigiendo a Google...");
    try {
      const response = await fetch(`${API_URL}/auth/google`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Error al iniciar sesión con Google");
      }

      if (data.oauth_url) {
        window.location.href = data.oauth_url;
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow-lg rounded-2xl mt-6">
      <h2 className="text-2xl font-bold mb-4">Iniciar Sesión</h2>

      {message && (
        <div
          className={`mb-4 p-3 rounded text-center font-medium ${
            message.startsWith("✅")
              ? "bg-green-100 text-green-800"
              : message.startsWith("❌")
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block font-medium">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isBlocked}
            className="border p-2 w-full rounded"
            required
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Contraseña:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={isBlocked}
            className="border p-2 w-full rounded"
            required
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isBlocked}
          className={`bg-blue-600 text-white font-bold px-4 py-3 rounded hover:bg-blue-700 w-full transition-colors duration-200 ${isBlocked ? 'opacity-50 cursor-not-allowed hover:bg-blue-600' : ''}`}
        >
          Iniciar Sesión
        </button>
      </form>

      <div className="mt-6 text-center">
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">O continúa con</span>
          </div>
        </div>
        <button
          onClick={handleGoogleLogin}
          disabled={isBlocked}
          className={`bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 flex items-center justify-center w-full transition-colors duration-200 ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google logo"
            className="w-5 h-5 mr-3"
          />
          Iniciar Sesión con Google
        </button>
      </div>

      <p className="text-center text-sm text-gray-600 mt-4">
        ¿No tienes una cuenta?{" "}
        <Link
          to="/register"
          className="font-medium text-blue-600 hover:underline"
        >
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
}
