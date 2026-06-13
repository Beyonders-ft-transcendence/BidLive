/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Gavel, Loader2, XCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface VerifyUserProps {
  onBackToLogin: () => void;
}

type VerificationState = 'loading' | 'success' | 'error';

export default function VerifyUser({ onBackToLogin }: VerifyUserProps) {
  const [state, setState] = useState<VerificationState>('loading');
  const [message, setMessage] = useState('Verificando sua conta...');

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      const params = new URLSearchParams(window.location.search);
      const uid = params.get('uid');
      const token = params.get('token');

      if (!uid || !token) {
        setState('error');
        setMessage('Link de verificação incompleto.');
        return;
      }

      const res = await apiService.verifyUser(uid, token);
      if (cancelled) return;

      setState(res.success ? 'success' : 'error');
      setMessage(res.message || (res.success ? 'E-mail verificado com sucesso.' : 'Link de verificação inválido ou expirado.'));
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, []);

  const Icon = state === 'loading' ? Loader2 : state === 'success' ? CheckCircle2 : XCircle;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex items-center justify-center px-4">
      <section className="w-full max-w-md border border-zinc-800 bg-zinc-900/70 rounded-xl p-8 text-center shadow-2xl shadow-black/30">
        <div className="mx-auto mb-6 h-12 w-12 rounded-xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center">
          <Gavel className="h-6 w-6 text-sky-300" />
        </div>

        <div
          className={`mx-auto mb-5 h-14 w-14 rounded-full flex items-center justify-center ${
            state === 'success'
              ? 'bg-emerald-500/10 text-emerald-300'
              : state === 'error'
                ? 'bg-rose-500/10 text-rose-300'
                : 'bg-zinc-800 text-zinc-300'
          }`}
        >
          <Icon className={`h-7 w-7 ${state === 'loading' ? 'animate-spin' : ''}`} />
        </div>

        <h1 className="text-xl font-bold text-white mb-2">
          {state === 'success' ? 'Conta verificada' : state === 'error' ? 'Verificação falhou' : 'Verificação de e-mail'}
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed mb-6">{message}</p>

        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full h-11 rounded-lg bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 transition-colors disabled:opacity-60"
          disabled={state === 'loading'}
        >
          Ir para login
        </button>
      </section>
    </div>
  );
}
