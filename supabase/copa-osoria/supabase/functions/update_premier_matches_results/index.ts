/**
 * Edge Function: actualiza scores y estado de los partidos recientes
 * de la Premier League consultando football-data.org v4.
 *
 * Diseñada para ejecutarse como cron cada hora o cada día.
 * Consulta los últimos 7 días para capturar resultados recientes
 * y partidos en curso.
 *
 * Variables de entorno en Supabase:
 *   FOOTBALL_DATA_API_KEY        – token de football-data.org
 *   SUPABASE_URL                 – inyectado automáticamente
 *   SUPABASE_SERVICE_ROLE_KEY    – inyectado automáticamente
 *   PREMIER_COMPETITION_PHASE_ID – UUID de la fase en copaosoria.competition_phase
 */
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => void;
  env: { get: (key: string) => string | undefined };
};

// @ts-expect-error - ESM URL import; válido en Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FOOTBALL_DATA_BASE = "https://api.football-data.org/v4";
const PL_COMPETITION     = "PL";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function mapStatus(fdStatus: string | undefined): string {
  switch (fdStatus) {
    case "FINISHED":              return "ended";
    case "IN_PLAY":
    case "PAUSED":
    case "LIVE":                  return "live";
    case "POSTPONED":
    case "SUSPENDED":             return "postponed";
    case "CANCELLED":             return "cancelled";
    default:                      return "scheduled";
  }
}

interface FdTeam {
  id: number;
  name: string;
}

interface FdScore {
  fullTime: { home: number | null; away: number | null };
}

interface FdMatch {
  id: number;
  utcDate: string;
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

/** Devuelve YYYY-MM-DD de un Date */
function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

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

  // Ventana de fechas: últimos 7 días hasta hoy
  const now  = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 7);

  const dateFrom = toDateStr(from);
  const dateTo   = toDateStr(now);

  // Fetch partidos recientes (1 request)
  const apiUrl = `${FOOTBALL_DATA_BASE}/competitions/${PL_COMPETITION}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  let result: { ok: boolean; status: number; text: string };
  try {
    const res = await fetch(apiUrl, {
      headers: { "X-Auth-Token": apiKey },
      signal: controller.signal,
    });
    const text = await res.text();
    result = { ok: res.ok, status: res.status, text };
  } finally {
    clearTimeout(timeout);
  }

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
  if (matches.length === 0) {
    return json(200, { ok: true, updated: 0, dateFrom, dateTo });
  }

  const nowIso = now.toISOString();
  const rows = matches.map((m) => ({
    competition_phase_id: competitionPhaseId,
    provider_match_id:    String(m.id),
    home_team_name:       m.homeTeam.name ?? null,
    away_team_name:       m.awayTeam.name ?? null,
    kickoff_at:           m.utcDate ? new Date(m.utcDate).toISOString() : null,
    home_score:           m.score.fullTime.home ?? null,
    away_score:           m.score.fullTime.away ?? null,
    status:               mapStatus(m.status),
    provider_updated_at:  m.lastUpdated ? new Date(m.lastUpdated).toISOString() : nowIso,
    updated_at:           nowIso,
  }));

  // Upsert — actualiza scores y estado de partidos ya existentes
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { error } = await supabase.schema("copaosoria").from("match").upsert(rows, {
    onConflict: "competition_phase_id,provider_match_id",
    ignoreDuplicates: false,
  });
  if (error) return json(500, { error: "DB error (upsert match)", details: error.message });

  return json(200, {
    ok: true,
    updated: rows.length,
    dateFrom,
    dateTo,
    competition_phase_id: competitionPhaseId,
  });
});
