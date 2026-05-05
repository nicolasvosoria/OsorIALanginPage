import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import MatchResultCard from "@/copa-osoria/components/MatchResultCard";
import BottomNav from "@/copa-osoria/components/layout/BottomNav";
import { Trophy, Sun, Moon, Calendar, Loader2 } from "lucide-react";
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

import { isPredictionClosed } from "@/copa-osoria/lib/predictionDeadline";
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
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");
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
      saveOnePrediction(item);
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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-primary px-4 pt-6 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src="/copa_osoria_logo.svg"
                alt="Copa Osoria"
                className="w-20 h-20 object-contain"
              />
              <div>
                <h1 className="text-lg font-display font-bold text-primary-foreground">
                  Polla Mundialista Copa Osoria 2026
                </h1>
                <p className="text-xs text-primary-foreground/70">
                  Partidos y resultados
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors"
              aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
            >
              {isDark ? (
                <Sun className="text-primary-foreground" size={18} />
              ) : (
                <Moon className="text-primary-foreground" size={18} />
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Ranking Global", value: "#5" },
              { label: "Puntos", value: `${totalPointsFromDb} pts` },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-primary-foreground/10 rounded-xl px-3 py-2 text-center"
              >
                <p className="text-[10px] text-primary-foreground/60 font-medium">
                  {stat.label}
                </p>
                <p className="text-sm font-display font-bold text-primary-foreground">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selector de competición */}
      <div className="max-w-lg mx-auto px-4 mt-4">
        <div className="bg-card rounded-2xl border border-border shadow-md p-1.5 grid grid-cols-2 gap-1 sm:grid-cols-3">
          {competitionOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setCompetition(option.key)}
              className={`min-h-11 px-2 rounded-xl text-xs font-display font-semibold transition-all ${
                competition === option.key
                  ? "gradient-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Explicación del sistema de puntos */}
      <div className="max-w-lg mx-auto px-4 mt-4">
        <div className="bg-card rounded-2xl border border-border/60 px-4 py-3 shadow-sm">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            ¿Cómo sumas? <strong className="text-foreground">0</strong> pts si no le atinaste · <strong className="text-foreground">2</strong> pts si acertaste quién gana · <strong className="text-foreground">5</strong> pts si clavaste el marcador exacto.
          </p>
        </div>
      </div>

      {/* Phase toggle (solo para Mundial) */}
      {competition === "mundial" && (
        <div className="max-w-lg mx-auto px-4 mt-4">
          <div className="bg-card rounded-2xl border border-border shadow-md p-1.5 flex gap-1">
            {(["grupos", "playoffs"] as Phase[]).map((p) => (
              <button
                key={p}
                onClick={() => setPhase(p)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-display font-semibold transition-all ${
                  phase === p
                    ? "gradient-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "grupos" ? "Partidos por día" : "Eliminatorias"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Partidos por día */}
      <div className="max-w-lg mx-auto px-4 mt-5 space-y-6">
        {(phase === "grupos" && competition === "mundial") || isFootballLeagueKey(competition) ? (
          <>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="animate-spin" size={20} />
                <span className="text-sm">Cargando partidos…</span>
              </div>
            ) : days.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                {getEmptyMatchesMessage(competition)}
              </p>
            ) : (
              <>
            {days.map((day) => (
              <section key={day.date}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={18} className="text-primary" />
                  <h2 className="text-sm font-display font-bold text-foreground">
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
                      disabled={isPredictionClosed(day.date, match.time)}
                      matchDate={day.date}
                      pointsEarned={scoresByMatchId[match.id] ?? null}
                    />
                  ))}
                </div>
              </section>
            ))}
              </>
            )}
            {!loading && ((phase === "grupos" && competition === "mundial") || isFootballLeagueKey(competition)) && !isAuthenticated && (
              <p className="text-center text-sm text-muted-foreground py-2">
                Inicia sesión para que se guarden tus predicciones al cambiar el marcador
              </p>
            )}
            {saveError ? (
              <p className="text-center text-sm text-destructive py-2">{saveError}</p>
            ) : null}
          </>
        ) : null}

        {competition === "mundial" && phase === "playoffs" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Trophy className="mx-auto text-muted-foreground/30 mb-3" size={48} />
            <p className="text-muted-foreground text-sm">
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
