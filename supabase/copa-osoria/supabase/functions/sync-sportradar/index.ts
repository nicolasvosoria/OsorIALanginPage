/**
 * Edge Function: sincroniza el calendario completo de la Premier League
 * desde football-data.org v4 y guarda los datos en copaosoria.match.
 *
 * Variables de entorno en Supabase:
 *   FOOTBALL_DATA_API_KEY       – token de football-data.org
 *   CRON_SECRET                 – secreto para autenticar la llamada
 *   SUPABASE_URL                – inyectado automáticamente
 *   SUPABASE_SERVICE_ROLE_KEY   – inyectado automáticamente
 *   PREMIER_COMPETITION_PHASE_ID – UUID de la fase en copaosoria.competition_phase
 *
 * Invocación:
 *   POST /sync-sportradar
 *   Header: x-cron-secret: <CRON_SECRET>
 *   Query (opcional): ?competition_phase_id=<uuid>&season=2025
 */
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => void;
  env: { get: (key: string) => string | undefined };
};

// @ts-expect-error - ESM URL import; válido en Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FOOTBALL_DATA_BASE = "https://api.football-data.org/v4";
const PL_COMPETITION     = "PL";
const DEFAULT_SEASON     = 2025; // temporada 2025-2026

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

/**
 * Mapea el campo `status` de football-data.org al valor interno.
 * https://docs.football-data.org/general/v4/match.html
 */
function mapStatus(fdStatus: string | undefined): string {
  switch (fdStatus) {
    case "FINISHED":                      return "ended";
    case "IN_PLAY":
    case "PAUSED":
    case "LIVE":                          return "live";
    case "POSTPONED":
    case "SUSPENDED":                     return "postponed";
    case "CANCELLED":                     return "cancelled";
    default:                              return "scheduled"; // SCHEDULED, TIMED, TBD
  }
}

// ---------------------------------------------------------------------------
// Tipos para la respuesta de football-data.org v4
// ---------------------------------------------------------------------------
interface FdTeam {
  id: number;
  name: string;
}

interface FdScore {
  fullTime: { home: number | null; away: number | null };
}

interface FdMatch {
  id: number;
  utcDate: string;        // "2025-08-15T19:00:00Z"
  status: string;
  lastUpdated: string;
  homeTeam: FdTeam;
  awayTeam: FdTeam;
  score: FdScore;
}

interface FdMatchesResponse {
  matches: FdMatch[];
  message?: string;
  errorCode?: number;
}

// ---------------------------------------------------------------------------
// Fetch con timeout
// ---------------------------------------------------------------------------
async function fetchWithTimeout(url: string, headers: Record<string, string>, timeoutMs: number) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  } finally {
    clearTimeout(t);
  }
}

// ---------------------------------------------------------------------------
// Handler principal
// ---------------------------------------------------------------------------
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  // Auth
  const expectedSecret = (Deno.env.get("CRON_SECRET") ?? "").trim();
  const gotSecret      = (req.headers.get("x-cron-secret") ?? "").trim();
  if (!expectedSecret || gotSecret !== expectedSecret) return json(401, { error: "Unauthorized" });

  // Supabase client
  const supabaseUrl    = (Deno.env.get("SUPABASE_URL") ?? "").trim();
  const serviceRoleKey = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "").trim();
  if (!supabaseUrl || !serviceRoleKey) return json(500, { error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });

  // API key
  const apiKey = (Deno.env.get("FOOTBALL_DATA_API_KEY") ?? "").trim();
  if (!apiKey) return json(500, { error: "Missing FOOTBALL_DATA_API_KEY" });

  // competition_phase_id
  const urlObj  = new URL(req.url);
  const envCp   = (Deno.env.get("PREMIER_COMPETITION_PHASE_ID") ?? "").trim();
  const queryCp = (urlObj.searchParams.get("competition_phase_id") ?? "").trim();
  const competitionPhaseId = queryCp || envCp;
  if (!competitionPhaseId) {
    return json(400, {
      error: "Missing competition_phase_id. Set PREMIER_COMPETITION_PHASE_ID or pass ?competition_phase_id=...",
    });
  }

  const season = Number(urlObj.searchParams.get("season") ?? DEFAULT_SEASON);

  // Fetch temporada completa (1 sola request)
  const apiUrl = `${FOOTBALL_DATA_BASE}/competitions/${PL_COMPETITION}/matches?season=${season}`;
  const result = await fetchWithTimeout(
    apiUrl,
    { "X-Auth-Token": apiKey },
    30000
  );

  if (!result.ok) {
    return json(502, {
      error: `football-data.org error ${result.status}`,
      detail: result.text.slice(0, 2000),
    });
  }

  const data = JSON.parse(result.text) as FdMatchesResponse;
  if (data.errorCode) {
    return json(502, { error: data.message ?? "football-data.org API error", errorCode: data.errorCode });
  }

  const matches = data.matches ?? [];
  const now = new Date().toISOString();

  const rows = matches.map((m) => ({
    competition_phase_id: competitionPhaseId,
    provider_match_id:    String(m.id),
    home_team_name:       m.homeTeam.name ?? null,
    away_team_name:       m.awayTeam.name ?? null,
    kickoff_at:           m.utcDate ? new Date(m.utcDate).toISOString() : null,
    home_score:           m.score.fullTime.home ?? null,
    away_score:           m.score.fullTime.away ?? null,
    status:               mapStatus(m.status),
    provider_updated_at:  m.lastUpdated ? new Date(m.lastUpdated).toISOString() : now,
    updated_at:           now,
  }));

  // Upsert en lotes de 100
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const batchSize = 100;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.schema("copaosoria").from("match").upsert(batch, {
      onConflict: "competition_phase_id,provider_match_id",
      ignoreDuplicates: false,
    });
    if (error) return json(500, { error: "DB error (upsert match)", details: error.message });
  }

  return json(200, {
    ok: true,
    competition: PL_COMPETITION,
    season,
    fetched: matches.length,
    synced: rows.length,
    competition_phase_id: competitionPhaseId,
  });
});
