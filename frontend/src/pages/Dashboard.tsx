/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Gavel, Heart, Bell, MessageSquare, ShieldCheck, DollarSign, Award, ArrowUpRight, Check } from 'lucide-react';
import { Auction, Bid, Notification, PrivateChatMessage, User } from '../types';
import { apiService } from '../services/api';

interface DashboardProps {
  currentUser: User;
  onPageNav: (page: string, auctionId?: string) => void;
  auctions: Auction[];
  bids: Bid[];
  watchlist: string[];
  notifications: Notification[];
}

type TabType = 'active-bids' | 'watchlist' | 'notifications' | 'support-chat';

export default function Dashboard({
  currentUser,
  onPageNav,
  auctions,
  bids,
  watchlist,
  notifications
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('active-bids');
  
  // Simulated private messages for support
  const [supportMessages, setSupportMessages] = useState([
    { sender: 'Suporte Técnico', content: 'Prezado Daniel, seu lance no Rolex Daytona foi computado com sucesso no ledger redundante.', time: '11:20 Z' },
    { sender: 'Você', content: 'Excelente! Quanto tempo costuma demorar o faturamento após o arremate?', time: '11:21 Z' },
    { sender: 'Suporte Técnico', content: 'Normalmente, assim que o cronometro zera, fazemos a checagem multifator de saldos e liberamos a chave em até 10 minutos. O frete segurado é gratuito!', time: '11:22 Z' }
  ]);
  const [supportInput, setSupportInput] = useState('');

  // 1. Calculations metrics
  const myBids = bids.filter(b => b.bidderName === currentUser.name);
  const myCreatedCount = auctions.filter(a => a.creatorId === currentUser.id).length;
  
  // Grab unique auctions where current user has placed an offer
  const auctionsIBidOn = auctions.filter(auc => {
    return bids.some(b => b.auctionId === auc.id && b.bidderName === currentUser.name);
  });

  // Calculate simulated funds spent (ended auctions won by me)
  const totalSpent = auctions
    .filter(a => a.status === 'ENDED' && a.currentBidderId === currentUser.id)
    .reduce((acc, curr) => acc + curr.currentPrice, 0);

  const handleSendSupportMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportInput.trim()) return;

    setSupportMessages(prev => [
      ...prev,
      { sender: 'Você', content: supportInput.trim(), time: 'Agora' }
    ]);
    setSupportInput('');

    // Simulate response after 1.5s
    setTimeout(() => {
      setSupportMessages(prev => [
        ...prev,
        { sender: 'Suporte Técnico', content: 'Entendido. Sua solicitação foi enfileirada no canal de auditoria. Tem algo mais que posso ajudar?', time: 'Agora' }
      ]);
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page titles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight font-sans">Minha Conta</h1>
          <p className="text-zinc-500 text-xs mt-0.5">Visão geral de seus lances, estatísticas financeiras, watchlist e canais de faturamento seguro.</p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Status KYC: Verificado</span>
        </div>
      </div>

      {/* Stats microcards dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl space-y-1">
          <span className="block text-[10px] text-zinc-500 font-mono uppercase font-semibold">Total Adjudicado</span>
          <span className="block text-lg font-mono font-bold text-emerald-400">
            R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl space-y-1">
          <span className="block text-[10px] text-zinc-500 font-mono uppercase font-semibold">Lances Efetuados</span>
          <span className="block text-lg font-mono font-bold text-zinc-100">{myBids.length} lances</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl space-y-1">
          <span className="block text-[10px] text-zinc-500 font-mono uppercase font-semibold">Lots Acompanhados</span>
          <span className="block text-lg font-mono font-bold text-zinc-100">{watchlist.length} itens</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl space-y-1">
          <span className="block text-[10px] text-zinc-500 font-mono uppercase font-semibold">Meus Bens Postados</span>
          <span className="block text-lg font-mono font-bold text-zinc-100">{myCreatedCount} publicados</span>
        </div>

      </div>

      {/* Tab select triggers */}
      <div className="flex border-b border-zinc-900 gap-1 overflow-x-auto whitespace-nowrap pb-1 scrollbar-none">
        
        <button
          onClick={() => setActiveTab('active-bids')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
            activeTab === 'active-bids'
              ? 'bg-zinc-900 text-white border-b-2 border-sky-400'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
          id="btn-tab-active-bids"
        >
          <Gavel className="h-4 w-4" />
          Rastreamento de Lances ({auctionsIBidOn.length})
        </button>

        <button
          onClick={() => setActiveTab('watchlist')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
            activeTab === 'watchlist'
              ? 'bg-zinc-900 text-white border-b-2 border-sky-400'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
          id="btn-tab-watchlist"
        >
          <Heart className="h-4 w-4" />
          Favoritos ({watchlist.length})
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
            activeTab === 'notifications'
              ? 'bg-zinc-900 text-white border-b-2 border-sky-400'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
          id="btn-tab-notifs"
        >
          <Bell className="h-4 w-4" />
          Alertas ({notifications.length})
        </button>

        <button
          onClick={() => setActiveTab('support-chat')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
            activeTab === 'support-chat'
              ? 'bg-zinc-900 text-white border-b-2 border-sky-400'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
          id="btn-tab-support"
        >
          <MessageSquare className="h-4 w-4" />
          Faturamento & Suporte
        </button>

      </div>

      {/* Tab render content */}
      <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-850/80 min-h-[300px] border-zinc-800/40">
        
        {/* TAB 1: Bidding tracker */}
        {activeTab === 'active-bids' && (
          <div className="space-y-4">
            <h3 className="text-zinc-200 font-sans font-bold text-sm border-b border-zinc-900 pb-3">Status de Seus Lances</h3>
            
            {auctionsIBidOn.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs text-sans">
                Nenhum lance efetuado de sua conta em leilões correntes.
              </div>
            ) : (
              <div className="space-y-3.5">
                {auctionsIBidOn.map(auc => {
                  const isWinningStr = auc.currentBidderId === currentUser.id;
                  return (
                    <div
                      key={auc.id}
                      onClick={() => onPageNav('details', auc.id)}
                      className="p-4 rounded-xl border border-zinc-900 bg-zinc-900/10 hover:bg-zinc-900/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer transition-all hover:border-zinc-800"
                    >
                      <div className="text-left space-y-1">
                        <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-500">{auc.category}</span>
                        <h4 className="font-sans font-bold text-zinc-200 text-sm line-clamp-1">{auc.title}</h4>
                      </div>

                      <div className="flex flex-wrap gap-4 items-center">
                        <div className="text-left md:text-right">
                          <span className="block text-[9px] text-zinc-500 font-mono">Última Oferta</span>
                          <span className="text-emerald-400 font-mono font-bold text-xs">
                            R$ {auc.currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div className="shrink-0">
                          {auc.status === 'ENDED' ? (
                            isWinningStr ? (
                              <span className="px-2.5 py-1 rounded bg-amber-950 text-amber-500 border border-amber-900/30 text-[10px] font-bold">
                                🏆 Arrematado por você
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded bg-zinc-900 text-zinc-500 text-[10px]">
                                Perdedor
                              </span>
                            )
                          ) : isWinningStr ? (
                            <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-900/30 text-[10px] font-bold">
                              🟢 Ganhando
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded bg-red-950 text-red-400 border border-red-900/40 text-[10px] font-bold">
                              🔴 Superado
                            </span>
                          )}
                        </div>

                        <span className="text-zinc-500 p-1 border border-zinc-900 hover:text-white rounded transition-colors bg-zinc-950 hover:bg-zinc-900">
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Watchlist */}
        {activeTab === 'watchlist' && (
          <div className="space-y-4">
            <h3 className="text-zinc-200 font-sans font-bold text-sm border-b border-zinc-900 pb-3 font-sans">Sua Watchlist</h3>

            {watchlist.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs">
                Nenhum lote favoritado para acompanhamento.
              </div>
            ) : (
              <div className="space-y-3.5">
                {auctions
                  .filter(a => watchlist.includes(a.id))
                  .map(auc => (
                    <div
                      key={auc.id}
                      onClick={() => onPageNav('details', auc.id)}
                      className="p-4 rounded-xl border border-zinc-900 bg-zinc-900/10 hover:bg-zinc-900/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer transition-all hover:border-zinc-800"
                    >
                      <div className="text-left space-y-1">
                        <span className="text-[10px] uppercase font-mono text-zinc-500">{auc.category}</span>
                        <h4 className="font-sans font-bold text-zinc-200 text-sm line-clamp-1">{auc.title}</h4>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="block text-[9px] text-zinc-500 font-mono">Preço Atual</span>
                          <span className="text-emerald-400 font-mono font-bold text-xs">
                            R$ {auc.currentPrice.toLocaleString('pt-BR')}
                          </span>
                        </div>
                        
                        <div className="text-right">
                          <span className="block text-[9px] text-zinc-500 font-mono">Status</span>
                          <span className={`text-[10px] font-bold font-sans ${auc.status === 'ACTIVE' ? 'text-emerald-400' : 'text-zinc-400'}`}>
                            {auc.status === 'ACTIVE' ? 'Ativo' : 'Encerrado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Notifications log scrolling history */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h3 className="text-zinc-200 font-sans font-bold text-sm border-b border-zinc-900 pb-3">Registro Histórico de Notificações</h3>

            {notifications.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs">
                Nenhum alerta localizado nos arquivos.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {notifications.map(notif => (
                  <div key={notif.id} className="p-3.5 border-b border-zinc-900/60 hover:bg-zinc-900/10 flex gap-3 text-left items-start">
                    <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                      notif.type === 'OUTBID' ? 'bg-red-500' : notif.type === 'BID_WON' ? 'bg-emerald-500' : 'bg-sky-500'
                    }`} />
                    <div className="flex-1 leading-normal text-xs">
                      <p className="font-bold text-zinc-300">{notif.title}</p>
                      <p className="text-zinc-400 text-xs mt-0.5">{notif.description}</p>
                      <span className="block text-[9px] text-zinc-600 font-mono mt-1">
                        {new Date(notif.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Support & Deliveries Message board */}
        {activeTab === 'support-chat' && (
          <div className="space-y-4 flex flex-col h-[400px]">
            <h3 className="text-zinc-200 font-sans font-bold text-sm border-b border-zinc-900 pb-3">Canal de Faturamento & Logística Seguro</h3>

            {/* Scrolling message logs */}
            <div className="flex-1 overflow-y-auto p-4 bg-zinc-950 border border-zinc-900 rounded-lg space-y-4 text-xs scrollbar-thin">
              {supportMessages.map((msg, i) => (
                <div key={i} className={`flex flex-col max-w-sm p-3 rounded-xl border ${
                  msg.sender === 'Você'
                    ? 'ml-auto bg-sky-950/10 border-sky-900/20 text-zinc-200 text-right text-right items-end'
                    : 'bg-zinc-900/35 border-zinc-900 text-zinc-300 text-left items-start'
                }`}>
                  <span className="font-sans font-bold text-[10px] text-zinc-400 mb-0.5">{msg.sender}</span>
                  <p className="leading-relaxed leading-relaxed break-words">{msg.content}</p>
                  <span className="block text-[9px] text-zinc-600 font-mono mt-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Input submit support form */}
            <form onSubmit={handleSendSupportMsg} className="flex gap-2">
              <input
                type="text"
                value={supportInput}
                onChange={(e) => setSupportInput(e.target.value)}
                placeholder="Pergunte aos auditores sobre logística, frete ou faturamento..."
                className="flex-1 h-10 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-550 focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
                id="support-chat-input"
              />
              <button
                type="submit"
                className="px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs transition-colors shadow"
                id="support-submit-btn"
              >
                Enviar
              </button>
            </form>
          </div>
        )}

      </div>

    </div>
  );
}
