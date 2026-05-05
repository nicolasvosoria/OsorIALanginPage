import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Users, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/copa-osoria/contexts/AuthContext";
import { getGroupById, getGroupByInvitationLink, joinGroup } from "@/copa-osoria/lib/groupService";
import type { Group } from "@/copa-osoria/types/group";
import { Button } from "@/copa-osoria/components/ui/button";
import { useToast } from "@/copa-osoria/hooks/use-toast";

const GroupJoin = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        
        getGroupByInvitationLink(id).then(data => {
            if (!cancelled) {
                // Si no lo encuentra por invitation_link, por retrocompatibilidad intenta buscar por ID
                if (!data) {
                    getGroupById(id).then(fallbackData => {
                        if (!cancelled) {
                            setGroup(fallbackData);
                            setLoading(false);
                        }
                    });
                } else {
                    setGroup(data);
                    setLoading(false);
                }
            }
        });

        return () => { cancelled = true; };
    }, [id]);

    const handleJoin = async () => {
        if (!user || !group) return;
        
        setJoining(true);
        const { success, error } = await joinGroup(group.id, user.id);
        
        if (success) {
            toast({ title: "¡Adentro!", description: `Te has unido a ${group.name}` });
            navigate(`/grupos/${group.id}`, { replace: true });
        } else {
            toast({ title: "Error", description: error || "No se pudo unir al grupo", variant: "destructive" });
            setJoining(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (!group) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-xl font-bold mb-2">Enlace inválido</h2>
                <p className="text-sm text-muted-foreground mb-6">El grupo al que intentas unirte no existe.</p>
                <Button onClick={() => navigate("/")}>Ir al inicio</Button>
            </div>
        );
    }

    const isExpired = group.invitation_expires_at 
        ? new Date() > new Date(group.invitation_expires_at) 
        : false;

    if (isExpired) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-xl font-bold mb-2">Enlace expirado</h2>
                <p className="text-sm text-muted-foreground mb-6">Este enlace de invitación ya no es válido. Pide al creador del grupo que genere un nuevo enlace.</p>
                <Button onClick={() => navigate("/")}>Ir al inicio</Button>
            </div>
        );
    }
    
    // Si el usuario no está logueado, podríamos guardar la url en sessionStorage y mandarlo al login
    if (!user) {
        sessionStorage.setItem("redirectAfterLogin", `/grupos/unirse/${id}`);
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Users size={40} className="text-primary" />
            </div>
            
            <h1 className="text-2xl font-display font-bold mb-2 border-b border-border/50 pb-2">Invitación a Grupo</h1>
            <p className="text-sm text-muted-foreground mb-6">
                Has sido invitado a participar de una Polla Privada.
            </p>
            
            <div className="bg-card w-full max-w-sm rounded-2xl border border-border shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold text-foreground font-display mb-1">{group.name}</h2>
                {group.description && <p className="text-xs text-muted-foreground">{group.description}</p>}
                
                <div className="mt-6">
                    <Button 
                       onClick={handleJoin} 
                       disabled={joining}
                       className="w-full font-bold h-12"
                    >
                        {joining ? (
                            <Loader2 className="animate-spin mr-2" size={18} />
                        ) : (
                            <>Unirme y Competir <ArrowRight className="ml-2" size={18} /></>
                        )}
                    </Button>
                </div>
            </div>
            
            <button 
                onClick={() => navigate("/")} 
                className="text-xs text-muted-foreground font-medium underline underline-offset-4"
            >
                Cancelar y volver al inicio
            </button>
        </div>
    );
};

export default GroupJoin;
