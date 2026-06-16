"use client";

import Image from "next/image";
import { FiSearch } from "react-icons/fi";
import icon from "@/assets/images/icon.png";
import type { AuctionCategory } from "@/types/auction.types";

interface MainHeaderProps {
  categoriesData?: AuctionCategory[];
  selectedCategoryId: number | null;
  setSelectedCategoryId: (id: number | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSubmitSearch: (e: React.FormEvent) => void;
  setPage: (page: number) => void;
}

export default function MainHeader({
  categoriesData,
  selectedCategoryId,
  setSelectedCategoryId,
  searchQuery,
  setSearchQuery,
  onSubmitSearch,
  setPage
}: MainHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 shadow-sm relative z-20">
      <div className="max-w-7xl mx-auto flex flex-row min-h-[64px] lg:min-h-[72px] items-center justify-between px-4 py-2.5 lg:py-0 gap-3 sm:gap-4">
        <div className="flex items-center gap-3 flex-shrink-0">
          <div>
            <Image src={icon} alt="BidLive" width={120} height={36} className="h-6 sm:h-[28px] lg:h-[30px] w-auto object-contain" />
          </div>
        </div>
        <div className="flex max-w-xl w-full ml-auto">
          <form onSubmit={onSubmitSearch} className="flex w-full overflow-hidden rounded-sm border-2 border-gray-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all bg-white shadow-sm hover:border-gray-300">
            <select 
              value={selectedCategoryId || ""} 
              onChange={(e) => {
                setSelectedCategoryId(e.target.value ? Number(e.target.value) : null);
                setPage(1);
              }}
              className="hidden sm:block bg-gray-50 border-r-2 border-gray-200 px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-gray-700 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <option value="">Todas Categorias</option>
              {categoriesData?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <input
              placeholder="Pesquisar leilões..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 md:px-5 py-1.5 md:py-2 text-[11px] md:text-sm outline-none text-gray-800 placeholder-gray-400 font-medium"
            />
            <button type="submit" className="bg-primary px-4 md:px-8 text-white hover:bg-primary-light transition-colors flex items-center justify-center">
              <FiSearch className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
