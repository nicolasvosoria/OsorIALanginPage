import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Plus, ChevronRight, Loader2, Info, Link2 } from "lucide-react";
import BottomNav from "@/copa-osoria/components/layout/BottomNav";
import { useAuth } from "@/copa-osoria/contexts/AuthContext";
import { getUserGroups, createGroup } from "@/copa-osoria/lib/groupService";
import type { Group } from "@/copa-osoria/types/group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/copa-osoria/components/ui/dialog";
import { Button } from "@/copa-osoria/components/ui/button";
import { Input } from "@/copa-osoria/components/ui/input";
import { Label } from "@/copa-osoria/components/ui/label";
import { useToast } from "@/copa-osoria/hooks/use-toast";

const GroupsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  /** Enlace o código de invitación para unirse a un grupo */
  const [inviteInput, setInviteInput] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);

  /** Extrae el id de invitación desde un enlace completo o devuelve el texto si ya es un código. */
  const getInviteIdFromInput = (input: string): string | null => {
    const trimmed = input.trim();
    if (!trimmed) return null;
    try {
      const asUrl = trimmed.startsWith("http") ? new URL(trimmed) : null;
      if (asUrl) {
        const match = asUrl.pathname.match(/\/grupos\/unirse\/([^/?#]+)/);
        return match ? match[1] : null;
      }
      return trimmed;
    } catch {
      return trimmed;
    }
  };

  const handleJoinByLink = () => {
    setInviteError(null);
    const id = getInviteIdFromInput(inviteInput);
    if (!id) {
      setInviteError("Pega el enlace de invitación o el código del grupo.");
      return;
    }
    navigate(`/grupos/unirse/${id}`);
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    
    setLoading(true);
    getUserGroups(user.id)
      .then((data) => {
        if (!cancelled) setGroups(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
      
    return () => { cancelled = true; };
  }, [user]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newGroupName.trim()) {
      toast({ title: "Error", description: "El nombre es obligatorio", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    const { group, error } = await createGroup(newGroupName.trim(), newGroupDesc.trim(), user.id);
    setIsCreating(false);

    if (error || !group) {
        toast({ title: "Error al crear grupo", description: error || "Intenta nuevamente", variant: "destructive" });
        return;
    }

    toast({ title: "¡Grupo creado!", description: "Ahora invita a tus amigos." });
    setIsDialogOpen(false);
    navigate(`/grupos/${group.id}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-primary px-4 pt-6 pb-10">
        <div className="max-w-lg mx-auto text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
             <Users size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-display font-bold text-primary-foreground">
            Mis Grupos
          </h1>
          <p className="text-xs text-primary-foreground/80 mt-1 tracking-wide font-medium">
            Compite con tus amigos en rankings privados
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button className="w-full h-14 rounded-xl shadow-lg text-base font-display mb-6">
                    <Plus size={20} className="mr-2" /> Crear Nuevo Grupo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Crear un Grupo Privado</DialogTitle>
                    <DialogDescription>
                        Crea un espacio para competir solo con tus amigos.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateGroup} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del grupo <span className="text-red-500">*</span></Label>
                        <Input 
                            id="name" 
                            placeholder="Ej: Los Pibes del Barrio" 
                            value={newGroupName} 
                            onChange={(e) => setNewGroupName(e.target.value)} 
                            maxLength={30}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="desc">Descripción (Opcional)</Label>
                        <Input 
                            id="desc" 
                            placeholder="Torneo por una cena..." 
                            value={newGroupDesc} 
                            onChange={(e) => setNewGroupDesc(e.target.value)} 
                            maxLength={60}
                        />
                    </div>
                    <DialogFooter className="pt-2">
                        <Button type="submit" disabled={isCreating} className="w-full">
                            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear e Invitar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
          </Dialog>

          <div className="bg-card rounded-2xl border border-border shadow-sm p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Link2 size={18} className="text-primary" />
              <h3 className="text-sm font-bold text-foreground">Unirse con enlace</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Pega el enlace de invitación que te compartieron para unirte a un grupo.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="https://.../grupos/unirse/... o código"
                value={inviteInput}
                onChange={(e) => {
                  setInviteInput(e.target.value);
                  setInviteError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleJoinByLink()}
                className="flex-1"
              />
              <Button type="button" onClick={handleJoinByLink} variant="secondary">
                Unirse
              </Button>
            </div>
            {inviteError && (
              <p className="text-xs text-destructive mt-2">{inviteError}</p>
            )}
          </div>

          {loading ? (
             <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                <Loader2 className="animate-spin" size={24} />
             </div>
          ) : groups.length === 0 ? (
             <div className="bg-card rounded-2xl border border-border px-6 py-10 text-center shadow-sm">
                 <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Info size={24} className="text-primary" />
                 </div>
                 <h3 className="text-sm font-bold text-foreground mb-1">Aún no tienes grupos</h3>
                 <p className="text-xs text-muted-foreground">
                     Crea tu primer grupo para invitar a tus amigos o espera a que te compartan un enlace para unirte a uno.
                 </p>
             </div>
          ) : (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-foreground mb-3 px-1">Tus grupos actuales</h2>
              {groups.map((g, i) => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/grupos/${g.id}`)}
                  className="bg-card rounded-xl border border-border/60 p-4 shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all hover:bg-muted/30"
                >
                  <div>
                    <h3 className="text-base font-bold text-foreground font-display">{g.name}</h3>
                    {g.description && <p className="text-xs text-muted-foreground mt-0.5">{g.description}</p>}
                  </div>
                  <ChevronRight size={20} className="text-muted-foreground/50" />
                </motion.div>
              ))}
            </div>
          )}
      </div>

      <BottomNav />
    </div>
  );
};

export default GroupsList;
