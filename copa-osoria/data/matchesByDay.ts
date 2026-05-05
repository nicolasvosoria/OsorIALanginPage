/**
 * Partidos del Mundial 2026 agrupados por día (fallback cuando la API no está disponible).
 * Solo partidos oficiales (FIFA). Horas en GMT-5 (Colombia).
 * homeScore/awayScore null = por jugar.
 *
 * Este listado es un SUBCONJUNTO de la fase de grupos (11–24 Jun) alineado con el calendario
 * oficial FIFA. Cuando la API TheSportsDB responde, se usan sus datos (más partidos y fechas).
 */
export interface MatchItem {
  id: string;
  homeTeam: string;
  awayTeam: string;
  /** Código ISO 2 letras para imagen de bandera; null = "Por definir" */
  homeCountryCode: string | null;
  awayCountryCode: string | null;
  homeBadgeUrl?: string | null;
  awayBadgeUrl?: string | null;
  status?: string | null;
  kickoffAt?: string | null;
  time: string;
  stadium: string;
  group: string;
  homeScore: number | null;
  awayScore: number | null;
  /** Fecha YYYY-MM-DD; opcional, usado cuando los partidos vienen de una API */
  date?: string;
}

export interface DayMatches {
  date: string;
  dateLabel: string;
  matches: MatchItem[];
}

export const matchesByDay: DayMatches[] = [
  // Jueves 11 Jun – Inauguración (solo Grupo A)
  {
    date: "2026-06-11",
    dateLabel: "Jueves 11 Jun",
    matches: [
      { id: "1", homeTeam: "México", awayTeam: "Sudáfrica", homeCountryCode: "mx", awayCountryCode: "za", time: "14:00", stadium: "Estadio Azteca (Ciudad de México)", group: "A", homeScore: null, awayScore: null },
      { id: "2", homeTeam: "Corea del Sur", awayTeam: "Por definir", homeCountryCode: "kr", awayCountryCode: null, time: "21:00", stadium: "Estadio Akron (Guadalajara)", group: "A", homeScore: null, awayScore: null },
    ],
  },
  // Viernes 12 Jun – Grupo B y D
  {
    date: "2026-06-12",
    dateLabel: "Viernes 12 Jun",
    matches: [
      { id: "3", homeTeam: "Canadá", awayTeam: "Por definir", homeCountryCode: "ca", awayCountryCode: null, time: "14:00", stadium: "BMO Field (Toronto)", group: "B", homeScore: null, awayScore: null },
      { id: "4", homeTeam: "Estados Unidos", awayTeam: "Paraguay", homeCountryCode: "us", awayCountryCode: "py", time: "20:00", stadium: "SoFi Stadium (Los Ángeles)", group: "D", homeScore: null, awayScore: null },
    ],
  },
  // Sábado 13 Jun – Grupo B y C (oficial FIFA)
  {
    date: "2026-06-13",
    dateLabel: "Sábado 13 Jun",
    matches: [
      { id: "5", homeTeam: "Catar", awayTeam: "Suiza", homeCountryCode: "qa", awayCountryCode: "ch", time: "14:00", stadium: "Levi's Stadium (Santa Clara)", group: "B", homeScore: null, awayScore: null },
      { id: "6", homeTeam: "Brasil", awayTeam: "Marruecos", homeCountryCode: "br", awayCountryCode: "ma", time: "17:00", stadium: "MetLife Stadium (Nueva York/Nueva Jersey)", group: "C", homeScore: null, awayScore: null },
      { id: "7", homeTeam: "Haití", awayTeam: "Escocia", homeCountryCode: "ht", awayCountryCode: "gb-sct", time: "20:00", stadium: "Gillette Stadium (Boston)", group: "C", homeScore: null, awayScore: null },
    ],
  },
  // Domingo 14 Jun – Grupo D (Australia 00:00 ET), E y F
  {
    date: "2026-06-14",
    dateLabel: "Domingo 14 Jun",
    matches: [
      { id: "7b", homeTeam: "Australia", awayTeam: "Por definir", homeCountryCode: "au", awayCountryCode: null, time: "00:00", stadium: "BC Place (Vancouver)", group: "D", homeScore: null, awayScore: null },
      { id: "8", homeTeam: "Alemania", awayTeam: "Curazao", homeCountryCode: "de", awayCountryCode: "cw", time: "12:00", stadium: "NRG Stadium (Houston)", group: "E", homeScore: null, awayScore: null },
      { id: "9", homeTeam: "Costa de Marfil", awayTeam: "Ecuador", homeCountryCode: "ci", awayCountryCode: "ec", time: "18:00", stadium: "Lincoln Financial Field (Filadelfia)", group: "E", homeScore: null, awayScore: null },
      { id: "10", homeTeam: "Países Bajos", awayTeam: "Japón", homeCountryCode: "nl", awayCountryCode: "jp", time: "15:00", stadium: "AT&T Stadium (Dallas)", group: "F", homeScore: null, awayScore: null },
      { id: "11", homeTeam: "Por definir", awayTeam: "Túnez", homeCountryCode: null, awayCountryCode: "tn", time: "21:00", stadium: "Estadio BBVA (Monterrey)", group: "F", homeScore: null, awayScore: null },
    ],
  },
  // Lunes 15 Jun – Grupo G y H
  {
    date: "2026-06-15",
    dateLabel: "Lunes 15 Jun",
    matches: [
      { id: "12", homeTeam: "Bélgica", awayTeam: "Egipto", homeCountryCode: "be", awayCountryCode: "eg", time: "14:00", stadium: "Lumen Field (Seattle)", group: "G", homeScore: null, awayScore: null },
      { id: "13", homeTeam: "Irán", awayTeam: "Nueva Zelanda", homeCountryCode: "ir", awayCountryCode: "nz", time: "20:00", stadium: "SoFi Stadium (Los Ángeles)", group: "G", homeScore: null, awayScore: null },
      { id: "14", homeTeam: "España", awayTeam: "Cabo Verde", homeCountryCode: "es", awayCountryCode: "cv", time: "11:00", stadium: "Mercedes-Benz Stadium (Atlanta)", group: "H", homeScore: null, awayScore: null },
      { id: "15", homeTeam: "Arabia Saudita", awayTeam: "Uruguay", homeCountryCode: "sa", awayCountryCode: "uy", time: "17:00", stadium: "Hard Rock Stadium (Miami)", group: "H", homeScore: null, awayScore: null },
    ],
  },
  // Jueves 18 Jun – Grupo A y B (segunda jornada)
  {
    date: "2026-06-18",
    dateLabel: "Jueves 18 Jun",
    matches: [
      { id: "16", homeTeam: "Por definir", awayTeam: "Sudáfrica", homeCountryCode: null, awayCountryCode: "za", time: "11:00", stadium: "Mercedes-Benz Stadium (Atlanta)", group: "A", homeScore: null, awayScore: null },
      { id: "17", homeTeam: "México", awayTeam: "Corea del Sur", homeCountryCode: "mx", awayCountryCode: "kr", time: "20:00", stadium: "Estadio Akron (Guadalajara)", group: "A", homeScore: null, awayScore: null },
      { id: "20", homeTeam: "Canadá", awayTeam: "Catar", homeCountryCode: "ca", awayCountryCode: "qa", time: "17:00", stadium: "BC Place (Vancouver)", group: "B", homeScore: null, awayScore: null },
      { id: "21", homeTeam: "Suiza", awayTeam: "Por definir", homeCountryCode: "ch", awayCountryCode: null, time: "14:00", stadium: "SoFi Stadium (Los Ángeles)", group: "B", homeScore: null, awayScore: null },
    ],
  },
  // Miércoles 24 Jun – Grupo A (tercera jornada)
  {
    date: "2026-06-24",
    dateLabel: "Miércoles 24 Jun",
    matches: [
      { id: "18", homeTeam: "Por definir", awayTeam: "México", homeCountryCode: null, awayCountryCode: "mx", time: "20:00", stadium: "Estadio Azteca (Ciudad de México)", group: "A", homeScore: null, awayScore: null },
      { id: "19", homeTeam: "Sudáfrica", awayTeam: "Corea del Sur", homeCountryCode: "za", awayCountryCode: "kr", time: "20:00", stadium: "Estadio BBVA (Monterrey)", group: "A", homeScore: null, awayScore: null },
    ],
  },
];
