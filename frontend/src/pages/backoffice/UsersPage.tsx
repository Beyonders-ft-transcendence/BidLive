import React, { useState } from 'react';
import Container from '@/components/layout/backoffice/Container';
import { useAdminUsersQuery, useBanUserMutation } from '@/hooks/useAdmin';
import Avatar from '@/components/common/Avatar';
import { Search, MoreVertical, ShieldBan, CheckCircle, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const { data, isLoading } = useAdminUsersQuery(page, search);
  const { mutate: banUser, isPending } = useBanUserMutation();

  const handleStatusToggle = (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    if (window.confirm(`Tem a certeza que deseja mudar o estado para ${newStatus}?`)) {
      banUser({ id: userId, payload: { status: newStatus as any } });
    }
  };

  const users = data?.results || [];

  return (
    <Container>
      <div className="flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Utilizadores</h1>
            <p className="text-muted-foreground mt-1 text-sm">Faça a gestão dos acessos e bloqueios.</p>
          </div>
          
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Pesquisar por email/nome..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10 pr-4 py-2 w-full md:w-80 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Utilizador</th>
                  <th className="px-6 py-4">Perfil</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Registado a</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-10 w-48 bg-muted rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-20 bg-muted rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-16 bg-muted rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-24 bg-muted rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-8 w-8 bg-muted rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      Nenhum utilizador encontrado.
                    </td>
                  </tr>
                ) : (
                  users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.full_name} src={user.avatar_url} size="md" />
                          <div>
                            <div className="font-bold text-foreground">{user.full_name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {typeof user.roles?.[0] === 'object' ? user.roles[0].name : user.roles?.[0] || 'USER'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-green-500/10 text-green-500">
                            <CheckCircle size={12} /> Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-500/10 text-red-500">
                            <ShieldBan size={12} /> Banido
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleStatusToggle(user.id, user.status)}
                          disabled={isPending}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                          title={user.status === 'ACTIVE' ? "Banir Utilizador" : "Reativar Utilizador"}
                        >
                          {user.status === 'ACTIVE' ? <ShieldAlert size={18} className="hover:text-red-500" /> : <CheckCircle size={18} className="hover:text-green-500" />}
                        </button>
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
                Total: <span className="font-semibold text-foreground">{data.count}</span> utilizadores
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
