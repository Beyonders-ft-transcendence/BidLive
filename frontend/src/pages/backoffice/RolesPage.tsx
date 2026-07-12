import { useState, useMemo } from 'react';
import Container from '@/components/layout/backoffice/Container';
import PageHeader from '@/components/layout/backoffice/PageHeader';
import { useRolesQuery, usePermissionsQuery, useUpdateRoleMutation } from '@/hooks/useRbac';
import { ShieldCheck, ShieldAlert, KeyRound, Save, X, Activity, UserCog } from 'lucide-react';

export default function RolesPage() {
  const { data: rolesData, isLoading: isLoadingRoles } = useRolesQuery();
  const { data: permissionsData } = usePermissionsQuery();
  const { mutate: updateRole, isPending: isUpdating } = useUpdateRoleMutation();

  const [activeRole, setActiveRole] = useState<any | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const roles = Array.isArray(rolesData) ? rolesData : rolesData?.results || [];
  const permissions = Array.isArray(permissionsData) ? permissionsData : permissionsData?.results || [];

  const handleEditRole = (role: any) => {
    setActiveRole(role);
    setSelectedPermissions(role.permissions?.map((p: any) => p.name) || []);
  };

  const togglePermission = (permName: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permName) 
        ? prev.filter(p => p !== permName)
        : [...prev, permName]
    );
  };

  const handleSave = () => {
    if (!activeRole) return;
    updateRole(
      { 
        id: activeRole.id, 
        payload: { 
          name: activeRole.name,
          permission_names: selectedPermissions 
        } 
      },
      {
        onSuccess: (data) => {
          setActiveRole(data);
        }
      }
    );
  };

  // Group permissions logically by prefix (e.g. user.*, domain.*)
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, any[]> = {};
    permissions.forEach((perm: any) => {
      const prefix = perm.name.split('.')[0] || 'geral';
      if (!groups[prefix]) groups[prefix] = [];
      groups[prefix].push(perm);
    });
    return groups;
  }, [permissions]);

  return (
    <Container>
      <PageHeader 
        title="Perfis e Acessos"
        description="Controle as permissões granulares dos utilizadores da plataforma selecionando um dos perfis abaixo."
        icon={<ShieldCheck size={20} />}
      />

      <div className="flex flex-col gap-6 max-w-[1400px] w-full relative pb-10">
        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
          {isLoadingRoles ? (
             Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-zinc-900/50 h-32 rounded-xl border border-zinc-800"></div>
            ))
          ) : roles.map((role: any) => (
            <div 
              key={role.id}
              onClick={() => handleEditRole(role)}
              className={`bg-black border rounded-xl p-5 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg group ${
                activeRole?.id === role.id 
                  ? 'border-indigo-500 ring-1 ring-indigo-500/30' 
                  : 'border-zinc-800 hover:border-zinc-500'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${
                  role.name === 'SUPER_ADMIN' ? 'bg-red-500/10 text-red-400' :
                  role.name === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-400' :
                  role.name === 'MODERATOR' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-zinc-800 text-zinc-400'
                }`}>
                  {role.name === 'SUPER_ADMIN' ? <ShieldAlert size={20} /> :
                   role.name === 'ADMIN' ? <ShieldCheck size={20} /> :
                   role.name === 'MODERATOR' ? <Activity size={20} /> :
                   <UserCog size={20} />}
                </div>
                <span className="text-[10px] uppercase font-bold text-zinc-500">ID: {role.id}</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-100 uppercase mb-1">{role.name}</h3>
              <p className="text-xs text-zinc-400 mb-4 line-clamp-2 min-h-[32px]">{role.description || 'Sem descrição.'}</p>
              <div className="flex items-center gap-2 pt-3 border-t border-zinc-800/80">
                <KeyRound size={12} className="text-zinc-500" />
                <span className="text-xs font-medium text-zinc-500">
                  <strong className="text-zinc-300">{role.permissions?.length || 0}</strong> permissões
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Drawer Backdrop */}
      {activeRole && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-in fade-in"
          onClick={() => !isUpdating && setActiveRole(null)}
        />
      )}

      {/* Right Drawer Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-black border-l border-zinc-800 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${
          activeRole ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/20">
          <div>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2 uppercase">
              {activeRole?.name}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Gerir permissões ativas</p>
          </div>
          <button 
            onClick={() => setActiveRole(null)}
            className="p-2 text-zinc-400 hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-800/50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          {Object.entries(groupedPermissions).map(([groupName, perms]) => (
            <div key={groupName} className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 border-b border-zinc-800/50 pb-2">
                Módulo: {groupName}
              </h3>
              <div className="space-y-4">
                {perms.map((perm: any) => {
                  const isActive = selectedPermissions.includes(perm.name);
                  return (
                    <div key={perm.id} className="flex items-center justify-between group">
                      <div className="pr-4">
                        <p className={`text-sm font-medium transition-colors ${isActive ? 'text-zinc-100' : 'text-zinc-400'}`}>
                          {perm.name}
                        </p>
                        {perm.description && (
                          <p className="text-xs text-zinc-600 mt-0.5 line-clamp-1">{perm.description}</p>
                        )}
                      </div>
                      
                      {/* Custom Toggle Switch */}
                      <button
                        onClick={() => togglePermission(perm.name)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none shrink-0 ${
                          isActive ? 'bg-indigo-500' : 'bg-zinc-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            isActive ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-900/50">
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-100 hover:bg-white text-black rounded-xl text-sm font-semibold transition cursor-pointer disabled:opacity-50"
          >
            <Save size={16} /> 
            {isUpdating ? 'A Guardar...' : 'Guardar Alterações'}
          </button>
        </div>
      </div>
    </Container>
  );
}
