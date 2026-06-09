"use client";

import { Eye, Ban, Trash2, CheckCircle, Gavel, PlusCircle } from "lucide-react";
import type { Auction } from "@/types/auction.types";
import { AuctionStatus } from "@/types/auction.types";
import { formatCurrency, auctionStatusColor, getAuctionStatusLabel } from "@/utils/auction";
import TableSection from "@/components/common/TableSection";

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
}: MyAuctionsTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300 select-none">
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight font-sans">Meus Leilões</h2>
            <p className="text-xs text-gray-400 mt-1 font-normal">
              Crie novos lotes, gerencie seus rascunhos, publique itens ou cancele leilões criados.
            </p>
          </div>
          <button
            onClick={onCreateNewClick}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow-md shadow-primary/10 transition uppercase cursor-pointer"
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
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-100 text-[9px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50/50">
              <th className="p-3">Título / Categoria</th>
              <th className="py-3">Preço Inicial</th>
              <th className="py-3">Preço Atual</th>
              <th className="py-3">Status</th>
              <th className="py-3">Término</th>
              <th className="py-3 text-right pr-6">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-[10px] text-gray-700">
            {loadingAuctions ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400 font-medium">
                  Carregando seus leilões da API...
                </td>
              </tr>
            ) : myAuctions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400 font-medium">
                  Nenhum leilão cadastrado por você.
                </td>
              </tr>
            ) : (
              myAuctions.map((auc) => (
                <tr key={auc.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-sm bg-primary/5 text-primary flex items-center justify-center border border-primary/10 shrink-0">
                        <Gavel size={12} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-950 text-xs leading-tight">
                          {auc.item?.title}
                        </span>
                        <span className="text-[8px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider font-mono">
                          ID: #{auc.id} | {auc.item?.category_label || "Sem categoria"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 font-semibold text-gray-800">
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
                  <td className="py-3 text-gray-400 font-bold">
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
                        className="p-1.5 rounded-sm hover:bg-primary/5 text-primary transition-colors cursor-pointer border border-gray-100 bg-white"
                      >
                        <Eye size={12} />
                      </button>

                      {auc.status === AuctionStatus.DRAFT && (
                        <>
                          <button
                            onClick={() => onPublishClick(auc.id)}
                            title="Publicar Leilão"
                            className="p-1.5 rounded-sm hover:bg-green-50 text-green-600 transition-colors cursor-pointer border border-gray-100 bg-white"
                          >
                            <CheckCircle size={12} />
                          </button>
                          <button
                            onClick={() => onDeleteClick(auc.id)}
                            title="Excluir Rascunho"
                            className="p-1.5 rounded-sm hover:bg-red-50 text-red-500 transition-colors cursor-pointer border border-gray-100 bg-white"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}

                      {auc.status === AuctionStatus.LIVE && (
                        <button
                          onClick={() => onCancelClick(auc.id)}
                          title="Cancelar Leilão"
                          className="p-1.5 rounded-sm hover:bg-red-50 text-red-500 transition-colors cursor-pointer border border-gray-100 bg-white"
                        >
                          <Ban size={12} />
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
