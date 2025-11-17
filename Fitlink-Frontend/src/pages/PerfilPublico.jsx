// src/pages/PerfilPublico.jsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RatingStars from "../components/RatingStars";
import { getUserRatings, addOrUpdateRating, getMyRating } from "../lib/ratings";
import { supabase } from "../lib/supabase";

export default function PerfilPublico() {
  const { id } = useParams(); // ID del usuario del perfil
  const [perfil, setPerfil] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [average, setAverage] = useState(0);
  const [myRating, setMyRating] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Obtener sesión del usuario actual
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user);
    });
  }, []);

  // Cargar datos del perfil
  useEffect(() => {
    async function loadPerfil() {
      let { data } = await supabase.from("profiles").select("*").eq("id", id).single();
      setPerfil(data);
    }
    loadPerfil();
  }, [id]);

  // Cargar calificaciones del perfil y del usuario actual
  useEffect(() => {
    if (!id || !currentUser) return;

    async function loadRatings() {
      const r = await getUserRatings(id);
      setRatings(r);

      // calcular promedio
      if (r.length > 0) {
        const avg = r.reduce((acc, x) => acc + x.rating, 0) / r.length;
        setAverage(avg.toFixed(1));
      }

      // cargar calificación del usuario actual
      const mine = await getMyRating(currentUser.id, id);
      setMyRating(mine?.rating || null);
    }

    loadRatings();
  }, [id, currentUser]);

  if (!perfil) return <p className="p-10 text-center">Cargando perfil...</p>;

  const handleRate = async (value) => {
    if (!currentUser) return;

    if (currentUser.id === perfil.id) {
      alert("No puedes calificarte a ti mismo.");
      return;
    }

    try {
      await addOrUpdateRating(currentUser.id, perfil.id, value);

      // recargar ratings
      const r = await getUserRatings(perfil.id);
      setRatings(r);
      const avg = r.reduce((acc, x) => acc + x.rating, 0) / r.length;
      setAverage(avg.toFixed(1));

      // recargar mi rating
      const mine = await getMyRating(currentUser.id, perfil.id);
      setMyRating(mine?.rating || null);

      alert("¡Calificación registrada!");
    } catch (err) {
      console.error(err);
      alert("Error al guardar tu calificación");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-3">{perfil.nombre}</h1>

      {/* ------------------- Rating público ------------------- */}
      <div className="mb-4">
        <p className="text-xl font-semibold">Calificación:</p>
        <p className="text-gray-700">
          ⭐ {average} / 5  
          <span className="text-sm text-gray-500 ml-2">
            ({ratings.length} evaluaciones)
          </span>
        </p>
      </div>

      {/* ------------------- Componente para calificar ------------------- */}
      <div className="mb-4">
        <p className="font-semibold">Tu calificación:</p>
        <RatingStars rating={myRating || 0} onRate={handleRate} editable />
      </div>

      <hr className="my-6" />

      <h2 className="text-xl font-bold mb-2">Información</h2>
      <p>Email: {perfil.email}</p>
      <p>Bio: {perfil.bio}</p>
    </div>
  );
}

