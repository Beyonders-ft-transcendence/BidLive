import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/shared/stores/auth.store';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/shared/schema/auth.schema';
import Logo from "@/assets/images/logo2.png";

export default function ForgotPassword() {
  useDocumentTitle("Recuperar Senha");

  const { forgotPassword, isLoading, error, clearError } = useAuthStore();
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    clearError();
    try {
      await forgotPassword(data);
      setSuccess(true);
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen bg-black flex text-zinc-100">
      {/* Left Panel - Image/Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="w-[400px] h-[400px] bg-primary/20 blur-[100px] absolute -top-20 -left-20 rounded-full mix-blend-screen pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10">
          <Link to="/" className="inline-block transition-transform hover:scale-105">
            <img src={Logo} alt="BidLive" className="h-8 object-contain" />
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-bold mb-4 tracking-tight">Recuperar o Acesso</h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Esqueceu a sua senha? Não se preocupe. Introduza o seu e-mail e enviaremos um link de recuperação para que volte a aceder à plataforma com total segurança.
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
            <h1 className="text-3xl font-bold tracking-tight mb-2">Esqueceu a senha?</h1>
            <p className="text-zinc-400">
              {success ? 'Verifique a sua caixa de entrada.' : 'Insira o seu e-mail para receber as instruções de redefinição.'}
            </p>
          </div>

          {success ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center animate-in zoom-in duration-500">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-lg font-medium text-emerald-400 mb-2">E-mail enviado!</h3>
              <p className="text-zinc-400 text-sm mb-6">
                Se o e-mail estiver associado a uma conta, receberá um link para redefinir a sua senha em poucos minutos.
              </p>
              <Link 
                to="/auth/signin" 
                className="w-full inline-flex justify-center items-center py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm font-medium transition-colors border border-zinc-800"
              >
                Voltar para o Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="email">
                  Endereço de E-mail
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-white transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    className={`w-full bg-zinc-900 border ${errors.email ? 'border-red-500' : 'border-zinc-800'} text-white rounded-lg py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all placeholder:text-zinc-600`}
                    placeholder="o.seu@email.com"
                  />
                </div>
                {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3.5 px-4 bg-white text-black hover:bg-zinc-200 rounded-lg text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Enviar Link de Recuperação'
                )}
              </button>
            </form>
          )}

          <div className="mt-8 text-center text-sm text-zinc-500">
            Lembrou-se da senha?{' '}
            <Link to="/auth/signin" className="text-white hover:underline font-medium inline-flex items-center gap-1 transition-colors">
              <ArrowLeft size={14} /> Voltar ao Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
