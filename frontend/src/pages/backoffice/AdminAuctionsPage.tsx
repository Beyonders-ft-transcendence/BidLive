import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useState } from 'react';
import Container from '@/components/layout/backoffice/Container';
import PageHeader from '@/components/layout/backoffice/PageHeader';
import Toolbar from '@/components/layout/backoffice/Toolbar';
import { useAuctionsQuery, useCancelAuctionMutation } from '@/hooks/useAuction';
import Avatar from '@/components/common/Avatar';
import { 
  Gavel,
  Search, 
  Ban, 
  ExternalLink,
  DollarSign,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AdminAuctionsPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('backoffice_auctions.title'));

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [auctionToCancel, setAuctionToCancel] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState(t('backoffice_auctions.default_cancel_reason'));
  
  const { data, isLoading } = useAuctionsQuery({ 
    page, 
    search: search || undefined,
    status: statusFilter || undefined,
    // By not passing a specific seller, an admin with auction.manage gets all
  });
  
  const { mutate: cancelAuction, isPending: isCanceling } = useCancelAuctionMutation();
  
  const confirmCancelAuction = () => {
    if (auctionToCancel !== null) {
      cancelAuction(
        { id: auctionToCancel, payload: { reason: cancelReason } },
        {
          onSuccess: () => {
            setAuctionToCancel(null);
            setCancelReason(t('backoffice_auctions.default_cancel_reason'));
          }
        }
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LIVE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-800 text-emerald-400 border border-zinc-700/50">{t('backoffice_auctions.status_live')}</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-800 text-blue-400 border border-zinc-700/50">{t('backoffice_auctions.status_completed')}</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-800 text-red-400 border border-zinc-700/50">{t('backoffice_auctions.status_cancelled')}</span>;
      case 'DRAFT':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700/50">{t('backoffice_auctions.status_draft')}</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700/50">{status}</span>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(value);
  };

  const auctions = data?.results || [];

  return (
    <Container>
      <PageHeader 
        title={t('backoffice_auctions.title')}
        description={t('backoffice_auctions.description')}
        icon={<Gavel size={20} />}
      />

      <div className="flex flex-col gap-6 max-w-[1400px] w-full relative">
        <Toolbar>
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder={t('backoffice_auctions.search_placeholder')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10 pr-4 py-2 w-full bg-black border border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-zinc-500 text-zinc-100 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto mt-3 md:mt-0">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-black border border-zinc-800 text-zinc-100 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:border-zinc-500 transition-all appearance-none"
            >
              <option value="">{t('backoffice_auctions.filter_all')}</option>
              <option value="LIVE">{t('backoffice_auctions.filter_live')}</option>
              <option value="COMPLETED">{t('backoffice_auctions.filter_completed')}</option>
              <option value="CANCELLED">{t('backoffice_auctions.filter_cancelled')}</option>
              <option value="DRAFT">{t('backoffice_auctions.filter_draft')}</option>
            </select>
          </div>
        </Toolbar>

        {/* Data Table */}
        <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-900/50 border-b border-zinc-800 text-xs font-medium text-zinc-500">
                <tr>
                  <th className="px-6 py-4 font-medium">{t('backoffice_auctions.th_seller')}</th>
                  <th className="px-6 py-4 font-medium">{t('backoffice_auctions.th_item_price')}</th>
                  <th className="px-6 py-4 font-medium">{t('backoffice_auctions.th_status')}</th>
                  <th className="px-6 py-4 font-medium">{t('backoffice_auctions.th_dates')}</th>
                  <th className="px-6 py-4 text-right font-medium">{t('backoffice_auctions.th_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-10 w-48 bg-zinc-800/50 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-10 w-48 bg-zinc-800/50 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-5 w-16 bg-zinc-800/50 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-8 w-24 bg-zinc-800/50 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-8 bg-zinc-800/50 rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : auctions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-zinc-500">
                      {t('backoffice_auctions.no_auctions')}
                    </td>
                  </tr>
                ) : (
                  auctions.map((auction: any) => (
                    <tr key={auction.id} className="hover:bg-zinc-900/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={auction.seller?.full_name || t('backoffice_auctions.unknown_seller')} src={auction.seller?.avatar_url} size="md" />
                          <div>
                            <div className="font-medium text-zinc-100">{auction.seller?.full_name || t('backoffice_auctions.unknown_seller')}</div>
                            <div className="text-xs text-zinc-500">@{auction.seller?.username || 'user'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-zinc-100 truncate max-w-[200px]">{auction.item?.title}</span>
                          <span className="text-xs text-emerald-400 font-mono mt-1 flex items-center gap-1">
                            <DollarSign size={10} />
                            {formatCurrency(auction.item?.current_price || auction.item?.starting_price || 0)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(auction.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-xs text-zinc-400 gap-1">
                          <div className="flex items-center gap-1.5" title={t('backoffice_auctions.start_date')}>
                            <Calendar size={12} className="text-zinc-500" />
                            {new Date(auction.start_time).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1.5" title={t('backoffice_auctions.end_date')}>
                            <Calendar size={12} className="text-zinc-500" />
                            {new Date(auction.end_time).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link 
                            to={`/auction/${auction.id}`}
                            className="p-1.5 text-zinc-400 hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-800"
                            title={t('backoffice_auctions.view_auction')}
                            target="_blank"
                          >
                            <ExternalLink size={16} />
                          </Link>
                          {auction.status !== 'CANCELLED' && auction.status !== 'COMPLETED' && (
                            <button 
                              onClick={() => setAuctionToCancel(auction.id)}
                              disabled={isCanceling}
                              className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors rounded-md hover:bg-zinc-800"
                              title={t('backoffice_auctions.cancel_auction')}
                            >
                              <Ban size={16} />
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
          
          {/* Pagination */}
          {data && data.count > 10 && (
            <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/20">
              <span className="text-xs text-zinc-500">
                {t('backoffice_auctions.total_auctions')}<span className="font-medium text-zinc-300">{data.count}</span>{t('backoffice_auctions.total_auctions_suffix')}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!data.previous}
                  className="px-3 py-1 text-xs border border-zinc-800 text-zinc-300 rounded-md disabled:opacity-50 hover:bg-zinc-800 transition-colors"
                >
                  {t('backoffice_auctions.btn_prev')}
                </button>
                <button 
                  onClick={() => setPage(p => p + 1)}
                  disabled={!data.next}
                  className="px-3 py-1 text-xs border border-zinc-800 text-zinc-300 rounded-md disabled:opacity-50 hover:bg-zinc-800 transition-colors"
                >
                  {t('backoffice_auctions.btn_next')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal Backdrop */}
      {auctionToCancel !== null && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => !isCanceling && setAuctionToCancel(null)}
        >
          {/* Modal Content */}
          <div 
            className="bg-black border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <div className="p-3 bg-red-400/10 rounded-full">
                <Ban size={24} />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100">{t('backoffice_auctions.cancel_modal_title')}</h3>
            </div>
            
            <p className="text-zinc-400 text-sm mb-5">
              {t('backoffice_auctions.cancel_modal_desc')}
            </p>

            <div className="mb-6">
              <label className="text-xs font-medium text-zinc-500 mb-2 block uppercase tracking-wider">{t('backoffice_auctions.cancel_modal_reason')}</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={t('backoffice_auctions.cancel_modal_reason_placeholder')}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-red-500/50 transition-colors"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setAuctionToCancel(null)}
                disabled={isCanceling}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg transition-colors"
              >
                {t('backoffice_auctions.cancel_modal_keep')}
              </button>
              <button 
                onClick={confirmCancelAuction}
                disabled={isCanceling}
                className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isCanceling ? t('backoffice_auctions.cancel_modal_canceling') : t('backoffice_auctions.cancel_modal_confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
