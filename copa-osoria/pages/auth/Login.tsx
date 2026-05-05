import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/copa-osoria/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    clearError();
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (!err) navigate("/predicciones");
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#07110b] text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] bg-[size:26px_26px] opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(45,226,194,.22),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(34,197,94,.16),transparent_36%)]" />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-8"
        >
          {/* Logo Copa Osoria */}
          <img
            src="/copa_osoria_logo.svg"
            alt="Copa Osoria"
            className="w-28 h-28 object-contain mb-5 rounded-3xl border border-[#2de2c2]/40 bg-white/10 p-3 shadow-[0_0_40px_rgba(45,226,194,.18)] backdrop-blur"
          />
          <p className="mb-3 rounded-full border border-[#2de2c2]/40 bg-[#2de2c2]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[#80ffe7]">
            OsorIA.tech
          </p>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white text-center tracking-tight">
            Copa Osoria
          </h1>
          <p className="max-w-sm text-center text-sm text-gray-300 mt-3">
            Polla mundialista 2026 con una experiencia simple, elegante y directa.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-4 rounded-3xl border border-[#2de2c2]/20 bg-white/[.08] p-6 shadow-[0_0_45px_rgba(45,226,194,.14)] backdrop-blur-md"
        >
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-400/30 text-red-200 text-sm px-4 py-3">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
              className="w-full h-12 px-4 rounded-xl bg-black/30 border border-white/15 text-white placeholder:text-gray-500 focus:border-[#2de2c2] focus:ring-2 focus:ring-[#2de2c2]/20 outline-none transition-all text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-full h-12 px-4 pr-12 rounded-xl bg-black/30 border border-white/15 text-white placeholder:text-gray-500 focus:border-[#2de2c2] focus:ring-2 focus:ring-[#2de2c2]/20 outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/password-reset")}
                className="text-sm text-[#80ffe7] font-medium hover:underline"
              >
                ¿Olvidaste contraseña?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl border-2 border-[#2de2c2] bg-[#2de2c2] text-black font-display font-bold text-base shadow-[0_0_28px_rgba(45,226,194,.22)] transition-all hover:scale-[1.02] hover:bg-transparent hover:text-[#80ffe7] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? "Iniciando sesión…" : "Iniciar Sesión"}
          </button>

          <p className="text-center text-sm text-gray-300 pt-2">
            ¿No tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => navigate("/registro")}
              className="text-[#80ffe7] font-semibold hover:underline"
            >
              Regístrate
            </button>
          </p>
        </motion.form>
      </div>
    </div>
  );
};

export default Login;
