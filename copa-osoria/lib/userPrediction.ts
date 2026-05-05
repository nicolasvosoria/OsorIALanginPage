import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/copa-osoria/lib/supabase";
import type {
  UserPredictionRecordItem,
  UserPredictionPayload,
  UserPredictionsMap,
} from "@/copa-osoria/types/pickem";

/** Payload para la Edge Function update_prediction_match (un solo partido). */
const EDGE_FUNCTION_NAME = "update_prediction_match";

/**
 * Actualiza solo el registro de un partido vía Edge Function.
 * Requiere sesión activa (Bearer token). La función está configurada con verify_jwt = true.
 * Ver: https://supabase.com/docs/guides/functions/function-configuration
 * Cuando la función devuelve 4xx/5xx, lee el body de la respuesta para mostrar el mensaje real.
 */
export async function updatePredictionMatch(
  item: UserPredictionRecordItem
): Promise<{ error: string | null; code?: string }> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session?.access_token) {
    return { error: "Debes iniciar sesión para guardar la predicción" };
  }

  const { data, error } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
    body: {
      match_id: item.match_id,
      home_team_name: item.home_team_name,
      away_team_name: item.away_team_name,
      home_score: item.home_score,
      away_score: item.away_score,
      limit_date: item.limit_date || null,
      /** Enviado para que la Edge Function resuelva match (FK) y guarde en user_prediction. */
      competition_phase_id: item.competition_phase_id ?? null,
    },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  if (error) {
    if (error instanceof FunctionsHttpError && error.context) {
      try {
        const response = error.context as Response;
        const body = (await response.json()) as { error?: string; code?: string };
        if (body?.error) {
          return { error: body.error, code: body.code };
        }
      } catch {
        // si no se puede parsear el body, se usa el mensaje genérico
      }
    }
    return { error: error.message };
  }
  const res = data as { error?: string; code?: string } | null;
  if (res?.error) {
    return { error: res.error, code: res.code };
  }
  return { error: null };
}

/**
 * Guarda las predicciones del usuario: una fila por partido.
 * prediction = { match_id, home_team_name, away_team_name, home_score, away_score }; limit_date = fecha/hora inicio partido.
 */
export async function saveAllUserPredictions(
  userId: string,
  items: UserPredictionRecordItem[]
): Promise<{ error: Error | null }> {
  for (const item of items) {
    const prediction: UserPredictionPayload = {
      match_id: item.match_id,
      home_team_name: item.home_team_name,
      away_team_name: item.away_team_name,
      home_score: item.home_score,
      away_score: item.away_score,
    };

    const { data: existing } = await supabase
      .from("user_prediction")
      .select("id")
      .eq("user_id", userId)
      .filter("prediction->>match_id", "eq", item.match_id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("user_prediction")
        .update({
          prediction,
          limit_date: item.limit_date,
          competition_phase_id: item.competition_phase_id ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      if (error) return { error };
    } else {
      const { error } = await supabase.from("user_prediction").insert({
        user_id: userId,
        prediction,
        limit_date: item.limit_date,
        competition_phase_id: item.competition_phase_id ?? null,
      });
      if (error) return { error };
    }
  }
  return { error: null };
}

/**
 * Obtiene todas las predicciones del usuario (una fila por partido).
 * Devuelve mapa match_id -> { home_score, away_score } para el formulario.
 */
export async function getAllUserPredictions(
  userId: string
): Promise<{ data: UserPredictionsMap | null; error: Error | null }> {
  const { data: rows, error } = await supabase
    .from("user_prediction")
    .select("prediction")
    .eq("user_id", userId);
  if (error) return { data: null, error };
  const map: UserPredictionsMap = {};
  for (const row of rows ?? []) {
    const p = row.prediction as UserPredictionPayload | null;
    if (p && typeof p.match_id === "string" && p.match_id) {
      map[p.match_id] = {
        home_score: Number(p.home_score) ?? 0,
        away_score: Number(p.away_score) ?? 0,
      };
    }
  }
  return { data: map, error: null };
}

export interface ScoresForUserResult {
  /** Puntaje por partido (provider match_id -> score desde user_score). */
  scoresByMatchId: Record<string, number>;
  /** Suma de todos los score del usuario en user_score. */
  totalPoints: number;
}

/**
 * Obtiene los puntajes del usuario desde user_score, por predicción.
 * Usado en /predicciones para mostrar solo el puntaje guardado por partido.
 */
export async function getScoresForUser(
  userId: string
): Promise<{ data: ScoresForUserResult | null; error: Error | null }> {
  const { data: predRows, error: predErr } = await supabase
    .from("user_prediction")
    .select("id, prediction")
    .eq("user_id", userId);
  if (predErr) return { data: null, error: predErr };

  const { data: scoreRows, error: scoreErr } = await supabase
    .from("user_score")
    .select("prediction_id, score")
    .eq("user_id", userId);
  if (scoreErr) return { data: null, error: scoreErr };

  const predictionIdToMatchId = new Map<string, string>();
  for (const row of predRows ?? []) {
    const p = row.prediction as UserPredictionPayload | null;
    const id = (row as { id?: string }).id;
    if (id && p && typeof p.match_id === "string" && p.match_id) {
      predictionIdToMatchId.set(id, p.match_id);
    }
  }

  const scoresByMatchId: Record<string, number> = {};
  let totalPoints = 0;
  for (const row of scoreRows ?? []) {
    const r = row as { prediction_id: string; score: number | null };
    const score = r.score != null ? Number(r.score) : 0;
    totalPoints += score;
    const matchId = predictionIdToMatchId.get(r.prediction_id);
    if (matchId) scoresByMatchId[matchId] = score;
  }

  return {
    data: { scoresByMatchId, totalPoints },
    error: null,
  };
}
