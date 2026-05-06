import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Calendar, Loader2 } from "lucide-react";
import BottomNav from "@/copa-osoria/components/layout/BottomNav";
import MatchResultCard from "@/copa-osoria/components/MatchResultCard";
import { matchesByDay } from "@/copa-osoria/data/matchesByDay";
import type { DayMatches } from "@/copa-osoria/data/matchesByDay";
import {
  getFootballLeagueNextMatches,
  getWorldCup2026Matches,
  mergeScoresIntoDays,
  groupMatchesByDay,
  type FootballLeagueKey,
} from "@/copa-osoria/lib/api/theSportsDbApi";
import { getCompetitionPhaseId, type CompetitionKey } from "@/copa-osoria/lib/competitionPhase";
import { useUserPrediction } from "@/copa-osoria/hooks/useUserPrediction";
import type { UserPredictionRecordItem } from "@/copa-osoria/types/pickem";

const FIRST_DAY = "2026-06-11";
const LAST_DAY_FIRST_3 = "2026-06-13";
const matchesFirst3Days: DayMatches[] = matchesByDay.filter((d) => d.date >= FIRST_DAY && d.date <= LAST_DAY_FIRST_3);

const LEAGUES: Array<{ key: "mundial" | FootballLeagueKey; label: string }> = [
  { key: "mundial", label: "Mundial 2026" },
  { key: "champions", label: "Champions League" },
  { key: "premier", label: "Premier League" },
  { key: "laliga", label: "La Liga" },
  { key: "seriea", label: "Serie A" },
  { key: "bundesliga", label: "Bundesliga" },
];

type MatchWithMeta = {
  day: DayMatches;
  match: DayMatches["matches"][number];
  leagueLabel: string;
  leagueKey: CompetitionKey;
};

const SAVE_DEBOUNCE_MS = 600;

export default function UpcomingMatches() {
  const [loading, setLoading] = useState(true);
  const [allMatches, setAllMatches] = useState<MatchWithMeta[]>([]);
  const [predictions, setPredictions] = useState<Record<string, { home: string; away: string }>>({});
  const { saveOnePrediction, loadAllPredictions, isAuthenticated } = useUserPrediction();
  const initialLoadDoneRef = useRef(false);
  const lastChangedMatchIdRef = useRef<string | null>(null);
  const [phaseIdsByLeague, setPhaseIdsByLeague] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all(
      LEAGUES.map(async (league) => {
        try {
          if (league.key === "mundial") {
            const apiMatches = await getWorldCup2026Matches();
            const days = mergeScoresIntoDays(matchesFirst3Days, apiMatches);
            return days.flatMap((day) => day.matches.map((match) => ({ day, match, leagueLabel: league.label, leagueKey: league.key })));
          }
          const apiMatches = await getFootballLeagueNextMatches(league.key);
          const days = groupMatchesByDay(apiMatches);
          return days.flatMap((day) => day.matches.map((match) => ({ day, match, leagueLabel: league.label, leagueKey: league.key })));
        } catch {
          return [] as MatchWithMeta[];
        }
      })
    ).then((chunks) => {
      if (cancelled) return;
      setAllMatches(chunks.flat());
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      LEAGUES.map(async (l) => [l.key, await getCompetitionPhaseId(l.key, "grupos")] as const)
    ).then((rows) => {
      if (cancelled) return;
      setPhaseIdsByLeague(
        rows.reduce<Record<string, string>>((acc, [k, id]) => {
          if (id) acc[k] = id;
          return acc;
        }, {})
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const next5 = useMemo(() => {
    const now = Date.now();
    return allMatches
      .filter(({ match }) => {
        if (!match.kickoffAt) return false;
        const ms = new Date(match.kickoffAt).getTime();
        return !Number.isNaN(ms) && ms > now;
      })
      .sort((a, b) => new Date(a.match.kickoffAt!).getTime() - new Date(b.match.kickoffAt!).getTime())
      .slice(0, 5);
  }, [allMatches]);

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
    if (!isAuthenticated) return;
    let cancelled = false;
    loadAllPredictions().then((res) => {
      if (cancelled || !res.data) return;
      setPredictions((prev) => {
        const next = { ...prev };
        for (const [matchId, scores] of Object.entries(res.data)) {
          next[matchId] = { home: String(scores.home_score), away: String(scores.away_score) };
        }
        return next;
      });
      initialLoadDoneRef.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, loadAllPredictions]);

  useEffect(() => {
    if (!isAuthenticated || !initialLoadDoneRef.current) return;
    const matchId = lastChangedMatchIdRef.current;
    if (!matchId) return;
    const found = next5.find((m) => m.match.id === matchId);
    if (!found) return;
    const home = predictions[matchId]?.home ?? "";
    const away = predictions[matchId]?.away ?? "";
    const item: UserPredictionRecordItem = {
      match_id: found.match.id,
      home_team_name: found.match.homeTeam,
      away_team_name: found.match.awayTeam,
      limit_date: `${found.day.date}T${found.match.time}:00-05:00`,
      home_score: parseInt(home, 10) || 0,
      away_score: parseInt(away, 10) || 0,
      competition_phase_id: phaseIdsByLeague[found.leagueKey] ?? null,
    };
    const t = setTimeout(() => {
      lastChangedMatchIdRef.current = null;
      saveOnePrediction(item);
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [predictions, next5, phaseIdsByLeague, isAuthenticated, saveOnePrediction]);

  return (
    <div className="relative min-h-screen overflow-hidden pb-24 bg-[#07110b] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] bg-[size:26px_26px] opacity-70" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(45,226,194,.24),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(34,197,94,.13),transparent_36%)]" />
      <div className="relative z-10 max-w-lg mx-auto px-4 pt-6">
        <h1 className="text-lg font-display font-bold">Más próximos</h1>
        <p className="text-xs mt-1 text-gray-300">Los 5 partidos más cercanos entre todas las ligas.</p>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 mt-5 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-gray-300">
            <Loader2 className="animate-spin text-[#80ffe7]" size={20} />
            <span className="text-sm">Cargando partidos…</span>
          </div>
        ) : next5.length === 0 ? (
          <p className="text-center text-sm py-8 text-gray-300">No hay partidos próximos.</p>
        ) : (
          next5.map(({ day, match, leagueLabel }, i) => (
            <section key={`${leagueLabel}-${match.id}`} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-[#80ffe7]" />
                  <h2 className="text-xs font-display font-bold">{day.dateLabel}</h2>
                </div>
                <span className="text-[11px] font-semibold text-[#80ffe7]">{leagueLabel}</span>
              </div>
              <MatchResultCard
                {...match}
                index={i}
                homeValue={predictions[match.id]?.home ?? ""}
                awayValue={predictions[match.id]?.away ?? ""}
                onHomeChange={(v) => setPredictionForMatch(match.id, "home", v)}
                onAwayChange={(v) => setPredictionForMatch(match.id, "away", v)}
                disabled={false}
                matchDate={day.date}
              />
            </section>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
