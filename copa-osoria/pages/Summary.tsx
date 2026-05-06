import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BottomNav from "@/copa-osoria/components/layout/BottomNav";
import { Medal, User, Loader2 } from "lucide-react";
import { useAuth } from "@/copa-osoria/contexts/AuthContext";
import {
  getRanking,
  getCurrentUserPoints,
  countMatchesWithResult,
  type RankingUser,
} from "@/copa-osoria/lib/summaryData";
import { matchesByDay } from "@/copa-osoria/data/matchesByDay";
import type { DayMatches } from "@/copa-osoria/data/matchesByDay";
import { getWorldCup2026Matches, mergeScoresIntoDays } from "@/copa-osoria/lib/api/theSportsDbApi";

const FIRST_DAY = "2026-06-11";
const LAST_DAY_FIRST_3 = "2026-06-13";
const matchesFirst3Days: DayMatches[] = matchesByDay.filter(
  (d) => d.date >= FIRST_DAY && d.date <= LAST_DAY_FIRST_3
);

const fasesResumenDefault = [
  { id: "grupos", label: "Grupos", completados: 0, total: 7 },
  { id: "dieciseisavos", label: "Dieciseisavos", completados: 0, total: 16 },
  { id: "octavos", label: "Octavos", completados: 0, total: 8 },
  { id: "cuartos", label: "Cuartos", completados: 0, total: 4 },
  { id: "semifinales", label: "Semifinales", completados: 0, total: 2 },
  { id: "final", label: "Final", completados: 0, total: 2 },
];

const equipos = ["Colombia", "Argentina", "Brasil", "México", "España", "Francia", "Alemania"];
const fasesFiltro = ["Fase de Grupos", "Dieciseisavos", "Octavos", "Cuartos", "Semifinales", "Final"];

const Summary = () => {
  const { user, profile } = useAuth();
  const [filtroEquipo, setFiltroEquipo] = useState("Colombia");
  const [filtroFase, setFiltroFase] = useState("Fase de Grupos");
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [days, setDays] = useState<DayMatches[]>(matchesFirst3Days);
  const [fasesResumen, setFasesResumen] = useState(fasesResumenDefault);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"resumen" | "ranking">("ranking");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getRanking(),
      getWorldCup2026Matches().then((apiMatches) => {
        const merged = mergeScoresIntoDays(matchesFirst3Days, apiMatches);
        return merged;
      }),
    ]).then(([rankingData, daysData]) => {
      if (cancelled) return;
      setRanking(rankingData);
      setDays(daysData);
      const completadosGrupos = countMatchesWithResult(daysData);
      setFasesResumen((prev) =>
        prev.map((f) =>
          f.id === "grupos"
            ? { ...f, completados: completadosGrupos, total: daysData.reduce((acc, d) => acc + d.matches.length, 0) }
            : f
        )
      );
      setLoading(false);
    }).catch(() => {
      if (!cancelled) {
        setRanking([]);
        setFasesResumen(fasesResumenDefault);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!user?.id || loading) return;
    getCurrentUserPoints(user.id, days).then(setUserPoints);
  }, [user?.id, loading, days]);

  const currentUserRank = user?.id ? (ranking.findIndex((r) => r.user_id === user.id) + 1) || null : null;
  const first = ranking[0];
  const second = ranking[1];
  const third = ranking[2];
  const showPodium = Boolean(first && second && third);
  const rest = showPodium ? ranking.slice(3) : ranking;
  const restStartRank = showPodium ? 4 : 1;

  return (
    <div className="relative min-h-screen overflow-hidden pb-24 bg-[#07110b] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] bg-[size:26px_26px] opacity-70" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(45,226,194,.24),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(34,197,94,.13),transparent_36%)]" />
      {/* Encabezado: logo, título, liga, métricas, avatar */}
      <div className="relative z-10 px-4 pt-6 pb-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/copa_logo_blanco.png"
                alt="Copa Osoria"
                className="w-24 h-24 object-contain flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-lg font-display font-bold text-white leading-tight">
                  Polla Mundialista Copa Osoria 2026
                </h1>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-xs text-gray-300">
                  <span>Ranking Global <strong>#{loading ? "…" : (currentUserRank || "—")}</strong></span>
                  <span>Ranking Liga: <strong>#{loading ? "…" : (currentUserRank || "—")}</strong></span>
                  <span>Puntos: <strong>{loading ? "…" : `${userPoints} pts`}</strong></span>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 border border-[#2de2c2]/25">
              {profile?.username ? (
                <span className="text-sm font-display font-bold text-white">
                  {profile.username.slice(0, 2).toUpperCase()}
                </span>
              ) : (
                <User className="text-primary-foreground" size={20} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 -mt-2 space-y-5">
        <section className="rounded-2xl border border-[#2de2c2]/20 bg-white/[.08] p-1 grid grid-cols-2 gap-1">
          {[
            { key: "resumen" as const, label: "Resumen" },
            { key: "ranking" as const, label: "Ranking" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setViewMode(opt.key)}
              className={`h-10 rounded-xl text-sm font-semibold transition-all ${viewMode === opt.key ? "bg-[#2de2c2] text-black" : "text-gray-300"}`}
            >
              {opt.label}
            </button>
          ))}
        </section>

        {/* Tabla de posiciones principal (podio + lista) */}
        {viewMode === "ranking" && (
          <>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-gray-300">
                <Loader2 className="animate-spin" size={18} />
                <span className="text-sm">Cargando ranking…</span>
              </div>
            ) : ranking.length === 0 ? (
              <p className="text-sm text-gray-300 py-3 text-center">Aún no hay datos en el ranking</p>
            ) : (
              <>
                {showPodium && (
                  <section className="rounded-2xl border border-[#2de2c2]/20 bg-white/[.08] shadow-[0_0_35px_rgba(45,226,194,.1)] p-4">
                    <div className="flex items-end justify-center gap-8 mb-2">
                      {[second, first, third].map((u, i) => {
                        const rank = i === 0 ? 2 : i === 1 ? 1 : 3;
                        const heights = ["h-20", "h-28", "h-16"];
                        const isFirst = i === 1;
                        const medalClass = rank === 1 ? "text-amber-400" : rank === 2 ? "text-gray-300" : "text-amber-700";
                        const initial = (u.username || "?").slice(0, 2).toUpperCase();
                        return (
                          <motion.div key={u.user_id} className="flex flex-col items-center min-w-[100px]">
                            <Medal size={22} className={medalClass} aria-label={`Puesto ${rank}`} />
                            <div className={`w-12 h-12 rounded-full ${isFirst ? "gradient-accent" : "bg-secondary"} flex items-center justify-center text-sm font-display font-bold ${isFirst ? "text-accent-foreground ring-2 ring-accent/30 ring-offset-2 ring-offset-card" : "text-secondary-foreground"} mb-2 mt-1`}>
                              {initial}
                            </div>
                            <p className="text-xs font-medium text-white text-center w-full max-w-[120px] truncate">{u.username}</p>
                            <p className="text-[10px] text-gray-300">{Number(u.points ?? 0)} pts</p>
                            <div className={`${heights[i]} w-14 rounded-t-lg mt-2 ${isFirst ? "gradient-primary" : "bg-secondary"} flex items-start justify-center pt-2`}>
                              <span className={`text-sm font-display font-bold ${isFirst ? "text-primary-foreground" : "text-secondary-foreground"}`}>#{rank}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </section>
                )}
                <section className="space-y-2 max-h-[55vh] overflow-y-auto">
                  {rest.map((u, i) => {
                    const pos = restStartRank + i;
                    const isCurrentUser = user?.id === u.user_id;
                    return (
                      <div key={u.user_id} className={`rounded-xl border border-[#2de2c2]/20 bg-white/[.08] px-4 py-3 flex items-center gap-3 ${isCurrentUser ? "ring-1 ring-[#2de2c2]/40" : ""}`}>
                        <div className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-xs font-display font-bold text-gray-300">{pos}</div>
                        <div className="w-9 h-9 rounded-full bg-[#2de2c2]/20 flex items-center justify-center text-xs font-display font-bold text-[#80ffe7]">
                          {(u.username || "?").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{u.username}{isCurrentUser ? " (tú)" : ""}</p>
                          <p className="text-xs text-gray-300">{Number(u.points ?? 0)} pts</p>
                        </div>
                      </div>
                    );
                  })}
                </section>
              </>
            )}
          </>
        )}

        {/* Resumen de predicciones por fases */}
        {viewMode === "resumen" && (
        <section>
          <h2 className="text-xs font-display font-bold text-foreground uppercase tracking-wide mb-3">
            Resumen de predicciones
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {fasesResumen.map((fase) => {
              const pct = fase.total > 0 ? Math.round((fase.completados / fase.total) * 100) : 0;
              return (
                <motion.div
                  key={fase.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl border border-border/60 p-4 shadow-sm"
                >
                  <p className="text-xs font-semibold text-foreground mb-2">{fase.label}</p>
                  <p className="text-lg font-display font-bold text-foreground">
                    {fase.completados}/{fase.total}
                  </p>
                  <p className="text-xs text-muted-foreground">{pct}%</p>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-warning transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
        )}

        {/* Filtros por equipo y fase */}
        {viewMode === "resumen" && (
        <section className="space-y-3 pb-4">
          <h2 className="text-xs font-display font-bold text-foreground uppercase tracking-wide">
            Filtrar por equipo y fase
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Equipo</label>
              <select
                value={filtroEquipo}
                onChange={(e) => setFiltroEquipo(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-field border border-border text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                {equipos.map((eq) => (
                  <option key={eq} value={eq}>
                    {eq}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Fase</label>
              <select
                value={filtroFase}
                onChange={(e) => setFiltroFase(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-field border border-border text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                {fasesFiltro.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Summary;
