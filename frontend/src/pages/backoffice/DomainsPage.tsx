import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '@/components/layout/backoffice/Container';
import PageHeader from '@/components/layout/backoffice/PageHeader';
import Toolbar from '@/components/layout/backoffice/Toolbar';
import { useDomainsQuery, useDeleteDomainMutation, useCreateDomainMutation } from '@/hooks/useDomain';
import { Search, Plus, Edit, Trash2, Globe, CheckCircle, Clock, PauseCircle, Archive } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { DomainStatus } from '@/shared/types/domain.types';

export default function DomainsPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('backoffice_domains.title'));

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newDomainName, setNewDomainName] = useState('');
  const navigate = useNavigate();
  
  const { data, isLoading } = useDomainsQuery({ page, search });
  const { mutate: deleteDomain, isPending: isDeleting } = useDeleteDomainMutation();
  const { mutate: createDomain, isPending: isCreatingMut } = useCreateDomainMutation();

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(t('backoffice_domains.confirm_delete', { name }))) {
      deleteDomain(id);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainName.trim()) return;
    createDomain(
      { name: newDomainName, status: 'draft' },
      {
        onSuccess: () => {
          setIsCreating(false);
          setNewDomainName('');
        }
      }
    );
  };

  const renderStatus = (status: DomainStatus, isArchived: boolean) => {
    if (isArchived) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
          <Archive size={10} /> {t('backoffice_domains.status.archived')}
        </span>
      );
    }
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-800 text-emerald-400 border border-zinc-700/50">
            <CheckCircle size={10} /> {t('backoffice_domains.status.active')}
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-800 text-blue-400 border border-zinc-700/50">
            <Clock size={10} /> {t('backoffice_domains.status.draft')}
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-800 text-yellow-500 border border-zinc-700/50">
            <PauseCircle size={10} /> {t('backoffice_domains.status.paused')}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-800 text-purple-400 border border-zinc-700/50">
            <CheckCircle size={10} /> {t('backoffice_domains.status.completed')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700/50">
            {status}
          </span>
        );
    }
  };

  const domains = data?.results || [];

  return (
    <Container>
      <PageHeader 
        title={t('backoffice_domains.title')}
        description={t('backoffice_domains.description')}
        icon={<Globe size={20} />}
        actions={
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-black rounded-lg font-medium hover:bg-white transition-colors"
          >
            <Plus size={16} /> {t('backoffice_domains.new_domain')}
          </button>
        }
      />

      <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
        
        {/* Create Domain Inline Form */}
        {isCreating && (
          <form onSubmit={handleCreate} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center gap-4 animate-in fade-in slide-in-from-top-2">
            <input 
              type="text" 
              placeholder={t('backoffice_domains.new_domain_name_placeholder')}
              value={newDomainName}
              onChange={(e) => setNewDomainName(e.target.value)}
              className="flex-1 px-4 py-2 bg-black border border-zinc-800 rounded-lg focus:outline-none focus:border-zinc-500 text-zinc-100"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button 
                type="submit" 
                disabled={isCreatingMut || !newDomainName.trim()}
                className="px-4 py-2 bg-zinc-100 text-black rounded-lg font-medium hover:bg-white transition-colors disabled:opacity-50"
              >
                {isCreatingMut ? t('backoffice_domains.saving') : t('backoffice_domains.save')}
              </button>
              <button 
                type="button" 
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-transparent text-zinc-400 border border-zinc-800 rounded-lg font-medium hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
              >
                {t('backoffice_domains.cancel')}
              </button>
            </div>
          </form>
        )}

        <Toolbar>
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder={t('backoffice_domains.search_placeholder')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10 pr-4 py-2 w-full bg-black border border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-zinc-500 text-zinc-100 transition-all"
            />
          </div>
          {/* Add future filters here */}
        </Toolbar>

        {/* Data Table */}
        <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-900/50 border-b border-zinc-800 text-xs font-medium text-zinc-500">
                <tr>
                  <th className="px-6 py-4 font-medium">{t('backoffice_domains.th_name')}</th>
                  <th className="px-6 py-4 font-medium">{t('backoffice_domains.th_owner')}</th>
                  <th className="px-6 py-4 font-medium">{t('backoffice_domains.th_status')}</th>
                  <th className="px-6 py-4 font-medium">{t('backoffice_domains.th_budget')}</th>
                  <th className="px-6 py-4 font-medium">{t('backoffice_domains.th_created')}</th>
                  <th className="px-6 py-4 text-right font-medium">{t('backoffice_domains.th_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-5 w-32 bg-zinc-800/50 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-5 w-48 bg-zinc-800/50 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-5 w-20 bg-zinc-800/50 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-5 w-16 bg-zinc-800/50 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-5 w-24 bg-zinc-800/50 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-12 bg-zinc-800/50 rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : domains.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-zinc-500">
                      {t('backoffice_domains.no_domains')}
                    </td>
                  </tr>
                ) : (
                  domains.map((domain: any) => (
                    <tr key={domain.id} className="hover:bg-zinc-900/30 transition-colors group">
                      <td className="px-6 py-4 font-medium text-zinc-100">
                        <Link to={`/backoffice/domains/${domain.id}`} className="hover:text-white transition-colors">
                          {domain.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        {domain.owner_email}
                      </td>
                      <td className="px-6 py-4">
                        {renderStatus(domain.status, domain.is_archived)}
                      </td>
                      <td className="px-6 py-4 text-zinc-400 font-mono text-xs">
                        {domain.budget ? `$${parseFloat(domain.budget).toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        {new Date(domain.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => navigate(`/backoffice/domains/${domain.id}`)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-800"
                            title={t('backoffice_domains.configure_title')}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(domain.id, domain.name)}
                            disabled={isDeleting}
                            className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors rounded-md hover:bg-zinc-800 disabled:opacity-50"
                            title={t('backoffice_domains.delete_title')}
                          >
                            <Trash2 size={16} />
                          </button>
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
                <span className="font-medium text-zinc-300">{data.count}</span> {t('backoffice_domains.total_suffix')}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!data.previous}
                  className="px-3 py-1 text-xs border border-zinc-800 text-zinc-300 rounded-md disabled:opacity-50 hover:bg-zinc-800 transition-colors"
                >
                  {t('backoffice_domains.btn_prev')}
                </button>
                <button 
                  onClick={() => setPage(p => p + 1)}
                  disabled={!data.next}
                  className="px-3 py-1 text-xs border border-zinc-800 text-zinc-300 rounded-md disabled:opacity-50 hover:bg-zinc-800 transition-colors"
                >
                  {t('backoffice_domains.btn_next')}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </Container>
  );
}
