import { FiPlus, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { AuctionCategory } from "@/types/auction.types";

interface SidebarProps {
  categoriesData?: AuctionCategory[];
  categoriesLoading: boolean;
  selectedCategoryId: number | null;
  setSelectedCategoryId: (id: number | null) => void;
  setPage: (page: number) => void;
  bestSellers: any[];
}

export default function Sidebar({
  categoriesData,
  categoriesLoading,
  selectedCategoryId,
  setSelectedCategoryId,
  setPage,
  bestSellers,
}: SidebarProps) {
  return (
    <aside className="w-full lg:w-[260px] flex-shrink-0 flex flex-col gap-5 lg:gap-7">
      {/* CATEGORIES */}
      <div className="border border-slate-800 bg-[#151C2C] rounded-sm shadow-sm overflow-hidden">
        <div className="bg-primary text-white font-bold px-5 py-3.5 text-[13px] tracking-wide shadow-sm">
          CATEGORIAS
        </div>
        <ul className="flex flex-col text-[13px] text-slate-300">
          {categoriesLoading ? (
            <div className="px-5 py-4 text-slate-500 animate-pulse">A carregar categorias...</div>
          ) : categoriesData && categoriesData.length > 0 ? (
            categoriesData.map((cat: AuctionCategory) => (
              <li 
                key={cat.id} 
                onClick={() => {
                  setSelectedCategoryId(cat.id === selectedCategoryId ? null : cat.id);
                  setPage(1);
                }}
                className={`flex justify-between items-center px-5 py-3.5 border-b border-slate-800 hover:text-primary hover:bg-slate-800 cursor-pointer transition-colors group ${selectedCategoryId === cat.id ? 'text-primary bg-primary/10 font-bold' : ''}`}
              >
                {cat.name} 
                <span className={`text-slate-500 group-hover:text-primary transition-colors border border-slate-700 group-hover:border-primary/30 rounded-sm p-0.5 shadow-sm bg-[#0B0F19] ${selectedCategoryId === cat.id ? 'text-primary border-primary/30' : ''}`}><FiPlus size={10} /></span>
              </li>
            ))
          ) : (
            <div className="px-5 py-4 text-slate-500">Nenhuma categoria encontrada</div>
          )}
        </ul>
      </div>

      {/* BEST SELLERS / LANCES EM DESTAQUE */}
      <div className="border border-slate-800 bg-[#151C2C] rounded-sm shadow-sm overflow-hidden hidden md:block">
        <div className="flex justify-between items-center bg-primary text-white font-bold px-5 py-3.5 text-[13px] tracking-wide shadow-sm">
          LANCES EM DESTAQUE
          <div className="flex gap-2">
             <FiChevronLeft className="cursor-pointer hover:text-white/70 transition-colors" />
             <FiChevronRight className="cursor-pointer hover:text-white/70 transition-colors" />
          </div>
        </div>
        <div className="p-5 flex flex-col gap-6">
          {bestSellers.length === 0 ? (
            <div className="text-slate-500 text-xs">Nenhum leilão em destaque</div>
          ) : (
            bestSellers.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex gap-4 items-center group cursor-pointer">
                  <div className="w-16 h-16 bg-[#0B0F19] border border-slate-800 flex items-center justify-center p-0 group-hover:border-primary/50 transition-colors rounded-sm shadow-sm overflow-hidden">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                    ) : (
                      <Icon size={24} className="text-slate-600 group-hover:text-primary/70 transition-colors" />
                    )}
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-[13px] text-slate-200 font-semibold leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">{item.name}</span>
                    <div className="flex items-center gap-2 text-sm mt-0.5">
                      <span className="text-primary font-black">{item.price}</span>
                      {item.oldPrice && <span className="text-slate-500 line-through text-[11px] font-medium">{item.oldPrice}</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* BANNER AD */}
      <div className="bg-linear-to-br from-[#00b2f0] to-blue-600 text-center p-6 flex flex-col items-center justify-center rounded-sm shadow-sm min-h-[260px] relative overflow-hidden hidden md:flex cursor-pointer hover:opacity-95 transition-opacity group">
        <div className="relative z-10 transform group-hover:scale-105 transition-transform duration-500">
          <h3 className="text-[28px] font-black text-white leading-none">ATÉ <br/><span className="text-primary bg-white px-3 py-1 inline-block mt-2 shadow-sm">50% DESC.</span></h3>
          <p className="text-[11px] font-black text-white mt-4 tracking-widest bg-black/20 px-2 py-1 rounded-sm backdrop-blur-sm inline-block uppercase">Veículos Recuperados</p>
        </div>
      </div>
    </aside>
  );
}
