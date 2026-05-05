import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/copa-osoria/contexts/AuthContext";
import { Button } from "@/copa-osoria/components/ui/button";

const Register = () => {
  const navigate = useNavigate();
  const { signUp, signIn, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    acceptPolicies: false,
  });

  const handleChange = (field: string, value: string | boolean) => {
    if (field === "acceptPolicies") {
      setForm((prev) => ({ ...prev, acceptPolicies: Boolean(value) }));
      return;
    }
    const nextValue = field === "phone" ? String(value).replace(/[^0-9+]/g, "") : String(value);
    setForm((prev) => ({ ...prev, [field]: nextValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!form.acceptPolicies) return;
    setSuccessMessage(null);
    setLoading(true);

    const { error: signUpError } = await signUp(
      form.email,
      form.password,
      form.username,
      form.phone
    );

    if (signUpError) {
      setLoading(false);
      return;
    }

    const { error: signInError } = await signIn(form.email, form.password);
    setLoading(false);

    if (signInError) return;

    setSuccessMessage("Usuario creado con éxito. Iniciando sesión...");
    setTimeout(() => navigate("/predicciones"), 700);
  };

  const requiredFields = [
    { key: "username", label: "Nombre de usuario", placeholder: "Elige un nombre de usuario", type: "text" as const },
    { key: "email", label: "Correo electrónico", placeholder: "correo@ejemplo.com", type: "email" as const },
    { key: "phone", label: "Número celular", placeholder: "Ej: 3001234567", type: "tel" as const },
  ];

  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-[#07110b] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] bg-[size:26px_26px] opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(45,226,194,.22),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(34,197,94,.16),transparent_36%)]" />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-4"
        >
          {/* Logo Copa Osoria */}
          <img
            src="/copa_osoria_logo.svg"
            alt="Copa Osoria"
            className="w-24 h-24 object-contain mb-2"
          />
          <h1 className="text-xl font-display font-bold text-white text-center">
            Polla Mundialista Copa Osoria 2026
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            Crea tu cuenta para participar
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-2.5 rounded-2xl border border-[#2de2c2]/20 bg-white/[.08] p-4 shadow-[0_0_30px_rgba(45,226,194,.14)] backdrop-blur-md"
        >
          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {successMessage}
            </div>
          )}
          {requiredFields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <label className="text-sm font-medium text-white">{f.label}</label>
              <input
                type={f.type}
                value={form[f.key as keyof typeof form]}
                onChange={(e) => handleChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                required
                inputMode={f.key === "phone" ? "tel" : undefined}
                autoComplete={f.key === "phone" ? "tel" : f.key === "email" ? "email" : "username"}
                className="w-full h-10 px-3 rounded-xl bg-black/30 border border-white/15 text-white placeholder:text-gray-500 focus:border-[#2de2c2] focus:ring-2 focus:ring-[#2de2c2]/20 outline-none transition-all text-sm"
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Crea una contraseña"
                className="w-full h-10 px-3 pr-11 rounded-xl bg-black/30 border border-white/15 text-white placeholder:text-gray-500 focus:border-[#2de2c2] focus:ring-2 focus:ring-[#2de2c2]/20 outline-none transition-all text-sm"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <label className="flex items-start gap-2 rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-xs">
            <input
              type="checkbox"
              checked={form.acceptPolicies}
              onChange={(e) => handleChange("acceptPolicies", e.target.checked)}
              required
              className="mt-0.5 h-4 w-4 accent-emerald-600"
            />
            <span className="text-gray-300">
              Acepto las políticas de tratamiento de datos personales.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading || !form.acceptPolicies}
            className="w-full h-10 rounded-xl border-2 border-[#2de2c2] bg-[#2de2c2] text-black font-display font-bold text-sm shadow-[0_0_28px_rgba(45,226,194,.22)] transition-all hover:scale-[1.02] hover:bg-transparent hover:text-[#80ffe7] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? "Creando cuenta…" : "Crear Cuenta"}
          </button>

          <p className="text-center text-xs text-gray-300 pt-1">
            ¿Ya tienes cuenta?{" "}
            <button type="button" onClick={() => navigate("/login")} className="text-[#80ffe7] font-semibold hover:underline">
              Inicia Sesión
            </button>
          </p>
        </motion.form>
      </div>

    </div>
  );
};

export default Register;
