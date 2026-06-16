"use client";

import { useState, useEffect } from "react";
import { 
  FiUser, 
  FiHeart, 
  FiGlobe, 
  FiSearch, 
  FiMenu,
  FiHome,
  FiGrid,
  FiList,
  FiPlus,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";
import { FaCoins, FaGavel, FaBoxOpen } from "react-icons/fa";
import { useAuctionsQuery, useFeaturedAuctionsQuery } from "@/hooks/useAuction";
import { useCategoriesQuery } from "@/hooks/useCategory";
import type { Auction, AuctionCategory } from "@/types/auction.types";
import Footer from "@/components/layout/Footer";
import icon from "@/assets/images/icon.png"
import Image from "next/image"

function CountdownTimer({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(endTime) - +new Date();
      if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    // Use a timeout to avoid calling setState synchronously within the effect body
    const timeout = setTimeout(() => {
      setTimeLeft(calculateTime());
    }, 0);

    const interval = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [endTime]);

  if (!timeLeft) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full justify-center">
      <div className="bg-gray-800/80 backdrop-blur-sm text-white flex flex-col items-center justify-center w-10 h-12 rounded-sm shadow-lg border border-gray-600/50">
        <span className="text-sm font-bold leading-none mt-1">{pad(timeLeft.days)}</span>
        <span className="text-[7px] text-gray-300 mt-1 tracking-wider">DIAS</span>
      </div>
      <div className="bg-gray-800/80 backdrop-blur-sm text-white flex flex-col items-center justify-center w-10 h-12 rounded-sm shadow-lg border border-gray-600/50">
        <span className="text-sm font-bold leading-none mt-1">{pad(timeLeft.hours)}</span>
        <span className="text-[7px] text-gray-300 mt-1 tracking-wider">HORAS</span>
      </div>
      <div className="bg-gray-800/80 backdrop-blur-sm text-white flex flex-col items-center justify-center w-10 h-12 rounded-sm shadow-lg border border-gray-600/50">
        <span className="text-sm font-bold leading-none mt-1">{pad(timeLeft.minutes)}</span>
        <span className="text-[7px] text-gray-300 mt-1 tracking-wider">MIN</span>
      </div>
      <div className="bg-gray-800/80 backdrop-blur-sm text-white flex flex-col items-center justify-center w-10 h-12 rounded-sm shadow-lg border border-gray-600/50">
        <span className="text-sm font-bold leading-none mt-1">{pad(timeLeft.seconds)}</span>
        <span className="text-[7px] text-gray-300 mt-1 tracking-wider">SEG</span>
      </div>
    </div>
  );
}

export default function Home() {
  // Estados para filtros e paginação
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [ordering, setOrdering] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(16);

  // Queries react-query
  const { data: categoriesData, isLoading: categoriesLoading } = useCategoriesQuery();
  const { data: featuredData } = useFeaturedAuctionsQuery();
  const { data: auctionsData, isLoading: auctionsLoading } = useAuctionsQuery({
    search: appliedSearch || undefined,
    category_id: selectedCategoryId || undefined,
    ordering: ordering || undefined,
    page: page,
    page_size: pageSize,
  });

  // Mapear leilões em destaque (bestSellers)
  const bestSellers = (featuredData?.results || []).slice(0, 4).map((auction: Auction) => {
    const item = auction.item || {};
    const primaryImg = item.images?.find((img) => img.is_primary)?.file?.url || item.images?.[0]?.file?.url || null;
    
    return {
      id: auction.id,
      name: item.title || "Leilão sem título",
      price: item.current_price ? `${parseFloat(item.current_price).toLocaleString('pt-AO')} Kz` : "0 Kz",
      oldPrice: item.buy_now_price ? `${parseFloat(item.buy_now_price).toLocaleString('pt-AO')} Kz` : null,
      imageUrl: primaryImg,
      icon: FaBoxOpen,
    };
  });

  // Mapear leilões da listagem principal
  const products = (auctionsData?.results || []).map((auction: Auction) => {
    const item = auction.item || {};
    const primaryImg = item.images?.find((img) => img.is_primary)?.file?.url || item.images?.[0]?.file?.url || null;
    
    const badges: string[] = [];
    if (item.condition_type === "NEW") badges.push("NOVO");

    return {
      id: auction.id,
      name: item.title || "Leilão sem título",
      price: item.current_price ? `${parseFloat(item.current_price).toLocaleString('pt-AO')} Kz` : "0 Kz",
      oldPrice: item.buy_now_price ? `${parseFloat(item.buy_now_price).toLocaleString('pt-AO')} Kz` : null,
      badges,
      hasTimer: auction.status === "LIVE",
      endTime: auction.end_time,
      icon: FaBoxOpen,
      imageUrl: primaryImg,
      status: auction.status,
    };
  });

  // Lógica de pesquisa
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchQuery);
    setPage(1);
  };

  // Cálculo de Paginação
  const totalCount = auctionsData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const startIndex = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalCount);

  return (
    <div className="w-full bg-[#f8f9fa] min-h-screen font-sans">
      {/* TOP BAR */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto flex h-10 items-center justify-between px-4">
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span className="rounded bg-primary px-2 py-1 text-white font-medium shadow-sm">
              AO VIVO
            </span>
            <p className="font-medium">
              Acompanhe os melhores leilões em tempo real.
            </p>
          </div>
          <ul className="flex items-center gap-6 text-xs text-gray-600 font-medium">
            <li className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
              <FiUser size={14} />
              <span>Minha Conta</span>
            </li>
            <li className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
              <FiHeart size={14} />
              <span>Favoritos</span>
            </li>
            <li className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
              <FiGlobe size={14} />
              <select className="bg-transparent outline-none cursor-pointer text-gray-600 hover:text-primary transition-colors">
                <option value="pt">Português</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </li>
            <li className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
              <FaCoins size={14} />
              <select className="bg-transparent outline-none cursor-pointer text-gray-600 hover:text-primary transition-colors">
                <option value="aoa">Kz (AOA)</option>
                <option value="usd">USD ($)</option>
                <option value="eur">EUR (€)</option>
              </select>
            </li>
          </ul>
        </div>
      </div>

      {/* MAIN HEADER */}
      <header className="bg-white border-b border-gray-100 shadow-sm relative z-20">
        <div className="max-w-7xl mx-auto flex h-24 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div>
              <Image src={icon} alt="BidLive" width={120} height={36} className="h-9 w-auto object-contain" />
            </div>
          </div>
          <div className="hidden lg:flex max-w-xl w-full ml-auto">
            <form onSubmit={handleSearchSubmit} className="flex w-full overflow-hidden rounded-sm border-2 border-gray-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all bg-white shadow-sm hover:border-gray-300">
              <select 
                value={selectedCategoryId || ""} 
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value ? Number(e.target.value) : null);
                  setPage(1);
                }}
                className="bg-gray-50 border-r-2 border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <option value="">Todas Categorias</option>
                {categoriesData?.map((cat: AuctionCategory) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <input
                placeholder="Pesquisar leilões..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-5 py-3 text-sm outline-none text-gray-800 placeholder-gray-400 font-medium"
              />
              <button type="submit" className="bg-primary px-8 text-white hover:bg-primary-light transition-colors flex items-center justify-center">
                <FiSearch size={20} />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* NAVBAR */}
      <nav className="bg-gray-900 text-white shadow-xl relative z-10">
        <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-8 h-full">
            <button className="flex items-center gap-2 text-white lg:hidden hover:text-primary transition-colors">
              <FiMenu size={24} />
            </button>
            <ul className="hidden lg:flex items-center h-full">
              <li className="flex items-center h-full border-b-[3px] border-primary px-6 text-sm font-bold text-white cursor-pointer bg-gray-800/50">
                Início
              </li>
              <li className="flex items-center h-full px-6 text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition-all cursor-pointer">
                Leilões
              </li>
              <li className="flex items-center h-full px-6 text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition-all cursor-pointer">
                Categorias
              </li>
              <li className="flex items-center h-full px-6 text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition-all cursor-pointer">
                Como Funciona
              </li>
              <li className="flex items-center h-full px-6 text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition-all cursor-pointer">
                Contacto
              </li>
            </ul>
          </div>
          <button className="flex h-full items-center gap-3 bg-primary px-8 text-sm font-bold text-white hover:bg-primary-light transition-all shadow-lg hover:shadow-primary/40 active:scale-95">
            <FaGavel size={18} />
            Meus Lances
          </button>
        </div>
      </nav>

      {/* NEW LAYOUT (BREADCRUMB + SIDEBAR + GRID) */}
      <main className="max-w-7xl mx-auto px-4 mt-8 pb-12">
        
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2.5 text-xs text-gray-500 mb-6 font-medium">
          <div className="flex items-center text-primary bg-primary/10 px-3.5 py-1.5 rounded-sm cursor-pointer hover:bg-primary hover:text-white transition-colors shadow-sm"
               onClick={() => {
                 setSelectedCategoryId(null);
                 setSearchQuery("");
                 setAppliedSearch("");
                 setOrdering("");
                 setPage(1);
               }}>
            <FiHome size={14} className="mr-2" />
            <span className="hidden sm:inline">Início</span>
          </div>
          <span className="text-gray-300 mx-1">&gt;</span>
          <span className="text-gray-700 bg-white px-4 py-1.5 rounded-sm border border-gray-200 shadow-sm">Todos os Leilões</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-7">
          {/* LEFT SIDEBAR */}
          <aside className="w-full lg:w-[260px] flex-shrink-0 flex flex-col gap-7">
            
            {/* CATEGORIES */}
            <div className="border border-gray-200 bg-white rounded-sm shadow-sm overflow-hidden">
              <div className="bg-primary text-white font-bold px-5 py-3.5 text-[13px] tracking-wide shadow-sm">
                CATEGORIAS
              </div>
              <ul className="flex flex-col text-[13px] text-gray-600">
                {categoriesLoading ? (
                  <div className="px-5 py-4 text-gray-400 animate-pulse">A carregar categorias...</div>
                ) : categoriesData && categoriesData.length > 0 ? (
                  categoriesData.map((cat: AuctionCategory) => (
                    <li 
                      key={cat.id} 
                      onClick={() => {
                        setSelectedCategoryId(cat.id === selectedCategoryId ? null : cat.id);
                        setPage(1);
                      }}
                      className={`flex justify-between items-center px-5 py-3.5 border-b border-gray-100 hover:text-primary hover:bg-gray-50 cursor-pointer transition-colors group ${selectedCategoryId === cat.id ? 'text-primary bg-primary/5 font-bold' : ''}`}
                    >
                      {cat.name} 
                      <span className={`text-gray-400 group-hover:text-primary transition-colors border border-gray-200 group-hover:border-primary/30 rounded-sm p-0.5 shadow-sm bg-white ${selectedCategoryId === cat.id ? 'text-primary border-primary/30' : ''}`}><FiPlus size={10} /></span>
                    </li>
                  ))
                ) : (
                  <div className="px-5 py-4 text-gray-400">Nenhuma categoria encontrada</div>
                )}
              </ul>
            </div>

            {/* BEST SELLERS / LANCES EM DESTAQUE */}
            <div className="border border-gray-200 bg-white rounded-sm shadow-sm overflow-hidden hidden md:block">
              <div className="flex justify-between items-center bg-primary text-white font-bold px-5 py-3.5 text-[13px] tracking-wide shadow-sm">
                LANCES EM DESTAQUE
                <div className="flex gap-2">
                   <FiChevronLeft className="cursor-pointer hover:text-white/70 transition-colors" />
                   <FiChevronRight className="cursor-pointer hover:text-white/70 transition-colors" />
                </div>
              </div>
              <div className="p-5 flex flex-col gap-6">
                {bestSellers.length === 0 ? (
                  <div className="text-gray-400 text-xs">Nenhum leilão em destaque</div>
                ) : (
                  bestSellers.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.id} className="flex gap-4 items-center group cursor-pointer">
                        <div className="w-16 h-16 bg-gray-50 border border-gray-100 flex items-center justify-center p-0 group-hover:border-primary/50 transition-colors rounded-sm shadow-sm overflow-hidden">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                          ) : (
                            <Icon size={24} className="text-gray-300 group-hover:text-primary/70 transition-colors" />
                          )}
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="text-[13px] text-gray-800 font-semibold leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">{item.name}</span>
                          <div className="flex items-center gap-2 text-sm mt-0.5">
                            <span className="text-primary font-black">{item.price}</span>
                            {item.oldPrice && <span className="text-gray-400 line-through text-[11px] font-medium">{item.oldPrice}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            {/* BANNER AD */}
            <div className="bg-[#46f1f9] text-center p-6 flex flex-col items-center justify-center rounded-sm shadow-sm min-h-[260px] relative overflow-hidden hidden md:flex cursor-pointer hover:opacity-95 transition-opacity group">
              <div className="relative z-10 transform group-hover:scale-105 transition-transform duration-500">
                <h3 className="text-[28px] font-black text-gray-800 leading-none">ATÉ <br/><span className="text-primary bg-white px-3 py-1 inline-block mt-2 shadow-sm">50% DESC.</span></h3>
                <p className="text-[11px] font-black text-gray-800 mt-4 tracking-widest bg-white/50 px-2 py-1 rounded-sm backdrop-blur-sm inline-block uppercase">Veículos Recuperados</p>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* TOP BANNER */}
            <div className="bg-[#e9e8e3] p-10 flex items-center justify-between rounded-sm shadow-sm relative overflow-hidden min-h-[200px]">
              <div className="max-w-xl relative z-10">
                <h2 className="text-[32px] font-black text-gray-800 mb-4 tracking-tight leading-none uppercase">LEILÕES DE <span className="text-primary">VEÍCULOS & IMÓVEIS</span></h2>
                <p className="text-[13px] text-gray-600 leading-relaxed font-medium">Participe dos melhores leilões de veículos recuperados, frotas empresariais e imóveis de desinvestimento. Faça o seu lance agora e garanta excelentes oportunidades de negócio com total segurança e transparência.</p>
              </div>
            </div>

            {/* TOOLBAR TOP */}
            <div className="flex flex-col sm:flex-row items-center justify-between border border-gray-200 p-3.5 bg-white rounded-sm shadow-sm gap-4">
              <div className="flex gap-2">
                 <button className="bg-primary text-white p-2.5 rounded-sm shadow-sm hover:bg-primary-light transition-colors"><FiGrid size={16} /></button>
                 <button className="bg-gray-50 border border-gray-200 text-gray-500 p-2.5 rounded-sm hover:bg-gray-100 transition-colors shadow-sm"><FiList size={16} /></button>
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[13px] text-gray-600 font-medium">
                 <div className="flex items-center gap-2.5">
                   <span>Ordenar por:</span>
                   <select 
                     value={ordering}
                     onChange={(e) => {
                       setOrdering(e.target.value);
                       setPage(1);
                     }}
                     className="border border-gray-300 p-2 px-3 outline-none rounded-sm bg-gray-50 cursor-pointer hover:border-gray-400 focus:border-primary transition-colors min-w-[120px]"
                   >
                     <option value="">Padrão</option>
                     <option value="item__current_price">Preço (Menor)</option>
                     <option value="-item__current_price">Preço (Maior)</option>
                     <option value="end_time">A Terminar em Breve</option>
                   </select>
                 </div>
                 <div className="flex items-center gap-2.5">
                   <span>Mostrar:</span>
                   <select 
                     value={pageSize}
                     onChange={(e) => {
                       setPageSize(Number(e.target.value));
                       setPage(1);
                     }}
                     className="border border-gray-300 p-2 px-3 outline-none rounded-sm bg-gray-50 cursor-pointer hover:border-gray-400 focus:border-primary transition-colors"
                   >
                     <option value={16}>16</option>
                     <option value={32}>32</option>
                     <option value={64}>64</option>
                   </select>
                 </div>
              </div>
            </div>

            {/* PRODUCT GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {auctionsLoading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="border border-gray-200 bg-white p-5 rounded-sm animate-pulse h-[340px] flex flex-col justify-between">
                    <div className="h-40 bg-gray-100 rounded-sm w-full mb-4"></div>
                    <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-100 rounded w-full mt-4"></div>
                  </div>
                ))
              ) : products.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-500 font-medium border border-dashed border-gray-300 bg-white rounded-sm">
                  Nenhum leilão disponível no momento.
                </div>
              ) : (
                products.map((product) => {
                  const Icon = product.icon;
                  return (
                    <div key={product.id} className="border border-gray-200 bg-white p-5 relative flex flex-col group hover:shadow-xl transition-all duration-300 hover:border-primary/50 rounded-sm cursor-pointer h-full">
                      
                      {/* STATUS & EXTRA BADGES */}
                      <div className="absolute top-5 left-5 flex flex-col gap-1.5 z-10">
                        {product.status === "LIVE" && (
                          <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-sm shadow-sm tracking-wider flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                            AO VIVO
                          </span>
                        )}
                        {product.status === "SCHEDULED" && (
                          <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-sm shadow-sm tracking-wider">
                            EM BREVE
                          </span>
                        )}
                        {(product.status === "ENDED" || product.status === "SOLD") && (
                          <span className="bg-gray-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-sm shadow-sm tracking-wider">
                            FINALIZADO
                          </span>
                        )}
                        {product.badges.includes("NOVO") && (
                          <span className="bg-[#00b2f0] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-sm shadow-sm tracking-wider">
                            NOVO
                          </span>
                        )}
                      </div>

                      {/* IMAGE CONTAINER */}
                      <div className="h-44 flex items-center justify-center mb-6 relative bg-white group-hover:scale-105 transition-transform duration-500 overflow-hidden rounded-sm">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full" />
                        ) : (
                          <Icon size={80} className="text-gray-200" />
                        )}
                        
                        {/* COUNTDOWN TIMER OVERLAY FOR LIVE AUCTIONS */}
                        {product.hasTimer && product.endTime && (
                          <CountdownTimer endTime={product.endTime} />
                        )}
                      </div>

                      {/* PRODUCT DETAILS */}
                      <div className="flex flex-col flex-1 justify-end">
                        <h3 className="text-[14px] text-gray-800 font-semibold line-clamp-2 min-h-[40px] mb-4 group-hover:text-primary transition-colors leading-snug">{product.name}</h3>
                        
                        <div className="mt-auto flex items-end justify-between border-t border-gray-100 pt-3">
                          <div className="flex flex-col">
                            <span className="text-primary font-black text-lg leading-none">{product.price}</span>
                            {product.oldPrice && <span className="text-gray-400 line-through text-[11px] mt-1.5 font-medium">{product.oldPrice}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* TOOLBAR BOTTOM & PAGINATION */}
            <div className="flex flex-col sm:flex-row items-center justify-between border border-gray-200 p-3.5 bg-white mt-2 rounded-sm shadow-sm gap-4">
              <div className="flex gap-2">
                 <button 
                   onClick={() => setPage(p => Math.max(1, p - 1))}
                   disabled={page === 1}
                   className="bg-gray-50 border border-gray-200 text-gray-500 p-2.5 rounded-sm hover:bg-gray-100 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   <FiChevronLeft size={16} />
                 </button>
                 
                 {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                   <button
                     key={p}
                     onClick={() => setPage(p)}
                     className={`px-3 py-1.5 text-sm font-semibold rounded-sm transition-colors border ${
                       page === p 
                         ? 'bg-primary border-primary text-white shadow-sm' 
                         : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'
                     }`}
                   >
                     {p}
                   </button>
                 ))}

                 <button 
                   onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                   disabled={page === totalPages}
                   className="bg-gray-50 border border-gray-200 text-gray-500 p-2.5 rounded-sm hover:bg-gray-100 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   <FiChevronRight size={16} />
                 </button>
              </div>
              <div className="text-[13px] text-gray-600 font-medium">
                 A mostrar {startIndex} a {endIndex} de {totalCount} ({totalPages} {totalPages === 1 ? 'Página' : 'Páginas'})
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}