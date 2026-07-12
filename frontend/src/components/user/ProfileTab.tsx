import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldAlert, Save, KeyRound, Loader2, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/shared/stores/auth.store';
import { changePasswordSchema, type ChangePasswordInput } from '@/shared/schema/auth.schema';
import Avatar from '@/components/common/Avatar';

export default function ProfileTab() {
  const { user, changePassword, isLoading } = useAuthStore();
  
  // States for tabs (Personal Info vs Security)
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form for Security
  const { 
    register: registerSecurity, 
    handleSubmit: handleSecuritySubmit, 
    reset: resetSecurity,
    formState: { errors: securityErrors } 
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSecuritySubmit = async (data: ChangePasswordInput) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await changePassword(data);
      setSuccessMsg('Senha alterada com sucesso!');
      resetSecurity();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao alterar a senha.');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UserIcon className="text-primary" /> Meu Perfil
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie suas informações pessoais e configurações de segurança.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => { setActiveTab('info'); setSuccessMsg(null); setErrorMsg(null); }}
          className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'info' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Informações Pessoais
        </button>
        <button
          onClick={() => { setActiveTab('security'); setSuccessMsg(null); setErrorMsg(null); }}
          className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'security' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <KeyRound size={16} /> Segurança
        </button>
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        
        {successMsg && (
          <div className="mb-6 p-4 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium flex items-center gap-2">
            <ShieldAlert size={16} /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2">
            <ShieldAlert size={16} /> {errorMsg}
          </div>
        )}

        {activeTab === 'info' && (
          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <div className="relative group cursor-pointer">
                <Avatar name={user.full_name || user.username} src={user.avatar_url} size="xl" />
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                  Alterar
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold">{user.full_name || user.username}</h3>
                <p className="text-muted-foreground text-sm">{user.email}</p>
                <div className="mt-2 inline-block px-2 py-1 bg-primary/10 text-primary text-[10px] uppercase font-bold rounded">
                  Status: {user.status}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                <input 
                  type="text" 
                  defaultValue={user.full_name} 
                  disabled
                  className="w-full bg-muted/30 border border-border rounded-md px-4 py-2 text-foreground disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Username</label>
                <input 
                  type="text" 
                  defaultValue={user.username} 
                  disabled
                  className="w-full bg-muted/30 border border-border rounded-md px-4 py-2 text-foreground disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <input 
                  type="email" 
                  defaultValue={user.email} 
                  disabled
                  className="w-full bg-muted/30 border border-border rounded-md px-4 py-2 text-foreground disabled:opacity-70 disabled:cursor-not-allowed"
                />
                <p className="text-[10px] text-muted-foreground mt-1">O email não pode ser alterado por motivos de segurança.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <button disabled className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-md opacity-50 cursor-not-allowed flex items-center gap-2">
                <Save size={16} /> Guardar Alterações
              </button>
            </div>
            <p className="text-xs text-muted-foreground text-right mt-2">
              A edição de dados pessoais será ativada em breve.
            </p>
          </div>
        )}

        {activeTab === 'security' && (
          <form onSubmit={handleSecuritySubmit(onSecuritySubmit)} className="space-y-6 max-w-lg">
            <div className="space-y-4">
              
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Senha Atual</label>
                <input 
                  type="password" 
                  {...registerSecurity('current_password')}
                  className={`w-full bg-background border ${securityErrors.current_password ? 'border-destructive' : 'border-border'} rounded-md px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all`}
                  placeholder="Insira a sua senha atual"
                />
                {securityErrors.current_password && <span className="text-xs text-destructive mt-1 block">{securityErrors.current_password.message}</span>}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Nova Senha</label>
                <input 
                  type="password" 
                  {...registerSecurity('new_password')}
                  className={`w-full bg-background border ${securityErrors.new_password ? 'border-destructive' : 'border-border'} rounded-md px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all`}
                  placeholder="Mínimo 8 caracteres"
                />
                {securityErrors.new_password && <span className="text-xs text-destructive mt-1 block">{securityErrors.new_password.message}</span>}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Confirmar Nova Senha</label>
                <input 
                  type="password" 
                  {...registerSecurity('new_password_confirm')}
                  className={`w-full bg-background border ${securityErrors.new_password_confirm ? 'border-destructive' : 'border-border'} rounded-md px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all`}
                  placeholder="Repita a nova senha"
                />
                {securityErrors.new_password_confirm && <span className="text-xs text-destructive mt-1 block">{securityErrors.new_password_confirm.message}</span>}
              </div>

            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <button 
                type="submit" 
                disabled={isLoading}
                className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-md transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                {isLoading ? 'A guardar...' : 'Atualizar Senha'}
              </button>
            </div>
          </form>
        )}
        
      </div>
    </div>
  );
}
