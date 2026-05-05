import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const medalByPos = { 1: "gold" as const, 2: "silver" as const, 3: "bronze" as const };
const medalColor = {
  gold: "text-amber-400",
  silver: "text-gray-300",
  bronze: "text-amber-700",
};

const Summary = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [filtroEquipo, setFiltroEquipo] = useState("Colombia");
  const [filtroFase, setFiltroFase] = useState("Fase de Grupos");
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [days, setDays] = useState<DayMatches[]>(matchesFirst3Days);
  const [fasesResumen, setFasesResumen] = useState(fasesResumenDefault);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Encabezado: logo, título, liga, métricas, avatar */}
      <div className="gradient-primary px-4 pt-6 pb-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/copa_osoria_logo.svg"
                alt="Copa Osoria"
                className="w-24 h-24 object-contain flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-lg font-display font-bold text-primary-foreground leading-tight">
                  Polla Mundialista Copa Osoria 2026
                </h1>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-xs text-primary-foreground/90">
                  <span>Ranking Global <strong>#{loading ? "…" : (currentUserRank || "—")}</strong></span>
                  <span>Ranking Liga: <strong>#{loading ? "…" : (currentUserRank || "—")}</strong></span>
                  <span>Puntos: <strong>{loading ? "…" : `${userPoints} pts`}</strong></span>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 border-2 border-primary-foreground/30">
              {profile?.username ? (
                <span className="text-sm font-display font-bold text-primary-foreground">
                  {profile.username.slice(0, 2).toUpperCase()}
                </span>
              ) : (
                <User className="text-primary-foreground" size={20} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-2 space-y-5">
        {/* Tabla de posiciones */}
        <section className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm">
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-xs font-display font-bold text-foreground uppercase tracking-wide">
              Tabla de posiciones
            </h2>
          </div>
          <div className="px-4 pb-4 max-h-[320px] overflow-y-auto space-y-1">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                <Loader2 className="animate-spin" size={18} />
                <span className="text-sm">Cargando ranking…</span>
              </div>
            ) : ranking.length === 0 ? (
              <p className="text-sm text-muted-foreground py-3 text-center">Aún no hay datos en el ranking</p>
            ) : (
              ranking.map((u, i) => {
                const pos = i + 1;
                const medal = medalByPos[pos as 1 | 2 | 3];
                const isCurrentUser = user?.id === u.user_id;
                return (
                  <div
                    key={u.user_id}
                    className={`flex items-center gap-3 py-2 px-2 rounded-lg ${isCurrentUser ? "bg-primary/10 ring-1 ring-primary/30" : ""}`}
                  >
                    <div className="w-6 flex justify-center flex-shrink-0">
                      {medal ? (
                        <Medal size={20} className={medalColor[medal]} aria-hidden />
                      ) : (
                        <span className="text-xs font-display font-bold text-muted-foreground">{pos}</span>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-display font-bold text-muted-foreground">
                        {u.username.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground flex-1 truncate">
                      {u.username}
                      {isCurrentUser && " (tú)"}
                    </span>
                    <span className="text-sm font-display font-bold text-foreground">{u.points} pts</span>
                  </div>
                );
              })
            )}
          </div>
          <div className="px-4 pb-4 border-t border-border/60 pt-3">
            <button
              type="button"
              onClick={() => navigate("/ranking")}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Ver tabla completa
            </button>
          </div>
        </section>

        {/* Resumen de predicciones por fases */}
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

        {/* Filtros por equipo y fase */}
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
      </div>

      <BottomNav />
    </div>
  );
};

export default Summary;
