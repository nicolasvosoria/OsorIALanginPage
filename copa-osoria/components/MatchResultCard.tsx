import { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, CheckCircle2, Timer } from "lucide-react";
import type { MatchItem } from "@/copa-osoria/data/matchesByDay";
import { getPredictionDeadlineMs, formatTimeLeft } from "@/copa-osoria/lib/predictionDeadline";

/** Solo permite un dígito 0-9 en el input de goles */
function clampGoalValue(value: string): string {
  if (value === "") return "";
  const digit = value.replace(/\D/g, "").slice(-1);
  const n = parseInt(digit, 10);
  if (digit === "" || isNaN(n)) return "";
  if (n < 0) return "0";
  if (n > 9) return "9";
  return digit;
}

interface MatchResultCardProps extends MatchItem {
  index?: number;
  /** Valores controlados desde el padre (predicciones). */
  homeValue: string;
  awayValue: string;
  onHomeChange: (value: string) => void;
  onAwayChange: (value: string) => void;
  /** Si true, no se puede modificar el marcador (5 min antes del partido). */
  disabled?: boolean;
  /** Fecha del partido (YYYY-MM-DD) para el temporizador. */
  matchDate?: string;
  /** Puntos obtenidos en este partido (0, 2 o 5). null = sin resultado aún o sin predicción. */
  pointsEarned?: number | null;
}

const FLAG_CDN = "https://flagcdn.com";
/** FlagCDN usa códigos en minúsculas (ISO 3166-1 alpha-2 o subdivisiones como gb-sct). */
function flagSrc(code: string | null): string {
  if (!code?.trim()) return "";
  return `${FLAG_CDN}/w40/${code.trim().toLowerCase()}.png`;
}

/** Convierte "HH:mm" (24h) a formato 12h en español (ej: "3:00 p. m.") */
function formatTime12h(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr ?? "0", 10);
  const m = mStr ?? "00";
  if (h === 0) return `12:${m} a. m.`;
  if (h === 12) return `12:${m} p. m.`;
  if (h < 12) return `${h}:${m} a. m.`;
  return `${h - 12}:${m} p. m.`;
}

const MatchResultCard = ({
  homeTeam,
  awayTeam,
  homeCountryCode,
  awayCountryCode,
  homeBadgeUrl,
  awayBadgeUrl,
  status,
  kickoffAt,
  time,
  stadium,
  group,
  homeValue,
  awayValue,
  onHomeChange,
  onAwayChange,
  index = 0,
  disabled = false,
  matchDate,
  pointsEarned = null,
}: MatchResultCardProps) => {
  const time12 = formatTime12h(time);
  const showPoints = pointsEarned !== undefined && pointsEarned !== null;
  const matchTimeMs = kickoffAt ? new Date(kickoffAt).getTime() : null;
  const hasPassed = status === "ended" || status === "closed" || status === "cancelled" || (matchTimeMs !== null && !Number.isNaN(matchTimeMs) && matchTimeMs < Date.now());
  const statusLabel = hasPassed ? "Ya pasó" : "Próximo";
  const StatusIcon = hasPassed ? CheckCircle2 : Timer;

  const [timeLeftLabel, setTimeLeftLabel] = useState<string | null>(null);
  useEffect(() => {
    if (disabled || !matchDate || !time) {
      setTimeLeftLabel(null);
      return;
    }
    const deadline = getPredictionDeadlineMs(matchDate, time);
    if (deadline == null) return;
    const update = () => {
      const ms = deadline - Date.now();
      setTimeLeftLabel(ms <= 0 ? null : formatTimeLeft(ms));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [disabled, matchDate, time]);

  /** Color del texto "X puntos" (0 = gris, 2 = ámbar, 5 = verde) */
  const pointsTextClass =
    showPoints &&
    (pointsEarned === 5
      ? "text-green-700 dark:text-green-300"
      : pointsEarned === 2
        ? "text-amber-700 dark:text-amber-300"
        : "text-muted-foreground");

  const handleHomeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      onHomeChange(clampGoalValue(e.target.value));
    },
    [onHomeChange, disabled]
  );
  const handleAwayChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      onAwayChange(clampGoalValue(e.target.value));
    },
    [onAwayChange, disabled]
  );

  const TeamMark = ({ badgeUrl, countryCode, team }: { badgeUrl?: string | null; countryCode: string | null; team: string }) => {
    const fallback = countryCode ? flagSrc(countryCode) : "";
    const src = badgeUrl || fallback;
    if (!src) {
      return (
        <div className="w-9 h-9 rounded-full flex-shrink-0 border border-border/50 bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground" aria-hidden>
          ?
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-full bg-white border border-border/50 shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
        <img
          src={src}
          alt={badgeUrl ? `Escudo ${team}` : `Bandera ${team}`}
          className={badgeUrl ? "w-7 h-7 object-contain" : "w-full h-full object-cover"}
          width={36}
          height={36}
          loading="lazy"
        />
      </div>
    );
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className={`flex-1 min-w-0 bg-card rounded-xl border border-border/60 p-4 shadow-sm ${disabled ? "opacity-90" : ""}`}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${hasPassed ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
            <StatusIcon size={12} />
            {statusLabel}
          </span>
          {group ? <p className="text-center text-xs font-medium text-foreground">{group.startsWith("Grupo ") ? group : `Grupo ${group}`}</p> : <span />}
        </div>
      <div className="flex items-center justify-between gap-3">
        {/* Local: bandera + país */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <TeamMark badgeUrl={homeBadgeUrl} countryCode={homeCountryCode} team={homeTeam} />
          <span className="text-sm font-medium text-foreground truncate">{homeTeam}</span>
        </div>

        {/* Goles: inputs 0-9 */}
        <div className="flex items-center gap-2 flex-shrink-0 px-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={homeValue}
            onChange={handleHomeChange}
            placeholder="–"
            aria-label={`Goles de ${homeTeam}`}
            disabled={disabled}
            readOnly={disabled}
            className={`w-9 h-9 rounded-lg border text-center text-lg font-display font-bold outline-none transition-all ${
              disabled
                ? "bg-muted/50 border-border/60 text-muted-foreground cursor-not-allowed"
                : "bg-field border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            }`}
          />
          <span className="text-muted-foreground text-xs font-medium">{time12}</span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={awayValue}
            onChange={handleAwayChange}
            placeholder="–"
            aria-label={`Goles de ${awayTeam}`}
            disabled={disabled}
            readOnly={disabled}
            className={`w-9 h-9 rounded-lg border text-center text-lg font-display font-bold outline-none transition-all ${
              disabled
                ? "bg-muted/50 border-border/60 text-muted-foreground cursor-not-allowed"
                : "bg-field border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            }`}
          />
        </div>

        {/* Visitante: bandera + país */}
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
          <TeamMark badgeUrl={awayBadgeUrl} countryCode={awayCountryCode} team={awayTeam} />
          <span className="text-sm font-medium text-foreground truncate">{awayTeam}</span>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-1 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1 min-w-0">
          <MapPin size={12} className="flex-shrink-0" />
          <span className="truncate">{stadium}</span>
        </span>
        {disabled ? (
          <span className="flex flex-shrink-0 text-muted-foreground/80">Predicción cerrada</span>
        ) : timeLeftLabel ? (
          <span className="flex flex-shrink-0 items-center gap-1 text-muted-foreground font-medium">
            <Clock size={12} />
            Tienes {timeLeftLabel} para elegir
          </span>
        ) : null}
      </div>
      </motion.article>
      {/* Puntaje fuera de la caja: solo texto "X puntos" con color */}
      {showPoints && (
        <span
          className={`flex-shrink-0 font-display font-semibold text-sm ${pointsTextClass}`}
          aria-label={`${pointsEarned} puntos en este partido`}
        >
          {pointsEarned} puntos
        </span>
      )}
    </div>
  );
};

export default MatchResultCard;
