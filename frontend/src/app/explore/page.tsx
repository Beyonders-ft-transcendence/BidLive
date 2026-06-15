import { 
  ChevronDown, 
  SlidersHorizontal, 
  Bookmark, 
  MapPin, 
  Gavel, 
  Clock, 
  Maximize, 
  Bed, 
  Car,
  Image as ImageIcon,
  Heart,
  Bell
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header"

export default function ExploreUser() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans antialiased">
        
        <Header />
      <div className="max-w-7xl  mx-auto">
        {/* Top Filter Bar */}
        <div className="bg-white rounded-sm p-2.5 mt-8 max-w-4xl mx-auto flex flex-wrap items-center justify-between shadow-sm border border-gray-100 mb-8 mt-2">
          
          <div className="flex items-center flex-1 divide-x divide-gray-100 overflow-x-auto">
            {/* Filter 1 */}
            <div className="px-4 lg:px-8 py-2 flex flex-col cursor-pointer hover:bg-gray-50 rounded-sm transition-colors shrink-0">
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Categoria</span>
              <span className="text-sm font-bold text-[#0C1B33] flex items-center gap-2">
                Todas as Categorias <ChevronDown size={14} className="text-gray-400" />
              </span>
            </div>
            
            {/* Filter 2 */}
            <div className="px-4 lg:px-8 py-2 flex flex-col cursor-pointer hover:bg-gray-50 rounded-sm transition-colors shrink-0">
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Status</span>
              <span className="text-sm font-bold text-[#0C1B33] flex items-center gap-2">
                Leilões Ao Vivo <ChevronDown size={14} className="text-gray-400" />
              </span>
            </div>
            
            {/* Filter 3 */}
            <div className="px-4 lg:px-8 py-2 flex flex-col cursor-pointer hover:bg-gray-50 rounded-sm transition-colors shrink-0">
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Valor Inicial</span>
              <span className="text-sm font-bold text-[#0C1B33] flex items-center gap-2">
                Qualquer Valor <ChevronDown size={14} className="text-gray-400" />
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 pr-2 pl-4 mt-4 lg:mt-0">
            <button className="p-3 border border-gray-200 rounded-sm text-gray-500 hover:bg-gray-50 hover:text-[#0C1B33] transition-colors">
              <SlidersHorizontal size={18} />
            </button>
            <button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-sm text-sm font-bold transition-colors shadow-md shadow-blue-500/10">
              Buscar Lotes!
            </button>
          </div>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          
          {/* Normal Card 1 */}
          <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-100 flex flex-col hover:border-primary/30 transition-colors group">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl lg:text-2xl font-extrabold text-[#0C1B33]">R$ 145.000</h3>
              <button className="text-gray-300 hover:text-red-500 transition-colors">
                <Heart size={20} />
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 font-medium">
              <MapPin size={14} className="text-gray-400" /> São Paulo, SP
            </div>
            
            <div className="w-full h-48 bg-gray-100 rounded-sm mb-4 relative overflow-hidden flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <ImageIcon size={40} className="text-gray-300" />
              <div className="absolute top-3 left-3 bg-white/90 px-2.5 py-1 rounded-sm text-xs font-bold text-[#0C1B33] backdrop-blur-sm shadow-sm">
                Lote #102
              </div>
            </div>
            
            <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed font-medium">
              Toyota Hilux SRV 4x4 2.8 TDI Diesel CD Aut. Veículo impecável, único dono e revisado.
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
              <button className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                Dar Lance
              </button>
              <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                <span className="flex items-center gap-1.5"><Gavel size={14} className="text-gray-400" /> 12</span>
                <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-sm border border-gray-100">
                  <Clock size={14} className="text-primary" /> 02:15:30
                </span>
              </div>
            </div>
          </div>

          {/* Normal Card 2 */}
          <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-100 flex flex-col hover:border-primary/30 transition-colors group">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl lg:text-2xl font-extrabold text-[#0C1B33]">R$ 49.000</h3>
              <button className="text-gray-300 hover:text-red-500 transition-colors">
                <Heart size={20} />
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 font-medium">
              <MapPin size={14} className="text-gray-400" /> Belo Horizonte, MG
            </div>
            
            <div className="w-full h-48 bg-gray-100 rounded-sm mb-4 relative overflow-hidden flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <ImageIcon size={40} className="text-gray-300" />
              <div className="absolute top-3 left-3 bg-white/90 px-2.5 py-1 rounded-sm text-xs font-bold text-[#0C1B33] backdrop-blur-sm shadow-sm">
                Lote #084
              </div>
            </div>
            
            <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed font-medium">
              Honda Civic EXL 2.0 Flex 16V Aut. Excelente estado, com manual e chave reserva.
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
              <button className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                Dar Lance
              </button>
              <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                <span className="flex items-center gap-1.5"><Gavel size={14} className="text-gray-400" /> 8</span>
                <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-sm border border-gray-100">
                  <Clock size={14} className="text-primary" /> 04:30:00
                </span>
              </div>
            </div>
          </div>

          {/* Featured Card (Spans 2 columns) */}
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 col-span-1 md:col-span-2 xl:col-span-2 flex flex-col xl:flex-row gap-6 hover:border-primary/30 transition-colors group">
            
            {/* Left: Images */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="w-full h-48 xl:h-[220px] bg-gray-100 rounded-sm relative overflow-hidden flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <ImageIcon size={48} className="text-gray-300" />
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1 rounded-sm text-xs font-bold flex items-center gap-1.5 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Ao Vivo
                  </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 h-20 bg-gray-100 rounded-sm flex items-center justify-center hover:bg-gray-200 cursor-pointer transition-colors">
                  <ImageIcon size={24} className="text-gray-300" />
                </div>
                <div className="flex-1 h-20 bg-gray-100 rounded-sm flex items-center justify-center hover:bg-gray-200 cursor-pointer transition-colors">
                  <ImageIcon size={24} className="text-gray-300" />
                </div>
              </div>
            </div>
            
            {/* Right: Info */}
            <div className="flex-1 flex flex-col pt-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl xl:text-[28px] font-extrabold text-[#0C1B33]">R$ 1.250.000</h3>
                <button className="text-red-500 hover:text-red-600 transition-colors">
                  <Bookmark size={24} fill="currentColor" />
                </button>
              </div>
              
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 font-medium">
                <MapPin size={14} className="text-gray-400" /> Alphaville, Barueri - SP
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 gap-y-4 gap-x-2 mb-6 border-y border-gray-50 py-4">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Área Total</p>
                  <p className="text-sm font-bold text-[#0C1B33] flex items-center gap-1.5"><Maximize size={14} className="text-gray-400"/> 450 m²</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Quartos</p>
                  <p className="text-sm font-bold text-[#0C1B33] flex items-center gap-1.5"><Bed size={14} className="text-gray-400"/> 4 Suítes</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Vagas</p>
                  <p className="text-sm font-bold text-[#0C1B33] flex items-center gap-1.5"><Car size={14} className="text-gray-400"/> 6 Vagas</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Lances</p>
                  <p className="text-sm font-bold text-[#0C1B33] flex items-center gap-1.5"><Gavel size={14} className="text-gray-400"/> 34 Lances</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Visão Geral</p>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 font-medium">
                  Casa de alto padrão em condomínio fechado, projeto arquitetônico moderno, acabamento premium. Piscina borda infinita, área gourmet completa e vista definitiva para a reserva ambiental.
                </p>
              </div>

              <div className="mt-auto flex items-center gap-3">
                <button className="flex-1 bg-primary hover:bg-primary/90 text-white py-3.5 rounded-sm text-sm font-bold transition-colors shadow-md shadow-blue-500/10">
                  Dar Lance Agora
                </button>
                <div className="bg-red-50 border border-red-100 px-4 py-3.5 rounded-sm flex items-center gap-2 text-sm font-bold text-red-600">
                  <Clock size={16} /> 00:12:45
                </div>
              </div>
            </div>
          </div>

          {/* Normal Card 3 */}
          <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-100 flex flex-col hover:border-primary/30 transition-colors group">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl lg:text-2xl font-extrabold text-[#0C1B33]">R$ 47.000</h3>
              <button className="text-gray-300 hover:text-red-500 transition-colors">
                <Heart size={20} />
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 font-medium">
              <MapPin size={14} className="text-gray-400" /> Curitiba, PR
            </div>
            
            <div className="w-full h-48 bg-gray-100 rounded-sm mb-4 relative overflow-hidden flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <ImageIcon size={40} className="text-gray-300" />
              <div className="absolute top-3 left-3 bg-white/90 px-2.5 py-1 rounded-sm text-xs font-bold text-[#0C1B33] backdrop-blur-sm shadow-sm">
                Lote #214
              </div>
            </div>
            
            <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed font-medium">
              Volkswagen Golf Highline 1.4 TSI Aut. Teto solar, bancos em couro, revisões na concessionária.
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
              <button className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                Dar Lance
              </button>
              <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                <span className="flex items-center gap-1.5"><Gavel size={14} className="text-gray-400" /> 5</span>
                <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-sm border border-gray-100">
                  <Clock size={14} className="text-primary" /> 1 dia
                </span>
              </div>
            </div>
          </div>

          {/* Normal Card 4 */}
          <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-100 flex flex-col hover:border-primary/30 transition-colors group">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl lg:text-2xl font-extrabold text-[#0C1B33]">R$ 57.000</h3>
              <button className="text-gray-300 hover:text-red-500 transition-colors">
                <Heart size={20} />
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 font-medium">
              <MapPin size={14} className="text-gray-400" /> Rio de Janeiro, RJ
            </div>
            
            <div className="w-full h-48 bg-gray-100 rounded-sm mb-4 relative overflow-hidden flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <ImageIcon size={40} className="text-gray-300" />
              <div className="absolute top-3 left-3 bg-white/90 px-2.5 py-1 rounded-sm text-xs font-bold text-[#0C1B33] backdrop-blur-sm shadow-sm">
                Lote #301
              </div>
            </div>
            
            <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed font-medium">
              Jeep Renegade Sport 1.8 Flex Aut. Único dono, IPVA pago, estado de zero.
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
              <button className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                Dar Lance
              </button>
              <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                <span className="flex items-center gap-1.5"><Gavel size={14} className="text-gray-400" /> 18</span>
                <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-sm border border-gray-100">
                  <Clock size={14} className="text-primary" /> 00:05:00
                </span>
              </div>
            </div>
          </div>
          
          {/* Normal Card 5 */}
          <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-100 flex flex-col hover:border-primary/30 transition-colors group">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl lg:text-2xl font-extrabold text-[#0C1B33]">R$ 36.000</h3>
              <button className="text-gray-300 hover:text-red-500 transition-colors">
                <Heart size={20} />
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 font-medium">
              <MapPin size={14} className="text-gray-400" /> Porto Alegre, RS
            </div>
            
            <div className="w-full h-48 bg-gray-100 rounded-sm mb-4 relative overflow-hidden flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <ImageIcon size={40} className="text-gray-300" />
              <div className="absolute top-3 left-3 bg-white/90 px-2.5 py-1 rounded-sm text-xs font-bold text-[#0C1B33] backdrop-blur-sm shadow-sm">
                Lote #045
              </div>
            </div>
            
            <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed font-medium">
              Chevrolet Tracker 1.2 Turbo Premier. Completa, multimidia e câmera de ré.
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
              <button className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                Dar Lance
              </button>
              <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                <span className="flex items-center gap-1.5"><Gavel size={14} className="text-gray-400" /> 3</span>
                <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-sm border border-gray-100">
                  <Clock size={14} className="text-primary" /> 2 dias
                </span>
              </div>
            </div>
          </div>

          {/* Normal Card 6 */}
          <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-100 flex flex-col hover:border-primary/30 transition-colors group">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl lg:text-2xl font-extrabold text-[#0C1B33]">R$ 25.000</h3>
              <button className="text-gray-300 hover:text-red-500 transition-colors">
                <Heart size={20} />
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 font-medium">
              <MapPin size={14} className="text-gray-400" /> Florianópolis, SC
            </div>
            
            <div className="w-full h-48 bg-gray-100 rounded-sm mb-4 relative overflow-hidden flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <ImageIcon size={40} className="text-gray-300" />
              <div className="absolute top-3 left-3 bg-white/90 px-2.5 py-1 rounded-sm text-xs font-bold text-[#0C1B33] backdrop-blur-sm shadow-sm">
                Lote #190
              </div>
            </div>
            
            <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed font-medium">
              Hyundai HB20 1.0 Comfort Plus. Excelente oportunidade para revenda ou uso particular.
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
              <button className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                Dar Lance
              </button>
              <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                <span className="flex items-center gap-1.5"><Gavel size={14} className="text-gray-400" /> 22</span>
                <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-sm border border-gray-100">
                  <Clock size={14} className="text-primary" /> 00:20:10
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
