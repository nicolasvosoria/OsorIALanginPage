/**
 * Tipos para el sistema pick'em: partidos normalizados y predicciones de usuarios.
 */

export type MatchStatus =
  | "scheduled"
  | "live"
  | "closed"
  | "ended"
  | "postponed"
  | "cancelled"
  | "not_started";

/** Partido normalizado (desde Sportradar o BD). Usado para calendario y para comparar con predicciones. */
export interface Match {
  id: string;
  sportradar_id: string;
  home_team_id: string;
  away_team_id: string;
  home_team_name: string;
  away_team_name: string;
  home_team_country_code: string | null;
  away_team_country_code: string | null;
  start_time: string;
  venue_name: string | null;
  venue_city: string | null;
  group_name: string | null;
  stage_phase: string | null;
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  winner_id: string | null;
  created_at?: string;
  updated_at?: string;
}

/** Predicción de un usuario para un partido. */
export interface UserPrediction {
  id?: string;
  user_id: string;
  match_id: string;
  home_score: number;
  away_score: number;
  points_earned: number | null;
  created_at?: string;
  updated_at?: string;
}

/** Regla de puntuación (ej: resultado exacto = 3, acertar ganador = 1). */
export interface PickemPointsRule {
  exactScore: number;
  correctResult: number;
  wrong: number;
}

export const DEFAULT_PICKEM_RULES: PickemPointsRule = {
  exactScore: 3,
  correctResult: 1,
  wrong: 0,
};

/** Reglas de la polla: 0 si no atina, 2 si atina ganador, 5 si atina marcador exacto. */
export const POLLA_POINTS_RULES: PickemPointsRule = {
  wrong: 0,
  correctResult: 2,
  exactScore: 5,
};

/** Contenido del JSONB `prediction` en cada fila (una fila por partido). */
export interface UserPredictionPayload {
  match_id: string;
  home_team_name: string;
  away_team_name: string;
  home_score: number;
  away_score: number;
}

/** Una fila por partido: datos para insertar/actualizar. */
export interface UserPredictionRecordItem {
  match_id: string;
  home_team_name: string;
  away_team_name: string;
  limit_date: string;
  home_score: number;
  away_score: number;
  /** UUID de la fila en competition_phase (relación competición + fase). */
  competition_phase_id?: string | null;
}

/** Fila de la tabla public.user_prediction (Supabase). Una fila por partido por usuario. */
export interface UserPredictionRow {
  id: string;
  created_at: string;
  updated_at: string | null;
  user_id: string | null;
  prediction: UserPredictionPayload | null;
  limit_date: string | null;
  competition_phase_id: string | null;
}

/** Mapa match_id -> scores para rellenar el formulario (desde getAllUserPredictions). */
export type UserPredictionsMap = Record<
  string,
  { home_score: number; away_score: number }
>;
