import { supabase } from "@/copa-osoria/lib/supabase";

/** Claves de competición y fase usadas en la UI (Predictions). */
export type CompetitionKey = "mundial" | "champions" | "premier" | "laliga" | "seriea" | "bundesliga";
export type PhaseKey = "grupos" | "playoffs";

/** Nombres esperados en las tablas competition y phase (ajustar si tu BD usa otros). */
const COMPETITION_NAME_BY_KEY: Partial<Record<CompetitionKey, string>> = {
  mundial: "mundial",
  champions: "Champions League",
  premier: "Premier League",
  laliga: "La Liga",
  seriea: "Serie A",
  bundesliga: "Bundesliga",
};

/** Nombres en la tabla phase (según tus registros: fase de grupos, semifinal, cuartos de final, final). */
const PHASE_NAME_BY_KEY: Record<PhaseKey, string> = {
  grupos: "fase de grupos",
  playoffs: "cuartos de final",
};

/**
 * Obtiene el UUID de competition_phase para la combinación competición + fase.
 * 1. Consulta competition por nombre → competition_id
 * 2. Consulta phase por nombre → phase_id
 * 3. Filtra competition_phase por competition_id y phase_id → id (resultado deseado).
 * Ese id se envía al crear el registro en user_prediction.
 */
export async function getCompetitionPhaseId(
  competitionKey: CompetitionKey,
  phaseKey: PhaseKey
): Promise<string | null> {
  const competitionName = COMPETITION_NAME_BY_KEY[competitionKey];
  if (!competitionName) return null;

  const phaseName = PHASE_NAME_BY_KEY[phaseKey];

  const { data: competitionRow, error: errCompetition } = await supabase
    .from("competition")
    .select("id")
    .eq("name", competitionName)
    .maybeSingle();

  if (errCompetition || !competitionRow?.id) return null;

  const { data: phaseRow, error: errPhase } = await supabase
    .from("phase")
    .select("id")
    .eq("name", phaseName)
    .maybeSingle();

  if (errPhase || !phaseRow?.id) return null;

  const { data: cpRow, error: errCp } = await supabase
    .from("competition_phase")
    .select("id")
    .eq("competition_id", competitionRow.id)
    .eq("phase_id", phaseRow.id)
    .maybeSingle();

  if (errCp || !cpRow?.id) return null;
  return cpRow.id;
}
