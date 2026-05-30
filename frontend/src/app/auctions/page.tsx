"use client";

import Header from "@/components/layout/Header";
import {
  Flame, Star, Activity, TrendingUp, ArrowUpRight,
  Users, Eye, Bell, SlidersHorizontal, PlayCircle, Search
} from "lucide-react";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/utils/auction";

type Auction = {
  id: string;
  title: string;
  price: number;
  participants: number;
  timeLeft: string;
  image: string;
  isLive: boolean;
  viewers: number;
  recentBids: number;
};

const INITIAL_AUCTIONS: Auction[] = [
  { id: "1", title: "BMW X6 M Competition 2023", price: 85000000, participants: 42, timeLeft: "12m 45s", image: "🏎️", isLive: true, viewers: 1240, recentBids: 5 },
  { id: "2", title: "Apartamento T4 - Ilha de Luanda", price: 350000000, participants: 18, timeLeft: "04m 12s", image: "🏢", isLive: true, viewers: 890, recentBids: 3 },
  { id: "3", title: "Rolex Daytona 116500LN", price: 18500000, participants: 65, timeLeft: "45m 00s", image: "⌚", isLive: true, viewers: 3200, recentBids: 12 },
  { id: "4", title: "MacBook Pro M3 Max 64GB", price: 3200000, participants: 24, timeLeft: "1h 30m", image: "💻", isLive: false, viewers: 150, recentBids: 0 },
  { id: "5", title: "Obra de Arte - Artista Local", price: 1500000, participants: 8, timeLeft: "2h 15m", image: "🖼️", isLive: false, viewers: 45, recentBids: 0 },
  { id: "6", title: "PlayStation 5 Pro Ed. Limitada", price: 850000, participants: 112, timeLeft: "01m 20s", image: "🎮", isLive: true, viewers: 4500, recentBids: 28 },
];

const INITIAL_ACTIVITIES = [
  { id: 1, user: "João M.", action: "deu um lance de", value: 85500000, item: "BMW X6 M...", time: "agora" },
  { id: 2, user: "Ana P.", action: "entrou no leilão", item: "Rolex Daytona", time: "12s atrás" },
  { id: 3, user: "Carlos S.", action: "venceu o leilão", item: "iPhone 15 Pro", time: "45s atrás" },
  { id: 4, user: "Maria Silva", action: "iniciou transmissão", item: "Apartamento T4", time: "2m atrás" },
];

export default function Auctions() {
  const [activeTab, setActiveTab] = useState("live");
  const [auctions, setAuctions] = useState<Auction[]>(INITIAL_AUCTIONS);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [pulseAuctionId, setPulseAuctionId] = useState<string | null>(null);

  // SIMULATE REAL-TIME ACTIVITY
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update an auction
      const liveAuctions = auctions.filter(a => a.isLive);
      if (liveAuctions.length > 0) {
        const randomAuctionIndex = Math.floor(Math.random() * liveAuctions.length);
        const auctionToUpdate = liveAuctions[randomAuctionIndex];

        const bidIncrease = Math.floor(Math.random() * 500000) + 50000;

        setAuctions(prev => prev.map(a =>
          a.id === auctionToUpdate.id
            ? {
              ...a,
              price: a.price + bidIncrease,
              participants: a.participants + 1,
              recentBids: a.recentBids + 1
            }
            : a
        ));

        setPulseAuctionId(auctionToUpdate.id);
        setTimeout(() => setPulseAuctionId(null), 1000);

        // Add to activity feed
        const newActivity = {
          id: Date.now(),
          user: ["Lucas", "Pedro", "Sara", "Marta", "Rui"][Math.floor(Math.random() * 5)] + " " + ["T.", "F.", "K.", "L."][Math.floor(Math.random() * 4)],
          action: "deu um lance de",
          value: auctionToUpdate.price + bidIncrease,
          item: auctionToUpdate.title.substring(0, 15) + "...",
          time: "agora"
        };

        setActivities(prev => [newActivity, ...prev].slice(0, 6)); // Keep top 6
      }
    }, 4000); // Every 4 seconds

    return () => clearInterval(interval);
  }, [auctions]);


  return (
    <div className="bg-gray-50 min-h-screen font-sans text-slate-900">
      <Header />

      <main className="max-w-[1400px] mx-auto px-4 pb-12">

        {/* 1. HERO COMPACTA (Premium & Dynamic) */}
        <section className="relative mt-6 mb-8 rounded-sm bg-blue-500 overflow-hidden shadow-sm border border-primary-light">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-10 min-h-[25vh]">
            <div className="md:w-1/2 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Leilões acontecendo agora
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Explore leilões em <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">tempo real</span>
              </h1>
            </div>

          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* MAIN CONTENT AREA */}
          <div className="flex-1">

            {/* 5. GRID DE LEILÕES */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {auctions.map((auction) => {
                const isPulsing = pulseAuctionId === auction.id;

                return (
                  <div
                    key={auction.id}
                    className="group bg-white rounded-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-primary transition-all duration-300 flex flex-col cursor-pointer"
                  >
                    {/* 6. CARD DO LEILÃO - TOPO */}
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden flex items-center justify-center text-6xl border-b border-gray-200">
                      {/* Image placeholder */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10"></div>

                      <div className="transform group-hover:scale-110 transition-transform duration-700 z-0">
                        {auction.image}
                      </div>

                      {/* Overlays */}
                      <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20">
                        {auction.isLive ? (
                          <div className="bg-red-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-sm flex items-center gap-1.5 shadow-sm">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                            LIVE
                          </div>
                        ) : (
                          <div className="bg-slate-800/80 backdrop-blur text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-sm">
                            Agendado
                          </div>
                        )}

                        <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-sm flex items-center gap-1.5">
                          <Eye size={12} className="opacity-70" /> {auction.viewers.toLocaleString()}
                        </div>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 z-20">
                        <h3 className="text-white font-extrabold text-lg drop-shadow-md truncate">{auction.title}</h3>
                      </div>
                    </div>

                    {/* CARD - CORPO */}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Preço Atual</p>
                          <div className={`text-xl font-black transition-colors duration-300 flex items-center gap-1 ${isPulsing ? 'text-green-500' : 'text-slate-900'}`}>
                            {formatCurrency(auction.price)}
                            {isPulsing && <ArrowUpRight size={18} className="text-green-500 animate-bounce" />}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Tempo</p>
                          <p className={`text-sm font-bold ${auction.isLive ? 'text-red-500' : 'text-slate-700'}`}>
                            {auction.timeLeft}
                          </p>
                        </div>
                      </div>

                      {/* CARD - FOOTER */}
                      <div className="mt-auto pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <Users size={14} className="text-slate-400" />
                            {auction.participants} bids
                          </div>

                          {auction.isLive && auction.recentBids > 0 && (
                            <div className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded text-right flex items-center gap-1">
                              <TrendingUp size={12} /> +{auction.recentBids} no último min
                            </div>
                          )}
                        </div>

                        <button className="w-full bg-blue-500 hover:bg-blue-500/90 text-white font-bold py-2.5 rounded-sm transition-all shadow-sm flex items-center justify-center gap-2">
                          {auction.isLive ? (
                            <>Entrar no Leilão <PlayCircle size={16} /></>
                          ) : (
                            <>Ver Detalhes</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More */}
            <div className="mt-8 flex justify-center">
              <button className="bg-white border border-gray-200 text-slate-700 font-bold py-3 px-8 rounded-sm hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                Carregar mais leilões
              </button>
            </div>
          </div>

          {/* 7. SIDEBAR DINÂMICA (Desktop) */}
          <div className="hidden lg:block w-[320px] shrink-0 space-y-6">
            {/* Live Activity Feed */}
            <div className="bg-white rounded-sm border border-gray-200 p-5 shadow-sm relative overflow-hidden">

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Activity size={16} className="text-blue-500" /> Atividade Live
                </h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
              </div>

              <div className="space-y-4 relative">
                {/* Connecting line */}
                <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-slate-100 z-0"></div>

                {activities.map((act, index) => (
                  <div key={act.id} className="relative z-10 flex gap-3 items-start animate-fade-in-up">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 border-white shadow-sm ${index === 0 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {act.value ? <TrendingUp size={10} /> : <Bell size={10} />}
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 leading-tight">
                        <span className="font-bold text-slate-900">{act.user}</span> {act.action} <span className="font-bold text-slate-800">{act.item}</span>
                      </p>
                      {act.value && (
                        <p className="text-xs font-black text-green-600 mt-0.5">
                          {formatCurrency(act.value)}
                        </p>
                      )}
                      <p className="text-[9px] text-slate-400 mt-1 font-medium">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </main>

    </div>
  );
}
