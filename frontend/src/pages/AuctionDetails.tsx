/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Eye, Heart, Gavel, ArrowLeft, ShoppingBag, ShieldCheck, Award } from 'lucide-react';
import { Auction, Bid, Stream, User } from '../types';
import LiveStreamPlayer from '../components/streams/LiveStreamPlayer';
import LiveChat from '../components/chats/LiveChat';
import { useAuctionSocket } from '../hooks/useAuctionSocket';

interface AuctionDetailsProps {
  auction: Auction | null;
  auctionId: string;
  currentUser: User;
  onPlaceBid: (auctionId: string, amount: number) => Promise<{ success: boolean; message: string }>;
  onBuyNow: (auctionId: string) => Promise<{ success: boolean; message: string }>;
  onWatchToggle: (id: string, e: React.MouseEvent) => void;
  isWatched: boolean;
  onBack: () => void;
  bids: Bid[];
  streams: Stream[];
  onRefresh: () => void;
}

export default function AuctionDetails({
  auction,
  auctionId,
  currentUser,
  onPlaceBid,
  onBuyNow,
  onWatchToggle,
  isWatched,
  onBack,
  bids,
  streams,
  onRefresh,
}: AuctionDetailsProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [bidValue, setBidValue] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showBuyNowModal, setShowBuyNowModal] = useState(false);

  useAuctionSocket(auctionId, (type) => {
    if (
      type === 'new_bid' ||
      type === 'outbid' ||
      type === 'bid_accepted' ||
      type === 'auction_snapshot' ||
      type === 'auction_ended' ||
      type === 'buy_now'
    ) {
      onRefresh();
    }
  });

  const auctionBids = bids
    .filter((b) => b.auctionId === auctionId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const stream = streams.find((s) => s.auctionId === auctionId);

  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    if (!auction) return;
    if (auction.status !== 'ACTIVE') {
      setTimeLeft(
        auction.status === 'UPCOMING' ? 'Leilão Agendado' : auction.status === 'ENDED' ? 'Arrematado' : 'Cancelado'
      );
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(auction.endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Arrematado');
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [auction]);

  if (!auction) {
    return (
      <div className="py-24 text-center text-zinc-500">
        Carregando informações do leilão...
      </div>
    );
  }

  const minAcceptableBid = auction.currentPrice + auction.minIncrement;

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const amount = parseFloat(bidValue);
    if (isNaN(amount)) {
      setErrorMsg('Por favor insira um valor numérico válido.');
      return;
    }

    if (amount < minAcceptableBid) {
      setErrorMsg(
        `O lance mínimo admissível para este lote é de R$ ${minAcceptableBid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`
      );
      return;
    }

    if (amount > currentUser.balance) {
      setErrorMsg(
        `Saldo em conta insuficiente. Seu saldo atual é de R$ ${currentUser.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`
      );
      return;
    }

    const res = await onPlaceBid(auction.id, amount);
    if (res.success) {
      setSuccessMsg(res.message);
      setBidValue('');
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handlePresetBid = async (increment: number) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const amount = auction.currentPrice + increment;

    if (amount > currentUser.balance) {
      setErrorMsg(`Saldo insuficiente para lance de R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`);
      return;
    }

    const res = await onPlaceBid(auction.id, amount);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleBuyNowSubmit = async () => {
    if (!auction.buyNowPrice) return;

    if (currentUser.balance < auction.buyNowPrice) {
      setErrorMsg('Saldo insuficiente para compra imediata.');
      setShowBuyNowModal(false);
      return;
    }

    const res = await onBuyNow(auction.id);
    if (res.success) {
      setSuccessMsg(res.message);
      setShowBuyNowModal(false);
    } else {
      setErrorMsg(res.message);
      setShowBuyNowModal(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white text-xs font-semibold px-3.5 py-2 hover:bg-zinc-900 border border-zinc-900 rounded-lg transition-all"
          id="btn-back-to-list"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar aos Leilões
        </button>

        <button
          onClick={(e) => onWatchToggle(auction.id, e)}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all border ${
            isWatched
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-500'
              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-300'
          }`}
          id="btn-details-watchlist"
        >
          <Heart className="h-4 w-4" fill={isWatched ? 'currentColor' : 'none'} />
          {isWatched ? 'Acompanhando' : 'Acompanhar'}
        </button>
      </div>

      {auction.status === 'ACTIVE' && stream && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LiveStreamPlayer
              streamId={stream.id}
              streamTitle={stream.title}
              streamerName={stream.streamerName}
              initialViewerCount={stream.viewersCount}
              auctionId={auction.id}
            />
          </div>
          <div className="lg:col-span-1 h-[360px] md:h-auto">
            <LiveChat roomId={stream.id} currentUser={currentUser} />
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800/80 shadow-md">
            <img
              src={auction.images[activeImageIdx]}
              alt={auction.title}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-all"
            />
          </div>

          {auction.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {auction.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative aspect-square w-18 shrink-0 rounded-lg overflow-hidden bg-zinc-950 transition-all border ${
                    activeImageIdx === idx ? 'border-sky-500 ring-1 ring-sky-500' : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <img src={img} alt="Thumbnail" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 items-center text-xs text-zinc-500 font-mono">
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800/40">{auction.category}</span>
              <span>•</span>
              <span>Criado por {auction.creatorName}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {auction.views} views
              </span>
            </div>

            <h1 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight font-sans">
              {auction.title}
            </h1>
          </div>

          <p className="text-zinc-400 text-sm leading-relaxed p-4 bg-zinc-900/10 border border-zinc-900 rounded-xl">
            {auction.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-1.5">
              <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-500 font-bold block">
                Tempo Restante
              </span>
              <span
                className={`text-lg font-mono font-bold block ${auction.status === 'ACTIVE' && timeLeft.includes('00h') ? 'text-red-500 animate-pulse' : 'text-zinc-100'}`}
              >
                {timeLeft}
              </span>
            </div>

            <div className="bg-zinc-950 border border-zinc-805 p-4 rounded-xl space-y-1.5 border-zinc-800">
              <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-500 font-bold block">
                {auction.status === 'ENDED' ? 'Arrematado por' : 'Lance Atual'}
              </span>
              <span className="text-lg font-mono font-bold text-emerald-400 block">
                R$ {auction.currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {auction.status === 'ACTIVE' ? (
            <div className="p-5 rounded-xl border border-zinc-800/85 bg-zinc-900/20 space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-white font-sans font-bold text-sm">Painel de Lances</span>
                <span className="text-xs font-mono text-zinc-500">Mínimo Incremento: R$ {auction.minIncrement}</span>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/40 text-red-400 text-xs text-left leading-relaxed">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-955/40 border border-emerald-900/30 text-emerald-400 text-xs text-left leading-relaxed bg-emerald-950/20">
                  {successMsg}
                </div>
              )}

              <div className="space-y-2">
                <span className="text-[10px] text-zinc-500 font-mono font-medium block">
                  Incremento rápido (+ sob lance atual):
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {[auction.minIncrement, auction.minIncrement * 2, auction.minIncrement * 4].map((inc) => (
                    <button
                      key={inc}
                      onClick={() => handlePresetBid(inc)}
                      className="py-2.5 text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-emerald-400 rounded-lg transition-all border border-zinc-800 hover:border-zinc-700 flex items-center justify-center gap-1"
                    >
                      +{inc.toLocaleString('pt-BR')}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleBidSubmit} className="space-y-3.5">
                <div className="relative">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-zinc-500 text-xs font-mono">
                    R$
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={bidValue}
                    onChange={(e) => setBidValue(e.target.value)}
                    placeholder={`Valor sugerido maior que R$ ${minAcceptableBid}`}
                    className="w-full h-11 pl-9 pr-24 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono"
                    id="details-bidding-input"
                  />
                  <div className="absolute right-1.5 top-1.5 flex gap-1.5">
                    <button
                      type="submit"
                      className="h-8 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                      id="btn-place-bid"
                    >
                      <Gavel className="h-3.5 w-3.5" />
                      Ofertar
                    </button>
                  </div>
                </div>
              </form>

              {auction.buyNowPrice !== null && (
                <div className="pt-4 border-t border-zinc-900 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] text-zinc-500 font-mono block">Compressão de tempo:</span>
                    <span className="text-white text-xs font-bold leading-normal block">
                      Disponível por Arremate Imediato
                    </span>
                  </div>
                  <button
                    onClick={() => setShowBuyNowModal(true)}
                    className="px-4 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-indigo-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border border-indigo-800/30"
                    id="btn-buynow-trigger"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Comprar por R$ {auction.buyNowPrice.toLocaleString('pt-BR')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-900/10 text-center text-zinc-500 text-xs leading-relaxed">
              {auction.status === 'ENDED' ? (
                <div className="space-y-2">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-950/50 text-emerald-400 border border-emerald-900/30">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <p className="font-semibold text-zinc-300">Este leilão foi encerrado e auditado com sucesso.</p>
                  {auction.currentBidderName && (
                    <p className="text-zinc-400">
                      Vencedor do Lote:{' '}
                      <span className="text-emerald-400 font-semibold font-mono">{auction.currentBidderName}</span> por{' '}
                      <span className="font-mono text-white">
                        R$ {auction.currentPrice.toLocaleString('pt-BR')}
                      </span>
                    </p>
                  )}
                </div>
              ) : (
                <span>Este leilão ainda não foi aberto para lances (Estágio de Agenda). Inicia em breve!</span>
              )}
            </div>
          )}
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-zinc-100 text-sm font-bold tracking-tight font-sans flex items-center gap-1.5">
          <Award className="h-4.5 w-4.5 text-sky-400" />
          Histórico Chronológico de Lances
        </h3>

        <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-lg">
          {auctionBids.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              Nenhuma oferta registrada neste registro até o momento. Seja o primeiro!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-900/40 text-zinc-500 font-mono font-bold uppercase tracking-wider border-b border-zinc-900">
                    <th className="px-5 py-3">Ofertante</th>
                    <th className="px-5 py-3 text-right">Valor do Lance</th>
                    <th className="px-5 py-3">Data & Hora</th>
                    <th className="px-5 py-3 text-right">Métricas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60 font-sans text-zinc-300">
                  {auctionBids.map((bid, index) => (
                    <tr key={bid.id} className="hover:bg-zinc-900/10 transition-colors">
                      <td className="px-5 py-3.5 flex items-center gap-2">
                        <img
                          src={bid.bidderAvatar}
                          alt="Avatar"
                          referrerPolicy="no-referrer"
                          className="h-6 w-6 rounded-md object-cover"
                        />
                        <span className="font-semibold text-zinc-200">{bid.bidderName}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-zinc-100">
                        R$ {bid.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-zinc-500">
                        {new Date(bid.timestamp).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {index === 0 && bid.status === 'SUCCESS' ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900/30 text-[10px] font-semibold">
                            Líder
                          </span>
                        ) : bid.status === 'OVERBID' ? (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500 border border-zinc-800 text-[10px]">
                            Superado
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-950/40 text-amber-500 text-[10px]">
                            Consolidado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {showBuyNowModal && auction.buyNowPrice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-md p-6 space-y-6 shadow-2xl relative z-10 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-900">
              <ShoppingBag className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-white text-lg font-bold tracking-tight">Confirmar Compra Imediata?</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Você está optando pelo arremate direto do lote{' '}
                <span className="text-zinc-200 font-semibold">{auction.title}</span> pelo preço fixado de{' '}
                <span className="text-emerald-400 font-mono font-bold">
                  R$ {auction.buyNowPrice.toLocaleString('pt-BR')}
                </span>
                .
              </p>
            </div>

            <div className="p-4 bg-zinc-900/30 border border-zinc-900/80 rounded-lg text-left text-xs text-zinc-500 leading-normal">
              O valor total será debitado de sua carteira BidLive instantaneamente e a propriedade legal faturada sob o
              e-mail cadastrado.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBuyNowModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold hover:bg-zinc-900 text-zinc-400 border border-zinc-900 hover:text-white rounded-lg transition-colors"
                id="btn-buynow-cancel"
              >
                Cancelar
              </button>
              <button
                onClick={handleBuyNowSubmit}
                className="flex-1 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-md"
                id="btn-buynow-confirm"
              >
                Confirmar Compra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
