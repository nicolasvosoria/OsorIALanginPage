import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail } from "lucide-react";
import { useAuth } from "@/copa-osoria/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/copa-osoria/components/ui/dialog";
import { Button } from "@/copa-osoria/components/ui/button";

const Register = () => {
  const navigate = useNavigate();
  const { signUp, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    register_code: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return;
    clearError();
    setLoading(true);
    const { error: err } = await signUp(
      form.email,
      form.password,
      form.username,
      form.register_code.trim() || null
    );
    setLoading(false);
    if (!err) {
      setRegisteredEmail(form.email);
      setShowConfirmDialog(true);
    }
  };

  const goToLogin = () => {
    setShowConfirmDialog(false);
    navigate("/");
  };

  const requiredFields = [
    { key: "username", label: "Nombre de usuario", placeholder: "Elige un nombre de usuario", type: "text" as const },
    { key: "email", label: "Correo electrónico", placeholder: "correo@ejemplo.com", type: "email" as const },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background/95 to-background" />

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
            className="w-40 h-40 object-contain mb-4"
          />
          <h1 className="text-2xl font-display font-bold text-foreground text-center">
            Polla Mundialista Copa Osoria 2026
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Crea tu cuenta para participar
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-3.5"
        >
          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3">
              {error}
            </div>
          )}
          {requiredFields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{f.label}</label>
              <input
                type={f.type}
                value={form[f.key as keyof typeof form]}
                onChange={(e) => handleChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                required={f.key !== "register_code"}
                className="w-full h-12 px-4 rounded-xl bg-field border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Crea una contraseña"
                className="w-full h-12 px-4 pr-12 rounded-xl bg-field border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Confirmar contraseña</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                placeholder="Repite tu contraseña"
                className="w-full h-12 px-4 pr-12 rounded-xl bg-field border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Código de registro <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={form.register_code}
              onChange={(e) => handleChange("register_code", e.target.value)}
              placeholder="Código de invitación"
              className="w-full h-12 px-4 rounded-xl bg-field border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading || form.password !== form.confirmPassword}
            className="w-full h-12 rounded-xl gradient-accent text-accent-foreground font-display font-bold text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? "Creando cuenta…" : "Crear Cuenta"}
          </button>

          <p className="text-center text-sm text-muted-foreground pt-2">
            ¿Ya tienes cuenta?{" "}
            <button type="button" onClick={() => navigate("/")} className="text-primary font-semibold hover:underline">
              Inicia Sesión
            </button>
          </p>
        </motion.form>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={(open) => !open && goToLogin()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-2">
              <div className="rounded-full bg-primary/10 p-3">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-center">
              Correo de confirmación enviado
            </DialogTitle>
            <DialogDescription className="text-center">
              Se ha enviado un correo de confirmación a <strong className="text-foreground">{registeredEmail}</strong>. Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={goToLogin} className="w-full sm:w-auto">
              Ir a Iniciar sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Register;
