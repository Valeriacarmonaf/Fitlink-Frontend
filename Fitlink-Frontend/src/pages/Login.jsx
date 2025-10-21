import { useState } from "react";

export default function LoginForm() {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  // Asumiendo que VITE_API_URL está en tu archivo .env
  // Ejemplo: VITE_API_URL=http://127.0.0.1:8000
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let newErrors = {};
    // FIX 1: Añadida la validación para el campo 'identifier'
    if (!formData.identifier.trim()) {
      newErrors.identifier = "El email o carnet es obligatorio";
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
        const errorMessage = data.detail || "Error desconocido al iniciar sesión";
        setMessage(`❌ ${errorMessage}`);
        return;
      }

      // Login exitoso
      setMessage("✅ Sesión iniciada con éxito");
      console.log("Datos del usuario:", data.user);
      console.log("Datos de sesión:", data.session);

      // FIX 2: Acceder correctamente al objeto 'session' que devuelve el backend
      if (data.session) {
        localStorage.setItem("supabase_session", JSON.stringify(data.session));
      }
      
      // Redirigir al usuario al dashboard o a donde corresponda
      // Por ejemplo, después de 1 segundo para que vea el mensaje de éxito.
      setTimeout(() => {
        // window.location.href = "/dashboard"; 
      }, 1000);

      // FIX 3: Limpiar el formulario usando la clave correcta 'identifier'
      setFormData({ identifier: "", password: "" }); 

    } catch (error) {
      console.error("Error de conexión:", error);
      setMessage("❌ Error de conexión. No se pudo contactar al servidor.");
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
      console.error("Error al redirigir a Google:", error);
      setMessage(`❌ ${error.message}`);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow-lg rounded-2xl mt-6">
      <h2 className="text-2xl font-bold mb-4">Iniciar Sesión</h2>

      {message && (
        <div className={`mb-4 p-2 rounded text-center ${
          message.startsWith("✅") ? "bg-green-100 text-green-700" :
          message.startsWith("❌") ? "bg-red-100 text-red-700" :
          "bg-blue-100 text-blue-700"
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block font-medium">Email o Carnet:</label>
          <input
            type="text"
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
          {/* FIX 4: Asegurarse de que el error del identificador se muestre */}
          {errors.identifier && <p className="text-red-500 text-sm">{errors.identifier}</p>}
        </div>

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
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 flex items-center justify-center w-full transition-colors duration-200"
        >
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google logo" 
            className="w-5 h-5 mr-3"
          />
          Iniciar Sesión con Google
        </button>
      </div>
    </div>
  );
}