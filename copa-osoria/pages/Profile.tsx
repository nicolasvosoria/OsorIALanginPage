import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BottomNav from "@/copa-osoria/components/layout/BottomNav";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/copa-osoria/components/ui/dialog";
import { LogOut, Pencil, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/copa-osoria/hooks/use-toast";
import { useAuth } from "@/copa-osoria/contexts/AuthContext";

const AVATAR_OPTIONS = [
  "bg-gradient-to-br from-primary to-primary/70",
  "bg-gradient-to-br from-amber-500 to-orange-600",
  "bg-gradient-to-br from-emerald-500 to-teal-600",
  "bg-gradient-to-br from-violet-500 to-purple-600",
  "bg-gradient-to-br from-rose-500 to-pink-600",
  "bg-gradient-to-br from-cyan-500 to-blue-600",
];

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, loading: authLoading, updateProfile, signOut, updatePassword } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarId, setAvatarId] = useState(0);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setEmail(profile.email);
    }
  }, [profile]);

  const getInitials = (n: string) => {
    const s = (n || "").trim();
    if (s.length >= 2) return s.slice(0, 2).toUpperCase();
    return s ? s[0].toUpperCase() : "?";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await updateProfile(username.trim(), email.trim());
    setSaving(false);
    if (error) {
      toast({
        title: "Error de perfil",
        description: error,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Cambios guardados",
      description: "Tu perfil se ha actualizado correctamente.",
    });
  };

  const handleSelectAvatar = (id: number) => {
    setAvatarId(id);
    setAvatarPickerOpen(false);
  };

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({
        title: "Contraseña corta",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "No coinciden",
        description: "La contraseña y la confirmación no coinciden.",
        variant: "destructive",
      });
      return;
    }
    setChangingPassword(true);
    const { error } = await updatePassword(newPassword);
    setChangingPassword(false);
    if (error) {
      toast({
        title: "Error de perfil",
        description: error,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Contraseña actualizada", description: "Tu contraseña se ha cambiado correctamente." });
    setPasswordDialogOpen(false);
    setNewPassword("");
    setConfirmPassword("");
  };

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
        <p className="text-muted-foreground">Cargando perfil…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-primary px-4 pt-6 pb-8">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-xl font-display font-bold text-primary-foreground">
            Mi Perfil
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-5">
        {/* Avatar con botón editar */}
        <div className="flex flex-col items-center">
          <Dialog open={avatarPickerOpen} onOpenChange={setAvatarPickerOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                aria-label="Escoger avatar"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`w-24 h-24 rounded-full ${AVATAR_OPTIONS[avatarId]} flex items-center justify-center text-2xl font-display font-bold text-white shadow-lg`}
                >
                  {getInitials(username)}
                </motion.div>
                <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-warning flex items-center justify-center shadow border-2 border-background">
                  <Pencil size={14} className="text-warning-foreground" />
                </span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xs">
              <DialogHeader>
                <DialogTitle>Escoger avatar</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-3 py-2">
                {AVATAR_OPTIONS.map((className, id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelectAvatar(id)}
                    className={`aspect-square rounded-full ${className} flex items-center justify-center text-lg font-display font-bold text-white hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all ${avatarId === id ? "ring-2 ring-primary ring-offset-2" : ""}`}
                  >
                    {getInitials(username)}
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Nombre de usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nombre de usuario"
              required
              className="w-full h-12 px-4 rounded-xl bg-field border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-center"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
              className="w-full h-12 px-4 rounded-xl bg-field border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-center"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-warning text-warning-foreground font-display font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity disabled:opacity-60 disabled:pointer-events-none"
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setPasswordDialogOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-field border border-border text-foreground font-medium text-sm hover:bg-secondary transition-colors"
        >
          <Lock size={16} />
          Cambiar contraseña
        </button>

        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Cambiar contraseña</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Nueva contraseña</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    className="w-full h-12 px-4 pr-12 rounded-xl bg-field border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Confirmar contraseña</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    className="w-full h-12 px-4 pr-12 rounded-xl bg-field border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordDialogOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-60"
                >
                  {changingPassword ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-destructive/10 text-destructive font-medium text-sm hover:bg-destructive/20 transition-colors"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
