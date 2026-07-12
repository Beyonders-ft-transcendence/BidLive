import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/shared/stores/auth.store';
import { resetPasswordSchema, type ResetPasswordInput } from '@/shared/schema/auth.schema';
import Logo from "@/assets/images/logo2.png";
import AbstractBg from "@/assets/images/abstract-bg.jpg";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const { resetPassword, isLoading, error, clearError } = useAuthStore();
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Se não existirem os tokens na URL, mostramos um erro genérico imediatamente
  if (!uid || !token) {
    return (
      <div className="min-h-screen bg-black flex text-zinc-100 items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-4 text-red-400">Link Inválido</h2>
          <p className="text-zinc-400 mb-6">
            O link de recuperação de senha está incompleto ou inválido. Por favor, solicite um novo link.
          </p>
          <Link 
            to="/auth/forgot-password" 
            className="w-full inline-flex justify-center items-center py-3 px-4 bg-white hover:bg-zinc-200 text-black rounded-lg text-sm font-bold transition-all"
          >
            Solicitar Novo Link
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordInput) => {
    clearError();
    try {
      await resetPassword({
        uid,
        token,
        new_password: data.new_password,
        new_password_confirm: data.new_password_confirm
      });
      setSuccess(true);
      // Opcional: Redirecionar após uns segundos
      setTimeout(() => navigate('/auth/signin'), 4000);
    } catch (err) {
      // O erro já é tratado e guardado na store (zustand)
    }
  };

  return (
    <div className="min-h-screen bg-black flex text-zinc-100">
      {/* Left Panel - Image/Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0">
          <img src={AbstractBg} alt="Background" className="w-full h-full object-cover opacity-40 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>
        
        <div className="relative z-10">
          <Link to="/" className="inline-block transition-transform hover:scale-105">
            <img src={Logo} alt="BidLive" className="h-8 object-contain" />
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-bold mb-4 tracking-tight">Nova Senha</h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Crie uma nova senha forte e memorável para proteger a sua conta e voltar a ter acesso a todos os recursos exclusivos da BidLive.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="mb-10 text-center lg:text-left">
            <div className="lg:hidden mb-8 flex justify-center">
              <Link to="/">
                <img src={Logo} alt="BidLive" className="h-8 object-contain" />
              </Link>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Redefinir Senha</h1>
            <p className="text-zinc-400">
              {success ? 'Senha alterada com sucesso.' : 'Escolha a sua nova senha de acesso.'}
            </p>
          </div>

          {success ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center animate-in zoom-in duration-500">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-lg font-medium text-emerald-400 mb-2">Senha Atualizada!</h3>
              <p className="text-zinc-400 text-sm mb-6">
                A sua senha foi alterada com sucesso. Já pode aceder à sua conta com as novas credenciais.
              </p>
              <Link 
                to="/auth/signin" 
                className="w-full inline-flex justify-center items-center py-3 px-4 bg-white hover:bg-zinc-200 text-black rounded-lg text-sm font-bold transition-all hover:scale-[1.02]"
              >
                Fazer Login Agora
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="new_password">
                  Nova Senha
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-white transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    id="new_password"
                    type="password"
                    {...register("new_password")}
                    className={`w-full bg-zinc-900 border ${errors.new_password ? 'border-red-500' : 'border-zinc-800'} text-white rounded-lg py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all placeholder:text-zinc-600`}
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
                {errors.new_password && <p className="mt-2 text-sm text-red-400">{errors.new_password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="new_password_confirm">
                  Confirmar Nova Senha
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-white transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    id="new_password_confirm"
                    type="password"
                    {...register("new_password_confirm")}
                    className={`w-full bg-zinc-900 border ${errors.new_password_confirm ? 'border-red-500' : 'border-zinc-800'} text-white rounded-lg py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all placeholder:text-zinc-600`}
                    placeholder="Repita a senha"
                  />
                </div>
                {errors.new_password_confirm && <p className="mt-2 text-sm text-red-400">{errors.new_password_confirm.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3.5 px-4 bg-white text-black hover:bg-zinc-200 rounded-lg text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] mt-2 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Guardar Nova Senha'
                )}
              </button>
            </form>
          )}

          <div className="mt-8 text-center text-sm text-zinc-500">
            Lembrou-se da senha antiga?{' '}
            <Link to="/auth/signin" className="text-white hover:underline font-medium inline-flex items-center gap-1 transition-colors">
              <ArrowLeft size={14} /> Cancelar
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
