/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Mail, KeyRound, Award, PiggyBank, PlusCircle, Check, LogOut } from 'lucide-react';
import { User } from '../types';

interface ProfileProps {
  currentUser: User;
  onUpdateProfile: (name: string, bio: string, avatar: string) => void;
  onAddFunds: (amount: number) => void;
  onLogout: () => void;
}

export default function Profile({ currentUser, onUpdateProfile, onAddFunds, onLogout }: ProfileProps) {
  const [nameInput, setNameInput] = useState(currentUser.name);
  const [bioInput, setBioInput] = useState(currentUser.bio);
  const [avatarInput, setAvatarInput] = useState(currentUser.avatar);

  const [savingMsg, setSavingMsg] = useState(false);
  const [fundSuccess, setFundSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(nameInput, bioInput, avatarInput);
    setSavingMsg(true);
    setTimeout(() => setSavingMsg(false), 2500);
  };

  const rechargeWallet = (amount: number) => {
    onAddFunds(amount);
    setFundSuccess(true);
    setTimeout(() => setFundSuccess(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      
      {/* Page headers */}
      <div>
        <h1 className="text-white text-2xl font-bold tracking-tight font-sans">Configurações do Perfil</h1>
        <p className="text-zinc-500 text-xs mt-0.5">Editar informações cadastrais do investidor, carregar fundos adicionais e revisar permissões RBAC.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left column: Quick visual specs, wallet card (1 col) */}
        <div className="space-y-6 md:col-span-1">
          
          {/* Avatar frame */}
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950 text-center space-y-4">
            <div className="relative inline-block">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="h-24 w-24 rounded-2xl object-cover ring-2 ring-zinc-800 mx-auto"
              />
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 border-2 border-zinc-950 text-[9px]" title="Usuário Ativo" />
            </div>

            <div>
              <h2 className="text-white text-base font-bold leading-snug">{currentUser.name}</h2>
              <span className="inline-block text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest mt-1">
                {currentUser.role}
              </span>
            </div>
          </div>

          {/* Real-time wallet simulation */}
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-4">
            <h3 className="text-zinc-300 font-sans font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-2.5">
              <PiggyBank className="h-4.5 w-4.5 text-emerald-400" />
              Carteira Digital
            </h3>

            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 font-mono font-medium block">Saldo Disponível:</span>
              <span className="text-2xl font-mono font-bold text-emerald-400 block leading-tight">
                R$ {currentUser.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Quick funding recharge triggers */}
            <div className="space-y-2 pt-2.5">
              <span className="text-[9px] text-zinc-500 font-mono block">Simular depósito adicional (Crédito instantâneo):</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => rechargeWallet(5000)}
                  className="py-1.5 text-[11px] font-mono font-bold bg-zinc-900 text-emerald-400 border border-zinc-800 rounded hover:border-zinc-700 transition-colors"
                >
                  + R$ 5.000
                </button>
                <button
                  onClick={() => rechargeWallet(10000)}
                  className="py-1.5 text-[11px] font-mono font-bold bg-zinc-900 text-emerald-400 border border-zinc-800 rounded hover:border-zinc-700 transition-colors"
                >
                  + R$ 10.000
                </button>
              </div>
              {fundSuccess && (
                <span className="block text-[10px] text-emerald-400 text-center font-semibold mt-1">
                  Depósito creditado! 🎉
                </span>
              )}
            </div>
          </div>

          {/* Sign out section */}
          <div className="p-5 rounded-xl border border-red-950/40 bg-red-950/5/65 text-center space-y-3.5 bg-red-950/5">
            <div className="space-y-1">
              <span className="block text-red-400 text-xs font-bold font-sans">Desconectar Sessão</span>
              <span className="block text-[10px] text-zinc-550 leading-normal text-zinc-500">Sua chave JWT de login expira em 24h ou imediatamente ao sair.</span>
            </div>
            <button
              onClick={onLogout}
              className="w-full py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-900/35 text-red-400 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              id="btn-profile-logout"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sair desta Conta
            </button>
          </div>

        </div>

        {/* Right column: Edit forms (2 cols) */}
        <div className="space-y-6 md:col-span-2">
          
          <div className="bg-zinc-950 border border-zinc-800/85 p-6 rounded-xl">
            
            <form onSubmit={handleSave} className="space-y-5">
              <h3 className="text-zinc-200 font-sans font-bold text-sm border-b border-zinc-900 pb-3">Informações de Contato & Bio</h3>

              {savingMsg && (
                <div className="p-3 text-xs text-emerald-400 rounded-lg bg-emerald-950/40 border border-emerald-900/35 flex items-center gap-1.5">
                  <Check className="h-4 w-4" />
                  Perfil atualizado com sucesso no banco de dados local.
                </div>
              )}

              {/* Edit forms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1.5 text-left">
                  <label className="text-zinc-500 text-xs font-mono font-bold block">Nome do Participante</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
                    id="profile-name-input"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-zinc-500 text-xs font-mono font-bold block">E-mail Cadastrado</label>
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full h-10 px-3 bg-zinc-900/50 border border-zinc-800/50 text-zinc-500 rounded-lg focus:outline-none text-xs cursor-not-allowed"
                  />
                  <span className="block text-[10px] text-zinc-600 font-mono">Modificações de email exigem KYC formal.</span>
                </div>

              </div>

              {/* Avatar URL input */}
              <div className="space-y-1.5 text-left">
                <label className="text-zinc-500 text-xs font-mono font-bold block font-sans">Avatar Image URL</label>
                <input
                  type="text"
                  value={avatarInput}
                  onChange={(e) => setAvatarInput(e.target.value)}
                  className="w-full h-10 px-3 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs font-mono"
                  id="profile-avatar-input"
                />
              </div>

              {/* Biography text block */}
              <div className="space-y-1.5 text-left">
                <label className="text-zinc-500 text-xs font-mono font-bold block">Biografia / Apresentação Pública</label>
                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs leading-relaxed"
                  id="profile-bio-input"
                />
              </div>

              <div className="pt-2 border-t border-zinc-900 text-right">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 font-bold text-white text-xs rounded-lg transition-all shadow-md"
                  id="btn-profile-submit"
                >
                  Salvar Informações
                </button>
              </div>

            </form>

          </div>

          {/* RBAC Privilege checklist block view */}
          <div className="bg-zinc-950 border border-zinc-805 p-6 rounded-xl space-y-4 border-zinc-800">
            <h3 className="text-zinc-300 font-sans font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-zinc-900">
              <ShieldCheck className="h-4.5 w-4.5 text-indigo-400" />
              Relação de Permissões (RBAC) do Seu Usuário
            </h3>
            
            <p className="text-[11px] text-zinc-500 leading-normal">
              Sua role herda as chaves de autorização cadastradas na inicialização do backend. Estas permissões controlam o acesso a views especiais e o lançamento de lances.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {currentUser.permissions.map(perm => (
                <span
                  key={perm}
                  className="px-2 py-1.5 rounded-md bg-zinc-905 border border-zinc-900 text-zinc-300 text-[10px] font-mono text-left block leading-none bg-zinc-900/60"
                >
                  🛡️ {perm}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
