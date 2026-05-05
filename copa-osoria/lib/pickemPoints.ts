/**
 * Compara el resultado real de un partido con la predicción del usuario y devuelve los puntos.
 * Solo se puntúa cuando el partido está cerrado (status ended/closed).
 */

import type { PickemPointsRule } from "@/copa-osoria/types/pickem";
import { POLLA_POINTS_RULES } from "@/copa-osoria/types/pickem";

export interface MatchResult {
  home_score: number;
  away_score: number;
  winner_id: string | null;
}

export interface Prediction {
  home_score: number;
  away_score: number;
}

/**
 * Desenlace del partido: local gana, visitante gana o empate.
 */
function getOutcome(homeScore: number, awayScore: number): "home" | "away" | "draw" {
  if (homeScore > awayScore) return "home";
  if (awayScore > homeScore) return "away";
  return "draw";
}

/**
 * Calcula los puntos de la polla para un partido.
 * - 5 pts: acertó marcador exacto.
 * - 2 pts: acertó quién ganó (o empate) pero no el marcador.
 * - 0 pts: no acertó nada.
 *
 * @returns Puntos (0, 2 o 5) o null si no hay resultado real aún o no hay predicción válida.
 */
export function calculatePollaPoints(
  predHome: number,
  predAway: number,
  actualHome: number,
  actualAway: number,
  rules: PickemPointsRule = POLLA_POINTS_RULES
): number | null {
  const exactMatch = actualHome === predHome && actualAway === predAway;
  if (exactMatch) return rules.exactScore;

  const resultOutcome = getOutcome(actualHome, actualAway);
  const predictionOutcome = getOutcome(predHome, predAway);
  if (resultOutcome === predictionOutcome) return rules.correctResult;

  return rules.wrong;
}

/**
 * Calcula los puntos de una predicción frente al resultado real (versión con IDs para Sportradar).
 * - Resultado exacto (mismo marcador): exactScore
 * - Mismo desenlace (ganador/empate): correctResult
 * - Resto: wrong
 */
export function calculatePoints(
  result: MatchResult,
  prediction: Prediction,
  homeTeamId: string,
  awayTeamId: string,
  rules: PickemPointsRule = { exactScore: 3, correctResult: 1, wrong: 0 }
): number {
  const { home_score: hR, away_score: aR } = result;
  const { home_score: hP, away_score: aP } = prediction;

  const exactMatch = hR === hP && aR === aP;
  if (exactMatch) return rules.exactScore;

  const resultOutcome = getOutcome(hR, aR);
  const predictionOutcome = getOutcome(hP, aP);
  if (resultOutcome === predictionOutcome) return rules.correctResult;

  return rules.wrong;
}

/**
 * Indica si el partido ya tiene resultado para poder puntuar.
 */
export function isMatchFinished(status: string): boolean {
  return status === "closed" || status === "ended";
}
