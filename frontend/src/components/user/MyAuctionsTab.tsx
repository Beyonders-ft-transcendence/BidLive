import { Eye, Ban, Trash2, CheckCircle, Gavel, PlusCircle, Video } from "lucide-react";
import type { Auction } from "@/shared/types/auction.types";
import { AuctionStatus } from "@/shared/types/auction.types";
import { formatCurrency, auctionStatusColor, getAuctionStatusLabel } from "@/shared/utils/auction.utils";
import TableSection from "../common/TableSection";

interface MyAuctionsTabProps {
  myAuctions: Auction[];
  loadingAuctions: boolean;
  myAuctionsPage: number;
  myAuctionsTotal: number;
  myAuctionsPageSize: number;
  onPageChange: (page: number) => void;
  onViewDetails: (auction: Auction) => void;
  onPublishClick: (id: number) => void;
  onCancelClick: (id: number) => void;
  onDeleteClick: (id: number) => void;
  onCreateNewClick: () => void;
  onManageStreamClick: (auction: Auction) => void;
}

export default function MyAuctionsTab({
  myAuctions,
  loadingAuctions,
  myAuctionsPage,
  myAuctionsTotal,
  myAuctionsPageSize,
  onPageChange,
  onViewDetails,
  onPublishClick,
  onCancelClick,
  onDeleteClick,
  onCreateNewClick,
  onManageStreamClick,
}: MyAuctionsTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300 select-none text-foreground">
      <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black tracking-tight">Meus Leilões</h2>
            <p className="text-xs text-muted-foreground mt-1 font-normal">
              Crie novos lotes, gerencie seus rascunhos, publique itens ou cancele leilões criados.
            </p>
          </div>
          <button
            onClick={onCreateNewClick}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl shadow-md shadow-primary/10 transition uppercase cursor-pointer border-none"
          >
            <PlusCircle size={15} />
            Criar Leilão
          </button>
        </div>
      </div>

      {/* Table list section */}
      <TableSection
        entityName="leilões"
        pagination={{
          currentPage: myAuctionsPage,
          totalCount: myAuctionsTotal,
          pageSize: myAuctionsPageSize,
          onPageChange: onPageChange,
        }}
      >
        <table className="w-full text-left border-collapse min-w-[700px] text-foreground">
          <thead>
            <tr className="border-b border-border text-[9px] text-muted-foreground font-bold uppercase tracking-wider bg-muted/30">
              <th className="p-3">Título / Categoria</th>
              <th className="py-3">Preço Inicial</th>
              <th className="py-3">Preço Atual</th>
              <th className="py-3">Status</th>
              <th className="py-3">Término</th>
              <th className="py-3 text-right pr-6">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-[10px]">
            {loadingAuctions ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground font-medium">
                  Carregando seus leilões da API...
                </td>
              </tr>
            ) : myAuctions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground font-medium">
                  Nenhum leilão cadastrado por você.
                </td>
              </tr>
            ) : (
              myAuctions.map((auc) => (
                <tr key={auc.id} className="hover:bg-muted/40 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-sm bg-primary/5 text-primary flex items-center justify-center border border-primary/10 shrink-0">
                        <Gavel size={12} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-xs leading-tight">
                          {auc.item?.title}
                        </span>
                        <span className="text-[8px] font-bold text-muted-foreground mt-0.5 uppercase tracking-wider font-mono">
                          ID: #{auc.id} | {auc.item?.category_label || "Sem categoria"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 font-semibold">
                    {formatCurrency(auc.item?.starting_price || 0)}
                  </td>
                  <td className="py-3 font-bold text-primary font-mono">
                    {formatCurrency(auc.item?.current_price || 0)}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase ${auctionStatusColor(
                        auc.status
                      )}`}
                    >
                      {getAuctionStatusLabel(auc.status)}
                    </span>
                  </td>
                  <td className="py-3 text-muted-foreground font-bold">
                    {new Date(auc.end_time).toLocaleDateString("pt-PT", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-3 text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewDetails(auc)}
                        title="Ver Detalhes"
                        className="p-1.5 rounded-lg hover:bg-primary/5 text-primary transition-colors cursor-pointer border border-border bg-background"
                      >
                        <Eye size={12} />
                      </button>

                      {auc.status === AuctionStatus.DRAFT && (
                        <>
                          <button
                            onClick={() => onPublishClick(auc.id)}
                            title="Publicar Leilão"
                            className="p-1.5 rounded-lg hover:bg-green-500/10 text-green-600 transition-colors cursor-pointer border border-border bg-background"
                          >
                            <CheckCircle size={12} />
                          </button>
                          <button
                            onClick={() => onDeleteClick(auc.id)}
                            title="Excluir Rascunho"
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors cursor-pointer border border-border bg-background"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}

                      {auc.status === AuctionStatus.LIVE && (
                        <button
                          onClick={() => onCancelClick(auc.id)}
                          title="Cancelar Leilão"
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors cursor-pointer border border-border bg-background"
                        >
                          <Ban size={12} />
                        </button>
                      )}

                      {(auc.status === AuctionStatus.LIVE || auc.status === AuctionStatus.SCHEDULED) && (
                        <button
                          onClick={() => onManageStreamClick(auc)}
                          title="Transmitir Ao Vivo"
                          className="p-1.5 rounded-lg hover:bg-primary/5 text-primary transition-colors cursor-pointer border border-border bg-background"
                        >
                          <Video size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableSection>
    </div>
  );
}
