import { useState, useEffect } from "react";
import { Heart, Gavel } from "lucide-react";
import type { Auction } from "@/shared/types/auction.types";
import { formatCurrency, auctionStatusColor, getAuctionStatusLabel } from "@/shared/utils/auction.utils";
import auctionService from "@/services/auction.service";
import { toast } from "sonner";

interface FavoritesTabProps {
  allAuctions: Auction[];
  loadingAll: boolean;
  onViewDetails: (auc: Auction) => void;
}

export default function FavoritesTab({ allAuctions, loadingAll, onViewDetails }: FavoritesTabProps) {
  
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  // Load favorite IDs from localStorage
  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem("bidlive_watched_auctions");
      if (stored) {
        setFavoriteIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Erro ao ler favoritos localmente:", e);
    }
  };

  useEffect(() => {
    loadFavorites();
    // Add window listener to sync local storage if mutated elsewhere
    window.addEventListener("storage", loadFavorites);
    return () => window.removeEventListener("storage", loadFavorites);
  }, []);

  const handleUnfavorite = async (e: React.MouseEvent, auctionId: number) => {
    e.stopPropagation();
    try {
      // Atualização Otimista
      const updated = favoriteIds.filter((id) => id !== auctionId);
      setFavoriteIds(updated);
      localStorage.setItem("bidlive_watched_auctions", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
      toast.success("Removido dos favoritos.");
      
      // Sincronização em background
      auctionService.unwatch(auctionId).catch(console.error);
    } catch (err) {
      console.error("Erro ao remover favorito:", err);
      toast.error("Ocorreu um erro ao atualizar a lista de favoritos.");
    }
  };

  // Filter global auctions by saved favorite IDs
  const favoriteAuctions = allAuctions.filter((auc) => favoriteIds.includes(auc.id));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300 text-foreground text-left">
      <div>
        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          Meus Leilões Favoritos
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Acompanhe os leilões que você favoritou e receba atualizações em tempo real.
        </p>
      </div>

      {loadingAll ? (
        <div className="bg-card border border-border p-12 rounded-sm text-center flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-muted-foreground font-semibold">Buscando favoritos...</span>
        </div>
      ) : favoriteAuctions.length === 0 ? (
        <div className="bg-card border border-border p-16 rounded-sm text-center max-w-2xl mx-auto flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-sm flex items-center justify-center">
            <Heart size={22} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Nenhum leilão favoritado</h4>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
              Marque como favorito (coração) os leilões que você deseja acompanhar na página principal de leilões.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favoriteAuctions.map((auc) => {
            const primaryImage = auc.item?.images?.find((img) => img.is_primary) || auc.item?.images?.[0];
            return (
              <div
                key={auc.id}
                onClick={() => onViewDetails(auc)}
                className="bg-card border border-border rounded-sm p-4 hover:border-primary/45 transition shadow-xs flex gap-4 cursor-pointer relative group"
              >
                {/* Image */}
                <div className="w-24 h-24 shrink-0 bg-muted border border-border/80 rounded-sm overflow-hidden relative">
                  {primaryImage ? (
                    <img src={primaryImage.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Gavel size={20} className="opacity-40" />
                    </div>
                  )}
                </div>

                {/* Info details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-bold text-muted-foreground truncate uppercase">
                        {auc.item?.category_label || "Geral"}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded-sm text-[8px] font-bold uppercase shrink-0 ${auctionStatusColor(auc.status)}`}>
                        {getAuctionStatusLabel(auc.status)}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-foreground truncate mt-1 group-hover:text-primary transition-colors">
                      {auc.item?.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-border/40 pt-2 mt-2">
                    <div>
                      <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">Lote ID</span>
                      <span className="text-[10px] font-bold font-mono">#{auc.id}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-primary/70 uppercase tracking-wider block">Lance Atual</span>
                      <span className="text-[10px] font-black text-primary font-mono">{formatCurrency(auc.item?.current_price || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Heart Action button */}
                <button
                  onClick={(e) => handleUnfavorite(e, auc.id)}
                  className="absolute top-2.5 right-2.5 p-1.5 bg-background border border-border rounded-sm hover:border-red-500 hover:text-red-500 text-red-500 fill-red-500 transition cursor-pointer"
                  title="Remover dos favoritos"
                >
                  <Heart size={12} className="fill-current" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
