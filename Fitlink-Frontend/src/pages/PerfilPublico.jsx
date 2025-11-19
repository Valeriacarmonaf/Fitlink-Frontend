import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import RatingStars from "../components/RatingStars";
import { getUserRatings, addRating, getUserAverageRating } from "../lib/ratings";

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function PerfilPublico({ userId }) {
  const params = useParams();
  const resolvedUserId = userId || params?.id;
  const [perfil, setPerfil] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [average, setAverage] = useState(0);
  const [error, setError] = useState(null);
  const [reportMessage, setReportMessage] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');

  // 🧑‍💻 Usuario logueado
  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    }
    fetchUser();
  }, []);

  // 👤 Perfil público que se está viendo
  useEffect(() => {
    async function fetchProfile() {
      setError(null);
      setPerfil(null);
      if (!resolvedUserId) {
        setError("No se indicó el id de usuario");
        return;
      }

      try {
        const resp = await supabase
          .from("profiles")
          .select("*")
          .eq("id", resolvedUserId)
          .single();

        // Manejo genérico: si hay data, úsala. Si no, intentamos tabla `usuarios`.
        if (resp && resp.data) {
          setPerfil(resp.data);
          return;
        }

        // Intentar fallback a `usuarios`
        const alt = await supabase
          .from("usuarios")
          .select("*")
          .eq("id", resolvedUserId)
          .single();

        if (alt && alt.data) {
          setPerfil(alt.data);
          return;
        }

        // Si llegamos aquí, no hay perfil
        const primaryErr = resp?.error;
        const altErr = alt?.error;
        console.error("PerfilPublico: no se encontró perfil", { resolvedUserId, primaryErr, altErr });
        setError("Perfil no encontrado o sin permisos para ver.");
      } catch (e) {
        console.error("PerfilPublico: error al obtener perfil", e);
        setError(e.message || String(e));
      }
    }
    fetchProfile();
  }, [resolvedUserId]);

  // ⭐ Calificaciones de ese perfil
  useEffect(() => {
    async function fetchRatings() {
      if (!perfil) return;
      const info = await getUserAverageRating(perfil.id);
      setAverage(info.average.toFixed(1));
      const data = await getUserRatings(perfil.id);
      setRatings(data);
    }
    fetchRatings();
  }, [perfil]);

  const handleRate = async (value) => {
    if (!currentUser || !perfil) return;
    if (currentUser.id === perfil.id) {
      alert("No puedes calificarte a ti mismo.");
      return;
    }

    try {
      await addRating(currentUser.id, perfil.id, value);
      const updated = await getUserRatings(perfil.id);
      setRatings(updated);
      const avg = updated.reduce((acc, r) => acc + r.rating, 0) / updated.length;
      setAverage(avg.toFixed(1));
      alert(`✅ Calificaste con ${value} estrellas`);
    } catch (err) {
      console.error(err);
      alert("Error al registrar la calificación.");
    }
  };

  const handleReport = async () => {
    // Abrir modal para escoger motivo
    setSelectedReason('');
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!resolvedUserId) return setReportMessage('Usuario no identificado');
    if (!selectedReason) return setReportMessage('Selecciona un motivo para reportar');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return setReportMessage('Debes iniciar sesión para reportar usuarios');
      const token = session.access_token;

      const resp = await fetch(`${API_URL}/users/${resolvedUserId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: selectedReason })
      });

      if (resp.status === 201) {
        const body = await resp.json();
        setReportMessage(`✅ Reporte enviado. Total de reportes: ${body.reports_count}`);
      } else if (resp.status === 409) {
        const body = await resp.json().catch(() => ({}));
        setReportMessage(body.message || 'Ya reportaste a este usuario.');
      } else {
        const body = await resp.json().catch(() => null);
        const msg = body?.message || body?.detail || 'Error al reportar';
        setReportMessage(msg);
      }
    } catch (e) {
      console.error('Error reportando usuario:', e);
      setReportMessage('No se pudo reportar al usuario. Intenta de nuevo.');
    } finally {
      setShowReportModal(false);
      setTimeout(() => setReportMessage(null), 3500);
    }
  };

  if (error) return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  if (!perfil) return <p className="p-4">Cargando perfil...</p>;

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-2xl shadow-md">
      <h1 className="text-2xl font-semibold mb-2">
        {perfil.nombre} {perfil.apellido}
      </h1>
      <p className="text-gray-500 mb-2">Teléfono: {perfil.telefono}</p>
      <p className="text-gray-500 mb-4">
        Nivel deportivo: {perfil.nivel_deportivo}
      </p>

      <div className="mb-4 text-center">
        <p className="text-lg font-medium text-gray-800">
          ⭐ Promedio: {average} / 5 ({ratings.length} evaluaciones)
        </p>
      </div>

      <div className="flex justify-center mb-4">
        <button
          onClick={handleReport}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Reportar usuario
        </button>
      </div>

      {reportMessage && (
        <div className="text-center mb-4">
          <div className="inline-block bg-yellow-100 text-yellow-900 px-4 py-2 rounded">
            {reportMessage}
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 mx-4">
            <h2 className="text-xl font-bold mb-4">Selecciona un motivo</h2>
            <div className="space-y-3 mb-4">
              {[
                'Lenguaje ofensivo o agresivo',
                'Contenido discriminatorio',
                'Comportamiento inseguro o peligroso',
                'Spam o conducta no deseada',
                'Otro (acoso o violación de normas)'
              ].map((m, i) => (
                <label key={i} className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="reportReason"
                    value={m}
                    checked={selectedReason === m}
                    onChange={() => setSelectedReason(m)}
                    className="mt-1"
                  />
                  <span className="text-gray-700">{m}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReportModal(false)} className="px-4 py-2 rounded bg-gray-100">Cancelar</button>
              <button onClick={submitReport} className="px-4 py-2 rounded bg-red-600 text-white">Enviar reporte</button>
            </div>
          </div>
        </div>
      )}

      {currentUser && currentUser.id !== perfil.id && (
        <div className="text-center">
          <p className="mb-2 font-medium text-gray-700">
            Califica a este usuario:
          </p>
          <RatingStars currentRating={0} onRate={handleRate} />
        </div>
      )}
    </div>
  );
}
