import { Gavel } from "lucide-react";
import type { Auction } from "@/types/auction.types";
import { formatCurrency } from "@/utils/auction";

export default function PopularLots({ auctions }: { auctions: Auction[] }) {
    return (
        <div className="lg:col-span-4 bg-[#0B0F19] rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col gap-4">
            <span className="text-sm font-bold text-white">Lotes Populares em Destaque</span>
            
            <div className="flex flex-col gap-4 mt-1">
                {auctions.slice(0, 5).map((auction) => (
                    <div key={auction.id} className="flex items-center justify-between border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                                <Gavel size={16} />
                            </div>
                            <div className="text-left min-w-0">
                                <h5 className="text-xs font-bold text-slate-200 leading-tight truncate">{auction.item?.title}</h5>
                                <p className="text-xs text-primary mt-0.5 font-bold">{formatCurrency(auction.item?.current_price || 0)}</p>
                            </div>
                        </div>
                        <div className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-md shrink-0 border border-primary/20">
                            Destaque
                        </div>
                    </div>
                ))}
                {auctions.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-4">Sem dados populares para exibir.</p>
                )}
            </div>
        </div>
    );
}
