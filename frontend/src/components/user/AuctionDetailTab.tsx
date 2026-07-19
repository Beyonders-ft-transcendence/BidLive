import { useState } from "react";
import { ArrowLeft, Calendar, ShieldAlert, CheckCircle, Trash2, Ban, Video, ImageIcon } from "lucide-react";
import type { Auction } from "@/shared/types/auction.types";
import { AuctionStatus } from "@/shared/types/auction.types";
import { formatCurrency, auctionStatusColor, getAuctionStatusLabel } from "@/shared/utils/auction.utils";

interface AuctionDetailTabProps {
  auction: Auction;
  onBack: () => void;
  onPublishClick: (id: number) => void;
  onCancelClick: (id: number) => void;
  onDeleteClick: (id: number) => void;
  onManageStreamClick: (auction: Auction) => void;
}

export default function AuctionDetailTab({
  auction,
  onBack,
  onPublishClick,
  onCancelClick,
  onDeleteClick,
  onManageStreamClick,
}: AuctionDetailTabProps) {
  
  const images = auction.item?.images || [];
  const [selectedImage, setSelectedImage] = useState<string | null>(
    images.length > 0 ? images[0].image_url : null
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300 select-none text-foreground text-left w-full max-w-5xl mx-auto">
      {/* Back navigation header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-sm transition cursor-pointer bg-background"
        >
          <ArrowLeft size={14} />
        </button>
        <div>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            Gerenciamento de Lotes
          </span>
          <h2 className="text-lg font-black tracking-tight leading-none mt-0.5">
            Lote #{auction.id} • Detalhes Gerais
          </h2>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        
        {/* LEFT COLUMN: Media Gallery & Lot Details */}
        <div className="space-y-6 min-w-0">
          
          {/* Item details and image preview */}
          <div className="bg-card border border-border p-6 rounded-sm shadow-sm space-y-5">
            <div>
              <span className="text-[9px] font-bold text-primary uppercase tracking-wider font-mono">
                {auction.item?.category_label || "Sem Categoria"}
              </span>
              <h3 className="text-base font-black tracking-tight mt-1 leading-snug">
                {auction.item?.title}
              </h3>
            </div>

            {/* Gallery Section */}
            <div className="space-y-3">
              <div className="relative aspect-video w-full bg-muted border border-border/80 rounded-sm overflow-hidden flex items-center justify-center">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={auction.item?.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <ImageIcon size={32} className="opacity-30" />
                    <span className="text-xs">Sem imagens anexadas a este lote</span>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
                  {images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img.image_url)}
                      className={`w-16 h-12 rounded-sm border shrink-0 overflow-hidden bg-muted cursor-pointer transition ${
                        selectedImage === img.image_url
                          ? "border-primary scale-[1.03]"
                          : "border-border/60 hover:border-border"
                      }`}
                    >
                      <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Descrição do Lote</span>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {auction.item?.description || "Nenhuma descrição detalhada informada para este lote."}
              </p>
            </div>
          </div>

          {/* Technical Specs Panel */}
          <div className="bg-card border border-border p-5 rounded-sm shadow-sm">
            <span className="text-xs font-black uppercase tracking-wider block border-b border-border pb-2.5 mb-4">
              Especificações Técnicas
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              <div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">ID do Lote</span>
                <span className="text-xs font-bold font-mono">#{auction.id}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Estado de Conservação</span>
                <span className="text-xs font-bold uppercase font-mono">{auction.item?.condition_type || "Novo"}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Lances Recebidos</span>
                <span className="text-xs font-bold font-mono">{auction.bids_count ?? 0}</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Bidding Box & Fast Actions */}
        <div className="space-y-6 w-full shrink-0">
          
          {/* Current pricing box */}
          <div className="bg-card border border-border rounded-sm shadow-sm overflow-hidden">
            <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Status do Leilão</span>
              <span
                className={`px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase ${auctionStatusColor(
                  auction.status
                )}`}
              >
                {getAuctionStatusLabel(auction.status)}
              </span>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Preço de Lançamento</span>
                <span className="text-sm font-black font-mono block">
                  {formatCurrency(auction.item?.starting_price || 0)}
                </span>
              </div>

              <div className="space-y-1 pt-3 border-t border-border/60">
                <span className="text-[9px] font-bold text-primary uppercase tracking-wider block">Preço de Lances Atual</span>
                <span className="text-lg font-black text-primary font-mono block leading-none mt-1">
                  {formatCurrency(auction.item?.current_price || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-card border border-border p-5 rounded-sm shadow-sm space-y-4">
            <span className="text-xs font-black uppercase tracking-wider block border-b border-border pb-2.5 mb-2.5">
              Ações Rápidas
            </span>

            <div className="flex flex-col gap-2">
              {/* Draft state actions */}
              {auction.status === AuctionStatus.DRAFT && (
                <>
                  <button
                    onClick={() => onPublishClick(auction.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-sm transition uppercase cursor-pointer border-none"
                  >
                    <CheckCircle size={14} />
                    Publicar Leilão
                  </button>
                  <button
                    onClick={() => onDeleteClick(auction.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-background border border-border hover:bg-destructive hover:border-destructive hover:text-white text-muted-foreground font-bold text-xs rounded-sm transition uppercase cursor-pointer"
                  >
                    <Trash2 size={14} />
                    Excluir Lote
                  </button>
                </>
              )}

              {/* Live state actions */}
              {auction.status === AuctionStatus.LIVE && (
                <>
                  <button
                    onClick={() => onManageStreamClick(auction)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-sm transition uppercase cursor-pointer border-none"
                  >
                    <Video size={14} />
                    Transmitir Ao Vivo
                  </button>
                  <button
                    onClick={() => onCancelClick(auction.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-background border border-border hover:bg-destructive hover:border-destructive hover:text-white text-muted-foreground font-bold text-xs rounded-sm transition uppercase cursor-pointer"
                  >
                    <Ban size={14} />
                    Cancelar Leilão
                  </button>
                </>
              )}

              {/* Scheduled state actions */}
              {auction.status === AuctionStatus.SCHEDULED && (
                <button
                  onClick={() => onManageStreamClick(auction)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-sm transition uppercase cursor-pointer border-none"
                >
                  <Video size={14} />
                  Transmitir Ao Vivo
                </button>
              )}

              {/* No actions available fallback */}
              {auction.status !== AuctionStatus.DRAFT &&
               auction.status !== AuctionStatus.LIVE &&
               auction.status !== AuctionStatus.SCHEDULED && (
                <div className="flex items-center gap-2 text-muted-foreground p-3 bg-muted/40 rounded-sm border border-border/50 text-[10px] font-semibold leading-relaxed">
                  <ShieldAlert size={14} className="shrink-0" />
                  Nenhuma ação disponível para leilões finalizados ou cancelados.
                </div>
              )}
            </div>
          </div>

          {/* Timeline & Schedule Dates */}
          <div className="bg-card border border-border p-5 rounded-sm shadow-sm space-y-4">
            <span className="text-xs font-black uppercase tracking-wider block border-b border-border pb-2.5 mb-2">
              Cronograma do Lote
            </span>

            <div className="space-y-4 text-left">
              <div className="flex gap-3 items-center">
                <div className="w-7 h-7 rounded-sm bg-muted border border-border/60 flex items-center justify-center text-muted-foreground shrink-0">
                  <Calendar size={13} />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Data de Início
                  </span>
                  <span className="text-[10px] font-bold text-foreground block mt-0.5">
                    {new Date(auction.start_time).toLocaleString("pt-PT")}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 items-center pt-3 border-t border-border/60">
                <div className="w-7 h-7 rounded-sm bg-muted border border-border/60 flex items-center justify-center text-muted-foreground shrink-0">
                  <Calendar size={13} />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Data de Término
                  </span>
                  <span className="text-[10px] font-bold text-foreground block mt-0.5">
                    {new Date(auction.end_time).toLocaleString("pt-PT")}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
