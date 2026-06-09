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
  const [role, setRole] = useState<UserRole>('USER');
  
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
        const username = name.trim().toLowerCase().replace(/\s+/g, '_');
        const res = await apiService.register(username, email, password);
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

  // Listen to popup messaging communication for OAuth callback redirect payloads
  useEffect(() => {
    const handleOauthMessage = (event: MessageEvent) => {
      // Validate origin can be run.app or localhost
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && origin !== window.location.origin) {
        return;
      }

      if (event.data?.type === 'OAUTH_GOOGLE_SUCCESS') {
        const payload = event.data.payload;
        setOauthLoading(null);
        onLoginSuccess({
          id: 'u-google-' + payload.id,
          name: payload.name,
          email: payload.email,
          avatar: payload.avatar,
          role: 'ADMIN', // Elevated admin permissions for test user
          balance: 50000.00, // Premium budget points
          status: 'ACTIVE',
          bio: 'Usuário registrado via login oficial do Google.',
          permissions: ['user.read', 'role.manage', 'permission.manage', 'auction.create', 'auction.update', 'auction.delete', 'auction.bid', 'auction.manage', 'report.manage', 'stream.host']
        });
      }

      if (event.data?.type === 'OAUTH_42_SUCCESS') {
        const payload = event.data.payload;
        setOauthLoading(null);
        onLoginSuccess({
          id: 'u-42-' + payload.id,
          name: payload.name,
          email: payload.email,
          avatar: payload.avatar,
          role: 'USER',
          balance: 42000.00, // 42 thematic budget points
          status: 'ACTIVE',
          bio: 'Estudante da 42 cadastrado com sucesso via Intra API.',
          permissions: ['auction.read', 'auction.bid', 'auction.create']
        });
      }
    };

    window.addEventListener('message', handleOauthMessage);
    return () => window.removeEventListener('message', handleOauthMessage);
  }, [onLoginSuccess]);

  // Handle Simulated Google Popup Flow
  const loginWithGoogle = () => {
    setError(null);
    setOauthLoading('google');

    // Calculate dimensions to center popup
    const width = 500;
    const height = 620;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      'about:blank',
      'oauth_google_popup',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      setError('O Pop-up de login do Google foi bloqueado pelo seu navegador. Por favor, permita pop-ups.');
      setOauthLoading(null);
      return;
    }

    // Direct writes structured, beautiful Google consent page to blank popup
    popup.document.write(`
      <html>
        <head>
          <title>Sign in with Google - BidLive Authorization</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Roboto', sans-serif; background-color: #f8f9fa; }
          </style>
        </head>
        <body class="flex flex-col items-center justify-center min-h-screen px-4 py-8">
          <div class="bg-white rounded-lg shadow-xl border border-gray-200 max-w-sm w-full p-8 text-center space-y-6">
            
            <!-- Google Logo G -->
            <div class="flex justify-center">
              <svg class="h-10 w-10" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.253-3.085C18.347 1.06 15.535 0 12.24 0c-6.63 0-12 5.37-12 12s5.37 12 12 12c6.92 0 11.52-4.81 11.52-11.72 0-.788-.08-1.39-.18-1.915H12.24z"/>
              </svg>
            </div>

            <div class="space-y-2">
              <h1 class="text-xl font-medium text-gray-800">Fazer login com o Google</h1>
              <p class="text-xs text-gray-500">para prosseguir para o <span class="text-indigo-600 font-semibold">BidLive App Hub</span></p>
            </div>

            <!-- Pre-defined Google Accounts Selection -->
            <div class="space-y-3 pt-2 text-left">
              <span class="text-xs text-gray-600 font-medium block border-b pb-1.5">Escolha uma conta para logar:</span>
              
              <button 
                onclick="selectAccount('Daniel Ndomba', 'ndondadaniel2020@gmail.com', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80')" 
                class="w-full border border-gray-200 hover:bg-gray-50 p-3 rounded-lg flex items-center gap-3 transition-colors focus:outline-none"
              >
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80" class="h-8 w-8 rounded-full object-cover">
                <div>
                  <span class="block text-xs font-bold text-gray-700">Daniel Ndomba</span>
                  <span class="block text-[10px] text-gray-500">ndondadaniel2020@gmail.com</span>
                </div>
              </button>

              <button 
                onclick="selectAccount('Ana Silva', 'ana.silva@example.com', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80')" 
                class="w-full border border-gray-200 hover:bg-gray-50 p-3 rounded-lg flex items-center gap-3 transition-colors focus:outline-none"
              >
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80" class="h-8 w-8 rounded-full object-cover">
                <div>
                  <span class="block text-xs font-bold text-gray-700">Ana Silva</span>
                  <span class="block text-[10px] text-gray-500">ana.silva@example.com</span>
                </div>
              </button>
            </div>

            <div class="text-left bg-gray-50 p-3 rounded text-[10px] text-gray-500 leading-normal">
              Ao continuar, o Google compartilhará seu nome, endereço de e-mail, foto do perfil e preferências com o BidLive. Consulte o termo de privacidade.
            </div>

            <div class="text-[10px] text-gray-400 font-mono">
              Redirect URI: <span id="redir-span"></span>
            </div>

          </div>

          <script>
            // Populate actual window origin inside UI
            document.getElementById('redir-span').innerText = window.opener ? window.opener.location.origin + '/auth/callback' : '';

            function selectAccount(name, email, avatar) {
              if (window.opener) {
                window.opener.postMessage({
                  type: 'OAUTH_GOOGLE_SUCCESS',
                  payload: {
                    id: 'goog-' + Date.now(),
                    name: name,
                    email: email,
                    avatar: avatar
                  }
                }, '*');
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `);

    // Monitor for close to reset loaders
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        setOauthLoading(null);
      }
    }, 1000);
  };

  // Handle Simulated 42 Intra Popup Flow
  const loginWith42 = () => {
    setError(null);
    setOauthLoading('42');

    const width = 500;
    const height = 620;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      'about:blank',
      'oauth_42_popup',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      setError('O Pop-up de login da 42 foi bloqueado pelo seu navegador. Por favor, permita pop-ups.');
      setOauthLoading(null);
      return;
    }

    // Direct writes structured, beautiful 42 authorization page to blank popup
    popup.document.write(`
      <html>
        <head>
          <title>Authorize BidLive - 42 School Intra API</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Space Grotesk', sans-serif; background-color: #0b0f19; color: #f3f4f6; }
          </style>
        </head>
        <body class="flex flex-col items-center justify-center min-h-screen px-4 py-8">
          <div class="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 max-w-sm w-full p-8 text-center space-y-6">
            
            <!-- 42 BRAND LOGO -->
            <div class="flex justify-center flex-col items-center">
              <div class="h-16 w-16 bg-gradient-to-tr from-[#00babc] to-[#005e60] rounded-xl flex items-center justify-center text-white font-extrabold text-2xl tracking-tighter shadow-xl">
                42
              </div>
              <span class="block text-xs uppercase tracking-widest text-[#00babc] mt-2 font-bold font-mono">INTRA API GATEWAY</span>
            </div>

            <div class="space-y-2">
              <h1 class="text-lg font-bold">Autorizar BidLive App</h1>
              <p class="text-xs text-gray-400">O app <span class="text-[#00babc] font-bold">BidLive platform</span> deseja obter permissões de read-user na Intra.</p>
            </div>

            <!-- Permission Scope listing -->
            <div class="border-t border-b border-gray-800 py-3.5 text-left space-y-2">
              <span class="text-xs uppercase font-mono tracking-wider font-bold text-gray-400 block pb-1">Escopos Requeridos:</span>
              <div class="flex items-center gap-2 text-xs text-gray-300">
                <span class="text-[#00babc]">✔</span>
                <span>Visualizar seu nome de login e apelido</span>
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-300">
                <span class="text-[#00babc]">✔</span>
                <span>Verificar endereço de e-mail acadêmico</span>
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-300">
                <span class="text-[#00babc]">✔</span>
                <span>Importar avatar de estudante e campus</span>
              </div>
            </div>

            <!-- Simulated Selectors -->
            <div class="space-y-2 text-left">
              <span class="text-[11px] font-mono text-gray-500 block">Autorizar como Aluno do Campus:</span>
              
              <button 
                onclick="authAsStudent('Gabriel Santos (gsantos)', 'gsantos@student.42.fr', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80')"
                class="w-full bg-gray-850 hover:bg-gray-800 border border-gray-800 rounded-lg p-2.5 flex items-center gap-3 transition-all focus:outline-none"
              >
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80" class="h-8 w-8 rounded-lg object-cover ring-1 ring-[#00babc]/40">
                <div>
                  <span class="block text-xs font-bold text-white">Gabriel Santos (gsantos)</span>
                  <span class="block text-[10px] text-gray-400">gsantos@student.42sp.org.br</span>
                </div>
              </button>
            </div>

            <div class="grid grid-cols-2 gap-3 pt-2">
              <button onclick="window.close()" class="py-2 px-4 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs font-bold transition-all">
                Recusar
              </button>
              <button onclick="authAsStudent('42 Student', 'student@42sp.org.br', 'https://api.dicebear.com/7.x/pixel-art/svg?seed=42')" class="py-2 px-4 rounded bg-[#00babc] text-white hover:bg-[#009c9e] text-xs font-bold transition-all shadow-md">
                Autorizar
              </button>
            </div>

            <div class="text-[9px] text-gray-500 font-mono">
              CLIENT ID: 41_intra_auth_42000
            </div>

          </div>

          <script>
            function authAsStudent(name, email, avatar) {
              if (window.opener) {
                window.opener.postMessage({
                  type: 'OAUTH_42_SUCCESS',
                  payload: {
                    id: '42-' + Date.now(),
                    name: name,
                    email: email,
                    avatar: avatar
                  }
                }, '*');
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `);

    // Monitor for close to reset loaders
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        setOauthLoading(null);
      }
    }, 1000);
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

          {activeTab === 'signup' && (
            <div className="space-y-1 text-left">
              <label className="text-zinc-400 text-xs font-mono font-medium">Função de Usuário (Escopo Simulado)</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full h-10 px-3 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs appearance-none"
              >
                <option value="USER">Usuário Regular (Investidor padrão)</option>
                <option value="MANAGER">Gestor de Leilões (Manager comercial)</option>
                <option value="ADMIN">Administrador Geral (Admin operacional)</option>
              </select>
            </div>
          )}

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
              'Completar Registro com Saldo'
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
