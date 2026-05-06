import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import MatchResultCard from "@/copa-osoria/components/MatchResultCard";
import BottomNav from "@/copa-osoria/components/layout/BottomNav";
import { Trophy, Calendar, Loader2 } from "lucide-react";
import { matchesByDay } from "@/copa-osoria/data/matchesByDay";
import type { DayMatches } from "@/copa-osoria/data/matchesByDay";
import {
  FOOTBALL_LEAGUES,
  getFootballLeagueNextMatches,
  getWorldCup2026Matches,
  mergeScoresIntoDays,
  groupMatchesByDay,
  type FootballLeagueKey,
} from "@/copa-osoria/lib/api/theSportsDbApi";
import { useUserPrediction } from "@/copa-osoria/hooks/useUserPrediction";
import type { UserPredictionRecordItem } from "@/copa-osoria/types/pickem";
import type { MatchItem } from "@/copa-osoria/data/matchesByDay";

function findMatchInDays(days: DayMatches[], matchId: string): { day: DayMatches; match: { id: string; homeTeam: string; awayTeam: string; time: string } } | null {
  for (const day of days) {
    const match = day.matches.find((m) => m.id === matchId);
    if (match) return { day, match };
  }
  return null;
}

const SAVE_DEBOUNCE_MS = 600;

type Phase = PhaseKey;
type Competition = CompetitionKey;

const competitionOptions: Array<{ key: Competition; label: string }> = [
  { key: "mundial", label: "Mundial 2026" },
  { key: "champions", label: FOOTBALL_LEAGUES.champions.label },
  { key: "premier", label: FOOTBALL_LEAGUES.premier.label },
  { key: "laliga", label: FOOTBALL_LEAGUES.laliga.label },
  { key: "seriea", label: FOOTBALL_LEAGUES.seriea.label },
  { key: "bundesliga", label: FOOTBALL_LEAGUES.bundesliga.label },
];

function isFootballLeagueKey(key: Competition): key is FootballLeagueKey {
  return key !== "mundial";
}

function getEmptyMatchesMessage(competition: Competition): string {
  if (competition === "mundial") return "No hay partidos del Mundial disponibles.";
  const label = FOOTBALL_LEAGUES[competition].emptyLabel;
  return `No hay partidos de ${label} en las próximas fechas.`;
}

import { getCompetitionPhaseId, type CompetitionKey, type PhaseKey } from "@/copa-osoria/lib/competitionPhase";

/** Solo mostramos partidos de los primeros 3 días (11, 12 y 13 Jun 2026). */
const FIRST_DAY = "2026-06-11";
const LAST_DAY_FIRST_3 = "2026-06-13";
const matchesFirst3Days: DayMatches[] = matchesByDay.filter(
  (d) => d.date >= FIRST_DAY && d.date <= LAST_DAY_FIRST_3
);

/** Estado de predicciones por partido: { [matchId]: { home, away } } */
function buildInitialPredictions(daysData: DayMatches[]): Record<string, { home: string; away: string }> {
  const out: Record<string, { home: string; away: string }> = {};
  for (const day of daysData) {
    for (const m of day.matches) {
      out[m.id] = {
        home: m.homeScore !== null ? String(m.homeScore) : "",
        away: m.awayScore !== null ? String(m.awayScore) : "",
      };
    }
  }
  return out;
}

const Predictions = () => {
  const [competition, setCompetition] = useState<Competition>("mundial");
  const [phase, setPhase] = useState<Phase>("grupos");
  const [competitionPhaseId, setCompetitionPhaseId] = useState<string | null>(null);
  const [days, setDays] = useState<DayMatches[]>(matchesFirst3Days);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const pageClass = isDark ? "bg-[#07110b] text-white" : "bg-[#f5faf8] text-slate-950";
  const gridClass = isDark ? "opacity-70" : "opacity-35";
  const glowClass = isDark
    ? "bg-[radial-gradient(circle_at_50%_0%,rgba(45,226,194,.24),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(34,197,94,.13),transparent_36%)]"
    : "bg-[radial-gradient(circle_at_50%_0%,rgba(45,226,194,.18),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(34,197,94,.10),transparent_36%)]";
  const panelClass = isDark
    ? "border-[#2de2c2]/20 bg-white/[.08] shadow-[0_0_35px_rgba(45,226,194,.1)]"
    : "border-emerald-900/10 bg-white/90 shadow-[0_18px_40px_rgba(15,23,42,.08)]";
  const mutedTextClass = isDark ? "text-gray-300" : "text-slate-600";
  const strongTextClass = isDark ? "text-white" : "text-slate-950";
  const activeClass = isDark ? "bg-[#2de2c2] text-black" : "bg-[#149b78] text-white";
  const inactiveClass = isDark ? "text-gray-300 hover:text-white hover:bg-white/[.06]" : "text-slate-600 hover:text-slate-950 hover:bg-emerald-50";
  const { saveOnePrediction, loadAllPredictions, loadScores, error: saveError, isAuthenticated } = useUserPrediction();
  const initialLoadDoneRef = useRef(false);
  const lastChangedMatchIdRef = useRef<string | null>(null);

  const [predictions, setPredictions] = useState<Record<string, { home: string; away: string }>>(() =>
    buildInitialPredictions(matchesFirst3Days)
  );
  /** Puntajes por partido desde user_score (solo lo que obtuvo el usuario en esa predicción). */
  const [scoresByMatchId, setScoresByMatchId] = useState<Record<string, number>>({});
  /** Total de puntos del usuario desde user_score. */
  const [totalPointsFromDb, setTotalPointsFromDb] = useState<number>(0);
  const [recentlySavedMatchId, setRecentlySavedMatchId] = useState<string | null>(null);

  const setPredictionForMatch = useCallback((matchId: string, field: "home" | "away", value: string) => {
    lastChangedMatchIdRef.current = matchId;
    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        home: prev[matchId]?.home ?? "",
        away: prev[matchId]?.away ?? "",
        [field]: value,
      },
    }));
  }, []);

  useEffect(() => {
    if (!isAuthenticated || loading) return;
    let cancelled = false;
    Promise.all([loadAllPredictions(), loadScores()]).then(([predRes, scoreRes]) => {
      if (cancelled) return;
      if (predRes.data) {
        setPredictions((prev) => {
          const next = { ...prev };
          for (const [matchId, scores] of Object.entries(predRes.data!)) {
            next[matchId] = {
              home: String(scores.home_score),
              away: String(scores.away_score),
            };
          }
          return next;
        });
      }
      if (scoreRes.data) {
        setScoresByMatchId(scoreRes.data.scoresByMatchId);
        setTotalPointsFromDb(scoreRes.data.totalPoints);
      }
      initialLoadDoneRef.current = true;
    });
    return () => { cancelled = true; };
  }, [isAuthenticated, loading, loadAllPredictions, loadScores]);

  useEffect(() => {
    if (!isAuthenticated || !initialLoadDoneRef.current) return;
    const matchId = lastChangedMatchIdRef.current;
    if (!matchId) return;
    const found = findMatchInDays(days, matchId);
    if (!found) return;
    const { day, match } = found;
    const home = predictions[match.id]?.home ?? "";
    const away = predictions[match.id]?.away ?? "";
    const limit_date = day.date && match.time ? `${day.date}T${match.time}:00-05:00` : "";
    const item: UserPredictionRecordItem = {
      match_id: match.id,
      home_team_name: match.homeTeam,
      away_team_name: match.awayTeam,
      limit_date,
      home_score: parseInt(home, 10) || 0,
      away_score: parseInt(away, 10) || 0,
      competition_phase_id: competitionPhaseId,
    };
    const t = setTimeout(() => {
      lastChangedMatchIdRef.current = null;
      saveOnePrediction(item).then((res) => {
        if (!res.error) {
          setRecentlySavedMatchId(match.id);
          window.setTimeout(() => setRecentlySavedMatchId((current) => (current === match.id ? null : current)), 2200);
        }
      });
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [predictions, days, isAuthenticated, saveOnePrediction, competitionPhaseId]);

  useEffect(() => {
    let cancelled = false;
    getCompetitionPhaseId(competition, phase).then((id) => {
      if (!cancelled) setCompetitionPhaseId(id);
    });
    return () => { cancelled = true; };
  }, [competition, phase]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    if (competition === "mundial") {
      getWorldCup2026Matches()
        .then((apiMatches) => {
          if (cancelled) return;
          const merged = mergeScoresIntoDays(matchesFirst3Days, apiMatches);
          setDays(merged);
          setPredictions((prev) => {
            const next = buildInitialPredictions(merged);
            return { ...next, ...prev };
          });
          setLoading(false);
        })
        .catch(() => {
          if (!cancelled) {
            setDays(matchesFirst3Days);
            setLoading(false);
          }
        });
    } else if (isFootballLeagueKey(competition)) {
      getFootballLeagueNextMatches(competition)
        .then((apiMatches) => {
          if (cancelled) return;
          const grouped = groupMatchesByDay(apiMatches);
          setDays(grouped);
          setPredictions((prev) => {
            const next = buildInitialPredictions(grouped);
            return { ...next, ...prev };
          });
          setLoading(false);
        })
        .catch(() => {
          if (!cancelled) {
            setDays([]);
            setLoading(false);
          }
        });
    }
    return () => { cancelled = true; };
  }, [competition]);

  return (
    <div className={`relative min-h-screen overflow-hidden pb-24 ${pageClass}`}>
      <div className={`pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] bg-[size:26px_26px] ${gridClass}`} />
      <div className={`pointer-events-none fixed inset-0 ${glowClass}`} />
      {/* Header */}
      <div className="relative z-10 px-4 pt-6 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-3">
              <img
                src="/copa_logo_blanco.png"
                alt="Copa Osoria"
                className="w-20 h-20 object-contain"
              />
              <div>
                <h1 className={`text-lg font-display font-bold ${strongTextClass}`}>
                  Polla Mundialista Copa Osoria 2026
                </h1>
                <p className={`text-xs ${mutedTextClass}`}>
                  Partidos y resultados
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Ranking Global", value: "#5" },
              { label: "Puntos", value: `${totalPointsFromDb} pts` },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`rounded-xl border px-3 py-2 text-center ${panelClass}`}
              >
                <p className={`text-[10px] font-medium ${mutedTextClass}`}>
                  {stat.label}
                </p>
                <p className={`text-sm font-display font-bold ${strongTextClass}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selector de competición */}
      <div className="relative z-10 max-w-lg mx-auto px-4 mt-4">
        <div className={`rounded-2xl border p-1.5 grid grid-cols-2 gap-1 backdrop-blur sm:grid-cols-3 ${panelClass}`}>
          {competitionOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setCompetition(option.key)}
              className={`min-h-11 px-2 rounded-xl text-xs font-display font-semibold transition-all ${
                competition === option.key
                  ? `${activeClass} shadow-[0_0_22px_rgba(45,226,194,.2)]`
                  : inactiveClass
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Explicación del sistema de puntos */}
      <div className="relative z-10 max-w-lg mx-auto px-4 mt-4">
        <div className={`rounded-2xl border px-4 py-3 backdrop-blur ${panelClass}`}>
          <p className={`text-xs text-center leading-relaxed ${mutedTextClass}`}>
            ¿Cómo sumas? <strong className={strongTextClass}>0</strong> pts si no le atinaste · <strong className={strongTextClass}>2</strong> pts si acertaste quién gana · <strong className={strongTextClass}>5</strong> pts si clavaste el marcador exacto.
          </p>
        </div>
      </div>

      {/* Phase toggle (solo para Mundial) */}
      {competition === "mundial" && (
        <div className="relative z-10 max-w-lg mx-auto px-4 mt-4">
          <div className={`rounded-2xl border p-1.5 flex gap-1 backdrop-blur ${panelClass}`}>
            {(["grupos", "playoffs"] as Phase[]).map((p) => (
              <button
                key={p}
                onClick={() => setPhase(p)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-display font-semibold transition-all ${
                  phase === p
                    ? `${activeClass} shadow-[0_0_22px_rgba(45,226,194,.2)]`
                    : inactiveClass
                }`}
              >
                {p === "grupos" ? "Partidos por día" : "Eliminatorias"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Partidos por día */}
      <div className="relative z-10 max-w-lg mx-auto px-4 mt-5 space-y-6">
        {(phase === "grupos" && competition === "mundial") || isFootballLeagueKey(competition) ? (
          <>
            {loading ? (
              <div className={`flex items-center justify-center gap-2 py-8 ${mutedTextClass}`}>
                <Loader2 className="animate-spin text-[#80ffe7]" size={20} />
                <span className="text-sm">Cargando partidos…</span>
              </div>
            ) : days.length === 0 ? (
              <p className={`text-center text-sm py-8 ${mutedTextClass}`}>
                {getEmptyMatchesMessage(competition)}
              </p>
            ) : (
              <>
            {days.map((day) => (
              <section key={day.date}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={18} className="text-[#80ffe7]" />
                  <h2 className={`text-sm font-display font-bold ${strongTextClass}`}>
                    {day.dateLabel}
                  </h2>
                </div>
                <div className="space-y-3">
                  {day.matches.map((match, i) => (
                    <MatchResultCard
                      key={match.id}
                      {...match}
                      index={i}
                      homeValue={predictions[match.id]?.home ?? ""}
                      awayValue={predictions[match.id]?.away ?? ""}
                      onHomeChange={(v) => setPredictionForMatch(match.id, "home", v)}
                      onAwayChange={(v) => setPredictionForMatch(match.id, "away", v)}
                      disabled={false}
                      matchDate={day.date}
                      pointsEarned={scoresByMatchId[match.id] ?? null}
                      recentlySaved={recentlySavedMatchId === match.id}
                    />
                  ))}
                </div>
              </section>
            ))}
              </>
            )}
            {!loading && ((phase === "grupos" && competition === "mundial") || isFootballLeagueKey(competition)) && !isAuthenticated && (
              <p className={`text-center text-sm py-2 ${mutedTextClass}`}>
                Inicia sesión para que se guarden tus predicciones al cambiar el marcador
              </p>
            )}
            {saveError ? (
              <p className="text-center text-sm text-red-300 py-2">{saveError}</p>
            ) : recentlySavedMatchId ? (
              <p className={`text-center text-sm py-2 ${isDark ? "text-[#80ffe7]" : "text-emerald-700"}`}>
                Marcador registrado correctamente.
              </p>
            ) : null}
          </>
        ) : null}

        {competition === "mundial" && phase === "playoffs" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Trophy className={`mx-auto mb-3 ${isDark ? "text-gray-300/30" : "text-slate-500/40"}`} size={48} />
            <p className={`text-sm ${mutedTextClass}`}>
              Las eliminatorias estarán disponibles próximamente
            </p>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Predictions;
