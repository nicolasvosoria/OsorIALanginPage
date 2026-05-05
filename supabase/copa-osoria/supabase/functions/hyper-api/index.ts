declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => void;
  env: { get: (key: string) => string | undefined };
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const THE_SPORTS_DB_BASE = "https://www.thesportsdb.com/api/v1/json/123";

type LeagueKey = "mundial" | "champions" | "premier" | "laliga" | "seriea" | "bundesliga";

type LeagueConfig = {
  leagueId: number;
  season: string;
  competitionName: string;
  phaseName: string;
  sportsDbLeagueName?: string;
  seedTeamIds?: string[];
};

const LEAGUES: Record<LeagueKey, LeagueConfig> = {
  mundial: { leagueId: 4429, season: "2026", competitionName: "mundial", phaseName: "fase de grupos" },
  champions: {
    leagueId: 4480,
    season: "2025-2026",
    competitionName: "Champions League",
    phaseName: "fase de grupos",
    sportsDbLeagueName: "UEFA Champions League",
    // The v1 free team-list endpoint does not return Champions teams reliably.
    // These seeds cover the current upcoming Champions fixtures and are safely deduped by idEvent.
    seedTeamIds: ["133604", "133664"], // Arsenal, Bayern Munich
  },
  premier: { leagueId: 4328, season: "2025-2026", competitionName: "Premier League", phaseName: "fase de grupos", sportsDbLeagueName: "English Premier League" },
  laliga: { leagueId: 4335, season: "2025-2026", competitionName: "La Liga", phaseName: "fase de grupos", sportsDbLeagueName: "Spanish La Liga" },
  seriea: { leagueId: 4332, season: "2025-2026", competitionName: "Serie A", phaseName: "fase de grupos", sportsDbLeagueName: "Italian Serie A" },
  bundesliga: { leagueId: 4331, season: "2025-2026", competitionName: "Bundesliga", phaseName: "fase de grupos", sportsDbLeagueName: "German Bundesliga" },
};

const DEFAULT_LEAGUE_KEY: LeagueKey = "premier";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function asLeagueKey(value: string | null | undefined): LeagueKey | null {
  const key = (value ?? "").trim().toLowerCase();
  return key in LEAGUES ? (key as LeagueKey) : null;
}

function mapStatus(strStatus: string | undefined): string | null {
  if (strStatus == null || strStatus === "") return "scheduled";
  const s = strStatus.toLowerCase();
  if (s === "finished" || s === "match finished" || s === "ended" || s === "closed") return "ended";
  if (s === "live" || s === "in progress" || s === "inprogress") return "live";
  if (s === "postponed") return "postponed";
  if (s === "cancelled" || s === "canceled") return "cancelled";
  return "scheduled";
}

function normalizeDateEvent(dateEvent: string): string {
  const s = (dateEvent ?? "").trim();
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const ddmmyyyy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return `${year}-${month!.padStart(2, "0")}-${day!.padStart(2, "0")}`;
  }
  return s;
}

function buildKickoffAt(dateEvent: string, strTime: string): string | null {
  const date = normalizeDateEvent(dateEvent);
  if (!date) return null;
  const timePart = (strTime ?? "00:00").slice(0, 8).padEnd(8, "0");
  const iso = `${date}T${timePart}Z`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

interface TheSportsDbEvent {
  idEvent: string;
  idLeague?: string;
  strHomeTeam: string;
  strAwayTeam: string;
  strHomeTeamBadge?: string | null;
  strAwayTeamBadge?: string | null;
  strVenue?: string | null;
  strGroup?: string | null;
  intRound?: string | null;
  intHomeScore: string | null;
  intAwayScore: string | null;
  dateEvent: string;
  strTime: string;
  strStatus?: string;
}

interface TheSportsDbEventsResponse {
  events: TheSportsDbEvent[] | null;
}

interface TheSportsDbTeam {
  idTeam?: string;
}

interface TheSportsDbTeamsResponse {
  teams: TheSportsDbTeam[] | null;
}

async function fetchSportsDbEvents(endpoint: string): Promise<TheSportsDbEvent[]> {
  const res = await fetch(`${THE_SPORTS_DB_BASE}/${endpoint}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TheSportsDB error ${res.status}: ${text}`);
  }
  const data: TheSportsDbEventsResponse = await res.json();
  return data.events ?? [];
}

async function fetchLeagueTeamIds(leagueName: string): Promise<string[]> {
  const endpoint = `search_all_teams.php?l=${encodeURIComponent(leagueName)}`;
  const res = await fetch(`${THE_SPORTS_DB_BASE}/${endpoint}`);
  if (!res.ok) return [];
  const data: TheSportsDbTeamsResponse = await res.json();
  return (data.teams ?? [])
    .map((team) => team.idTeam?.trim() ?? "")
    .filter((id) => id.length > 0);
}

async function fetchUpcomingLeagueEvents(leagueKey: LeagueKey, leagueId: number, league: LeagueConfig): Promise<{ endpoint: string; events: TheSportsDbEvent[] }> {
  if (leagueKey === "mundial") {
    const endpoint = `eventsseason.php?id=${leagueId}&s=${encodeURIComponent(league.season)}`;
    return { endpoint, events: await fetchSportsDbEvents(endpoint) };
  }

  const endpoints: string[] = [`eventsnextleague.php?id=${leagueId}`];
  const teamIds = new Set<string>(league.seedTeamIds ?? []);

  if (league.sportsDbLeagueName) {
    for (const id of await fetchLeagueTeamIds(league.sportsDbLeagueName)) {
      teamIds.add(id);
    }
  }

  for (const teamId of teamIds) {
    endpoints.push(`eventsnext.php?id=${teamId}`);
  }

  const byId = new Map<string, TheSportsDbEvent>();
  for (const endpoint of endpoints) {
    try {
      const events = await fetchSportsDbEvents(endpoint);
      for (const event of events) {
        if (String(event.idLeague ?? "") !== String(leagueId)) continue;
        if (event.idEvent) byId.set(event.idEvent, event);
      }
    } catch {
      // Keep partial data. The free tier may throttle; one failed team should not break the whole sync.
    }
  }

  const events = Array.from(byId.values()).sort((a, b) => {
    const ak = `${normalizeDateEvent(a.dateEvent)}T${a.strTime ?? ""}`;
    const bk = `${normalizeDateEvent(b.dateEvent)}T${b.strTime ?? ""}`;
    return ak.localeCompare(bk);
  });

  return { endpoint: endpoints.join(","), events };
}

async function resolveCompetitionPhaseId(
  supabase: ReturnType<typeof createClient>,
  league: { competitionName: string; phaseName: string },
  inputCompetitionPhaseId: string
): Promise<{ competitionPhaseId: string | null; error?: Response }> {
  if (inputCompetitionPhaseId) return { competitionPhaseId: inputCompetitionPhaseId };

  const { data: comp, error: compErr } = await supabase
    .schema("copaosoria").from("competition")
    .select("id")
    .eq("name", league.competitionName)
    .maybeSingle();
  if (compErr) return { competitionPhaseId: null, error: json(500, { error: "DB error (competition)", details: compErr.message }) };
  if (!comp?.id) return { competitionPhaseId: null, error: json(400, { error: `competition '${league.competitionName}' not found` }) };

  const { data: phase, error: phaseErr } = await supabase
    .schema("copaosoria").from("phase")
    .select("id")
    .eq("name", league.phaseName)
    .maybeSingle();
  if (phaseErr) return { competitionPhaseId: null, error: json(500, { error: "DB error (phase)", details: phaseErr.message }) };
  if (!phase?.id) return { competitionPhaseId: null, error: json(400, { error: `phase '${league.phaseName}' not found` }) };

  const { data: cp, error: cpErr } = await supabase
    .schema("copaosoria").from("competition_phase")
    .select("id")
    .eq("competition_id", comp.id)
    .eq("phase_id", phase.id)
    .maybeSingle();
  if (cpErr) return { competitionPhaseId: null, error: json(500, { error: "DB error (competition_phase)", details: cpErr.message }) };
  if (!cp?.id) return { competitionPhaseId: null, error: json(400, { error: "competition_phase not found" }) };

  return { competitionPhaseId: cp.id };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const expectedSecret = Deno.env.get("CRON_SECRET") ?? "";
  const gotSecret = req.headers.get("x-cron-secret") ?? "";
  if (!expectedSecret || gotSecret !== expectedSecret) return json(401, { error: "Unauthorized" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceRoleKey) return json(500, { error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });

  const urlObj = new URL(req.url);
  let competitionPhaseId = urlObj.searchParams.get("competition_phase_id")?.trim() || "";
  let leagueKey = asLeagueKey(urlObj.searchParams.get("league_key")) ?? DEFAULT_LEAGUE_KEY;
  const queryLeagueId = Number(urlObj.searchParams.get("league_id") ?? "") || null;
  const querySeason = (urlObj.searchParams.get("season") ?? "").trim() || null;
  let leagueIdOverride = queryLeagueId;
  let seasonOverride = querySeason;

  const contentType = req.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const body = (await req.json()) as {
        competition_phase_id?: string;
        league_key?: string;
        league_id?: number;
        season?: string;
      };
      if (!competitionPhaseId && typeof body?.competition_phase_id === "string") {
        competitionPhaseId = body.competition_phase_id.trim();
      }
      const bodyLeagueKey = asLeagueKey(body?.league_key);
      if (bodyLeagueKey) leagueKey = bodyLeagueKey;
      if (body?.league_id != null) leagueIdOverride = Number(body.league_id) || null;
      if (body?.season != null) seasonOverride = body.season.trim() || null;
    } catch {
      // ignore invalid optional body; auth + defaults still apply
    }
  }

  const leagueId = leagueIdOverride ?? LEAGUES[leagueKey].leagueId;
  const season = seasonOverride ?? LEAGUES[leagueKey].season;

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { competitionPhaseId: resolvedCompetitionPhaseId, error: resolveError } = await resolveCompetitionPhaseId(
    supabase,
    LEAGUES[leagueKey],
    competitionPhaseId
  );
  if (resolveError) return resolveError;
  if (!resolvedCompetitionPhaseId) return json(400, { error: "competition_phase_id could not be resolved" });

  let endpoint = "";
  let events: TheSportsDbEvent[] = [];
  try {
    const result = await fetchUpcomingLeagueEvents(leagueKey, leagueId, { ...LEAGUES[leagueKey], season });
    endpoint = result.endpoint;
    events = result.events;
  } catch (error) {
    return json(502, { error: "TheSportsDB error", detail: error instanceof Error ? error.message : String(error) });
  }
  const now = new Date().toISOString();

  const rows = events.map((e: TheSportsDbEvent) => {
    const homeScore = e.intHomeScore != null && e.intHomeScore !== "" ? parseInt(e.intHomeScore, 10) : null;
    const awayScore = e.intAwayScore != null && e.intAwayScore !== "" ? parseInt(e.intAwayScore, 10) : null;

    return {
      competition_phase_id: resolvedCompetitionPhaseId,
      provider_match_id: e.idEvent,
      home_team_name: e.strHomeTeam ?? null,
      away_team_name: e.strAwayTeam ?? null,
      home_team_badge_url: e.strHomeTeamBadge ?? null,
      away_team_badge_url: e.strAwayTeamBadge ?? null,
      kickoff_at: buildKickoffAt(e.dateEvent, e.strTime),
      home_score: homeScore != null && Number.isNaN(homeScore) ? null : homeScore,
      away_score: awayScore != null && Number.isNaN(awayScore) ? null : awayScore,
      status: mapStatus(e.strStatus),
      provider_updated_at: now,
      updated_at: now,
    };
  });

  if (rows.length > 0) {
    const { error } = await supabase.schema("copaosoria").from("match").upsert(rows, {
      onConflict: "competition_phase_id,provider_match_id",
      ignoreDuplicates: false,
    });
    if (error) return json(500, { error: "DB error (upsert match)", details: error.message });
  }

  return json(200, {
    ok: true,
    league_key: leagueKey,
    league_id: leagueId,
    season,
    endpoint,
    competition_phase_id: resolvedCompetitionPhaseId,
    synced: rows.length,
  });
});
