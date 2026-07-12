import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/shared/stores/auth.store';
import Logo from "@/assets/images/logo2.png";
import AbstractBg from "@/assets/images/abstract-bg.jpg";

export default function VerifyUser() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const { verifyUser } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!uid || !token) {
      setStatus('error');
      setErrorMessage('Link de verificação inválido ou incompleto.');
      return;
    }

    let isMounted = true;

    const performVerification = async () => {
      try {
        await verifyUser({ uid, token });
        if (isMounted) {
          setStatus('success');
          // Opcional: Redirecionar após uns segundos
          setTimeout(() => navigate('/auth/signin'), 4000);
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage(err?.message || 'Não foi possível verificar a sua conta. O link pode ter expirado.');
        }
      }
    };

    performVerification();

    return () => {
      isMounted = false;
    };
  }, [uid, token, verifyUser, navigate]);

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
          <h2 className="text-4xl font-bold mb-4 tracking-tight">Verificação de Conta</h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Garantimos a segurança da nossa comunidade verificando a autenticidade de todos os nossos membros.
          </p>
        </div>
      </div>

      {/* Right Panel - Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 text-center">
          
          <div className="lg:hidden mb-12 flex justify-center">
            <Link to="/">
              <img src={Logo} alt="BidLive" className="h-8 object-contain" />
            </Link>
          </div>

          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-10 space-y-6">
              <Loader2 className="w-16 h-16 text-zinc-500 animate-spin" />
              <div>
                <h2 className="text-2xl font-bold mb-2">A verificar conta...</h2>
                <p className="text-zinc-400">Aguarde um momento, por favor.</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center animate-in zoom-in duration-500">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Conta Verificada!</h2>
              <p className="text-zinc-400 mb-8 leading-relaxed">
                A sua conta foi ativada com sucesso. Já tem acesso completo a todas as funcionalidades exclusivas da plataforma BidLive.
              </p>
              <Link 
                to="/auth/signin" 
                className="w-full inline-flex justify-center items-center gap-2 py-4 px-4 bg-white hover:bg-zinc-200 text-black rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
              >
                Prosseguir para o Login <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center animate-in zoom-in duration-500">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 text-red-400 mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <XCircle size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Falha na Verificação</h2>
              <p className="text-zinc-400 mb-8 leading-relaxed">
                {errorMessage}
              </p>
              <Link 
                to="/auth/signin" 
                className="w-full inline-flex justify-center items-center py-4 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Voltar para o Login
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
