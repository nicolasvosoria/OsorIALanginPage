import { createClient } from "jsr:@supabase/supabase-js@2";
import { serve } from "https://deno.land/std/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isIntInRange(v: unknown, min: number, max: number) {
  return Number.isInteger(v) && (v as number) >= min && (v as number) <= max;
}

function optionalUuid(v: unknown): string | null {
  if (v == null || v === "") return null;
  const s = typeof v === "string" ? v.trim() : String(v);
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return s && uuidRe.test(s) ? s : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json(401, { error: "Missing bearer token" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json(500, { error: "Missing Supabase env vars" });
  }

  const supabaseAuth = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userErr } = await supabaseAuth.auth.getUser();
  if (userErr || !userData?.user) return json(401, { error: "Invalid token" });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const provider_match_id = typeof body.match_id === "string" ? body.match_id.trim() : "";
  const home_team_name = typeof body.home_team_name === "string" ? body.home_team_name.trim() : null;
  const away_team_name = typeof body.away_team_name === "string" ? body.away_team_name.trim() : null;

  const home_score = body.home_score === null ? null : Number(body.home_score);
  const away_score = body.away_score === null ? null : Number(body.away_score);

  const limit_date = typeof body.limit_date === "string" && body.limit_date.trim()
    ? body.limit_date.trim()
    : null;

  const competition_phase_id_input = optionalUuid(body.competition_phase_id);

  if (!provider_match_id) return json(400, { error: "match_id is required" });
  if (home_score !== null && !isIntInRange(home_score, 0, 99)) return json(400, { error: "home_score must be integer 0..99 or null" });
  if (away_score !== null && !isIntInRange(away_score, 0, 99)) return json(400, { error: "away_score must be integer 0..99 or null" });

  const prediction = {
    match_id: provider_match_id,
    home_team_name,
    away_team_name,
    home_score,
    away_score,
  };

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const userEmail = userData.user.email?.trim() || `${userData.user.id}@copaosoria.local`;
  const fallbackUserEmail = `${userData.user.id}@copaosoria.local`;
  const rawUsername =
    typeof userData.user.user_metadata?.username === "string"
      ? userData.user.user_metadata.username
      : typeof userData.user.user_metadata?.full_name === "string"
        ? userData.user.user_metadata.full_name
        : userEmail.split("@")[0];

  const profilePayload = {
    id: userData.user.id,
    email: userEmail,
    username: rawUsername.trim() || "Usuario",
    register_code:
      typeof userData.user.user_metadata?.register_code === "string"
        ? userData.user.user_metadata.register_code
        : null,
  };

  const { error: profileErr } = await supabaseAdmin
    .schema("copaosoria").from("users")
    .upsert(profilePayload, { onConflict: "id", ignoreDuplicates: false });

  if (profileErr) {
    const { error: fallbackProfileErr } = await supabaseAdmin
      .schema("copaosoria").from("users")
      .upsert({ ...profilePayload, email: fallbackUserEmail }, { onConflict: "id", ignoreDuplicates: false });

    if (fallbackProfileErr) {
      return json(500, { error: "DB error (ensure user profile)", details: fallbackProfileErr.message });
    }
  }

  let matchRow: { id: string; competition_phase_id: string } | null = null;

  if (competition_phase_id_input) {
    const { data, error } = await supabaseAdmin
      .schema("copaosoria").from("match")
      .select("id, competition_phase_id")
      .eq("competition_phase_id", competition_phase_id_input)
      .eq("provider_match_id", provider_match_id)
      .maybeSingle();

    if (error) return json(500, { error: "DB error (match lookup)", details: error.message });
    matchRow = data ?? null;
  } else {
    const { data, error } = await supabaseAdmin
      .schema("copaosoria").from("match")
      .select("id, competition_phase_id")
      .eq("provider_match_id", provider_match_id)
      .limit(2);

    if (error) return json(500, { error: "DB error (match lookup)", details: error.message });

    if ((data ?? []).length === 1) {
      matchRow = data![0];
    } else if ((data ?? []).length > 1) {
      return json(400, {
        error: "competition_phase_id is required because provider match_id is not unique across phases",
        match_id: provider_match_id,
      });
    }
  }

  if (!matchRow?.id) {
    return json(409, {
      error: "Match not found in DB. Sync matches first (cron) before saving prediction.",
      match_id: provider_match_id,
      competition_phase_id: competition_phase_id_input,
    });
  }

  const match_id_uuid = matchRow.id;
  const competition_phase_id = competition_phase_id_input ?? matchRow.competition_phase_id;

  let existing: { id: string; limit_date: string | null } | null = null;

  const { data: existingByFk, error: findFkErr } = await supabaseAdmin
    .schema("copaosoria").from("user_prediction")
    .select("id, limit_date")
    .eq("user_id", userData.user.id)
    .eq("match_id", match_id_uuid)
    .maybeSingle();

  if (findFkErr) return json(500, { error: "DB error (find by match_id)", details: findFkErr.message });

  if (existingByFk?.id) {
    existing = existingByFk;
  } else {
    const { data: existingByJson, error: findJsonErr } = await supabaseAdmin
      .schema("copaosoria").from("user_prediction")
      .select("id, limit_date")
      .eq("user_id", userData.user.id)
      .eq("prediction->>match_id", provider_match_id)
      .maybeSingle();

    if (findJsonErr) return json(500, { error: "DB error (find by json match_id)", details: findJsonErr.message });
    existing = existingByJson ?? null;
  }

  const nowIso = new Date().toISOString();

  if (existing?.limit_date) {
    const deadline = new Date(existing.limit_date);
    if (!Number.isNaN(deadline.getTime()) && Date.now() > deadline.getTime()) {
      return json(403, { error: "Deadline passed", code: "DEADLINE_PASSED", limit_date: existing.limit_date });
    }
  }

  if (existing?.id) {
    const { data: updated, error: updErr } = await supabaseAdmin
      .schema("copaosoria").from("user_prediction")
      .update({
        prediction,
        updated_at: nowIso,
        competition_phase_id,
        match_id: match_id_uuid,
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (updErr) return json(409, { error: "DB error (update)", details: updErr.message });
    return json(200, { ok: true, action: "updated", row: updated });
  }

  if (!limit_date) return json(400, { error: "limit_date is required for first insert of a match" });

  const { data: inserted, error: insErr } = await supabaseAdmin
    .schema("copaosoria").from("user_prediction")
    .upsert(
      {
        user_id: userData.user.id,
        prediction,
        limit_date,
        updated_at: nowIso,
        competition_phase_id,
        match_id: match_id_uuid,
      },
      { onConflict: "user_id,match_id", ignoreDuplicates: false }
    )
    .select("*")
    .single();

  if (insErr) return json(409, { error: "DB error (save prediction)", details: insErr.message });
  return json(201, { ok: true, action: "saved", row: inserted });
});