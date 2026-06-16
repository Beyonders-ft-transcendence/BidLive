"use client";

import { useState, useEffect } from "react";
import { 
  FiHome,
  FiGrid,
  FiList,
  FiPlus,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";
import { FaBoxOpen } from "react-icons/fa";
import { useAuctionsQuery, useFeaturedAuctionsQuery } from "@/hooks/useAuction";
import { useCategoriesQuery } from "@/hooks/useCategory";
import type { Auction, AuctionCategory } from "@/types/auction.types";
import Footer from "@/components/layout/Footer";
import HomeHeader from "@/components/layout/home/HomeHeader";
import CountdownTimer from "@/components/common/CountdownTimer";
import Sidebar from "@/components/layout/home/Sidebar";
import ToolbarTop from "@/components/layout/home/ToolbarTop";



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
      {/* HEADER SECTION */}
      <HomeHeader
        categoriesData={categoriesData}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSubmitSearch={handleSearchSubmit}
        setPage={setPage}
      />

      {/* NEW LAYOUT (BREADCRUMB + SIDEBAR + GRID) */}
      <main className="max-w-7xl mx-auto px-4 mt-8 pb-12">
        
        {/* BREADCRUMB */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-[11px] sm:text-xs text-gray-500 mb-4 sm:mb-6 font-medium">
          <div className="flex items-center justify-center text-primary bg-primary/10 px-3 sm:px-3.5 py-1.5 rounded-sm cursor-pointer hover:bg-primary hover:text-white transition-colors shadow-sm"
               onClick={() => {
                 setSelectedCategoryId(null);
                 setSearchQuery("");
                 setAppliedSearch("");
                 setOrdering("");
                 setPage(1);
               }}>
            <FiHome size={14} className="sm:mr-2" />
            <span className="hidden sm:inline">Início</span>
          </div>
          <span className="text-gray-300 mx-0.5 sm:mx-1">&gt;</span>
          <span className="text-gray-700 bg-white px-3 sm:px-4 py-1.5 rounded-sm border border-gray-200 shadow-sm truncate max-w-[200px] sm:max-w-none">Todos os Leilões</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-7">
          {/* LEFT SIDEBAR */}
          <Sidebar
            categoriesData={categoriesData}
            categoriesLoading={categoriesLoading}
            selectedCategoryId={selectedCategoryId}
            setSelectedCategoryId={setSelectedCategoryId}
            setPage={setPage}
            bestSellers={bestSellers}
          />

          {/* MAIN CONTENT */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* TOP BANNER */}
            <div className="bg-[#e9e8e3] p-6 md:p-10 flex items-center justify-between rounded-sm shadow-sm relative overflow-hidden min-h-[160px] md:min-h-[200px]">
              <div className="max-w-xl relative z-10 text-center sm:text-left">
                <h2 className="text-2xl md:text-[32px] font-black text-gray-800 mb-3 md:mb-4 tracking-tight leading-none uppercase">LEILÕES DE <span className="text-primary block sm:inline mt-1 sm:mt-0">VEÍCULOS & IMÓVEIS</span></h2>
                <p className="text-xs md:text-[13px] text-gray-600 leading-relaxed font-medium">Participe dos melhores leilões de veículos recuperados, frotas empresariais e imóveis de desinvestimento. Faça o seu lance agora e garanta excelentes oportunidades de negócio com total segurança e transparência.</p>
              </div>
            </div>

            {/* TOOLBAR TOP */}
            <ToolbarTop 
              ordering={ordering} 
              setOrdering={setOrdering} 
              pageSize={pageSize} 
              setPageSize={setPageSize} 
              setPage={setPage} 
            />

            {/* PRODUCT GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {auctionsLoading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="border border-gray-200 bg-white p-3 sm:p-5 rounded-sm animate-pulse h-[280px] sm:h-[340px] flex flex-col justify-between">
                    <div className="h-32 sm:h-40 bg-gray-100 rounded-sm w-full mb-3 sm:mb-4"></div>
                    <div className="h-3 sm:h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                    <div className="h-3 sm:h-4 bg-gray-100 rounded w-1/2"></div>
                    <div className="h-6 sm:h-8 bg-gray-100 rounded w-full mt-3 sm:mt-4"></div>
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
                    <div key={product.id} className="border border-gray-200 bg-white p-3 sm:p-5 relative flex flex-col group hover:shadow-xl transition-all duration-300 hover:border-primary/50 rounded-sm cursor-pointer h-full">
                      
                      {/* STATUS & EXTRA BADGES */}
                      <div className="absolute top-3 left-3 sm:top-5 sm:left-5 flex flex-col gap-1 sm:gap-1.5 z-10">
                        {product.status === "LIVE" && (
                          <span className="bg-red-600 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 rounded-sm shadow-sm tracking-wider flex items-center gap-1 sm:gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                            AO VIVO
                          </span>
                        )}
                        {product.status === "SCHEDULED" && (
                          <span className="bg-blue-600 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 rounded-sm shadow-sm tracking-wider">
                            EM BREVE
                          </span>
                        )}
                        {(product.status === "ENDED" || product.status === "SOLD") && (
                          <span className="bg-gray-500 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 rounded-sm shadow-sm tracking-wider">
                            FINALIZADO
                          </span>
                        )}
                        {product.badges.includes("NOVO") && (
                          <span className="bg-[#00b2f0] text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 rounded-sm shadow-sm tracking-wider">
                            NOVO
                          </span>
                        )}
                      </div>

                      {/* IMAGE CONTAINER */}
                      <div className="h-32 sm:h-44 flex items-center justify-center mb-3 sm:mb-6 relative bg-white group-hover:scale-105 transition-transform duration-500 overflow-hidden rounded-sm">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full" />
                        ) : (
                          <Icon className="text-gray-200 w-12 h-12 sm:w-20 sm:h-20" />
                        )}
                        
                        {/* COUNTDOWN TIMER OVERLAY FOR LIVE AUCTIONS */}
                        {product.hasTimer && product.endTime && (
                          <CountdownTimer endTime={product.endTime} />
                        )}
                      </div>

                      {/* PRODUCT DETAILS */}
                      <div className="flex flex-col flex-1 justify-end">
                        <h3 className="text-xs sm:text-[14px] text-gray-800 font-semibold line-clamp-2 min-h-[32px] sm:min-h-[40px] mb-2 sm:mb-4 group-hover:text-primary transition-colors leading-snug">{product.name}</h3>
                        
                        <div className="mt-auto flex items-end justify-between border-t border-gray-100 pt-2 sm:pt-3">
                          <div className="flex flex-col w-full">
                            <span className="text-primary font-black text-sm sm:text-lg leading-none">{product.price}</span>
                            {product.oldPrice && <span className="text-gray-400 line-through text-[9px] sm:text-[11px] mt-1 sm:mt-1.5 font-medium">{product.oldPrice}</span>}
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