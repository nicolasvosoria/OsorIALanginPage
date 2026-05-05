import { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
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
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const cardClass = isDark
    ? "border-[#2de2c2]/20 bg-white/[.08] text-white shadow-[0_0_32px_rgba(45,226,194,.1)]"
    : "border-emerald-900/10 bg-white/95 text-slate-950 shadow-[0_18px_35px_rgba(15,23,42,.08)]";
  const strongTextClass = isDark ? "text-white" : "text-slate-950";
  const mutedTextClass = isDark ? "text-gray-300" : "text-slate-600";
  const inputClass = isDark
    ? "bg-black/30 border-white/15 text-white focus:border-[#2de2c2] focus:ring-2 focus:ring-[#2de2c2]/20"
    : "bg-emerald-50/60 border-emerald-900/10 text-slate-950 focus:border-[#149b78] focus:ring-2 focus:ring-[#149b78]/20";
  const disabledInputClass = isDark
    ? "bg-white/5 border-white/10 text-gray-400 cursor-not-allowed"
    : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed";
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
        : "text-gray-300");

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
        <div className="w-9 h-9 rounded-full flex-shrink-0 border border-white/15 bg-white/10 flex items-center justify-center text-[10px] font-medium text-gray-300" aria-hidden>
          ?
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-full bg-white border border-white/15 shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
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
        className={`flex-1 min-w-0 rounded-3xl border p-4 backdrop-blur ${cardClass} ${disabled ? "opacity-90" : ""}`}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${hasPassed ? (isDark ? "bg-white/10 text-gray-300" : "bg-slate-100 text-slate-600") : (isDark ? "bg-[#2de2c2]/10 text-[#80ffe7]" : "bg-emerald-50 text-emerald-700")}`}>
            <StatusIcon size={12} />
            {statusLabel}
          </span>
          {group ? <p className={`text-center text-xs font-medium ${strongTextClass}`}>{group.startsWith("Grupo ") ? group : `Grupo ${group}`}</p> : <span />}
        </div>
      <div className="space-y-4 sm:hidden">
        <div className="flex items-center justify-center gap-3">
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
            className={`w-11 h-11 rounded-xl border text-center text-lg font-display font-bold outline-none transition-all ${
              disabled ? disabledInputClass : inputClass
            }`}
          />
          <span className={`min-w-[82px] text-center text-xs font-medium ${mutedTextClass}`}>{time12}</span>
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
            className={`w-11 h-11 rounded-xl border text-center text-lg font-display font-bold outline-none transition-all ${
              disabled ? disabledInputClass : inputClass
            }`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <TeamMark badgeUrl={homeBadgeUrl} countryCode={homeCountryCode} team={homeTeam} />
            <span className={`min-w-0 flex-1 text-base font-semibold leading-tight break-words ${strongTextClass}`}>{homeTeam}</span>
          </div>
          <div className="flex min-w-0 items-center justify-end gap-2 text-right">
            <span className={`min-w-0 flex-1 text-base font-semibold leading-tight break-words ${strongTextClass}`}>{awayTeam}</span>
            <TeamMark badgeUrl={awayBadgeUrl} countryCode={awayCountryCode} team={awayTeam} />
          </div>
        </div>
      </div>

      <div className="hidden items-center justify-between gap-3 sm:flex">
        {/* Local: bandera + país */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <TeamMark badgeUrl={homeBadgeUrl} countryCode={homeCountryCode} team={homeTeam} />
          <span className={`text-sm font-medium truncate ${strongTextClass}`}>{homeTeam}</span>
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
              disabled ? disabledInputClass : inputClass
            }`}
          />
          <span className={`text-xs font-medium ${mutedTextClass}`}>{time12}</span>
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
              disabled ? disabledInputClass : inputClass
            }`}
          />
        </div>

        {/* Visitante: bandera + país */}
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
          <TeamMark badgeUrl={awayBadgeUrl} countryCode={awayCountryCode} team={awayTeam} />
          <span className={`text-sm font-medium truncate ${strongTextClass}`}>{awayTeam}</span>
        </div>
      </div>
      <div className={`mt-2 flex items-center justify-between gap-1 text-[11px] ${mutedTextClass}`}>
        <span className="flex items-center gap-1 min-w-0">
          <MapPin size={12} className="flex-shrink-0" />
          <span className="truncate">{stadium}</span>
        </span>
        {disabled ? (
          <span className={`flex flex-shrink-0 ${isDark ? "text-gray-300/80" : "text-slate-500"}`}>Predicción cerrada</span>
        ) : timeLeftLabel ? (
          <span className={`flex flex-shrink-0 items-center gap-1 font-medium ${mutedTextClass}`}>
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
