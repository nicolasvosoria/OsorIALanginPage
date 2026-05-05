import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Loader2, ArrowLeft, Link as LinkIcon, Check, Copy, Medal } from "lucide-react";
import { useAuth } from "@/copa-osoria/contexts/AuthContext";
import { getGroupById, getGroupMembersRanking, renewInvitationLink } from "@/copa-osoria/lib/groupService";
import type { Group, GroupMember } from "@/copa-osoria/types/group";
import { Button } from "@/copa-osoria/components/ui/button";
import { useToast } from "@/copa-osoria/hooks/use-toast";

const medalColors = {
  1: "text-amber-400",
  2: "text-gray-300",
  3: "text-amber-700",
} as const;

const GroupDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();

    const [group, setGroup] = useState<Group | null>(null);
    const [ranking, setRanking] = useState<GroupMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRenewing, setIsRenewing] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!id || !user) return;
        let cancelled = false;
        
        Promise.all([
            getGroupById(id),
            getGroupMembersRanking(id)
        ]).then(([gData, rData]) => {
            if (!cancelled) {
                setGroup(gData);
                setRanking(rData);
                setLoading(false);
            }
        });

        return () => { cancelled = true; };
    }, [id, user]);

    const handleCopyLink = () => {
        if (!group) return;
        // Construct the invitation link using the dedicated invitation_link property if available, fallback to id
        const inviteCode = group.invitation_link || group.id;
        const link = `${window.location.origin}/grupos/unirse/${inviteCode}`;
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            toast({ title: "Enlace copiado", description: "Envíalo a tus amigos para que se unan" });
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleRenewLink = async () => {
        if (!group || isRenewing) return;
        setIsRenewing(true);
        const { success, newLink, error } = await renewInvitationLink(group.id);
        if (success && newLink) {
            setGroup({ ...group, invitation_link: newLink, invitation_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() });
            toast({ title: "Enlace renovado", description: "El enlace viejo ya no funcionará." });
            // Automaticamente copiarlo y dar feedback
            const link = `${window.location.origin}/grupos/unirse/${newLink}`;
            navigator.clipboard.writeText(link).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        } else {
            toast({ title: "Error", description: error || "No se pudo renovar el enlace.", variant: "destructive" });
        }
        setIsRenewing(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-2">
                <Loader2 className="animate-spin text-primary" size={32} />
                <p className="text-sm text-muted-foreground">Cargando grupo...</p>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
                <Users size={48} className="text-muted-foreground/30 mb-4" />
                <h2 className="text-lg font-bold mb-2">Grupo no encontrado</h2>
                <p className="text-sm text-muted-foreground mb-6">El grupo que buscas no existe o fue eliminado.</p>
                <Button onClick={() => navigate("/grupos")}>Volver a mis grupos</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-12">
            {/* Header */}
            <div className="gradient-primary px-4 pt-6 pb-8 relative">
                <button 
                  onClick={() => navigate("/grupos")}
                  className="absolute top-6 left-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="max-w-lg mx-auto text-center mt-4">
                     <h1 className="text-2xl font-display font-bold text-primary-foreground mb-1">
                        {group.name}
                     </h1>
                     {group.description && (
                         <p className="text-sm text-primary-foreground/90 font-medium">
                             {group.description}
                         </p>
                     )}
                     <div className="flex items-center justify-center gap-1.5 mt-3 bg-white/10 w-fit mx-auto px-3 py-1.5 rounded-full text-xs text-primary-foreground font-medium">
                         <Users size={14} /> {ranking.length} {ranking.length === 1 ? 'miembro' : 'miembros'}
                     </div>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 -mt-4">
                <div className="bg-card rounded-2xl border border-border shadow-lg p-4 text-center mb-6">
                    <p className="text-sm font-semibold mb-3">Invita a más amigos</p>
                    <div className="space-y-3">
                        <Button 
                            onClick={handleCopyLink} 
                            variant={copied ? "outline" : "default"} 
                            className="w-full flex items-center gap-2 transition-all"
                        >
                            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                            {copied ? "¡Enlace Copiado!" : "Copiar Enlace de Invitación"}
                        </Button>
                        {group.invitation_expires_at && new Date() > new Date(group.invitation_expires_at) && (
                            <div className="bg-red-500/10 text-red-500 text-xs font-semibold py-2 px-3 rounded-lg flex justify-center">
                                Enlace expirado
                            </div>
                        )}
                        <Button
                            onClick={handleRenewLink}
                            variant="secondary"
                            className="w-full text-xs"
                            type="button"
                            disabled={isRenewing}
                        >
                            {isRenewing ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                            Regenerar Enlace
                        </Button>
                    </div>
                    {group.invitation_expires_at && (
                        <p className="text-[10px] text-muted-foreground mt-3">
                            Válido hasta: {new Date(group.invitation_expires_at).toLocaleDateString()}
                        </p>
                    )}
                </div>

                <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center justify-center gap-2">
                    <Medal size={20} className="text-primary" /> Ranking del Grupo
                </h2>
                
                <div className="space-y-2">
                    {ranking.map((member, i) => {
                        const rank = i + 1;
                        const isTop3 = rank <= 3;
                        return (
                            <motion.div
                                key={member.user_id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`rounded-xl border flex items-center gap-3 px-4 py-3 ${
                                    member.user_id === user?.id 
                                      ? "bg-primary/5 border-primary/20" 
                                      : "bg-card border-border/60"
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                    isTop3 ? "bg-muted flex items-center justify-center" : "bg-muted/30 text-muted-foreground"
                                }`}>
                                    {isTop3 ? <Medal size={16} className={medalColors[rank as 1|2|3]} /> : rank}
                                </div>
                                <div className="flex-1 min-w-0">
                                   <p className="text-sm font-bold text-foreground truncate">
                                       {member.nickname} {member.user_id === user?.id && <span className="text-[10px] text-primary font-normal bg-primary/10 px-2 py-0.5 rounded-full ml-2">Tú</span>}
                                   </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black font-display text-primary">{member.total_points}</p>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">pts</p>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default GroupDetails;
