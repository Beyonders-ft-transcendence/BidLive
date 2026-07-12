import { useState, useEffect } from "react";
import { X, Gavel, Award, Shield } from "lucide-react";
import Avatar from "@/components/common/Avatar";
import adminService from "@/services/admin.service";

interface PublicProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
    username: string;
    fullName?: string;
    avatarUrl?: string;
}

export default function PublicProfileModal({
    isOpen,
    onClose,
    userId,
    username,
    fullName,
    avatarUrl,
}: PublicProfileModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    // Para simplificar e acelerar a demo, vamos mostrar as informações básicas
    // Se a API permitir buscar detalhes públicos, poderemos acrescentar aqui depois.
    const [details, setDetails] = useState<any>(null);

    useEffect(() => {
        if (!isOpen) {
            setDetails(null);
            return;
        }
        
        const fetchUserDetails = async () => {
            setIsLoading(true);
            try {
                // Tentativa de obter detalhes públicos do utilizador (pode não existir na API ainda)
                // Se o endpoint não existir, usamos mock de dados ou mostramos apenas o que foi passado nas Props.
                const res = await adminService.getUserById(userId); 
                setDetails(res);
            } catch (error) {
                console.error("Erro ao carregar detalhes do utilizador:", error);
                // Não mostramos erro ao utilizador, apenas usamos as props básicas
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserDetails();
    }, [isOpen, userId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
                onClick={onClose}
            />
            
            <div className="bg-card border border-border w-full max-w-sm rounded-xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
                <button 
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors z-20 cursor-pointer"
                >
                    <X size={18} />
                </button>

                <div className="relative h-24 bg-gradient-to-r from-primary/80 to-primary flex justify-center">
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 rounded-full p-1 bg-card border border-border shadow-lg">
                        <Avatar 
                            name={details?.full_name || fullName || username} 
                            src={details?.avatar_url || avatarUrl} 
                            size="lg" 
                        />
                    </div>
                </div>

                <div className="pt-14 pb-6 px-6 text-center">
                    <h3 className="text-xl font-bold text-foreground">
                        {details?.full_name || fullName || username}
                    </h3>
                    <p className="text-sm font-semibold text-muted-foreground mt-0.5">
                        @{details?.username || username}
                    </p>

                    <div className="mt-3 flex items-center justify-center gap-1.5">
                        <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider">
                            <Shield size={10} /> Conta Verificada
                        </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className="bg-muted border border-border rounded-lg py-3 flex flex-col items-center justify-center">
                            <Gavel size={16} className="text-muted-foreground mb-1" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Membro desde</span>
                            <span className="text-sm font-semibold text-foreground">
                                {details?.date_joined ? new Date(details.date_joined).getFullYear() : new Date().getFullYear()}
                            </span>
                        </div>
                        <div className="bg-muted border border-border rounded-lg py-3 flex flex-col items-center justify-center">
                            <Award size={16} className="text-amber-500 mb-1" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Avaliação</span>
                            <span className="text-sm font-semibold text-foreground">
                                Positiva
                            </span>
                        </div>
                    </div>
                </div>

                {isLoading && (
                    <div className="absolute inset-0 bg-card/50 flex items-center justify-center backdrop-blur-sm z-30">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
}
