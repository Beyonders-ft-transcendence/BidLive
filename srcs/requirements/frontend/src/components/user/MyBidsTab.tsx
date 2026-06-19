"use client";

import { TrendingUp } from "lucide-react";
import type { Auction } from "@/types/auction.types";
import type { User } from "@/types/auth.types";
import { formatCurrency } from "@/utils/auction";

interface MyBidsTabProps {
  allAuctions: Auction[];
  user: User;
  loadingAll: boolean;
}

export default function MyBidsTab({ allAuctions, user, loadingAll }: MyBidsTabProps) {
  const wonAuctions = allAuctions.filter((a) => a.winner === user.id);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300 select-none">
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Meus Lances</h2>
          <p className="text-xs text-gray-400 mt-1 font-normal">
            Visualize leilões arrematados ou disputados em que você enviou ofertas.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        {loadingAll ? (
          <p className="text-center text-xs text-gray-400 py-8">Carregando seus lances da API...</p>
        ) : wonAuctions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400">
            <TrendingUp size={36} className="opacity-40 mb-3 animate-bounce" />
            <h4 className="text-sm font-bold text-gray-800 mb-1">Nenhum lance arrematado ainda</h4>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
              Você ainda não arrematou leilões. Participe de salas de leilão ao vivo a partir da página principal para fazer ofertas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wonAuctions.map((auc) => (
              <div
                key={auc.id}
                className="border border-green-100 bg-green-50/10 rounded-xl p-4 flex flex-col justify-between gap-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <span className="text-[9px] font-extrabold text-green-600 bg-green-50 rounded px-2 py-0.5 border border-green-200/50 inline-block uppercase">
                      Arrematado
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 truncate mt-2 leading-snug">
                      {auc.item?.title}
                    </h4>
                    <p className="text-[9px] text-gray-400 mt-1 font-mono uppercase">Lote: #{auc.id}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Preço Final</span>
                    <span className="text-xs font-black text-green-700 font-mono">
                      {formatCurrency(auc.item?.current_price || 0)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100/50 pt-3 flex items-center justify-between text-[10px] text-slate-500 font-bold">
                  <span>Finalizado em:</span>
                  <span>{new Date(auc.end_time).toLocaleDateString("pt-PT")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
