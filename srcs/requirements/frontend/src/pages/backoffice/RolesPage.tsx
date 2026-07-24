import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useState, useMemo } from 'react';
import Container from '@/components/layout/backoffice/Container';
import PageHeader from '@/components/layout/backoffice/PageHeader';
import Toolbar from '@/components/layout/backoffice/Toolbar';
import { 
  useAdminRolesQuery, 
  useAdminPermissionsQuery, 
  useUpdateRoleMutation,
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation
} from '@/hooks/useAdmin';
import { ShieldCheck, ShieldAlert, KeyRound, Save, X, Activity, UserCog, Plus, Trash2, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Tab = 'roles' | 'permissions';

export default function RolesPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('backoffice_roles.title'));

  const [activeTab, setActiveTab] = useState<Tab>('roles');

  // Queries
  const { data: rolesData, isLoading: isLoadingRoles } = useAdminRolesQuery();
  const { data: permissionsData, isLoading: isLoadingPermissions } = useAdminPermissionsQuery();

  // Mutations (Roles)
  const { mutate: createRole, isPending: isCreatingRole } = useCreateRoleMutation();
  const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateRoleMutation();
  const { mutate: deleteRole, isPending: isDeletingRole } = useDeleteRoleMutation();

  // Mutations (Permissions)
  const { mutate: createPermission, isPending: isCreatingPermission } = useCreatePermissionMutation();
  const { mutate: updatePermission, isPending: isUpdatingPermission } = useUpdatePermissionMutation();
  const { mutate: deletePermission, isPending: isDeletingPermission } = useDeletePermissionMutation();

  // Roles State
  const [activeRole, setActiveRole] = useState<any | null>(null);
  const [isRoleCreateMode, setIsRoleCreateMode] = useState(false);
  const [showRoleDeleteConfirm, setShowRoleDeleteConfirm] = useState(false);
  const [roleForm, setRoleForm] = useState({ name: '', description: '' });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Permissions State
  const [activePermission, setActivePermission] = useState<any | null>(null);
  const [isPermissionCreateMode, setIsPermissionCreateMode] = useState(false);
  const [showPermissionDeleteConfirm, setShowPermissionDeleteConfirm] = useState(false);
  const [permissionForm, setPermissionForm] = useState({ name: '', description: '' });

  const roles = Array.isArray(rolesData) ? rolesData : rolesData?.results || [];
  const permissions = Array.isArray(permissionsData) ? permissionsData : permissionsData?.results || [];

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

  // --- Handlers for Roles ---
  const handleEditRole = (role: any) => {
    setActiveRole(role);
    setIsRoleCreateMode(false);
    setShowRoleDeleteConfirm(false);
    setRoleForm({ name: role.name, description: role.description || '' });
    const permNames = Array.isArray(role.permissions)
      ? role.permissions.map((p: any) => (typeof p === 'string' ? p : p?.name)).filter(Boolean)
      : [];
    setSelectedPermissions(permNames);
  };

  const handleNewRole = () => {
    setActiveRole(null);
    setIsRoleCreateMode(true);
    setShowRoleDeleteConfirm(false);
    setRoleForm({ name: '', description: '' });
    setSelectedPermissions([]);
  };

  const closeRoleDrawer = () => {
    if (isUpdatingRole || isCreatingRole) return;
    setActiveRole(null);
    setIsRoleCreateMode(false);
    setShowRoleDeleteConfirm(false);
  };

  const togglePermission = (permName: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permName) 
        ? prev.filter(p => p !== permName)
        : [...prev, permName]
    );
  };

  const toggleAllPermissions = () => {
    if (selectedPermissions.length === permissions.length) {
      setSelectedPermissions([]); 
    } else {
      setSelectedPermissions(permissions.map((p: any) => p.name)); 
    }
  };

  const toggleGroupPermissions = (groupName: string) => {
    const groupPerms = groupedPermissions[groupName].map((p: any) => p.name);
    const allGroupActive = groupPerms.every((permName: string) => selectedPermissions.includes(permName));
    
    if (allGroupActive) {
      setSelectedPermissions(prev => prev.filter(p => !groupPerms.includes(p)));
    } else {
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...groupPerms])));
    }
  };

  const handleSaveRole = () => {
    const payload = {
      name: roleForm.name,
      description: roleForm.description,
      permission_names: selectedPermissions
    };

    if (isRoleCreateMode) {
      createRole(payload, {
        onSuccess: () => closeRoleDrawer()
      });
    } else if (activeRole) {
      updateRole(
        { id: activeRole.id, payload },
        {
          onSuccess: (data) => {
            if (data) {
              setActiveRole(data);
              const permNames = Array.isArray(data.permissions)
                ? data.permissions.map((p: any) => (typeof p === 'string' ? p : p?.name)).filter(Boolean)
                : [];
              setSelectedPermissions(permNames);
            }
          }
        }
      );
    }
  };

  // --- Handlers for Permissions ---
  const handleEditPermission = (permission: any) => {
    setActivePermission(permission);
    setIsPermissionCreateMode(false);
    setShowPermissionDeleteConfirm(false);
    setPermissionForm({ name: permission.name, description: permission.description || '' });
  };

  const handleNewPermission = () => {
    setActivePermission(null);
    setIsPermissionCreateMode(true);
    setShowPermissionDeleteConfirm(false);
    setPermissionForm({ name: '', description: '' });
  };

  const closePermissionDrawer = () => {
    if (isUpdatingPermission || isCreatingPermission) return;
    setActivePermission(null);
    setIsPermissionCreateMode(false);
    setShowPermissionDeleteConfirm(false);
  };

  const handleSavePermission = () => {
    const payload = {
      name: permissionForm.name,
      description: permissionForm.description
    };

    if (isPermissionCreateMode) {
      createPermission(payload, {
        onSuccess: () => closePermissionDrawer()
      });
    } else if (activePermission) {
      updatePermission(
        { id: activePermission.id, payload },
        {
          onSuccess: (data) => {
            setActivePermission(data);
            closePermissionDrawer();
          }
        }
      );
    }
  };

  const isRoleDrawerOpen = activeRole || isRoleCreateMode;
  const isPermissionDrawerOpen = activePermission || isPermissionCreateMode;

  return (
    <Container>
      <PageHeader 
        title={t('backoffice_roles.title')}
        description={t('backoffice_roles.description')}
        icon={<ShieldCheck size={20} />}
      />

      <div className="flex flex-col gap-6 max-w-[1400px] w-full relative pb-10">
        <Toolbar>
          <div className="flex items-center justify-between w-full">
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('roles')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'roles' ? 'bg-zinc-800 text-zinc-100 shadow' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Perfis (Roles)
              </button>
              <button
                onClick={() => setActiveTab('permissions')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'permissions' ? 'bg-zinc-800 text-zinc-100 shadow' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Permissões do Sistema
              </button>
            </div>

            {activeTab === 'roles' && (
              <button
                onClick={handleNewRole}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-black text-sm font-medium rounded-lg hover:bg-white transition-colors"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Novo Perfil</span>
              </button>
            )}

            {activeTab === 'permissions' && (
              <button
                onClick={handleNewPermission}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-black text-sm font-medium rounded-lg hover:bg-white transition-colors"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Nova Permissão</span>
              </button>
            )}
          </div>
        </Toolbar>

        {activeTab === 'roles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
            {isLoadingRoles ? (
               Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-zinc-900/50 h-32 rounded-xl border border-zinc-800"></div>
              ))
            ) : roles.map((role: any) => (
              <div 
                key={role.id}
                onClick={() => handleEditRole(role)}
                className={`relative overflow-hidden bg-gradient-to-br from-zinc-900/80 to-black border rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] group ${
                  activeRole?.id === role.id 
                    ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/30' 
                    : 'border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-zinc-800/20 to-transparent rounded-bl-full opacity-50 pointer-events-none group-hover:from-zinc-700/30 transition-colors"></div>
                
                <div className="flex items-center justify-between mb-5 relative z-10">
                  <div className={`p-2.5 rounded-xl border ${
                    role.name === 'SUPER_ADMIN' ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(248,113,113,0.1)]' :
                    role.name === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' :
                    role.name === 'MODERATOR' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(251,191,36,0.1)]' :
                    'bg-zinc-800/50 text-zinc-400 border-zinc-700/50'
                  }`}>
                    {role.name === 'SUPER_ADMIN' ? <ShieldAlert size={22} /> :
                     role.name === 'ADMIN' ? <ShieldCheck size={22} /> :
                     role.name === 'MODERATOR' ? <Activity size={22} /> :
                     <UserCog size={22} />}
                  </div>
                </div>
                <h3 className="text-xl font-black text-zinc-100 uppercase tracking-tight mb-2 relative z-10">{role.name}</h3>
                <p className="text-sm text-zinc-400 mb-6 line-clamp-2 min-h-[40px] leading-relaxed relative z-10">{role.description || t('backoffice_roles.no_description')}</p>
                
                <div className="flex items-center gap-2 pt-4 border-t border-zinc-800/80 relative z-10">
                  <div className="p-1.5 bg-zinc-800/80 rounded-md text-zinc-400 group-hover:text-zinc-200 transition-colors">
                    <KeyRound size={14} />
                  </div>
                  <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
                    <strong className="text-zinc-100">{role.permissions?.length || 0}</strong> {t('backoffice_roles.permissions_active')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900/50 border-b border-zinc-800 text-xs font-medium text-zinc-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Nome (Chave)</th>
                    <th className="px-6 py-4 font-medium">Descrição</th>
                    <th className="px-6 py-4 font-medium">Módulo</th>
                    <th className="px-6 py-4 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {isLoadingPermissions ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-5 w-32 bg-zinc-800/50 rounded"></div></td>
                        <td className="px-6 py-4"><div className="h-5 w-48 bg-zinc-800/50 rounded"></div></td>
                        <td className="px-6 py-4"><div className="h-5 w-20 bg-zinc-800/50 rounded"></div></td>
                        <td className="px-6 py-4"><div className="h-6 w-8 bg-zinc-800/50 rounded ml-auto"></div></td>
                      </tr>
                    ))
                  ) : permissions.map((perm: any) => {
                    const module = perm.name.split('.')[0] || 'geral';
                    return (
                      <tr key={perm.id} className="hover:bg-zinc-900/30 transition-colors group">
                        <td className="px-6 py-4 font-mono text-zinc-300">
                          {perm.name}
                        </td>
                        <td className="px-6 py-4 text-zinc-400">
                          {perm.description || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/50 uppercase">
                            {module}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEditPermission(perm)}
                              className="p-1.5 text-zinc-400 hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-800"
                              title="Editar Permissão"
                            >
                              <Edit size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* --- ROLE DRAWER --- */}
      {isRoleDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-in fade-in"
          onClick={closeRoleDrawer}
        />
      )}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-black border-l border-zinc-800 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${
          isRoleDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/20">
          <div>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2 uppercase">
              {isRoleCreateMode ? 'Novo Perfil' : activeRole?.name}
            </h2>
            {!isRoleCreateMode && (
              <div className="flex items-center justify-between mt-1 gap-4">
                <p className="text-xs text-zinc-400">{t('backoffice_roles.manage_permissions')}</p>
                <button 
                  onClick={toggleAllPermissions}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {selectedPermissions.length === permissions.length ? t('backoffice_roles.disable_all') : t('backoffice_roles.enable_all')}
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={closeRoleDrawer}
            className="p-2 text-zinc-400 hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-800/50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-300">Nome do Perfil</label>
              <input 
                type="text" 
                required
                value={roleForm.name}
                onChange={(e) => setRoleForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-all uppercase font-mono"
                placeholder="Ex: ADMIN_SECUNDARIO"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-300">Descrição</label>
              <textarea 
                rows={2}
                value={roleForm.description}
                onChange={(e) => setRoleForm(p => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-all resize-none"
                placeholder="Descreva a finalidade deste perfil..."
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-800/50">
            <h3 className="text-sm font-semibold text-zinc-300">Permissões do Sistema</h3>
            {Object.entries(groupedPermissions).map(([groupName, perms]) => {
              const groupPerms = perms.map((p: any) => p.name);
              const allGroupActive = groupPerms.every((permName: string) => selectedPermissions.includes(permName));

              return (
                <div key={groupName} className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4 border-b border-zinc-800/50 pb-2">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      {t('backoffice_roles.module_label', { name: groupName })}
                    </h3>
                    <button 
                      onClick={() => toggleGroupPermissions(groupName)}
                      className="text-[10px] font-bold text-zinc-400 hover:text-zinc-200 transition-colors bg-zinc-800/50 hover:bg-zinc-700/50 px-2 py-1 rounded"
                    >
                      {allGroupActive ? t('backoffice_roles.disable_module') : t('backoffice_roles.enable_module')}
                    </button>
                  </div>
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
              );
            })}
          </div>

          {!isRoleCreateMode && activeRole && !['SUPER_ADMIN'].includes(activeRole.name) && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              {!showRoleDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowRoleDeleteConfirm(true)}
                  className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 size={16} />
                  Remover Perfil
                </button>
              ) : (
                <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg">
                  <p className="text-sm font-medium text-red-400 mb-1">Confirmação de Deleção</p>
                  <p className="text-xs text-red-400/80 mb-3">
                    Ao remover este perfil, todos os utilizadores associados perderão os privilégios inerentes.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRoleDeleteConfirm(false)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-300 bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteRole(activeRole.id, {
                          onSuccess: () => closeRoleDrawer()
                        });
                      }}
                      disabled={isDeletingRole}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-red-950 bg-red-500 hover:bg-red-400 rounded-md transition-colors disabled:opacity-50"
                    >
                      {isDeletingRole ? 'A Remover...' : 'Remover'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-900/50">
          <button
            onClick={handleSaveRole}
            disabled={isUpdatingRole || isCreatingRole || !roleForm.name.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-100 hover:bg-white text-black rounded-xl text-sm font-semibold transition cursor-pointer disabled:opacity-50"
          >
            <Save size={16} /> 
            {(isUpdatingRole || isCreatingRole) ? t('backoffice_roles.btn_saving') : t('backoffice_roles.btn_save')}
          </button>
        </div>
      </div>

      {/* --- PERMISSION DRAWER --- */}
      {isPermissionDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-in fade-in"
          onClick={closePermissionDrawer}
        />
      )}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-black border-l border-zinc-800 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${
          isPermissionDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/20">
          <h2 className="text-xl font-bold text-zinc-100">
            {isPermissionCreateMode ? 'Nova Permissão' : 'Editar Permissão'}
          </h2>
          <button 
            onClick={closePermissionDrawer}
            className="p-2 text-zinc-400 hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-800/50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-300">Chave da Permissão</label>
            <input 
              type="text" 
              required
              value={permissionForm.name}
              onChange={(e) => setPermissionForm(p => ({ ...p, name: e.target.value.toLowerCase() }))}
              className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-all font-mono"
              placeholder="ex: user.create"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-300">Descrição</label>
            <textarea 
              rows={3}
              value={permissionForm.description}
              onChange={(e) => setPermissionForm(p => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-all resize-none"
              placeholder="O que esta permissão autoriza?"
            />
          </div>

          {!isPermissionCreateMode && activePermission && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              {!showPermissionDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowPermissionDeleteConfirm(true)}
                  className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 size={16} />
                  Remover Permissão
                </button>
              ) : (
                <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg">
                  <p className="text-sm font-medium text-red-400 mb-1">Confirmação</p>
                  <p className="text-xs text-red-400/80 mb-3">
                    Remover esta permissão revogará o acesso em todos os perfis associados.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPermissionDeleteConfirm(false)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-300 bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deletePermission(activePermission.id, {
                          onSuccess: () => closePermissionDrawer()
                        });
                      }}
                      disabled={isDeletingPermission}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-red-950 bg-red-500 hover:bg-red-400 rounded-md transition-colors disabled:opacity-50"
                    >
                      {isDeletingPermission ? 'A Remover...' : 'Remover'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-900/50">
          <button
            onClick={handleSavePermission}
            disabled={isUpdatingPermission || isCreatingPermission || !permissionForm.name.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-100 hover:bg-white text-black rounded-xl text-sm font-semibold transition cursor-pointer disabled:opacity-50"
          >
            <Save size={16} /> 
            {(isUpdatingPermission || isCreatingPermission) ? 'A Guardar...' : 'Guardar Alterações'}
          </button>
        </div>
      </div>
    </Container>
  );
}
