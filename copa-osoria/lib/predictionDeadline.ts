/**
 * Cierre de predicciones: 5 minutos antes del inicio del partido (GMT-5).
 */

export const MINUTES_BEFORE_MATCH_CLOSE = 5;

function buildMatchStartISO(date: string, time: string): string {
  if (!date || !time) return "";
  return `${date}T${time}:00-05:00`;
}

/** Timestamp (ms) hasta cuando se puede elegir marcador: 5 min antes del inicio. */
export function getPredictionDeadlineMs(date: string, time: string): number | null {
  const iso = buildMatchStartISO(date, time);
  if (!iso) return null;
  try {
    const start = new Date(iso).getTime();
    return start - MINUTES_BEFORE_MATCH_CLOSE * 60 * 1000;
  } catch {
    return null;
  }
}

/** True si ya pasó la hora límite (5 min antes del partido). */
export function isPredictionClosed(date: string, time: string): boolean {
  const deadline = getPredictionDeadlineMs(date, time);
  if (deadline == null) return false;
  return Date.now() >= deadline;
}

/** Formatea ms restantes en días, horas y minutos: "Xd Xh Xm" */
export function formatTimeLeft(msLeft: number): string {
  if (msLeft <= 0) return "Predicción cerrada";
  const totalSec = Math.floor(msLeft / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(" ");
}
