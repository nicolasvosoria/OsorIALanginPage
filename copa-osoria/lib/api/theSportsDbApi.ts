/**
 * Lectura de partidos para Copa Osoria.
 *
 * IMPORTANTE: el browser NO consulta proveedores deportivos directo.
 * Las Edge Functions sincronizan TheSportsDB/football-data.org hacia Supabase
 * y la UI solo lee la tabla `copaosoria.match`.
 */

import type { MatchItem } from "@/copa-osoria/data/matchesByDay";
import { supabase } from "@/copa-osoria/lib/supabase";
import { getCompetitionPhaseId } from "@/copa-osoria/lib/competitionPhase";

export const FOOTBALL_LEAGUES = {
  champions: {
    label: "Champions League",
    emptyLabel: "la Champions League",
    sportsDbLeagueId: 4480,
    season: "2025-2026",
    defaultCountryCode: null,
  },
  premier: {
    label: "Premier League",
    emptyLabel: "la Premier League",
    sportsDbLeagueId: 4328,
    season: "2025-2026",
    defaultCountryCode: "gb",
  },
  laliga: {
    label: "La Liga",
    emptyLabel: "La Liga",
    sportsDbLeagueId: 4335,
    season: "2025-2026",
    defaultCountryCode: "es",
  },
  seriea: {
    label: "Serie A",
    emptyLabel: "la Serie A",
    sportsDbLeagueId: 4332,
    season: "2025-2026",
    defaultCountryCode: "it",
  },
  bundesliga: {
    label: "Bundesliga",
    emptyLabel: "la Bundesliga",
    sportsDbLeagueId: 4331,
    season: "2025-2026",
    defaultCountryCode: "de",
  },
} as const;

export type FootballLeagueKey = keyof typeof FOOTBALL_LEAGUES;

type DbMatchRow = {
  provider_match_id: string | null;
  home_team_name: string | null;
  away_team_name: string | null;
  kickoff_at: string | null;
  home_team_badge_url?: string | null;
  away_team_badge_url?: string | null;
  home_score: number | null;
  away_score: number | null;
  status: string | null;
};

const countryNameToCode: Record<string, string> = {
  Mexico: "mx", "South Africa": "za", USA: "us", Paraguay: "py", Brazil: "br", Morocco: "ma",
  Qatar: "qa", Switzerland: "ch", Haiti: "ht", Scotland: "gb-sct", Germany: "de", "Curaçao": "cw",
  Ecuador: "ec", Netherlands: "nl", Japan: "jp", Belgium: "be", Egypt: "eg", Uruguay: "uy",
  Spain: "es", France: "fr", Argentina: "ar", England: "gb", Portugal: "pt", Italy: "it",
  "South Korea": "kr", Canada: "ca", Colombia: "co", Australia: "au", Tunisia: "tn",
  Arsenal: "gb", Chelsea: "gb", "Manchester United": "gb", "Manchester United FC": "gb",
  "Manchester City": "gb", "Manchester City FC": "gb", Liverpool: "gb", "Liverpool FC": "gb",
  "Tottenham Hotspur": "gb", "Tottenham Hotspur FC": "gb", "West Ham United": "gb", "West Ham United FC": "gb",
  "Newcastle United": "gb", "Newcastle United FC": "gb", Brighton: "gb", "Brighton & Hove Albion FC": "gb",
  "Aston Villa": "gb", "Aston Villa FC": "gb", "Crystal Palace": "gb", "Crystal Palace FC": "gb",
  Everton: "gb", "Everton FC": "gb", "Nottingham Forest": "gb", "Nottingham Forest FC": "gb",
  Bournemouth: "gb", "AFC Bournemouth": "gb", Fulham: "gb", "Fulham FC": "gb", Brentford: "gb",
  "Brentford FC": "gb", Burnley: "gb", "Burnley FC": "gb", "Leeds United FC": "gb", "Sunderland AFC": "gb",
  "Real Madrid": "es", Barcelona: "es", "Atletico Madrid": "es", Villarreal: "es", Sevilla: "es", Valencia: "es",
  "Bayern München": "de", "Bayern Munich": "de", "Borussia Dortmund": "de", "Bayer Leverkusen": "de",
  Inter: "it", "AC Milan": "it", Juventus: "it", Napoli: "it", Atalanta: "it", Roma: "it", Lazio: "it",
};

const teamNameToSpanish: Record<string, string> = {
  Mexico: "México", "South Africa": "Sudáfrica", USA: "Estados Unidos", Brazil: "Brasil", Morocco: "Marruecos",
  Qatar: "Catar", Switzerland: "Suiza", Haiti: "Haití", Scotland: "Escocia", Germany: "Alemania",
  Netherlands: "Países Bajos", Japan: "Japón", Belgium: "Bélgica", Egypt: "Egipto", Spain: "España",
  France: "Francia", England: "Inglaterra", "South Korea": "Corea del Sur", Canada: "Canadá",
};

function teamNameToSpanishName(name: string): string {
  const n = name?.trim() ?? "";
  return teamNameToSpanish[n] ?? n;
}

function teamNameToCountryCode(name: string, fallback: string | null = null): string | null {
  const n = name?.trim() ?? "";
  if (!n) return fallback;
  if (countryNameToCode[n]) return countryNameToCode[n];
  if (n.length === 2) return n.toLowerCase();
  return fallback;
}

/** Convierte UTC ISO a fecha/hora Colombia (GMT-5). */
function isoToGMT5(isoDate: string): { date: string; time: string } {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return { date: "", time: "00:00" };
  const gmt5 = new Date(d.getTime() - 5 * 60 * 60 * 1000);
  return { date: gmt5.toISOString().slice(0, 10), time: gmt5.toISOString().slice(11, 16) };
}

function mapDbMatchToMatchItem(row: DbMatchRow, defaultCountryCode: string | null = null): MatchItem {
  const { date, time } = isoToGMT5(row.kickoff_at ?? "");
  const homeName = row.home_team_name ?? "";
  const awayName = row.away_team_name ?? "";

  return {
    id: row.provider_match_id ?? `${homeName}-${awayName}-${row.kickoff_at ?? ""}`,
    homeTeam: teamNameToSpanishName(homeName),
    awayTeam: teamNameToSpanishName(awayName),
    homeCountryCode: teamNameToCountryCode(homeName, defaultCountryCode),
    awayCountryCode: teamNameToCountryCode(awayName, defaultCountryCode),
    homeBadgeUrl: row.home_team_badge_url ?? null,
    awayBadgeUrl: row.away_team_badge_url ?? null,
    status: row.status ?? null,
    kickoffAt: row.kickoff_at ?? null,
    time,
    stadium: "",
    group: "",
    homeScore: row.home_score ?? null,
    awayScore: row.away_score ?? null,
    date,
  };
}

async function getMatchesFromDb(
  competitionPhaseId: string,
  defaultCountryCode: string | null,
  next = 20
): Promise<MatchItem[]> {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const baseSelect = "provider_match_id, home_team_name, away_team_name, home_team_badge_url, away_team_badge_url, kickoff_at, home_score, away_score, status";
  const [{ data: upcoming, error: errUpcoming }, { data: recent, error: errRecent }] = await Promise.all([
    supabase
      .from("match")
      .select(baseSelect)
      .eq("competition_phase_id", competitionPhaseId)
      .gte("kickoff_at", todayStart.toISOString())
      .order("kickoff_at", { ascending: true })
      .limit(next),
    supabase
      .from("match")
      .select(baseSelect)
      .eq("competition_phase_id", competitionPhaseId)
      .eq("status", "ended")
      .lt("kickoff_at", todayStart.toISOString())
      .order("kickoff_at", { ascending: false })
      .limit(3),
  ]);

  if (errUpcoming) throw new Error(`Error Supabase (upcoming): ${errUpcoming.message}`);
  if (errRecent) throw new Error(`Error Supabase (recent): ${errRecent.message}`);

  const combined = [...((recent ?? []) as DbMatchRow[]).reverse(), ...((upcoming ?? []) as DbMatchRow[])];
  if (combined.length > 0) {
    return combined.map((m) => mapDbMatchToMatchItem(m, defaultCountryCode));
  }

  // TheSportsDB free endpoints may return historical season slices. If there are no
  // upcoming/ended rows for today, still show the synced DB data so the front has
  // something consultable instead of an empty tab.
  const { data: fallback, error: errFallback } = await supabase
    .from("match")
    .select(baseSelect)
    .eq("competition_phase_id", competitionPhaseId)
    .order("kickoff_at", { ascending: true })
    .limit(next);

  if (errFallback) throw new Error(`Error Supabase (fallback): ${errFallback.message}`);
  return ((fallback ?? []) as DbMatchRow[]).map((m) => mapDbMatchToMatchItem(m, defaultCountryCode));
}

/** Partidos del Mundial 2026 desde Supabase; si no hay sync, devuelve vacío y la UI conserva fallback local. */
export async function getWorldCup2026Matches(): Promise<MatchItem[]> {
  const competitionPhaseId = await getCompetitionPhaseId("mundial", "grupos");
  if (!competitionPhaseId) return [];

  const { data, error } = await supabase
    .from("match")
    .select("provider_match_id, home_team_name, away_team_name, home_team_badge_url, away_team_badge_url, kickoff_at, home_score, away_score, status")
    .eq("competition_phase_id", competitionPhaseId)
    .gte("kickoff_at", "2026-06-11T00:00:00.000Z")
    .lt("kickoff_at", "2026-06-14T00:00:00.000Z")
    .order("kickoff_at", { ascending: true });

  if (error) throw new Error(`Error Supabase (world cup): ${error.message}`);
  return ((data ?? []) as DbMatchRow[]).map((m) => mapDbMatchToMatchItem(m));
}

/** Alias histórico: ahora lee Premier desde Supabase. */
export async function getPremierLeagueNextTwoWeeks(): Promise<MatchItem[]> {
  return getFootballLeagueNextMatches("premier");
}

/** Próximos partidos de ligas europeas desde la tabla sincronizada `copaosoria.match`. */
export async function getFootballLeagueNextMatches(
  leagueKey: FootballLeagueKey,
  next = 20
): Promise<MatchItem[]> {
  const competitionPhaseId = await getCompetitionPhaseId(leagueKey, "grupos");
  if (!competitionPhaseId) throw new Error(`No se encontró competition_phase_id para ${FOOTBALL_LEAGUES[leagueKey].label}`);
  return getMatchesFromDb(competitionPhaseId, FOOTBALL_LEAGUES[leagueKey].defaultCountryCode, next);
}

/**
 * Fusiona resultados de Supabase en un listado base por días.
 * Mantiene el fallback local completo y solo actualiza marcador cuando hay match coincidente.
 */
export function mergeScoresIntoDays(
  baseDays: Array<{ date: string; dateLabel: string; matches: MatchItem[] }>,
  apiMatches: MatchItem[]
): Array<{ date: string; dateLabel: string; matches: MatchItem[] }> {
  const apiByKey = new Map<string, MatchItem>();
  for (const m of apiMatches) {
    apiByKey.set(`${m.date ?? ""}-${m.homeCountryCode ?? ""}-${m.awayCountryCode ?? ""}`, m);
  }
  return baseDays.map((day) => ({
    ...day,
    matches: day.matches.map((baseMatch) => {
      const key = `${day.date}-${baseMatch.homeCountryCode ?? ""}-${baseMatch.awayCountryCode ?? ""}`;
      const fromApi = apiByKey.get(key);
      if (!fromApi) return baseMatch;
      return {
        ...baseMatch,
        id: fromApi.id || baseMatch.id,
        homeBadgeUrl: fromApi.homeBadgeUrl ?? baseMatch.homeBadgeUrl ?? null,
        awayBadgeUrl: fromApi.awayBadgeUrl ?? baseMatch.awayBadgeUrl ?? null,
        status: fromApi.status ?? baseMatch.status ?? null,
        kickoffAt: fromApi.kickoffAt ?? baseMatch.kickoffAt ?? null,
        homeScore: fromApi.homeScore ?? baseMatch.homeScore,
        awayScore: fromApi.awayScore ?? baseMatch.awayScore,
      };
    }),
  }));
}

/** Alias histórico para consumidores viejos. */
export async function getPremierLeagueMatchesFromDb(): Promise<MatchItem[]> {
  return getFootballLeagueNextMatches("premier");
}

/** Agrupa partidos por día para la UI. */
export function groupMatchesByDay(
  matches: MatchItem[]
): Array<{ date: string; dateLabel: string; matches: MatchItem[] }> {
  const byDate = new Map<string, MatchItem[]>();
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  for (const m of matches) {
    const date = m.date ?? "";
    if (!date) continue;
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push(m);
  }

  const today = new Date().toISOString().slice(0, 10);

  return Array.from(byDate.entries())
    .sort(([a], [b]) => {
      const aUpcoming = a >= today;
      const bUpcoming = b >= today;
      if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
      return aUpcoming ? a.localeCompare(b) : b.localeCompare(a);
    })
    .map(([date, matchList]) => {
      let dateLabel = date;
      const [y, mo, d] = date.split("-").map(Number);
      if (y && mo && d) {
        const dayOfWeek = new Date(y, mo - 1, d).getDay();
        dateLabel = `${days[dayOfWeek]} ${d} ${months[mo - 1]}`;
      }
      return { date, dateLabel, matches: matchList };
    });
}
