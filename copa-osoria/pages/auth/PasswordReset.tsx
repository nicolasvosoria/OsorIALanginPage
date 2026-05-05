import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/copa-osoria/contexts/AuthContext";
import { Button } from "@/copa-osoria/components/ui/button";

const PasswordReset = () => {
  const navigate = useNavigate();
  const { resetPasswordForEmail, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    clearError();
    setLoading(true);
    const { error: err } = await resetPasswordForEmail(email.trim());
    setLoading(false);
    if (!err) setSent(true);
  };

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
            Recuperar contraseña
          </h1>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            {sent
              ? "Revisa tu correo"
              : "Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña."}
          </p>
        </motion.div>

        {!sent ? (
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
              <label className="text-sm font-medium text-foreground">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
                className="w-full h-12 px-4 rounded-xl bg-field border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-display font-bold text-base"
            >
              {loading ? "Enviando…" : "Enviar enlace"}
            </Button>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-sm space-y-4 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Te hemos enviado un enlace a <strong className="text-foreground">{email}</strong>. Revisa tu bandeja de entrada y haz clic en el enlace para crear una nueva contraseña.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-xl"
              onClick={() => navigate("/login")}
            >
              Volver al inicio de sesión
            </Button>
          </motion.div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-8">
          <Link to="/login" className="text-primary font-semibold hover:underline">
            ← Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default PasswordReset;
