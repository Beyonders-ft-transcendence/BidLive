/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Gavel, Sparkles, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { User, UserRole } from '../types';
import { apiService } from '../services/api';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | '42' | null>(null);
  const [allowOfflineFallback, setAllowOfflineFallback] = useState(false);

  // Traditional Sign In / Up Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAllowOfflineFallback(false);

    if (!email || !password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (activeTab === 'signup' && !name) {
      setError('Por favor, preencha o seu nome para cadastro.');
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === 'signin') {
        const res = await apiService.login(email, password);
        setIsLoading(false);
        if (res.success && res.user) {
          onLoginSuccess(res.user);
        } else {
          setError(res.message || 'Falha na autenticação.');
          if (res.message?.includes('Impossível conectar') || res.message?.includes('Connection') || res.message?.includes('cors')) {
            setAllowOfflineFallback(true);
          }
        }
      } else {
        // Sign Up Flow
        const username = email.split('@')[0];
        const res = await apiService.register(username, email, password, name);
        if (res.success) {
          // Auto-login after register
          const loginRes = await apiService.login(email, password);
          setIsLoading(false);
          if (loginRes.success && loginRes.user) {
            onLoginSuccess(loginRes.user);
          } else {
            setActiveTab('signin');
            setError('Cadastro concluído! Por favor faça o login com suas credenciais.');
          }
        } else {
          setIsLoading(false);
          setError(res.message || 'Erro ao registrar usuário.');
          if (res.message?.includes('Impossível conectar') || res.message?.includes('Connection') || res.message?.includes('cors')) {
            setAllowOfflineFallback(true);
          }
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(`Erro inesperado: ${err.message || err}`);
      setAllowOfflineFallback(true);
    }
  };

  const handleOfflineLogin = () => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      let loggedUser: User;
      if (email.toLowerCase() === 'ndondadaniel2020@gmail.com') {
        loggedUser = {
          id: 'u-current',
          name: 'Daniel Ndomba (Offline)',
          email: 'ndondadaniel2020@gmail.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
          role: 'ADMIN',
          balance: 24500.00,
          status: 'ACTIVE',
          bio: 'Colecionador entusiasta de demonstração (Modo Offline integrado).',
          permissions: ['user.read', 'role.manage', 'permission.manage', 'auction.create', 'auction.update', 'auction.delete', 'auction.bid', 'auction.manage', 'report.manage', 'stream.host']
        };
      } else {
        loggedUser = {
          id: `u-logged-offline-${Date.now()}`,
          name: email.split('@')[0].toUpperCase() + ' (Offline)',
          email: email,
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${email}`,
          role: 'USER',
          balance: 5000.00,
          status: 'ACTIVE',
          bio: 'Investidor na demonstração BidLive offline.',
          permissions: ['auction.read', 'auction.bid', 'auction.create']
        };
      }
      onLoginSuccess(loggedUser);
    }, 600);
  };

  // Handle Real Google OAuth Flow
  const loginWithGoogle = () => {
    setError(null);
    setOauthLoading('google');
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Google Client ID não configurado no ambiente do Frontend. (VITE_GOOGLE_CLIENT_ID ausente)');
      setOauthLoading(null);
      return;
    }
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/google/callback`);
    const scopes = encodeURIComponent('email profile');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}`;
    window.location.href = authUrl;
  };

  // Handle Real 42 OAuth Flow
  const loginWith42 = async () => {
    setError(null);
    setOauthLoading('42');
    const res = await apiService.get42AuthorizationUrl();
    if (res.success && res.authorization_url) {
      window.location.href = res.authorization_url;
    } else {
      setError(res.message || 'Não foi possível iniciar o login com 42.');
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-16 text-zinc-300 relative">
      <div className="absolute inset-0 bg-radial-at-t from-sky-500/10 via-transparent to-transparent opacity-80 pointer-events-none" />

      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white">
          <Gavel className="h-4 w-4" />
        </div>
        <span className="font-sans font-bold text-base text-white tracking-tight">BidLive</span>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-zinc-950 border border-zinc-900 p-8 rounded-2xl shadow-2xl space-y-6 relative z-10"
      >
        {/* Animated Sparkles Label */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300">
            <Sparkles className="h-3 w-3 text-sky-400" />
            Vendas e Lances em Milissegundos
          </span>
          <h2 className="text-white text-2xl font-bold tracking-tight">Acesse o Portal BidLive</h2>
          <p className="text-zinc-500 text-xs">Entre na rede descentralizada de leilões ao vivo, streams em tempo real e de faturamento auditado.</p>
        </div>

        {/* Navigation Tab Hooks between SignIn or Registrar Tab */}
        <div className="flex bg-zinc-900/50 p-1 rounded-lg border border-zinc-900">
          <button
            onClick={() => { setActiveTab('signin'); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
              activeTab === 'signin' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => { setActiveTab('signup'); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
              activeTab === 'signup' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Registrar-se
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/45 border border-red-900/35 rounded-lg text-red-400 text-xs flex flex-col gap-2 text-left">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            {allowOfflineFallback && (
              <button
                type="button"
                onClick={handleOfflineLogin}
                className="mt-1 w-full py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono font-bold rounded text-[10px] border border-zinc-800 transition-colors uppercase tracking-wider text-center cursor-pointer"
              >
                Prosseguir em Modo Offline (Demonstração)
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {activeTab === 'signup' && (
            <div className="space-y-1 text-left">
              <label className="text-zinc-400 text-xs font-mono font-medium">Nome Completo</label>
              <input
                type="text"
                placeholder="Ex. Gabriel Santos"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
              />
            </div>
          )}

          <div className="space-y-1 text-left">
            <label className="text-zinc-400 text-xs font-mono font-medium">Endereço de E-mail</label>
            <input
              type="email"
              placeholder="Ex. c.oliveira@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-zinc-400 text-xs font-mono font-medium">Palavra-passe (Senha)</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 pl-3 pr-10 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-zinc-500 hover:text-zinc-300 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || oauthLoading !== null}
            className="w-full h-10 bg-sky-600 hover:bg-sky-500 font-bold text-white text-xs rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Processando...
              </>
            ) : activeTab === 'signin' ? (
              'Acessar Minha Conta'
            ) : (
              'Completar Registro'
            )}
          </button>

        </form>

        {/* Horizontal separator line */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-zinc-900" />
          <span className="text-[10px] font-mono font-bold text-zinc-650 uppercase tracking-widest text-zinc-700">ou prossiga via API</span>
          <div className="flex-1 h-px bg-zinc-900" />
        </div>

        {/* OAuth brand login triggers wrapper grid */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Google SSO Login */}
          <button
            onClick={loginWithGoogle}
            disabled={isLoading || oauthLoading !== null}
            className="h-10 border border-zinc-800 bg-zinc-950 hover:bg-zinc-900/50 rounded-lg text-xs font-bold text-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
            id="btn-oauth-google"
          >
            {oauthLoading === 'google' ? (
              <Loader2 className="h-4 w-4 animate-spin text-sky-450" />
            ) : (
              <>
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.253-3.085C18.347 1.06 15.535 0 12.24 0c-6.63 0-12 5.37-12 12s5.37 12 12 12c6.92 0 11.52-4.81 11.52-11.72 0-.788-.08-1.39-.18-1.915H12.24z"/>
                </svg>
                Google
              </>
            )}
          </button>

          {/* 42 Coding School Portal Login */}
          <button
            onClick={loginWith42}
            disabled={isLoading || oauthLoading !== null}
            className="h-10 border border-[#00babc]/25 bg-zinc-950 hover:bg-[#00babc]/10 rounded-lg text-xs font-bold text-[#00babc] transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
            id="btn-oauth-42"
          >
            {oauthLoading === '42' ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#00babc]" />
            ) : (
              <>
                <div className="h-4 w-4 bg-[#00babc] rounded flex items-center justify-center text-white text-[9px] font-extrabold tracking-tighter">
                  42
                </div>
                Portal 42
              </>
            )}
          </button>

        </div>

        {/* Informative text info */}
        <p className="text-[10px] text-zinc-600 font-mono text-center leading-normal">
          Dica: Use <span className="text-zinc-400">ndondadaniel2020@gmail.com</span> para carregar instantaneamente o perfil oficial com relógios e privilégios ADMIN correntes ou utilize o Google/Portal 42 para SSO real.
        </p>

      </motion.div>
    </div>
  );
}
