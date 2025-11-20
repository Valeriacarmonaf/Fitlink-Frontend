// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export default function LoginForm() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido";
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
      return;
    }

    setErrors({});
    setMessage("Iniciando sesión...");

    try {
      // 1️⃣ Login en tu backend
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Credenciales incorrectas");
      }

      // 2️⃣ Guardar tokens localmente
      localStorage.setItem("sb-access-token", data.session.access_token);
      localStorage.setItem("sb-refresh-token", data.session.refresh_token);

      // 3️⃣ Sincronizar sesión con Supabase
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      });

      setMessage("✅ Sesión iniciada");
      navigate("/dashboard");

    } catch (error) {
      setMessage(`❌ ${error.message}`);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow-lg rounded-2xl mt-6">
      <h2 className="text-2xl font-bold mb-4">Iniciar Sesión</h2>

      {message && (
        <div className="mb-4 p-3 rounded text-center bg-blue-100 text-blue-800">
          {message}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
          {errors.email && <p className="text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
          {errors.password && <p className="text-red-500">{errors.password}</p>}
        </div>

        <button className="bg-blue-600 text-white w-full py-3 rounded">
          Iniciar sesión
        </button>
      </form>

      <p className="text-center mt-4">
        ¿No tienes cuenta?{" "}
        <Link className="text-blue-600" to="/register">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
