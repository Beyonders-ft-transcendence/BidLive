import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '@/components/layout/backoffice/Container';
import { useDomainsQuery, useDeleteDomainMutation, useCreateDomainMutation } from '@/hooks/useDomain';
import { Search, Plus, Edit, Trash2, Globe, CheckCircle, Clock, PauseCircle, Archive } from 'lucide-react';
import type { DomainStatus } from '@/shared/types/domain.types';

export default function DomainsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newDomainName, setNewDomainName] = useState('');
  const navigate = useNavigate();
  
  const { data, isLoading } = useDomainsQuery({ page, search });
  const { mutate: deleteDomain, isPending: isDeleting } = useDeleteDomainMutation();
  const { mutate: createDomain, isPending: isCreatingMut } = useCreateDomainMutation();

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Tem a certeza que deseja eliminar o domínio "${name}"? Esta ação não pode ser desfeita.`)) {
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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-500/10 text-gray-500">
          <Archive size={12} /> Arquivado
        </span>
      );
    }
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-green-500/10 text-green-500">
            <CheckCircle size={12} /> Ativo
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-500">
            <Clock size={12} /> Rascunho
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-yellow-500/10 text-yellow-500">
            <PauseCircle size={12} /> Pausado
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-500/10 text-purple-500">
            <CheckCircle size={12} /> Concluído
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-500/10 text-gray-500">
            {status}
          </span>
        );
    }
  };

  const domains = data?.results || [];

  return (
    <Container>
      <div className="flex flex-col gap-6">
        
        {/* Header and Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Globe size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Domínios</h1>
              <p className="text-sm text-muted-foreground">Faça a gestão dos seus projetos e contextos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Pesquisar domínios..." 
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10 pr-4 py-2 w-full md:w-64 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
            <button 
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus size={18} /> Novo Domínio
            </button>
          </div>
        </div>

        {/* Create Domain Inline Form */}
        {isCreating && (
          <form onSubmit={handleCreate} className="bg-card border border-primary/30 p-4 rounded-xl flex items-center gap-4">
            <input 
              type="text" 
              placeholder="Nome do novo domínio..." 
              value={newDomainName}
              onChange={(e) => setNewDomainName(e.target.value)}
              className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
              autoFocus
            />
            <button 
              type="submit" 
              disabled={isCreatingMut || !newDomainName.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isCreatingMut ? 'A Criar...' : 'Guardar'}
            </button>
            <button 
              type="button" 
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
            >
              Cancelar
            </button>
          </form>
        )}

        {/* Data Table */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Proprietário</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Orçamento</th>
                  <th className="px-6 py-4">Criado em</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-6 w-32 bg-muted rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-48 bg-muted rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-20 bg-muted rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-16 bg-muted rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-24 bg-muted rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-8 w-16 bg-muted rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : domains.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      Nenhum domínio encontrado.
                    </td>
                  </tr>
                ) : (
                  domains.map((domain: any) => (
                    <tr key={domain.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground">
                        <Link to={`/backoffice/domains/${domain.id}`} className="hover:text-primary transition-colors">
                          {domain.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {domain.owner_email}
                      </td>
                      <td className="px-6 py-4">
                        {renderStatus(domain.status, domain.is_archived)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {domain.budget ? `$${parseFloat(domain.budget).toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(domain.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => navigate(`/backoffice/domains/${domain.id}`)}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"
                            title="Configurar Domínio"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(domain.id, domain.name)}
                            disabled={isDeleting}
                            className="p-2 text-muted-foreground hover:text-red-500 transition-colors rounded-md hover:bg-muted disabled:opacity-50"
                            title="Eliminar Domínio"
                          >
                            <Trash2 size={18} />
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
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total: <span className="font-semibold text-foreground">{data.count}</span> domínios
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!data.previous}
                  className="px-3 py-1 text-sm border border-border rounded-md disabled:opacity-50 hover:bg-muted"
                >
                  Anterior
                </button>
                <button 
                  onClick={() => setPage(p => p + 1)}
                  disabled={!data.next}
                  className="px-3 py-1 text-sm border border-border rounded-md disabled:opacity-50 hover:bg-muted"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </Container>
  );
}
