import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/copa-osoria/contexts/AuthContext";
import { Button } from "@/copa-osoria/components/ui/button";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, updatePassword, error, clearError } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return;
    clearError();
    setSaving(true);
    const { error: err } = await updatePassword(password);
    setSaving(false);
    if (!err) setSuccess(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background/95 to-background" />
        <div className="relative z-10 flex-1 flex items-center justify-center px-6">
          <p className="text-muted-foreground">Cargando…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background/95 to-background" />
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
          <img src="/copa_osoria_logo.svg" alt="Copa Osoria" className="w-24 h-24 object-contain mb-6 opacity-80" />
          <h1 className="text-xl font-display font-bold text-foreground mb-2">
            Enlace inválido o expirado
          </h1>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            El enlace para restablecer la contraseña no es válido o ha expirado. Solicita uno nuevo.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button asChild className="w-full rounded-xl">
              <Link to="/password-reset">Solicitar nuevo enlace</Link>
            </Button>
            <Button asChild variant="outline" className="w-full rounded-xl">
              <Link to="/">Iniciar sesión</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background/95 to-background" />
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
          <img src="/copa_osoria_logo.svg" alt="Copa Osoria" className="w-32 h-32 object-contain mb-6" />
          <h1 className="text-xl font-display font-bold text-foreground mb-2">
            Contraseña actualizada
          </h1>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Tu contraseña se ha cambiado correctamente. Ya puedes iniciar sesión con la nueva contraseña.
          </p>
          <Button
            className="w-full max-w-xs rounded-xl"
            onClick={() => navigate("/")}
          >
            Ir a iniciar sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background/95 to-background" />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-10"
        >
          <img
            src="/copa_osoria_logo.svg"
            alt="Copa Osoria"
            className="w-40 h-40 object-contain mb-4"
          />
          <h1 className="text-2xl font-display font-bold text-foreground text-center">
            Nueva contraseña
          </h1>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Elige una contraseña segura para tu cuenta.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-4"
        >
          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Nueva contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nueva contraseña"
                required
                minLength={6}
                className="w-full h-12 px-4 pr-12 rounded-xl bg-field border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Confirmar contraseña</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                required
                minLength={6}
                className="w-full h-12 px-4 pr-12 rounded-xl bg-field border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            disabled={saving || password !== confirmPassword || password.length < 6}
            className="w-full h-12 rounded-xl font-display font-bold text-base"
          >
            {saving ? "Guardando…" : "Cambiar contraseña"}
          </Button>
        </motion.form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          <Link to="/" className="text-primary font-semibold hover:underline">
            ← Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ChangePassword;
