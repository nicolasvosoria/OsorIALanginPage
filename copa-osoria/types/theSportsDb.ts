/**
 * Tipos para la API TheSportsDB (v1, gratuita).
 * Documentación: https://www.thesportsdb.com/documentation
 */

export interface TheSportsDbEvent {
  idEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  dateEvent: string;
  strTime: string;
  strVenue: string;
  strGroup: string;
  strStatus?: string;
  /** Número de jornada (p. ej. "28"). */
  intRound?: string;
}

export interface TheSportsDbEventsResponse {
  events: TheSportsDbEvent[] | null;
}
