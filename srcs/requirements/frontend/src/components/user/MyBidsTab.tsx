import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Auction } from "@/shared/types/auction.types";
import type { User } from "@/shared/types/auth.types";
import { formatCurrency } from "@/shared/utils/auction.utils";

interface MyBidsTabProps {
  allAuctions: Auction[];
  user: User;
  loadingAll: boolean;
}

export default function MyBidsTab({ allAuctions, user, loadingAll }: MyBidsTabProps) {
  const { t } = useTranslation();

  const wonAuctions = allAuctions.filter((a) => a.winner === user.id);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300 select-none">
      <div className="bg-card border border-border p-5 rounded-sm shadow-sm text-foreground">
        <div>
          <h2 className="text-xl font-black tracking-tight">{t('my_bids_tab.title')}</h2>
          <p className="text-xs text-muted-foreground mt-1 font-normal">
            {t('my_bids_tab.desc')}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border p-5 rounded-sm shadow-sm text-foreground">
        {loadingAll ? (
          <p className="text-center text-xs text-muted-foreground py-8">{t('my_bids_tab.loading')}</p>
        ) : wonAuctions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <TrendingUp size={36} className="opacity-40 mb-3 animate-bounce" />
            <h4 className="text-sm font-bold mb-1">{t('my_bids_tab.no_bids')}</h4>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              {t('my_bids_tab.no_bids_desc')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wonAuctions.map((auc) => (
              <div
                key={auc.id}
                className="border border-emerald-500/10 bg-emerald-500/5 rounded-sm p-4 flex flex-col justify-between gap-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-500/10 rounded-sm px-2 py-0.5 border border-emerald-500/20 inline-block uppercase">
                      {t('my_bids_tab.won_badge')}
                    </span>
                    <h4 className="text-xs font-bold truncate mt-2 leading-snug">
                      {auc.item?.title}
                    </h4>
                    <p className="text-[9px] text-muted-foreground mt-1 font-mono uppercase">{t('my_bids_tab.lot_id', { id: auc.id })}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">{t('my_bids_tab.final_price')}</span>
                    <span className="text-xs font-black text-emerald-600 font-mono">
                      {formatCurrency(auc.item?.current_price || 0, true)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border pt-3 flex items-center justify-between text-[10px] text-muted-foreground font-bold">
                  <span>{t('my_bids_tab.finished_on')}</span>
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
