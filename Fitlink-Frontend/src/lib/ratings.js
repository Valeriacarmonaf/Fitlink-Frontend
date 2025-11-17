// src/lib/ratings.js
import { supabase } from "./supabase";

/**
 * Crear o actualizar una calificación
 */
export async function addOrUpdateRating(raterId, ratedUserId, rating) {
  if (raterId === ratedUserId) {
    throw new Error("Un usuario no puede calificarse a sí mismo.");
  }

  // 1️⃣ Verificar si ya existe calificación previa
  const { data: existingRating, error: fetchError } = await supabase
    .from("ratings")
    .select("*")
    .eq("rater_id", raterId)
    .eq("rated_user_id", ratedUserId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    throw fetchError;
  }

  // 2️⃣ Si existe, actualizar
  if (existingRating) {
    const { data, error } = await supabase
      .from("ratings")
      .update({ rating, updated_at: new Date() })
      .eq("id", existingRating.id);

    if (error) throw error;
    return { updated: true, data };
  }

  // 3️⃣ Si no existe, crear nueva
  const { data, error } = await supabase
    .from("ratings")
    .insert([{ rater_id: raterId, rated_user_id: ratedUserId, rating }]);

  if (error) throw error;
  return { created: true, data };
}

/**
 * Obtener TODAS las calificaciones que ha recibido un usuario
 */
export async function getUserRatings(userId) {
  const { data, error } = await supabase
    .from("ratings")
    .select("*")
    .eq("rated_user_id", userId);

  if (error) throw error;
  return data;
}

/**
 * Obtener la calificación que el usuario actual ya hizo (si existe)
 */
export async function getMyRating(raterId, ratedUserId) {
  const { data, error } = await supabase
    .from("ratings")
    .select("*")
    .eq("rater_id", raterId)
    .eq("rated_user_id", ratedUserId)
    .maybeSingle(); // evita error si no existe registro

  if (error) throw error;
  return data;
}

