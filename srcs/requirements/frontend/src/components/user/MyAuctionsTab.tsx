import { Eye, Ban, Trash2, CheckCircle, Gavel, PlusCircle, Video } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300 select-none text-foreground">
      <div className="bg-card border border-border p-5 rounded-sm shadow-sm flex flex-col justify-between">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black tracking-tight">{t('my_auctions_tab.title')}</h2>
            <p className="text-xs text-muted-foreground mt-1 font-normal">
              {t('my_auctions_tab.desc')}
            </p>
          </div>
          <button
            onClick={onCreateNewClick}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-sm shadow-md shadow-primary/10 transition uppercase cursor-pointer border-none"
          >
            <PlusCircle size={15} />
            {t('my_auctions_tab.new_auction')}
          </button>
        </div>
      </div>

      {/* Table list section */}
      <TableSection
        entityName={t('my_auctions_tab.title')}
        pagination={{
          currentPage: myAuctionsPage,
          totalCount: myAuctionsTotal,
          pageSize: myAuctionsPageSize,
          onPageChange: onPageChange,
        }}
      >
        {/* Mobile View: Clean Card Layout for small screens */}
        <div className="grid grid-cols-1 gap-3 p-3 sm:hidden">
          {loadingAuctions ? (
            <div className="p-8 text-center text-muted-foreground font-medium bg-card border border-border rounded-sm">
              {t('my_auctions_tab.loading')}
            </div>
          ) : myAuctions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground font-medium bg-card border border-border rounded-sm">
              {t('my_auctions_tab.no_auctions')}
            </div>
          ) : (
            myAuctions.map((auc) => (
              <div key={auc.id} className="bg-card border border-border p-3.5 rounded-sm shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-sm bg-primary/5 text-primary flex items-center justify-center border border-primary/10 shrink-0">
                      <Gavel size={14} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground text-xs leading-tight truncate" title={auc.item?.title}>
                        {auc.item?.title}
                      </h3>
                      <span className="text-[9px] font-bold text-muted-foreground mt-0.5 block uppercase tracking-wider font-mono truncate">
                        ID: #{auc.id} | {auc.item?.category_label || t('my_auctions_tab.no_category')}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase shrink-0 ${auctionStatusColor(auc.status)}`}>
                    {getAuctionStatusLabel(auc.status, t)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 py-2 px-3 bg-muted/40 rounded-sm border border-border/50 text-[10px]">
                  <div>
                    <span className="text-[8px] font-bold uppercase text-muted-foreground block">{t('my_auctions_tab.initial_price')}</span>
                    <span className="font-semibold text-foreground">{formatCurrency(auc.item?.starting_price || 0, true)}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold uppercase text-muted-foreground block">{t('my_auctions_tab.current_price')}</span>
                    <span className="font-bold text-primary font-mono">{formatCurrency(auc.item?.current_price || 0, true)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[9px] border-t border-border/40">
                  <span className="text-muted-foreground font-medium">
                    {t('my_auctions_tab.end_date')}: <strong className="text-foreground">{new Date(auc.end_time).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</strong>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onViewDetails(auc)}
                      title={t('my_auctions_tab.view_details')}
                      className="p-1.5 rounded-sm hover:bg-primary/5 text-primary border border-border bg-background cursor-pointer"
                    >
                      <Eye size={13} />
                    </button>

                    {auc.status === AuctionStatus.DRAFT && (
                      <>
                        <button
                          onClick={() => onPublishClick(auc.id)}
                          title={t('my_auctions_tab.publish')}
                          className="p-1.5 rounded-sm hover:bg-green-500/10 text-green-600 border border-border bg-background cursor-pointer"
                        >
                          <CheckCircle size={13} />
                        </button>
                        <button
                          onClick={() => onDeleteClick(auc.id)}
                          title={t('my_auctions_tab.delete')}
                          className="p-1.5 rounded-sm hover:bg-destructive/10 text-destructive border border-border bg-background cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}

                    {auc.status === AuctionStatus.LIVE && (
                      <button
                        onClick={() => onCancelClick(auc.id)}
                        title={t('my_auctions_tab.cancel')}
                        className="p-1.5 rounded-sm hover:bg-destructive/10 text-destructive border border-border bg-background cursor-pointer"
                      >
                        <Ban size={13} />
                      </button>
                    )}

                    {(auc.status === AuctionStatus.LIVE || auc.status === AuctionStatus.SCHEDULED) && (
                      <button
                        onClick={() => onManageStreamClick(auc)}
                        title={t('my_auctions_tab.manage_stream')}
                        className="p-1.5 rounded-sm hover:bg-primary/5 text-primary border border-border bg-background cursor-pointer"
                      >
                        <Video size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Full Table Layout for medium & larger screens */}
        <div className="hidden sm:block overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-foreground">
            <thead>
              <tr className="border-b border-border text-[9px] text-muted-foreground font-bold uppercase tracking-wider bg-muted/30 whitespace-nowrap">
                <th className="p-3">{t('my_auctions_tab.title_header')}</th>
                <th className="py-3 hidden sm:table-cell">{t('my_auctions_tab.initial_price')}</th>
                <th className="py-3">{t('my_auctions_tab.current_price')}</th>
                <th className="py-3">{t('my_auctions_tab.status')}</th>
                <th className="py-3 hidden md:table-cell">{t('my_auctions_tab.end_date')}</th>
                <th className="py-3 text-right pr-6">{t('my_auctions_tab.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-[10px]">
              {loadingAuctions ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground font-medium">
                    {t('my_auctions_tab.loading')}
                  </td>
                </tr>
              ) : myAuctions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground font-medium">
                    {t('my_auctions_tab.no_auctions')}
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
                        <div className="flex flex-col max-w-[150px] sm:max-w-[200px] md:max-w-[250px] lg:max-w-[300px]">
                          <span className="font-bold text-foreground text-xs leading-tight truncate" title={auc.item?.title}>
                            {auc.item?.title}
                          </span>
                          <span className="text-[8px] font-bold text-muted-foreground mt-0.5 uppercase tracking-wider font-mono truncate" title={auc.item?.category_label || t('my_auctions_tab.no_category')}>
                            ID: #{auc.id} | {auc.item?.category_label || t('my_auctions_tab.no_category')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 font-semibold hidden sm:table-cell">
                      {formatCurrency(auc.item?.starting_price || 0, true)}
                    </td>
                    <td className="py-3 font-bold text-primary font-mono">
                      {formatCurrency(auc.item?.current_price || 0, true)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase ${auctionStatusColor(
                          auc.status
                        )}`}
                      >
                        {getAuctionStatusLabel(auc.status, t)}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground font-bold hidden md:table-cell">
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
                          title={t('my_auctions_tab.view_details')}
                          className="p-1.5 rounded-sm hover:bg-primary/5 text-primary transition-colors cursor-pointer border border-border bg-background"
                        >
                          <Eye size={12} />
                        </button>

                        {auc.status === AuctionStatus.DRAFT && (
                          <>
                            <button
                              onClick={() => onPublishClick(auc.id)}
                              title={t('my_auctions_tab.publish')}
                              className="p-1.5 rounded-sm hover:bg-green-500/10 text-green-600 transition-colors cursor-pointer border border-border bg-background"
                            >
                              <CheckCircle size={12} />
                            </button>
                            <button
                              onClick={() => onDeleteClick(auc.id)}
                              title={t('my_auctions_tab.delete')}
                              className="p-1.5 rounded-sm hover:bg-destructive/10 text-destructive transition-colors cursor-pointer border border-border bg-background"
                            >
                              <Trash2 size={12} />
                            </button>
                          </>
                        )}

                        {auc.status === AuctionStatus.LIVE && (
                          <button
                            onClick={() => onCancelClick(auc.id)}
                            title={t('my_auctions_tab.cancel')}
                            className="p-1.5 rounded-sm hover:bg-destructive/10 text-destructive transition-colors cursor-pointer border border-border bg-background"
                          >
                            <Ban size={12} />
                          </button>
                        )}

                        {(auc.status === AuctionStatus.LIVE || auc.status === AuctionStatus.SCHEDULED) && (
                          <button
                            onClick={() => onManageStreamClick(auc)}
                            title={t('my_auctions_tab.manage_stream')}
                            className="p-1.5 rounded-sm hover:bg-primary/5 text-primary transition-colors cursor-pointer border border-border bg-background"
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
        </div>
      </TableSection>
    </div>
  );
}
