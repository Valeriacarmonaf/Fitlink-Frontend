// src/pages/PerfilUsuario.jsx
import React, { useState, useEffect } from "react";
import { Camera, User, Upload } from "lucide-react";

const API_BASE_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:8000' 
  : '';

const initialState = {
id: null,
nombre: "",
carnet: "",
cedula: "",
fecha_nacimiento: "",
biografia: "",
municipio: "",
telefono: "",
foto_url: "",
nivel_deportivo: "", // Se mantiene para el <select> de la UI
intereses_seleccionados: [],
};

// Mapeos para el campo nivel_habilidad (DB int) y nivel_deportivo (UI string)
const NivelMapping = {
"principiante": 1,
"en progreso": 2, 
"intermedio": 3,
"avanzado": 4,
"experto": 5
};
const IdToNivel = {
1: "principiante",
2: "en progreso", 
3: "intermedio",
4: "avanzado",
5: "experto"
};

// Función de fetch mejorada
const apiFetch = async (url, options = {}) => {
const fullUrl = `${API_BASE_URL}${url}`;
console.log(`🔄 Fetching: ${options.method || 'GET'} ${fullUrl}`);
   try {
      const response = await fetch(fullUrl, options);
      
      if (!response.ok) {
         if (response.status === 404) {
            throw new Error(`Not Found: La ruta ${url} no existe`);
         }
         
         const contentType = response.headers.get('content-type');
         if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.detail || errorData.message || `Error ${response.status}`);
         } else {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
         }
      }
      
      const contentType = response.headers.get('content-type');
      // Permite respuestas sin body (e.g. 204 No Content)
      if (!contentType || !contentType.includes('application/json')) {
         return {}; 
      }
      
      return await response.json();
   } catch (error) {
      console.error(`💥 Error en fetch a ${url}:`, error);
      throw error;
   }
};

export default function PerfilUsuario({ session }) {
   const [perfil, setPerfil] = useState(initialState);
   const [loading, setLoading] = useState(false);
   const [uploading, setUploading] = useState(false);
   const [intereses, setIntereses] = useState([]);
   const [error, setError] = useState("");

   // Cargar el perfil del usuario logueado desde public.usuarios
   useEffect(() => {
      if (!session) {
         console.log("⏳ Esperando sesión...");
         return;
      }

      const cargarDatos = async () => {
         setLoading(true);
         setError("");
         
         try {
            console.log("✅ Sesión disponible, cargando datos...");
            
            const authHeaders = {
               'Authorization': `Bearer ${session.access_token}`,
               'Content-Type': 'application/json'
            };

            // Cargar intereses desde /api/intereses
            try {
               console.log("📋 Cargando intereses desde /api/intereses...");
               const interesesData = await apiFetch('/api/intereses');
               setIntereses(interesesData.data || []);
               console.log(`✅ Intereses cargados: ${interesesData.data?.length || 0}`);
            } catch (interesesError) {
               console.warn("⚠️ No se pudieron cargar los intereses:", interesesError.message);
               setIntereses([]);
            }

            // Cargar perfil del usuario
            try {
               console.log("👤 Cargando perfil desde /users/me...");
               const perfilData = await apiFetch('/users/me', {
                  headers: authHeaders
               });
               
               if (perfilData.data) {
                  const data = perfilData.data;
                  
                  // Mapeo de número (DB: nivel_habilidad) a string (UI: nivel_deportivo)
                  const nivelString = IdToNivel[data.nivel_habilidad] || ""; 
                  
                  setPerfil({
                     id: data.id || null,
                     nombre: data.nombre || "",
                     carnet: data.carnet || "",
                     cedula: data.cedula || "", 
                     fecha_nacimiento: data.fecha_nacimiento || "",
                     biografia: data.biografia || "",
                     municipio: data.municipio || "",
                     telefono: data.telefono || "",
                     foto_url: data.foto_url || "",
                     nivel_deportivo: nivelString, // Usa el string para el selector
                     intereses_seleccionados: (data.intereses_seleccionados || []).map(id => Number(id)),
                  });
                  console.log("✅ Perfil cargado correctamente");
                  console.log("🎯 Nivel deportivo:", nivelString);
                  console.log("🆔 Cédula:", data.cedula);
               }
            } catch (perfilError) {
               if (perfilError.message.includes('404') || perfilError.message.includes('No se encontró')) {
                  console.warn("⚠️ No hay perfil existente, se creará uno nuevo");
               } else {
                  throw perfilError;
               }
            }

         } catch (error) {
            console.error("❌ Error cargando datos:", error);
            setError("Error al cargar los datos: " + error.message);
         } finally {
            setLoading(false);
         }
      };

      cargarDatos();
   }, [session]);

   const handleChange = (e) => {
      const { name, value } = e.target;
      setPerfil({ ...perfil, [name]: value });
   };

   const handleInteresChange = (e) => {
      const interesId = parseInt(e.target.value);
      const isChecked = e.target.checked;
      
      setPerfil((prev) => {
         const nuevosIntereses = isChecked
            ? [...prev.intereses_seleccionados, interesId]
            : prev.intereses_seleccionados.filter((id) => id !== interesId);
         
         console.log("🎯 Intereses actualizados:", nuevosIntereses);
         return { ...prev, intereses_seleccionados: nuevosIntereses };
      });
   };

   const uploadAvatar = async (event) => {
      try {
         setUploading(true);
         if (!event.target.files || event.target.files.length === 0) {
            throw new Error("Debes seleccionar una imagen para subir.");
         }
         
         const file = event.target.files[0];
         const formData = new FormData();
         // El campo esperado por el backend para la imagen puede variar.
         // Usaremos 'avatar' como en tu código original, si no funciona, se debe revisar el backend.
         formData.append("avatar", file); 

         await apiFetch('/users/me/upload-foto', {
            method: "POST",
            // IMPORTANTE: NO incluir Content-Type: application/json. El navegador lo maneja por FormData.
            headers: {
               Authorization: `Bearer ${session.access_token}`,
            },
            body: formData,
         });

         // Recargar el perfil después de subir la foto
         const perfilData = await apiFetch('/users/me', {
            headers: { Authorization: `Bearer ${session.access_token}` }
         });
         
         if (perfilData.data) {
            setPerfil(prev => ({ ...prev, foto_url: perfilData.data.foto_url }));
         }
         
         alert("Foto actualizada. ¡No olvides guardar el perfil!");

      } catch (error) {
         alert("Error al subir la foto: " + error.message);
      } finally {
         setUploading(false);
      }
   };

   // Función de preferencias eliminada ya que no se usa, pero se puede mantener si es necesaria.
   // const handlePrefsChange = (e) => {
   //    setPrefs({ ...prefs, [e.target.name]: e.target.checked });
   // };

   const validarDatos = () => {
      const telRegex = /^[0-9]{10}$/;
      
      // Validar teléfono
      if (perfil.telefono && !telRegex.test(perfil.telefono)) {
         alert("El teléfono debe tener 10 dígitos numéricos.");
         return false;
      }
      
      // Validar nivel deportivo
      const nivelesValidos = Object.keys(NivelMapping);
      if (perfil.nivel_deportivo && !nivelesValidos.includes(perfil.nivel_deportivo)) {
         alert("Por favor selecciona un nivel deportivo válido.");
         return false;
      }
      
      return true;
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      if (!validarDatos()) {
         setLoading(false);
         return;
      }

      // 1. Mapeo de nivel de string a ID numérico para el backend (nivel_habilidad)
      const nivelSeleccionado = perfil.nivel_deportivo || "principiante";
      const nivelId = NivelMapping[nivelSeleccionado] || 1;
      
      // 2. Helper para convertir strings vacíos a null para campos BigInt (carnet, cedula)
      const emptyToNull = (value) => (value === "" ? null : value);

      const perfilData = {
         nombre: perfil.nombre,
         carnet: emptyToNull(perfil.carnet), // CORREGIDO: Enviar null si está vacío
         cedula: emptyToNull(perfil.cedula), // CORREGIDO: Enviar null si está vacío
         fecha_nacimiento: perfil.fecha_nacimiento || null,
         biografia: perfil.biografia,
         municipio: perfil.municipio,
         telefono: perfil.telefono,
         foto_url: perfil.foto_url,
         nivel_habilidad: nivelId, // CORREGIDO: Usar el nombre de campo de la tabla y el ID numérico
         intereses: perfil.intereses_seleccionados,
      };

      console.log("💾 Guardando - Nivel:", nivelSeleccionado, "ID:", nivelId);
      console.log("💾 Payload:", perfilData);

      try {
         await apiFetch('/users/me', {
            method: "PUT",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(perfilData),
         });

         alert("✅ Perfil guardado correctamente");
         
      } catch (error) {
         alert("❌ Error al guardar el perfil: " + error.message);
      } finally {
         setLoading(false);
      }
   };

   const escanearCarnet = async () => {
      alert("Función de escaneo de carnet aún no implementada.");
   };

   return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg mt-10">
         <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Perfil de Usuario
         </h1>

         {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
               {error}
            </div>
         )}

         {loading && !perfil.id ? (
            <p className="text-center text-gray-600">Cargando perfil...</p>
         ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
               {/* Sección de foto */}
               <div className="flex flex-col items-center space-y-3">
                  {perfil.foto_url ? (
                     <img
                        src={perfil.foto_url}
                        alt="Avatar"
                        className="w-32 h-32 rounded-full object-cover"
                     />
                  ) : (
                     <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={64} className="text-gray-500" />
                     </div>
                  )}
                  <label className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-300">
                     {uploading ? "Subiendo..." : "Cambiar Foto"}
                     <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={uploadAvatar}
                        disabled={uploading}
                     />
                  </label>
               </div>

               {/* Campos del formulario */}
               <div className="space-y-4">
                  <input
                     name="nombre"
                     value={perfil.nombre}
                     onChange={handleChange}
                     placeholder="Nombre"
                     className="border rounded-lg p-2 w-full"
                     required
                  />
                  <input
                     name="cedula"
                     value={perfil.cedula}
                     onChange={handleChange}
                     placeholder="Cédula"
                     className="border rounded-lg p-2 w-full"
                  />
               </div>

               <div className="flex items-center gap-2">
                  <input
                     name="carnet"
                     value={perfil.carnet}
                     onChange={handleChange}
                     placeholder="Carnet"
                     className="border rounded-lg p-2 w-full"
                  />
                  <button
                     type="button"
                     onClick={escanearCarnet}
                     className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                     title="(placeholder) Cámara"
                  >
                     <Camera size={18} /> Foto
                  </button>
               </div>

               <div>
                  <label className="text-sm text-gray-600">Fecha de Nacimiento</label>
                  <input
                     type="date"
                     name="fecha_nacimiento"
                     value={perfil.fecha_nacimiento}
                     onChange={handleChange}
                     className="border rounded-lg p-2 w-full"
                  />
               </div>

               <textarea
                  name="biografia"
                  value={perfil.biografia}
                  onChange={handleChange}
                  placeholder="Biografía (cuéntanos un poco sobre ti)"
                  className="border rounded-lg p-2 w-full h-24"
               />

               <input
                  name="municipio"
                  value={perfil.municipio}
                  onChange={handleChange}
                  placeholder="Municipio"
                  className="border rounded-lg p-2 w-full"
               />

               <input
                  name="telefono"
                  value={perfil.telefono}
                  onChange={handleChange}
                  placeholder="Teléfono (10 dígitos)"
                  className="border rounded-lg p-2 w-full"
               />

               <select
                  name="nivel_deportivo"
                  value={perfil.nivel_deportivo}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full"
                  required
               >
                  <option value="">Selecciona tu nivel deportivo</option>
                  <option value="principiante">Principiante</option>
                  <option value="en progreso">En Progreso</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                  <option value="experto">Experto</option>
               </select>

               {/* Sección de intereses con checkmarks */}
               <div>
                  <label className="font-medium text-gray-700">Intereses Deportivos</label>
                  {intereses.length === 0 ? (
                     <p className="text-sm text-gray-500 mt-2">
                        Cargando intereses...
                     </p>
                  ) : (
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {intereses.map((interes) => (
                           <label
                              key={interes.id}
                              className="flex items-center gap-2 border p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                           >
                              <input
                                 type="checkbox"
                                 value={interes.id}
                                 checked={perfil.intereses_seleccionados.includes(interes.id)}
                                 onChange={handleInteresChange}
                                 className="rounded text-blue-600 focus:ring-blue-500"
                              />
                              <span className="flex items-center gap-2">
                                 <span className="text-lg">{interes.icono}</span>
                                 <span className="text-sm">{interes.nombre}</span>
                              </span>
                           </label>
                        ))}
                     </div>
                  )}
                  {intereses.length > 0 && (
                     <p className="text-xs text-gray-500 mt-2">
                        {perfil.intereses_seleccionados.length} intereses seleccionados
                     </p>
                  )}
               </div>

               <button
                  type="submit"
                  disabled={loading || uploading}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
               >
                  {loading ? "Guardando..." : "Guardar Cambios"}
               </button>
            </form>
         )}
      </div>
   );
}