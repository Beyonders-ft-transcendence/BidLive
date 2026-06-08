// components/layout/home/LiveAuctionsSection.tsx
"use client";
import { useState, useEffect } from "react";
import { Eye, Users, Clock, ArrowUpRight, Play, TrendingUp, Activity, Bell } from "lucide-react";
import { formatCurrency } from "@/utils/auction";

const INITIAL_AUCTIONS = [
  {
    id: "1",
    title: "BMW X6 M Competition 2023",
    price: 85000000,
    category: "Veículos",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80",
    timeLeft: 345,
    viewers: 1240,
    bids: 42,
  },
  {
    id: "2",
    title: "Apartamento T4 - Ilha de Luanda",
    price: 350000000,
    category: "Imóveis",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    timeLeft: 820,
    viewers: 890,
    bids: 18,
  },
  {
    id: "3",
    title: "Rolex Cosmograph Daytona",
    price: 18500000,
    category: "Acessórios",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    timeLeft: 120,
    viewers: 3200,
    bids: 65,
  },
  {
    id: "4",
    title: "PlayStation 5 Pro Ed. Limitada",
    price: 850000,
    category: "Eletrônicos",
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80",
    timeLeft: 410,
    viewers: 1540,
    bids: 112,
  },
];

const INITIAL_ACTIVITIES = [
  { id: "1", user: "João M.", action: "deu lance de", value: 85200000, item: "BMW X6", time: "12s atrás" },
  { id: "2", user: "Ana P.", action: "entrou no leilão", item: "Rolex Daytona", time: "30s atrás" },
  { id: "3", user: "Carlos S.", action: "deu lance de", value: 18600000, item: "Rolex Daytona", time: "1m atrás" },
  { id: "4", user: "Maria Silva", action: "entrou no leilão", item: "Apartamento T4", time: "2m atrás" },
];

export default function LiveAuctionsSection() {
  const [auctions, setAuctions] = useState(INITIAL_AUCTIONS);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [pulseId, setPulseId] = useState<string | null>(null);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "00m 00s";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  };

  // Timers countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setAuctions((prev) =>
        prev.map((auc) => ({
          ...auc,
          timeLeft: auc.timeLeft > 0 ? auc.timeLeft - 1 : 600, // loop back to 10m
        }))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulating Real-time Bid Events
  useEffect(() => {
    const bidsInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * auctions.length);
      const auction = auctions[randomIndex];

      const bidIncrease = Math.floor(Math.random() * 400000) + 100000;
      const newPrice = auction.price + bidIncrease;

      setAuctions((prev) =>
        prev.map((auc) =>
          auc.id === auction.id
            ? {
                ...auc,
                price: newPrice,
                bids: auc.bids + 1,
                viewers: auc.viewers + Math.floor(Math.random() * 8) - 3,
              }
            : auc
        )
      );

      // Sincronizar painel da direita (adicionar nova atividade)
      const userNames = ["Lucas T.", "Sara F.", "Rui K.", "Marta L.", "Pedro V.", "Ana G."];
      const randomUser = userNames[Math.floor(Math.random() * userNames.length)];
      
      const newAct = {
        id: Date.now().toString(),
        user: randomUser,
        action: "deu lance de",
        value: newPrice,
        item: auction.title.split(" - ")[0].split(" M ")[0], // compact name
        time: "agora",
      };

      setActivities((prev) => [newAct, ...prev.slice(0, 4)]);

      setPulseId(auction.id);
      const timeout = setTimeout(() => setPulseId(null), 1000);
      return () => clearTimeout(timeout);
    }, 4500);

    return () => clearInterval(bidsInterval);
  }, [auctions]);

  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-16">
          <span className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-[11px] font-bold tracking-[1.6px] uppercase px-4 py-1.5 rounded-full border border-red-100 mb-5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Leilões Ao Vivo Agora
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0C1B33] text-center leading-tight tracking-tight">
            Destaques da Plataforma em Tempo Real
          </h2>
          <p className="text-sm text-gray-500 text-center max-w-lg mt-4 leading-relaxed">
            Acompanhe a atividade das ofertas, veja o relógio correr e dê seu lance antes que o martelo bata.
          </p>
        </div>

        {/* Layout Grid: 4 Cards on Left, Sidebar Activity on Right */}
        <div className="flex flex-col lg:flex-row justify-between gap-8 lg:gap-10 items-stretch w-full">
          
          {/* Left: 4 Overlay Cards (rounded-sm) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            {auctions.map((auc) => {
              const isPulsing = pulseId === auc.id;

              return (
                <div
                  key={auc.id}
                  className="group relative overflow-hidden aspect-[4/3] rounded-sm border border-gray-100 shadow-sm cursor-pointer flex flex-col justify-between"
                >
                  {/* Full Background Image */}
                  <img
                    src={auc.image}
                    alt={auc.title}
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 rounded-sm"
                  />
                  
                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/60 to-slate-950/20 z-0"></div>

                  {/* Card Header (Absolute Overlaid) */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                    <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-sm shadow-xs">
                      <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
                      LIVE
                    </span>

                    <span className="inline-flex items-center gap-1 bg-black/55 backdrop-blur-xs text-white text-[9px] font-semibold px-2 py-0.5 rounded-sm">
                      <Eye size={10} className="opacity-80" />
                      {auc.viewers.toLocaleString()} assistindo
                    </span>
                  </div>

                  {/* Card Bottom Content (Absolute Overlaid) */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col justify-end">
                    
                    {/* Category Tag */}
                    <span className="text-[9px] font-extrabold tracking-[1px] uppercase text-[#1B59F8] bg-white rounded-sm px-2 py-0.5 w-fit mb-2">
                      {auc.category}
                    </span>

                    {/* Title */}
                    <h3 className="text-white font-extrabold text-base lg:text-lg truncate drop-shadow-sm mb-3">
                      {auc.title}
                    </h3>

                    {/* Bid & Time Info */}
                    <div className="flex justify-between items-center border-t border-white/10 pt-3">
                      <div>
                        <p className="text-[9px] text-gray-300 font-bold uppercase tracking-wider mb-0.5">
                          Lance Atual
                        </p>
                        <div
                          className={`text-base font-black transition-all duration-300 flex items-center gap-1 ${
                            isPulsing ? "text-green-400 scale-105" : "text-white"
                          }`}
                        >
                          {formatCurrency(auc.price)}
                          {isPulsing && (
                            <ArrowUpRight size={14} className="text-green-400 animate-bounce" />
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <p className="text-[9px] text-gray-300 font-bold uppercase tracking-wider mb-0.5">
                          Tempo
                        </p>
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-sm">
                          <Clock size={11} className="text-red-400" />
                          {formatTime(auc.timeLeft)}
                        </span>
                      </div>
                    </div>

                    {/* Overlay Action Button (Slide-up or Fade-in on Hover) */}
                    <div className="h-0 group-hover:h-9 overflow-hidden transition-all duration-300 opacity-0 group-hover:opacity-100 mt-3">
                      <button className="w-full bg-primary hover:bg-primary/95 text-white font-bold text-[10px] tracking-[1px] uppercase py-2.5 rounded-sm transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-1.5">
                        Dar Lance Rápido
                        <Play size={10} className="fill-white" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Premium Activity Sidebar (rounded-sm) */}
          <div className="w-full lg:w-[380px] shrink-0 flex flex-col">
            <div className="bg-[#0C1B33] rounded-sm p-6 flex flex-col justify-between flex-1 text-white border border-slate-800 shadow-lg relative overflow-hidden">
              
              {/* Header Widget */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-white">
                    <Activity size={15} className="text-primary animate-pulse" />
                    Monitor de Ofertas
                  </h3>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                </div>

                {/* Simulated Live Bid Feed */}
                <div className="space-y-4 relative min-h-[260px]">
                  <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-slate-800 z-0"></div>

                  {activities.map((act, index) => (
                    <div
                      key={act.id}
                      className={`relative z-10 flex gap-3.5 items-start transition-all duration-300 ${
                        index === 0 ? "animate-fade-in-up" : "opacity-75"
                      }`}
                    >
                      {/* Connection node */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 border-[#0C1B33] shadow-xs ${
                          index === 0 ? "bg-primary text-white" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {act.value ? <TrendingUp size={10} /> : <Bell size={10} />}
                      </div>

                      <div className="flex-1">
                        <p className="text-[12px] text-slate-300 leading-tight">
                          <span className="font-extrabold text-white">{act.user}</span> {act.action}{" "}
                          <span className="font-bold text-slate-200">{act.item}</span>
                        </p>
                        {act.value && (
                          <p className={`text-[12px] font-black mt-0.5 ${index === 0 ? "text-green-400" : "text-slate-300"}`}>
                            {formatCurrency(act.value)}
                          </p>
                        )}
                        <p className="text-[9px] text-slate-500 mt-1 font-medium">{act.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Action Footer */}
              <div className="pt-6 border-t border-slate-800 mt-6 lg:mt-0">
                <div className="bg-slate-900/50 p-4 rounded-sm border border-slate-800 mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Disputas</span>
                    <span className="text-lg font-black text-white">237 lotes</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Ativos Hoje</span>
                    <span className="text-lg font-black text-primary">12 ativos</span>
                  </div>
                </div>

                <button className="w-full bg-white hover:bg-slate-100 text-[#0C1B33] font-bold text-xs tracking-[1px] uppercase py-3.5 rounded-sm transition-all text-center flex items-center justify-center gap-2">
                  Ver Todos os Leilões
                  <Play size={10} className="fill-[#0C1B33] stroke-[#0C1B33]" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
