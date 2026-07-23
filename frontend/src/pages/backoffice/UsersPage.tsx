import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useState, useEffect } from 'react';
import Container from '@/components/layout/backoffice/Container';
import PageHeader from '@/components/layout/backoffice/PageHeader';
import Toolbar from '@/components/layout/backoffice/Toolbar';
import { 
  useAdminUsersQuery, 
  useUpdateUserMutation, 
  useAdminRolesQuery, 
  useAdminUserDetailQuery,
  useCreateUserMutation,
  useDeleteUserMutation
} from '@/hooks/useAdmin';
import Avatar from '@/components/common/Avatar';
import { Search, ShieldBan, CheckCircle, Users, X, Edit, Save, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function UsersPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('backoffice_users.title'));

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { data, isLoading } = useAdminUsersQuery(page, search);
  const { data: rolesData } = useAdminRolesQuery();
  const { data: userDetail, isLoading: isLoadingDetail } = useAdminUserDetailQuery(selectedUserId || 0);
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUserMutation();
  const { mutate: createUser, isPending: isCreating } = useCreateUserMutation();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUserMutation();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    full_name: '',
    password: '',
    status: 'ACTIVE',
    role_names: [] as string[],
  });

  const resetForm = () => {
    setFormData({
      email: '',
      username: '',
      full_name: '',
      password: '',
      status: 'ACTIVE',
      role_names: [],
    });
  };

  useEffect(() => {
    if (userDetail && !isCreateMode) {
      setFormData({
        email: userDetail.email || '',
        username: userDetail.username || '',
        full_name: userDetail.full_name || '',
        password: '',
        status: userDetail.status || 'ACTIVE',
        role_names: userDetail.roles?.map((r: any) => typeof r === 'string' ? r : r.name) || [],
      });
    }
  }, [userDetail, isCreateMode]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreateMode) {
      if (!formData.role_names || formData.role_names.length === 0 || !formData.role_names[0]) {
        toast.error("Por favor, selecione um perfil de acesso (Role) para o novo utilizador.");
        return;
      }

      const payload: any = {
        email: formData.email,
        username: formData.username,
        full_name: formData.full_name,
        password: formData.password,
      };

      if (formData.status) {
        payload.status = formData.status;
      }

      if (Array.isArray(formData.role_names) && formData.role_names.length > 0) {
        const filteredRoles = formData.role_names.filter((r: string) => r && r.trim() !== '');
        if (filteredRoles.length > 0) {
          payload.role_names = filteredRoles;
        }
      }

      createUser(payload, {
        onSuccess: () => {
          setIsCreateMode(false);
          resetForm();
        }
      });
    } else if (selectedUserId) {
      const updateData: any = {};
      
      if (formData.username && formData.username.trim()) {
        updateData.username = formData.username.trim();
      }
      if (formData.full_name && formData.full_name.trim()) {
        updateData.full_name = formData.full_name.trim();
      }
      if (formData.status) {
        updateData.status = formData.status;
      }

      if (Array.isArray(formData.role_names)) {
        updateData.role_names = formData.role_names.filter((r: string) => r && r.trim() !== '');
      }

      updateUser({ 
        id: selectedUserId, 
        payload: updateData 
      }, {
        onSuccess: () => {
          setSelectedUserId(null);
          resetForm();
        }
      });
    }
  };

  const roles = Array.isArray(rolesData) ? rolesData : (rolesData?.results || []);
  const users = data?.results || [];

  return (
    <Container>
      <PageHeader 
        title={t('backoffice_users.title')}
        description={t('backoffice_users.description')}
        icon={<Users size={20} />}
      />

      <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full relative">
        <Toolbar>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full">
            <div className="relative w-full sm:max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text" 
                placeholder={t('backoffice_users.search_placeholder')}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10 pr-4 py-2 w-full bg-black border border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-zinc-500 text-zinc-100 transition-all"
              />
            </div>
            <button
              onClick={() => {
                resetForm();
                setIsCreateMode(true);
                setSelectedUserId(null);
                setShowDeleteConfirm(false);
              }}
              className="sm:ml-auto flex items-center justify-center gap-2 px-4 py-2 bg-zinc-100 text-black text-sm font-medium rounded-lg hover:bg-white transition-colors"
            >
              <Plus size={16} />
              <span>{t('backoffice_users.btn_new_user')}</span>
            </button>
          </div>
        </Toolbar>

        {/* Data List (Cards for Mobile) / Table (Desktop) */}
        <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden">
          
          {/* Mobile Cards View */}
          <div className="md:hidden flex flex-col divide-y divide-zinc-800/50">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800/50 shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-zinc-800/50 rounded mb-2"></div>
                      <div className="h-3 w-24 bg-zinc-800/50 rounded"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-800/30">
                    <div className="h-5 w-16 bg-zinc-800/50 rounded"></div>
                    <div className="h-5 w-20 bg-zinc-800/50 rounded"></div>
                  </div>
                </div>
              ))
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">
                {t('backoffice_users.no_users')}
              </div>
            ) : (
              users.map((user: any) => (
                <div key={`mobile-${user.id}`} className="p-4 hover:bg-zinc-900/20 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.full_name} src={user.avatar_url} size="md" />
                      <div>
                        <div className="font-medium text-zinc-100">{user.full_name}</div>
                        <div className="text-xs text-zinc-500">{user.email}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setIsCreateMode(false);
                        setShowDeleteConfirm(false);
                      }}
                      className="p-2 text-zinc-400 hover:text-zinc-100 transition-colors rounded-lg border border-zinc-800 hover:bg-zinc-800 bg-zinc-900/50 shadow-sm"
                      title={t('backoffice_users.manage_user')}
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs mt-4 bg-zinc-900/20 p-3 rounded-lg border border-zinc-800/50">
                    <div className="flex flex-col gap-1">
                      <span className="text-zinc-500 uppercase font-bold text-[10px] tracking-wider">{t('backoffice_users.th_profile')}</span>
                      <div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/50 shadow-sm">
                          {typeof user.roles?.[0] === 'object' ? user.roles[0].name : user.roles?.[0] || 'USER'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className="text-zinc-500 uppercase font-bold text-[10px] tracking-wider">{t('backoffice_users.th_status')}</span>
                      {user.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-800 text-emerald-400 border border-zinc-700/50 shadow-sm">
                          <CheckCircle size={10} /> {t('backoffice_users.status_active')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-800 text-red-400 border border-zinc-700/50 shadow-sm">
                          <ShieldBan size={10} /> {t('backoffice_users.status_banned')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 text-[11px] text-zinc-500 flex justify-between items-center px-1">
                    <span className="uppercase tracking-wider font-semibold">{t('backoffice_users.th_registered_at')}</span>
                    <span className="font-mono text-zinc-400">{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
              <thead className="bg-zinc-900/50 border-b border-zinc-800 text-xs font-medium text-zinc-500">
                <tr>
                  <th className="px-6 py-4 font-medium">{t('backoffice_users.th_user')}</th>
                  <th className="px-6 py-4 font-medium">{t('backoffice_users.th_profile')}</th>
                  <th className="px-6 py-4 font-medium">{t('backoffice_users.th_status')}</th>
                  <th className="px-6 py-4 font-medium">{t('backoffice_users.th_registered_at')}</th>
                  <th className="px-6 py-4 text-right font-medium">{t('backoffice_users.th_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-10 w-48 bg-zinc-800/50 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-5 w-20 bg-zinc-800/50 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-5 w-16 bg-zinc-800/50 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-5 w-24 bg-zinc-800/50 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-8 bg-zinc-800/50 rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-zinc-500">
                      {t('backoffice_users.no_users')}
                    </td>
                  </tr>
                ) : (
                  users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-zinc-900/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.full_name} src={user.avatar_url} size="md" />
                          <div>
                            <div className="font-medium text-zinc-100">{user.full_name}</div>
                            <div className="text-xs text-zinc-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                          {typeof user.roles?.[0] === 'object' ? user.roles[0].name : user.roles?.[0] || 'USER'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-800 text-emerald-400 border border-zinc-700/50">
                            <CheckCircle size={10} /> {t('backoffice_users.status_active')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-800 text-red-400 border border-zinc-700/50">
                            <ShieldBan size={10} /> {t('backoffice_users.status_banned')}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-zinc-400 text-xs font-mono">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setIsCreateMode(false);
                              setShowDeleteConfirm(false);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-800"
                            title={t('backoffice_users.manage_user')}
                          >
                            <Edit size={16} />
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
            <div className="px-4 sm:px-6 py-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/20">
              <span className="text-xs text-zinc-500 w-full sm:w-auto text-center sm:text-left">
                {t('backoffice_users.total_users')} <span className="font-medium text-zinc-300">{data.count}</span> {t('backoffice_users.total_users_suffix')}
              </span>
              <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!data.previous}
                  className="px-3 py-1 text-xs border border-zinc-800 text-zinc-300 rounded-md disabled:opacity-50 hover:bg-zinc-800 transition-colors"
                >
                  {t('backoffice_users.btn_prev')}
                </button>
                <button 
                  onClick={() => setPage(p => p + 1)}
                  disabled={!data.next}
                  className="px-3 py-1 text-xs border border-zinc-800 text-zinc-300 rounded-md disabled:opacity-50 hover:bg-zinc-800 transition-colors"
                >
                  {t('backoffice_users.btn_next')}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Right Drawer Backdrop */}
      {(selectedUserId || isCreateMode) && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-in fade-in"
          onClick={() => {
            setSelectedUserId(null);
            setIsCreateMode(false);
            setShowDeleteConfirm(false);
          }}
        />
      )}

      {/* Right Drawer Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] max-w-[100vw] bg-black border-l border-zinc-800 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${
          (selectedUserId || isCreateMode) ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-100">
            {isCreateMode ? t('backoffice_users.create_user_title') : t('backoffice_users.manage_user')}
          </h2>
          <button 
            onClick={() => {
              setSelectedUserId(null);
              setIsCreateMode(false);
              setShowDeleteConfirm(false);
            }}
            className="p-2 text-zinc-400 hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-800/50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {(isLoadingDetail && selectedUserId && !isCreateMode) ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-500"></div>
            </div>
          ) : (
            <form id="user-form" onSubmit={handleSave} className="p-6 flex flex-col gap-8">
              
              {/* Profile Overview (Only in edit mode) */}
              {!isCreateMode && userDetail && (
                <div className="flex items-center gap-4">
                  <Avatar name={userDetail.full_name} src={userDetail.avatar_url} size="lg" />
                  <div>
                    <h3 className="font-semibold text-zinc-100 text-lg">{userDetail.full_name}</h3>
                    <p className="text-sm text-zinc-500">{userDetail.email}</p>
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <div className="flex flex-col gap-6">
                {isCreateMode && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-zinc-300">{t('backoffice_users.email')}</label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                        className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-zinc-300">{t('backoffice_users.username')}</label>
                      <input 
                        type="text" 
                        required
                        value={formData.username}
                        onChange={(e) => setFormData(p => ({ ...p, username: e.target.value }))}
                        className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
                      />
                    </div>
                  </>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-zinc-300">{t('backoffice_users.full_name')}</label>
                  <input 
                    type="text" 
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData(p => ({ ...p, full_name: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-zinc-300">
                    {isCreateMode ? t('backoffice_users.password_create') : t('backoffice_users.password')}
                  </label>
                  <input 
                    type="password" 
                    required={isCreateMode}
                    placeholder={t('backoffice_users.password_placeholder')}
                    value={formData.password}
                    onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-zinc-300">{t('backoffice_users.account_status')}</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 appearance-none transition-all"
                  >
                    <option value="ACTIVE">{t('backoffice_users.status_active')}</option>
                    <option value="BANNED">{t('backoffice_users.banned_suspended')}</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-zinc-300">{t('backoffice_users.access_profile')}</label>
                  <select 
                    value={formData.role_names[0] || ''}
                    onChange={(e) => setFormData(p => ({ ...p, role_names: e.target.value ? [e.target.value] : [] }))}
                    className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 appearance-none transition-all"
                  >
                    <option value="">{t('backoffice_users.select_profile')}</option>
                    {roles.map((role: any) => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-zinc-500 mt-1">{t('backoffice_users.profile_help')}</p>
                </div>

                {/* Delete button only in edit mode */}
                {!isCreateMode && (
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    {!showDeleteConfirm ? (
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={16} />
                        {t('backoffice_users.delete_user')}
                      </button>
                    ) : (
                      <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg">
                        <p className="text-sm font-medium text-red-400 mb-1">{t('backoffice_users.delete_confirm')}</p>
                        <p className="text-xs text-red-400/80 mb-3">{t('backoffice_users.delete_confirm_desc')}</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-300 bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors"
                          >
                            {t('backoffice_users.btn_cancel')}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedUserId) {
                                deleteUser(selectedUserId, {
                                  onSuccess: () => {
                                    setSelectedUserId(null);
                                    setShowDeleteConfirm(false);
                                  }
                                });
                              }
                            }}
                            disabled={isDeleting}
                            className="flex-1 px-3 py-1.5 text-xs font-medium text-red-950 bg-red-500 hover:bg-red-400 rounded-md transition-colors disabled:opacity-50"
                          >
                            {isDeleting ? '...' : t('backoffice_users.btn_delete')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </form>
          )}
        </div>

        <div className="p-6 border-t border-zinc-800 bg-black/80 backdrop-blur-md">
          <button 
            type="submit"
            form="user-form"
            disabled={isUpdating || isCreating || (isLoadingDetail && !isCreateMode)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-100 text-black rounded-lg font-medium hover:bg-white transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {(isUpdating || isCreating) ? t('backoffice_users.btn_saving') : t('backoffice_users.btn_save')}
          </button>
        </div>
      </div>
    </Container>
  );
}
