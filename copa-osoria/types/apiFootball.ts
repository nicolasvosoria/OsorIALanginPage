/**
 * Tipos para la API api-football.com (v3 / api-sports.io).
 * Documentación: https://www.api-football.com/documentation-v3
 *
 * Endpoint base: https://v3.football.api-sports.io
 * Autenticación: header "x-apisports-key"
 * Liga FIFA World Cup: id 1. Temporada "2026".
 * Premier League: id 39. Temporada "2025" (= 2025-2026).
 */

export interface ApiFootballVenue {
  id: number | null;
  name: string | null;
  city: string | null;
}

export interface ApiFootballStatus {
  /** Descripción larga: "Not Started", "First Half", "Halftime", "Match Finished", etc. */
  long: string;
  /**
   * Código corto del estado del partido:
   * "TBD" | "NS" | "1H" | "HT" | "2H" | "ET" | "BT" | "P" | "SUSP" | "INT"
   * | "FT" | "AET" | "PEN" | "PST" | "CANC" | "ABD" | "AWD" | "WO" | "LIVE"
   */
  short: string;
  /** Minuto transcurrido; null si el partido no ha empezado o ya terminó. */
  elapsed: number | null;
}

export interface ApiFootballFixtureInfo {
  id: number;
  referee: string | null;
  /** Timezone de la fecha: siempre "UTC" en respuestas directas. */
  timezone: string;
  /** Fecha y hora ISO 8601 con offset: "2026-06-11T19:00:00+00:00" */
  date: string;
  timestamp: number;
  periods: {
    first: number | null;
    second: number | null;
  };
  venue: ApiFootballVenue;
  status: ApiFootballStatus;
}

export interface ApiFootballLeagueInfo {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string | null;
  season: number;
  /**
   * Jornada/ronda del partido.
   * WC:  "Group Stage - A", "Round of 16", "Quarter-finals", etc.
   * PL:  "Regular Season - 28", "Regular Season - 29", etc.
   */
  round: string;
}

export interface ApiFootballTeam {
  id: number;
  name: string;
  logo: string;
  /** true = ganó, false = perdió, null = empate o partido no finalizado. */
  winner: boolean | null;
}

export interface ApiFootballGoals {
  home: number | null;
  away: number | null;
}

export interface ApiFootballFixture {
  fixture: ApiFootballFixtureInfo;
  league: ApiFootballLeagueInfo;
  teams: {
    home: ApiFootballTeam;
    away: ApiFootballTeam;
  };
  goals: ApiFootballGoals;
  score: {
    halftime: ApiFootballGoals;
    fulltime: ApiFootballGoals;
    extratime: ApiFootballGoals;
    penalty: ApiFootballGoals;
  };
}

export interface ApiFootballResponse {
  get: string;
  parameters: Record<string, string>;
  errors: unknown[];
  results: number;
  paging: { current: number; total: number };
  response: ApiFootballFixture[];
}
