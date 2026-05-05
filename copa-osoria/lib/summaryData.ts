/**
 * Datos para la página Resumen: ranking (users + user_score) y puntos del usuario actual.
 * Tablas: users, user_prediction, user_score.
 */

import { supabase } from "@/copa-osoria/lib/supabase";
import { getAllUserPredictions } from "@/copa-osoria/lib/userPrediction";
import { calculatePollaPoints } from "@/copa-osoria/lib/pickemPoints";
import type { DayMatches } from "@/copa-osoria/data/matchesByDay";
import type { MatchItem } from "@/copa-osoria/data/matchesByDay";

export interface RankingUser {
  user_id: string;
  username: string;
  points: number;
}

async function getCopaOsoriaUserIds(): Promise<string[]> {
  const ids = new Set<string>();

  const { data: predictionUsers } = await supabase
    .from("user_prediction")
    .select("user_id")
    .range(0, 19999);

  for (const row of predictionUsers ?? []) {
    const id = (row as { user_id?: string }).user_id;
    if (id) ids.add(id);
  }

  const { data: groupUsers } = await supabase
    .from("user_group")
    .select("user_id")
    .range(0, 19999);

  for (const row of groupUsers ?? []) {
    const id = (row as { user_id?: string }).user_id;
    if (id) ids.add(id);
  }

  return Array.from(ids);
}

/**
 * Obtiene el ranking global: todos los usuarios con sus puntos desde user_score.
 * Si user_score está vacío o no existe, devuelve usuarios con 0 pts.
 * Nota: las políticas RLS de la tabla "users" deben permitir leer todos los usuarios para el ranking.
 */
export async function getRanking(): Promise<RankingUser[]> {
  const copaUserIds = await getCopaOsoriaUserIds();
  if (!copaUserIds.length) return [];

  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, username")
    .in("id", copaUserIds)
    .order("username")
    .range(0, 4999);
  if (usersError) return [];
  if (!users?.length) return [];

  const { data: scores, error: scoresError } = await supabase
    .from("user_score")
    .select("user_id, points, total_points, score")
    .in("user_id", copaUserIds)
    .range(0, 19999);
  if (scoresError) {
    return (users as { id: string; username: string }[]).map((u) => ({
      user_id: u.id,
      username: u.username || "Usuario",
      points: 0,
    }));
  }

  const scoreByUser = new Map<string, number>();
  for (const row of scores ?? []) {
    const r = row as Record<string, unknown>;
    const uid = typeof r.user_id === "string" ? r.user_id : null;
    const pts = Number(r.points ?? r.total_points ?? r.score ?? 0) || 0;
    if (uid) scoreByUser.set(uid, (scoreByUser.get(uid) ?? 0) + pts);
  }

  return (users as { id: string; username: string }[])
    .map((u) => ({
      user_id: u.id,
      username: u.username || "Usuario",
      points: scoreByUser.get(u.id) ?? 0,
    }))
    .sort((a, b) => b.points - a.points);
}

/**
 * Calcula los puntos del usuario actual a partir de sus predicciones y los resultados
 * de los partidos (days con homeScore/awayScore).
 */
export async function getCurrentUserPoints(
  userId: string,
  days: DayMatches[]
): Promise<number> {
  const { data: predictions } = await getAllUserPredictions(userId);
  if (!predictions) return 0;
  let total = 0;
  for (const day of days) {
    for (const m of day.matches) {
      const pred = predictions[m.id];
      if (!pred) continue;
      const pts = getPointsForMatch(m, String(pred.home_score), String(pred.away_score));
      if (pts !== null) total += pts;
    }
  }
  return total;
}

function getPointsForMatch(
  match: MatchItem,
  predHome: string,
  predAway: string
): number | null {
  if (match.homeScore === null || match.awayScore === null) return null;
  const h = predHome.trim() === "" ? NaN : parseInt(predHome, 10);
  const a = predAway.trim() === "" ? NaN : parseInt(predAway, 10);
  if (Number.isNaN(h) || Number.isNaN(a)) return null;
  return calculatePollaPoints(h, a, match.homeScore, match.awayScore);
}

/**
 * Cuenta partidos con resultado (homeScore y awayScore no null) en los días dados.
 */
export function countMatchesWithResult(days: DayMatches[]): number {
  let n = 0;
  for (const day of days) {
    for (const m of day.matches) {
      if (m.homeScore !== null && m.awayScore !== null) n++;
    }
  }
  return n;
}
