import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import RatingStars from "../components/RatingStars";
import { getUserRatings, addRating, getUserAverageRating } from "../lib/ratings";

export default function PerfilPublico({ userId }) {
  const [perfil, setPerfil] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [average, setAverage] = useState(0);

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
      if (!userId) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setPerfil(data);
      }
    }
    fetchProfile();
  }, [userId]);

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
