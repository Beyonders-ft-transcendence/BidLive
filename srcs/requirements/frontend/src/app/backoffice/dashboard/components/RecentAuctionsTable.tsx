import type { Auction } from "@/types/auction.types";
import { formatCurrency } from "@/utils/auction";

// Format date simple helper
const formatDateSimple = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
        return new Date(dateStr).toLocaleDateString("pt-PT", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    } catch {
        return dateStr;
    }
};

export default function RecentAuctionsTable({ 
    auctions, 
    loading 
}: { 
    auctions: Auction[];
    loading: boolean;
}) {
    return (
        <div className="lg:col-span-12 bg-[#0B0F19] rounded-xl border border-slate-800 p-6 shadow-lg flex flex-col justify-between">
            <div>
                <span className="text-sm font-bold text-white block mb-4">Leilões Cadastrados Recentemente</span>
                
                <div className="overflow-x-auto scrollbar-none">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead>
                            <tr className="border-b border-slate-800 text-xs text-slate-500 font-bold uppercase tracking-wider">
                                <th className="pb-3 pr-2">ID Lote</th>
                                <th className="pb-3 pr-2">Item</th>
                                <th className="pb-3 pr-2">Categoria</th>
                                <th className="pb-3 pr-2">Preço Corrente</th>
                                <th className="pb-3 pr-2">Status</th>
                                <th className="pb-3">Criação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-xs text-slate-400">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-4 text-center text-slate-500">
                                        Carregando leilões recentes da API...
                                    </td>
                                </tr>
                            ) : auctions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-4 text-center text-slate-500">
                                        Nenhum leilão cadastrado no sistema.
                                    </td>
                                </tr>
                            ) : (
                                auctions.map((auction) => (
                                    <tr key={auction.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="py-3.5 text-slate-500 font-mono text-[11px]">#{auction.id}</td>
                                        <td className="py-3.5 font-semibold text-slate-200 pr-2">{auction.item?.title}</td>
                                        <td className="py-3.5 text-slate-400">{auction.item?.category_label || "Sem categoria"}</td>
                                        <td className="py-3.5 font-bold text-primary">{formatCurrency(auction.item?.current_price || 0)}</td>
                                        <td className="py-3.5">
                                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 shadow-sm">
                                                {auction.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 text-slate-500 font-semibold">{formatDateSimple(auction.created_at)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
