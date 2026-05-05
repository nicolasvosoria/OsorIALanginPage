import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BottomNav from "@/copa-osoria/components/layout/BottomNav";
import { Medal, Loader2 } from "lucide-react";
import { getRanking } from "@/copa-osoria/lib/summaryData";
import type { RankingUser } from "@/copa-osoria/lib/summaryData";

const medalColors = {
  1: "text-amber-400",
  2: "text-gray-300",
  3: "text-amber-700",
} as const;

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank <= 3) {
    return (
      <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
        <Medal size={18} className={medalColors[rank as 1 | 2 | 3]} />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-field flex items-center justify-center text-xs font-display font-bold text-muted-foreground">
      {rank}
    </div>
  );
};

const Rankings = () => {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getRanking()
      .then((data) => {
        if (!cancelled) setRanking(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const first = ranking[0];
  const second = ranking[1];
  const third = ranking[2];
  const showPodium = Boolean(first && second && third);
  const rest = showPodium ? ranking.slice(3) : ranking;
  const restStartRank = showPodium ? 4 : 1;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-primary px-4 pt-6 pb-10">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-xl font-display font-bold text-primary-foreground">
            Ranking
          </h1>
          <p className="text-xs text-primary-foreground/70 mt-1 tracking-wide font-medium">
            Los 10 mejores jugadores del momento
          </p>
        </div>
      </div>

      {loading ? (
        <div className="max-w-lg mx-auto px-4 flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="animate-spin" size={24} />
          <span>Cargando ranking…</span>
        </div>
      ) : ranking.length === 0 ? (
        <div className="max-w-lg mx-auto px-4 py-12 text-center text-muted-foreground text-sm">
          Aún no hay datos en el ranking.
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {showPodium && (
            <div className="max-w-lg mx-auto px-4 -mt-6">
              <div className="bg-card rounded-2xl border border-border shadow-lg p-4">
                <div className="flex items-end justify-center gap-8 mb-2">
                  {[second, first, third].map((u, i) => {
                    const rank = i === 0 ? 2 : i === 1 ? 1 : 3;
                    const heights = ["h-20", "h-28", "h-16"];
                    const isFirst = i === 1;
                    const medalClass = rank === 1 ? "text-amber-400" : rank === 2 ? "text-gray-300" : "text-amber-700";
                    const initial = (u.username || "?").slice(0, 2).toUpperCase();
                    return (
                      <motion.div
                        key={u.user_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className="flex flex-col items-center min-w-[100px]"
                      >
                        <div className="flex flex-col items-center mb-1">
                          <Medal size={22} className={medalClass} aria-label={`Puesto ${rank}`} />
                        </div>
                        <div className={`w-12 h-12 rounded-full ${isFirst ? "gradient-accent" : "bg-secondary"} flex items-center justify-center text-sm font-display font-bold ${isFirst ? "text-accent-foreground" : "text-secondary-foreground"} mb-2 ${isFirst ? "ring-2 ring-accent/30 ring-offset-2 ring-offset-card" : ""}`}>
                          {initial}
                        </div>
                        <p className="text-xs font-medium text-foreground text-center w-full max-w-[120px] truncate" title={u.username}>
                          {u.username}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{u.points} pts</p>
                        <div className={`${heights[i]} w-14 rounded-t-lg mt-2 ${isFirst ? "gradient-primary" : "bg-secondary"} flex items-start justify-center pt-2`}>
                          <span className={`text-sm font-display font-bold ${isFirst ? "text-primary-foreground" : "text-secondary-foreground"}`}>
                            #{rank}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Del 4º en adelante (todos los demás) */}
          <div className="max-w-lg mx-auto px-4 mt-4 space-y-2 max-h-[60vh] overflow-y-auto">
            {rest.map((u, i) => (
              <motion.div
                key={u.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="bg-card rounded-xl border border-border/60 px-4 py-3 flex items-center gap-3"
              >
                <RankBadge rank={restStartRank + i} />
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-display font-bold text-primary">
                  {(u.username || "?").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{u.username}</p>
                  <p className="text-xs text-muted-foreground">{u.points} pts</p>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
};

export default Rankings;
