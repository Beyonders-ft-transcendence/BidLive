import { Gavel, TrendingUp, FileText, CheckCircle2, PlusCircle } from "lucide-react";
import StatsGrid from "@/components/common/StatsGrid";
import type { Auction } from "@/shared/types/auction.types";
import type { User } from "@/shared/types/auth.types";
import { formatCurrency, auctionStatusColor, getAuctionStatusLabel } from "@/shared/utils/auction.utils";

interface OverviewTabProps {
  user: User;
  metrics: {
    totalCreated: number;
    activeCreated: number;
    wonCount: number;
    participatingCount: number;
  };
  loadingAuctions: boolean;
  myAuctions: Auction[];
  loadingAll: boolean;
  allAuctions: Auction[];
  onCreateNewClick: () => void;
  onViewAllAuctionsClick: () => void;
  onViewAllBidsClick: () => void;
}

export default function OverviewTab({
  user,
  metrics,
  loadingAuctions,
  myAuctions,
  loadingAll,
  allAuctions,
  onCreateNewClick,
  onViewAllAuctionsClick,
  onViewAllBidsClick,
}: OverviewTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300 select-none">
      {/* Welcome header card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm text-foreground">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
            <h2 className="text-xl font-black tracking-tight">Bem-vindo, {user.full_name}!</h2>
            <p className="text-xs text-muted-foreground mt-1 font-normal">Controle aqui seus lances, leilões ativos e preferências do portal.</p>
          </div>
          <button
            onClick={onCreateNewClick}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl shadow-md shadow-primary/10 transition uppercase cursor-pointer border-none"
          >
            <PlusCircle size={15} />
            Novo Leilão
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsGrid
        items={[
          { label: "Leilões Criados", value: metrics.totalCreated, icon: <Gavel size={16} /> },
          { label: "Leilões Ativos", value: metrics.activeCreated, icon: <TrendingUp size={16} /> },
          { label: "Leilões Participando", value: metrics.participatingCount, icon: <FileText size={16} /> },
          { label: "Leilões Ganhos", value: metrics.wonCount, icon: <CheckCircle2 size={16} /> },
        ]}
        columns={4}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Created Auctions */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between text-foreground">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
              <span className="text-xs font-black uppercase tracking-wider">Meus Leilões Recentes</span>
              <button
                onClick={onViewAllAuctionsClick}
                className="text-[10px] font-bold text-primary hover:underline uppercase bg-transparent border-none cursor-pointer"
              >
                Ver Todos
              </button>
            </div>

            <div className="space-y-3">
              {loadingAuctions ? (
                <p className="text-center text-xs text-muted-foreground py-8">Carregando...</p>
              ) : myAuctions.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-8">Você não possui leilões cadastrados.</p>
              ) : (
                myAuctions.slice(0, 4).map((auc) => (
                  <div
                    key={auc.id}
                    className="flex justify-between items-center p-3 bg-muted/40 hover:bg-muted rounded-lg transition-colors border border-border/50"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded bg-primary/5 flex items-center justify-center text-primary border border-primary/10 shrink-0">
                        <Gavel size={12} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold truncate leading-snug">
                          {auc.item?.title}
                        </span>
                        <span className="text-[8px] font-mono font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                          {auc.item?.category_label || "Sem Categoria"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-primary font-mono">
                        {formatCurrency(auc.item?.current_price || 0)}
                      </p>
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded-[4px] text-[7px] font-bold uppercase mt-1 ${auctionStatusColor(
                          auc.status
                        )}`}
                      >
                        {getAuctionStatusLabel(auc.status)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bidding Summary Panel */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between text-foreground">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
              <span className="text-xs font-black uppercase tracking-wider">Histórico de Disputas</span>
              <button
                onClick={onViewAllBidsClick}
                className="text-[10px] font-bold text-primary hover:underline uppercase bg-transparent border-none cursor-pointer"
              >
                Ver Todos
              </button>
            </div>

            <div className="space-y-3">
              {loadingAll ? (
                <p className="text-center text-xs text-muted-foreground py-8">Carregando...</p>
              ) : allAuctions.filter((a) => a.winner === user.id).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                  <TrendingUp size={24} className="opacity-40 animate-pulse mb-2" />
                  <p className="text-xs">Nenhuma licitação ganha ou disputada no momento.</p>
                </div>
              ) : (
                allAuctions
                  .filter((a) => a.winner === user.id)
                  .slice(0, 4)
                  .map((auc) => (
                    <div
                      key={auc.id}
                      className="flex justify-between items-center p-3 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-lg transition-colors border border-emerald-500/10"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20 shrink-0">
                          <CheckCircle2 size={12} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold truncate leading-snug">
                            {auc.item?.title}
                          </span>
                          <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5">
                            Vencedor do Lote
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-black text-emerald-600 font-mono">
                          {formatCurrency(auc.item?.current_price || 0)}
                        </p>
                        <span className="inline-block px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[7px] font-bold uppercase rounded-[4px] mt-1">
                          Ganho
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
