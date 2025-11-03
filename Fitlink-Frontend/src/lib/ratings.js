// src/lib/ratings.js
import { supabase } from "./supabase";

/**
 * Guarda una nueva calificación de usuario
 * @param {string} raterId - ID del usuario que califica
 * @param {string} ratedUserId - ID del usuario calificado
 * @param {number} rating - Valor de la calificación (1–5)
 */
export async function addRating(raterId, ratedUserId, rating) {
  if (raterId === ratedUserId) {
    throw new Error("Un usuario no puede calificarse a sí mismo.");
  }

  const { data, error } = await supabase
    .from("ratings")
    .insert([{ rater_id: raterId, rated_user_id: ratedUserId, rating }]);

  if (error) throw error;
  return data;
}

/**
 * Obtiene todas las calificaciones de un usuario
 * @param {string} userId - ID del usuario calificado
 */
export async function getUserRatings(userId) {
  const { data, error } = await supabase
    .from("ratings")
    .select("rating")
    .eq("rated_user_id", userId);

  if (error) throw error;
  return data;
}

/**
 * Calcula el promedio de calificaciones
 * @param {string} userId - ID del usuario calificado
 */
export async function getUserAverageRating(userId) {
  const ratings = await getUserRatings(userId);
  if (!ratings.length) return { average: 0, total: 0 };

  const total = ratings.length;
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  const average = sum / total;

  return { average, total };
}
