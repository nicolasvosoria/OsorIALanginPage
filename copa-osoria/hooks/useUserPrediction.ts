import { useState, useCallback } from "react";
import { useAuth } from "@/copa-osoria/contexts/AuthContext";
import {
  updatePredictionMatch,
  getAllUserPredictions,
  getScoresForUser,
} from "@/copa-osoria/lib/userPrediction";
import type { UserPredictionRecordItem } from "@/copa-osoria/types/pickem";

/**
 * Hook para guardar y cargar predicciones del usuario.
 * saveOnePrediction: actualiza solo un partido vía Edge Function update_prediction_match.
 * loadScores: carga puntajes desde user_score (por partido y total) para /predicciones.
 */
export function useUserPrediction() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveOnePrediction = useCallback(
    async (item: UserPredictionRecordItem) => {
      if (!user?.id) {
        setError("Debes iniciar sesión para guardar predicciones");
        return { error: "Debes iniciar sesión para guardar predicciones" };
      }
      setLoading(true);
      setError(null);
      const { error: err, code } = await updatePredictionMatch(item);
      setLoading(false);
      if (err) {
        const message = code === "DEADLINE_PASSED" ? "La fecha límite para este partido ya pasó" : err;
        setError(message);
        return { error: message };
      }
      return { error: null };
    },
    [user?.id]
  );

  const loadAllPredictions = useCallback(async () => {
    if (!user?.id) return { data: null, error: null };
    return getAllUserPredictions(user.id);
  }, [user?.id]);

  const loadScores = useCallback(async () => {
    if (!user?.id) return { data: null, error: null };
    return getScoresForUser(user.id);
  }, [user?.id]);

  return {
    saveOnePrediction,
    loadAllPredictions,
    loadScores,
    loading,
    error,
    isAuthenticated: !!user,
  };
}
