// components/layout/home/LiveAuctionsSection.tsx
"use client";
import { useState, useEffect } from "react";
import { Eye, Users, Clock, ArrowUpRight, Play, TrendingUp, Activity, Bell } from "lucide-react";
import { formatCurrency } from "@/utils/auction";
import { motion } from "framer-motion";

import Link from "next/link";
import { useAuctionsQuery, useAuctionActivitiesQuery } from "@/hooks/useAuction";
import { useGlobalAuctionRealtime } from "@/hooks/useAuctionRealtime";
import Image from "next/image";

export default function LiveAuctionsSection() {
  const { data: auctionsData, isLoading: loadingAuctions } = useAuctionsQuery({ status: "LIVE", limit: 4 });
  const { data: allAuctionsData } = useAuctionsQuery({ limit: 1 });
  const { data: activities = [] } = useAuctionActivitiesQuery();

  // Connect to the global websocket for real-time bid updates
  useGlobalAuctionRealtime();

  const auctions = auctionsData?.results || [];
  const activeAuctionsCount = auctionsData?.count || 0;
  const totalAuctionsCount = allAuctionsData?.count || 0;

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "00m 00s";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  };

  const calculateTimeLeft = (endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((end - now) / 1000);
    return diff > 0 ? diff : 0;
  };

  const getTimeAgo = (timestamp: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return `${diff}s atrás`;
    const m = Math.floor(diff / 60);
    if (m < 60) return `${m}m atrás`;
    const h = Math.floor(m / 60);
    return `${h}h atrás`;
  };

  return (
    <section id="leiloes" className="py-24 bg-white border-t border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-16">
          <span className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-[11px] font-bold tracking-[1.6px] uppercase px-4 py-1.5 rounded-full border border-red-100 mb-5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Leilões Ao Vivo Agora
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0C1B33] text-center leading-tight tracking-tight">
            Leilões ao Vivo
          </h2>
          <p className="text-sm text-gray-500 text-center max-w-lg mt-4 leading-relaxed">
            Acompanhe a atividade das ofertas, veja o relógio correr e dê seu lance antes que o martelo bata.
          </p>
        </div>

        {/* Layout Grid: 4 Cards on Left, Sidebar Activity on Right */}
        <div className="flex flex-col lg:flex-row justify-between gap-8 lg:gap-10 items-stretch w-full">
          
          {/* Left: 4 Overlay Cards (rounded-sm) */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={{
              visible: { transition: { staggerChildren: 0.2 } },
              hidden: {}
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1"
          >
            {loadingAuctions ? (
              <div className="col-span-full flex flex-col items-center justify-center bg-slate-50 rounded-xl min-h-[400px] border border-slate-100">
                <span className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4"></span>
                <p className="text-sm font-medium text-slate-500">A carregar leilões ao vivo...</p>
              </div>
            ) : auctions.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-xl py-16 px-6 text-center h-full min-h-[400px]">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-slate-100">
                  <Clock size={24} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-extrabold text-[#0C1B33] mb-2 tracking-tight">Pausa no Martelo</h3>
                <p className="text-slate-500 text-sm max-w-sm mb-6 leading-relaxed">
                  Não existem leilões a decorrer neste momento. Explore o nosso catálogo e prepare-se para as próximas disputas!
                </p>
                <Link href="/explore">
                  <button className="bg-[#0C1B33] hover:bg-primary text-white font-bold text-xs tracking-[1px] uppercase px-8 py-3.5 rounded-sm transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                    Explorar Catálogo
                    <ArrowUpRight size={14} />
                  </button>
                </Link>
              </div>
            ) : auctions.slice(0, 4).map((auc: any) => {
              const currentPrice = auc.item?.current_price || auc.item?.starting_price;
              const timeLeftStr = formatTime(calculateTimeLeft(auc.end_time));

              return (
                <Link key={auc.id} href={`/auctions/${auc.id}`} className="block h-full w-full">
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 50, scale: 0.9 },
                      visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 120 } }
                    }}
                    className="group relative overflow-hidden h-full min-h-[240px] md:min-h-[280px] rounded-xl border border-gray-100 shadow-sm cursor-pointer flex flex-col justify-between"
                  >
                    {/* Full Background Image */}
                    <img
                      src={auc.item?.images?.[0]?.file?.url || "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80"}
                      alt={auc.item?.title}
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
                        {auc.viewers_count || 0} assistindo
                      </span>
                    </div>

                    {/* Card Bottom Content (Absolute Overlaid) */}
                    <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col justify-end">
                      
                      {/* Category Tag */}
                      <span className="text-[9px] font-extrabold tracking-[1px] uppercase text-[#1B59F8] bg-white rounded-sm px-2 py-0.5 w-fit mb-2">
                        {auc.item?.category_label || "Lote"}
                      </span>

                      {/* Title */}
                      <h3 className="text-white font-extrabold text-base lg:text-lg truncate drop-shadow-sm mb-3">
                        {auc.item?.title}
                      </h3>

                      {/* Bid & Time Info */}
                      <div className="flex justify-between items-center border-t border-white/10 pt-3">
                        <div>
                          <p className="text-[9px] text-gray-300 font-bold uppercase tracking-wider mb-0.5">
                            Lance Atual
                          </p>
                          <div className="text-base font-black transition-all duration-300 flex items-center gap-1 text-white">
                            {formatCurrency(currentPrice)}
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <p className="text-[9px] text-gray-300 font-bold uppercase tracking-wider mb-0.5">
                            Tempo
                          </p>
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-sm">
                            <Clock size={11} className="text-red-400" />
                            {timeLeftStr}
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
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>

          {/* Right: Premium Activity Sidebar (rounded-sm) */}
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
            className="w-full lg:w-[380px] shrink-0 flex flex-col lg:h-0 lg:min-h-full"
          >
            <div className="bg-[#0C1B33] rounded-xl p-6 flex flex-col justify-between h-full text-white border border-slate-800 shadow-lg relative overflow-hidden">
              
              {/* Header Widget */}
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex justify-between items-center mb-6 shrink-0">
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
                <div className="space-y-4 relative flex-1 overflow-y-auto pr-2 flex flex-col justify-start">
                  {activities.length > 0 && <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-slate-800 z-0"></div>}
                  
                  {activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center opacity-60 py-10 my-auto">
                      <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-3">
                        <Activity size={20} className="text-slate-400" />
                      </div>
                      <p className="text-[13px] font-bold text-slate-300">Sem atividade recente</p>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
                        Fique atento, os lances em tempo real aparecerão aqui.
                      </p>
                    </div>
                  ) : (
                    activities.map((act: any, index: number) => (
                    <Link key={act.id} href={`/auctions/${act.auction_id}`}>
                      <div
                        className={`relative z-10 flex gap-3.5 items-start transition-all duration-300 ${
                          index === 0 ? "animate-fade-in-up" : "opacity-75"
                        } hover:opacity-100 mb-4 cursor-pointer`}
                      >
                        {/* Connection node */}
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 border-[#0C1B33] shadow-xs ${
                            index === 0 ? "bg-primary text-white" : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          <TrendingUp size={10} />
                        </div>

                        <div className="flex-1">
                          <p className="text-[12px] text-slate-300 leading-tight">
                            <span className="font-extrabold text-white">{act.bidder?.username || 'Usuário'}</span> deu lance em{" "}
                            <span className="font-bold text-slate-200">{act.auction_title?.substring(0, 20)}...</span>
                          </p>
                          <p className={`text-[12px] font-black mt-0.5 ${index === 0 ? "text-green-400" : "text-slate-300"}`}>
                            {formatCurrency(act.amount)}
                          </p>
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 whitespace-nowrap pt-1">
                          {getTimeAgo(act.created_at)}
                        </div>
                      </div>
                    </Link>
                  )))}
                </div>
              </div>

              {/* Sidebar Action Footer */}
              <div className="pt-6 border-t border-slate-800 mt-6 shrink-0">
                <div className="bg-slate-900/50 p-4 rounded-sm border border-slate-800 mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Cadastrados</span>
                    <span className="text-lg font-black text-white">{totalAuctionsCount} lotes</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Ativos Agora</span>
                    <span className="text-lg font-black text-primary">{activeAuctionsCount} ativos</span>
                  </div>
                </div>

                <button className="w-full bg-white hover:bg-slate-100 text-[#0C1B33] font-bold text-xs tracking-[1px] uppercase py-3.5 rounded-sm transition-all text-center flex items-center justify-center gap-2">
                  Ver Todos os Leilões
                  <Play size={10} className="fill-[#0C1B33] stroke-[#0C1B33]" />
                </button>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
