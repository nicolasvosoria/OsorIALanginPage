/**
 * Página para comprobar visualmente que los puntos (0, 2, 5) se muestran
 * correctamente en la interfaz. Usa la misma tarjeta que Predicciones.
 *
 * Cómo usarla: inicia la app (npm run dev), abre en el navegador:
 *   http://localhost:5173/verificar-puntos
 *
 * Debes ver 3 tarjetas: una con badge gris (0), una ámbar (2), una verde (5).
 */
import { Link } from "react-router-dom";
import MatchResultCard from "@/copa-osoria/components/MatchResultCard";

const cardProps = {
  id: "demo-1",
  homeTeam: "México",
  awayTeam: "Sudáfrica",
  homeCountryCode: "MX",
  awayCountryCode: "ZA",
  time: "14:00",
  stadium: "Estadio Azteca (Ciudad de México)",
  group: "Grupo A",
  homeScore: 1,
  awayScore: 2,
  homeValue: "1",
  awayValue: "2",
  onHomeChange: () => {},
  onAwayChange: () => {},
  disabled: true,
};

const VerificarPuntos = () => (
  <div className="min-h-screen bg-background p-6">
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <Link to="/" className="text-sm text-primary hover:underline">
          ← Volver
        </Link>
        <h1 className="text-xl font-display font-bold text-foreground mt-2">
          Comprobación visual: puntos en la tarjeta de partido
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          El número de puntos aparece fuera de la caja del partido, con el color correspondiente (gris, ámbar, verde).
        </p>
      </div>

      <div className="space-y-4">
        <MatchResultCard {...cardProps} pointsEarned={0} />
        <MatchResultCard {...cardProps} pointsEarned={2} />
        <MatchResultCard {...cardProps} pointsEarned={5} />
      </div>
    </div>
  </div>
);

export default VerificarPuntos;
