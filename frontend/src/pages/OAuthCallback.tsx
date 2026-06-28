import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { apiService } from '../services/api';
import { User } from '../types';

interface OAuthCallbackProps {
  provider: 'google' | '42';
  onLoginSuccess: (user: User) => void;
}

export default function OAuthCallback({ provider, onLoginSuccess }: OAuthCallbackProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      if (!code) {
        setError('Código de autorização ausente.');
        return;
      }

      try {
        const redirectUri = window.location.origin + `/auth/${provider}/callback`;
        let res;

        if (provider === '42') {
          if (!state) {
            setError('State ausente na resposta da 42.');
            return;
          }
          res = await apiService.handleOAuthCallback('/auth/42/callback/', {
            code,
            state,
            redirect_uri: redirectUri
          });
        } else {
          // Google
          res = await apiService.handleOAuthCallback('/auth/google/callback/', {
            code,
            redirect_uri: redirectUri
          });
        }

        if (res.success && res.user) {
          onLoginSuccess(res.user);
        } else {
          setError(res.message || 'Falha ao autenticar via provedor social.');
        }
      } catch (err: any) {
        setError(err.message || 'Erro de comunicação com o servidor.');
      }
    };

    processCallback();
  }, [provider, onLoginSuccess]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-16 text-zinc-300">
      <div className="flex flex-col items-center justify-center p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl max-w-sm w-full">
        {error ? (
          <div className="text-center space-y-4">
            <h2 className="text-red-400 font-bold text-lg">Falha na Autenticação</h2>
            <p className="text-zinc-400 text-sm">{error}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-sm transition-colors w-full"
            >
              Voltar ao Início
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-sky-500 mx-auto" />
            <h2 className="text-zinc-200 font-medium">Autenticando com {provider === '42' ? '42' : 'Google'}...</h2>
            <p className="text-zinc-500 text-xs">Por favor, aguarde enquanto validamos suas credenciais.</p>
          </div>
        )}
      </div>
    </div>
  );
}
