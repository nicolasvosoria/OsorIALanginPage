declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => void;
  env: { get: (key: string) => string | undefined };
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const THE_SPORTS_DB_BASE = "https://www.thesportsdb.com/api/v1/json/123";
const FIFA_WORLD_CUP_LEAGUE_ID = 4429;
const TARGET_YEAR = 2026;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function mapStatus(strStatus: string | undefined): string | null {
  if (strStatus == null || strStatus === "") return "scheduled";
  const s = strStatus.toLowerCase();
  if (s === "finished" || s === "ended" || s === "closed") return "ended";
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

function isTargetYear(dateEvent: string, kickoffAt: string | null): boolean {
  const norm = normalizeDateEvent(dateEvent);
  if (norm && /^\d{4}-\d{2}-\d{2}$/.test(norm)) {
    const y = Number(norm.slice(0, 4));
    if (!Number.isNaN(y)) return y === TARGET_YEAR;
  }
  if (kickoffAt) {
    const d = new Date(kickoffAt);
    if (!Number.isNaN(d.getTime())) return d.getUTCFullYear() === TARGET_YEAR;
  }
  return false;
}

interface TheSportsDbEvent {
  idEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  dateEvent: string;
  strTime: string;
  strStatus?: string;
}

interface TheSportsDbEventsResponse {
  events: TheSportsDbEvent[] | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const expectedSecret = (Deno.env.get("CRON_SECRET") ?? "").trim();
  const gotSecret = (req.headers.get("x-cron-secret") ?? "").trim();
  if (!expectedSecret || gotSecret !== expectedSecret) return json(401, { error: "Unauthorized" });

  const supabaseUrl = (Deno.env.get("SUPABASE_URL") ?? "").trim();
  const supabaseKey = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "").trim();
  if (!supabaseUrl || !supabaseKey) return json(500, { error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });

  const urlObj = new URL(req.url);

  const envCp = (Deno.env.get("WORLD_CUP_COMPETITION_PHASE_ID") ?? "").trim();
  const queryCp = (urlObj.searchParams.get("competition_phase_id") ?? "").trim();
  let competitionPhaseId: string | null = queryCp || envCp || null;

  const supabase = createClient(supabaseUrl, supabaseKey);

  if (!competitionPhaseId) {
    const { data: comp, error: compErr } = await supabase
      .schema("copaosoria").from("competition")
      .select("id")
      .eq("name", "mundial")
      .maybeSingle();

    if (compErr) return json(500, { error: "DB error (competition)", details: compErr.message });
    if (!comp?.id) return json(400, { error: "competition_phase_id not provided and competition 'mundial' not found" });

    const { data: phase, error: phaseErr } = await supabase
      .schema("copaosoria").from("phase")
      .select("id")
      .eq("name", "fase de grupos")
      .maybeSingle();

    if (phaseErr) return json(500, { error: "DB error (phase)", details: phaseErr.message });
    if (!phase?.id) return json(400, { error: "competition_phase_id not provided and phase 'fase de grupos' not found" });

    const { data: cp, error: cpErr } = await supabase
      .schema("copaosoria").from("competition_phase")
      .select("id")
      .eq("competition_id", comp.id)
      .eq("phase_id", phase.id)
      .maybeSingle();

    if (cpErr) return json(500, { error: "DB error (competition_phase)", details: cpErr.message });
    if (!cp?.id) return json(400, { error: "competition_phase_id not provided and competition_phase not found" });

    competitionPhaseId = cp.id;
  }

  const apiUrl = `${THE_SPORTS_DB_BASE}/eventsseason.php?id=${FIFA_WORLD_CUP_LEAGUE_ID}&s=${TARGET_YEAR}`;

  const res = await fetch(apiUrl);
  if (!res.ok) {
    const text = await res.text();
    return json(502, { error: `TheSportsDB error ${res.status}`, detail: text });
  }

  const data: TheSportsDbEventsResponse = await res.json();
  const events = data.events ?? [];
  const now = new Date().toISOString();

  const rows = events
    .map((e) => {
      const kickoff_at = buildKickoffAt(e.dateEvent, e.strTime);
      if (!isTargetYear(e.dateEvent, kickoff_at)) return null;

      const homeScore = e.intHomeScore != null && e.intHomeScore !== "" ? parseInt(e.intHomeScore, 10) : null;
      const awayScore = e.intAwayScore != null && e.intAwayScore !== "" ? parseInt(e.intAwayScore, 10) : null;

      return {
        competition_phase_id: competitionPhaseId,
        provider_match_id: e.idEvent,
        home_team_name: e.strHomeTeam ?? null,
        away_team_name: e.strAwayTeam ?? null,
        kickoff_at,
        home_score: homeScore != null && Number.isNaN(homeScore) ? null : homeScore,
        away_score: awayScore != null && Number.isNaN(awayScore) ? null : awayScore,
        status: mapStatus(e.strStatus),
        provider_updated_at: now,
        updated_at: now,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (rows.length > 0) {
    const { error } = await supabase.schema("copaosoria").from("match").upsert(rows, {
      onConflict: "competition_phase_id,provider_match_id",
      ignoreDuplicates: false,
    });
    if (error) return json(500, { error: "DB error (upsert match)", details: error.message });
  }

  const { data: linked, error: linkErr } = await supabase.schema("copaosoria").rpc("backfill_user_prediction_match_id", {
    p_competition_phase_id: competitionPhaseId,
  });

  if (linkErr) return json(500, { error: "DB error (backfill match_id)", details: linkErr.message });

  return json(200, {
    ok: true,
    year: TARGET_YEAR,
    fetched: events.length,
    synced: rows.length,
    filtered_out: events.length - rows.length,
    competition_phase_id: competitionPhaseId,
    linked_predictions: linked ?? 0,
  });
});