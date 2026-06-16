import { 
  FiUser, 
  FiHeart, 
  FiGlobe, 
  FiSearch, 
  FiPhone, 
  FiMenu,
  FiHome,
  FiGrid,
  FiList,
  FiPlus,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";
import { FaCoins, FaGavel, FaStar, FaRegStar, FaCamera, FaCar, FaHome, FaBoxOpen } from "react-icons/fa";

const categories = [
  "Veículos e Peças", "Imóveis", "Eletrônicos e Celulares", "Obras de Arte",
  "Joias e Relógios", "Máquinas Industriais", "Equipamentos Agrícolas", "Móveis e Decoração",
  "Moda e Acessórios", "Artigos Colecionáveis", "Instrumentos Musicais", "Artigos Esportivos",
  "Lotes Diversos", "Outros"
];

const bestSellers = [
  { id: 1, name: "Toyota Hilux 2021 4x4", price: "25.000.000 Kz", oldPrice: "30.000.000 Kz", rating: 5, icon: FaCar },
  { id: 2, name: "Apartamento T3 - Talatona", price: "85.000.000 Kz", oldPrice: null, rating: 4, icon: FaHome },
  { id: 3, name: "MacBook Pro M2 16GB", price: "1.200.000 Kz", oldPrice: "1.500.000 Kz", rating: 4, icon: FaBoxOpen },
  { id: 4, name: "Rolex Submariner Date", price: "8.500.000 Kz", oldPrice: "10.000.000 Kz", rating: 5, icon: FaBoxOpen },
];

const products = [
  { id: 1, name: "Toyota Land Cruiser Prado TXL 2020", price: "45.000.000 Kz", oldPrice: "52.000.000 Kz", discount: "-13%", rating: 5, badges: ["DESTAQUE"], hasTimer: true, icon: FaCar },
  { id: 2, name: "Moradia T4 Condomínio Austin", price: "120.000.000 Kz", oldPrice: null, discount: null, rating: 5, badges: ["NOVO", "QUENTE"], hasTimer: true, icon: FaHome },
  { id: 3, name: "iPhone 15 Pro Max 256GB", price: "850.000 Kz", oldPrice: "1.100.000 Kz", discount: "-22%", rating: 4, badges: ["OFERTA"], hasTimer: false, icon: FaBoxOpen },
  { id: 4, name: "Gerador Caterpillar 500kVA", price: "12.000.000 Kz", oldPrice: "15.000.000 Kz", discount: "-20%", rating: 4, badges: [], hasTimer: true, icon: FaBoxOpen },
  
  { id: 5, name: "Lote de 10 Computadores Dell Optiplex", price: "2.500.000 Kz", oldPrice: "3.500.000 Kz", discount: "-28%", rating: 4, badges: ["LIQUIDAÇÃO"], hasTimer: false, icon: FaBoxOpen },
  { id: 6, name: "Terreno 20x30m Benfica", price: "8.000.000 Kz", oldPrice: null, discount: null, rating: 3, badges: [], hasTimer: true, icon: FaHome },
  { id: 7, name: "Camião Basculante Volvo FMX", price: "35.000.000 Kz", oldPrice: "42.000.000 Kz", discount: "-16%", rating: 4, badges: ["OFERTA"], hasTimer: false, icon: FaCar },
  { id: 8, name: "Relógio Audemars Piguet Royal Oak", price: "18.000.000 Kz", oldPrice: null, discount: null, rating: 5, badges: ["PREMIUM"], hasTimer: true, icon: FaBoxOpen },
  
  { id: 9, name: "Escavadora Hidráulica CAT 320", price: "28.000.000 Kz", oldPrice: "35.000.000 Kz", discount: "-20%", rating: 4, badges: [], hasTimer: false, icon: FaCar },
  { id: 10, name: "Mota Yamaha R1 2022", price: "9.500.000 Kz", oldPrice: "12.000.000 Kz", discount: "-20%", rating: 5, badges: ["NOVO"], hasTimer: true, icon: FaCar },
  { id: 11, name: "Apartamento T2 Centralidade do Kilamba", price: "22.000.000 Kz", oldPrice: null, discount: null, rating: 4, badges: [], hasTimer: false, icon: FaHome },
  { id: 12, name: "PlayStation 5 + 2 Comandos", price: "450.000 Kz", oldPrice: "600.000 Kz", discount: "-25%", rating: 5, badges: ["DESTAQUE"], hasTimer: true, icon: FaBoxOpen },
];

function Rating({ value }: { value: number }) {
  return (
    <div className="flex text-yellow-400 text-[11px] mt-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        star <= value ? <FaStar key={star} /> : <FaRegStar key={star} className="text-gray-300" />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="w-full bg-[#f8f9fa] min-h-screen pb-12 font-sans">
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
            <div className="rounded-xl bg-primary p-2.5 text-white shadow-lg shadow-primary/30">
              <FaGavel size={26} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900">
                BID<span className="text-primary">LIVE</span>
              </h1>
            </div>
          </div>
          <div className="hidden lg:flex flex-1 max-w-2xl mx-10">
            <div className="flex w-full overflow-hidden rounded-xl border-2 border-gray-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all bg-white shadow-sm hover:border-gray-300">
              <select className="bg-gray-50 border-r-2 border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 outline-none cursor-pointer hover:bg-gray-100 transition-colors">
                <option>Todas Categorias</option>
                <option>Veículos</option>
                <option>Imóveis</option>
                <option>Eletrônicos</option>
              </select>
              <input
                placeholder="Pesquisar leilões..."
                className="flex-1 px-5 py-3 text-sm outline-none text-gray-800 placeholder-gray-400 font-medium"
              />
              <button className="bg-primary px-8 text-white hover:bg-primary-light transition-colors flex items-center justify-center">
                <FiSearch size={20} />
              </button>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3.5">
              <FiPhone size={22} className="text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-wider text-gray-400 mb-0.5">SUPORTE 24/7</p>
              <p className="font-black text-gray-900 text-sm">+244 900 000 000</p>
            </div>
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
      <main className="max-w-7xl mx-auto px-4 mt-8">
        
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2.5 text-xs text-gray-500 mb-6 font-medium">
          <div className="flex items-center text-primary bg-primary/10 px-3.5 py-1.5 rounded-sm cursor-pointer hover:bg-primary hover:text-white transition-colors shadow-sm">
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
                {categories.map((cat, idx) => (
                  <li key={idx} className="flex justify-between items-center px-5 py-3.5 border-b border-gray-100 hover:text-primary hover:bg-gray-50 cursor-pointer transition-colors group">
                    {cat} 
                    <span className="text-gray-400 group-hover:text-primary transition-colors border border-gray-200 group-hover:border-primary/30 rounded-sm p-0.5 shadow-sm bg-white"><FiPlus size={10} /></span>
                  </li>
                ))}
              </ul>
            </div>

            {/* BEST SELLERS */}
            <div className="border border-gray-200 bg-white rounded-sm shadow-sm overflow-hidden hidden md:block">
              <div className="flex justify-between items-center bg-primary text-white font-bold px-5 py-3.5 text-[13px] tracking-wide shadow-sm">
                LANCES EM DESTAQUE
                <div className="flex gap-2">
                   <FiChevronLeft className="cursor-pointer hover:text-white/70 transition-colors" />
                   <FiChevronRight className="cursor-pointer hover:text-white/70 transition-colors" />
                </div>
              </div>
              <div className="p-5 flex flex-col gap-6">
                {bestSellers.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="flex gap-4 items-center group cursor-pointer">
                      <div className="w-16 h-16 bg-gray-50 border border-gray-100 flex items-center justify-center p-2 group-hover:border-primary/50 transition-colors rounded-sm shadow-sm">
                        <Icon size={24} className="text-gray-300 group-hover:text-primary/70 transition-colors" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <Rating value={item.rating} />
                        <span className="text-[13px] text-gray-800 font-semibold leading-tight mt-1 mb-1 group-hover:text-primary transition-colors line-clamp-2">{item.name}</span>
                        <div className="flex items-center gap-2 text-sm mt-0.5">
                          <span className="text-primary font-black">{item.price}</span>
                          {item.oldPrice && <span className="text-gray-400 line-through text-[11px] font-medium">{item.oldPrice}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* BANNER AD */}
            <div className="bg-[#46f1f9] text-center p-6 flex flex-col items-center justify-center rounded-sm shadow-sm min-h-[260px] relative overflow-hidden hidden md:flex cursor-pointer hover:opacity-95 transition-opacity group">
              <div className="relative z-10 transform group-hover:scale-105 transition-transform duration-500">
                <h3 className="text-[28px] font-black text-gray-800 leading-none">ATÉ <br/><span className="text-primary bg-white px-3 py-1 inline-block mt-2 shadow-sm">50% DESC.</span></h3>
                <p className="text-[11px] font-black text-gray-800 mt-4 tracking-widest bg-white/50 px-2 py-1 rounded-sm backdrop-blur-sm inline-block uppercase">Veículos Recuperados</p>
              </div>
              {/* Decorative elements to match the image's cyan banner style */}
              <div className="absolute -bottom-10 -right-10 opacity-30 transform -rotate-12 group-hover:rotate-0 transition-transform duration-700">
                 <FaCar size={140} className="text-white" />
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
              <div className="hidden md:flex absolute right-10 top-1/2 -translate-y-1/2 items-center justify-center z-10">
                {/* Mock image placeholder */}
                <div className="w-48 h-32 bg-gray-800/10 rounded-lg flex items-center justify-center transform rotate-2 hover:rotate-0 transition-transform duration-500 shadow-xl backdrop-blur-sm border border-white/20">
                  <FaCar size={80} className="text-gray-800" />
                </div>
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
                   <select className="border border-gray-300 p-2 px-3 outline-none rounded-sm bg-gray-50 cursor-pointer hover:border-gray-400 focus:border-primary transition-colors min-w-[120px]">
                     <option>Padrão</option>
                     <option>Preço (Menor)</option>
                     <option>Preço (Maior)</option>
                     <option>A Terminar em Breve</option>
                   </select>
                 </div>
                 <div className="flex items-center gap-2.5">
                   <span>Mostrar:</span>
                   <select className="border border-gray-300 p-2 px-3 outline-none rounded-sm bg-gray-50 cursor-pointer hover:border-gray-400 focus:border-primary transition-colors">
                     <option>16</option>
                     <option>32</option>
                     <option>64</option>
                   </select>
                 </div>
              </div>
            </div>

            {/* PRODUCT GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const Icon = product.icon;
                return (
                  <div key={product.id} className="border border-gray-200 bg-white p-5 relative flex flex-col group hover:shadow-xl transition-all duration-300 hover:border-primary/50 rounded-sm cursor-pointer h-full">
                    
                    {/* BADGES */}
                    <div className="absolute top-5 left-5 flex flex-col gap-1.5 z-10">
                      {product.badges.includes("DESTAQUE") && <span className="bg-[#f06e38] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-sm shadow-sm tracking-wider">DESTAQUE</span>}
                      {product.badges.includes("OFERTA") && <span className="bg-[#f06e38] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-sm shadow-sm tracking-wider">OFERTA</span>}
                      {product.badges.includes("LIQUIDAÇÃO") && <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-sm shadow-sm tracking-wider">LIQUIDAÇÃO</span>}
                      {product.badges.includes("NOVO") && <span className="bg-[#00b2f0] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-sm shadow-sm tracking-wider">NOVO</span>}
                      {product.badges.includes("QUENTE") && <span className="bg-yellow-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-sm shadow-sm tracking-wider">QUENTE</span>}
                      {product.badges.includes("PREMIUM") && <span className="bg-purple-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-sm shadow-sm tracking-wider">PREMIUM</span>}
                    </div>

                    {/* IMAGE CONTAINER */}
                    <div className="h-44 flex items-center justify-center mb-6 relative bg-white group-hover:scale-105 transition-transform duration-500">
                      <Icon size={80} className="text-gray-200" />
                      
                      {/* COUNTDOWN TIMER OVERLAY */}
                      {product.hasTimer && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full justify-center">
                          <div className="bg-gray-800/80 backdrop-blur-sm text-white flex flex-col items-center justify-center w-10 h-12 rounded-sm shadow-lg border border-gray-600/50">
                            <span className="text-sm font-bold leading-none mt-1">01</span>
                            <span className="text-[7px] text-gray-300 mt-1 tracking-wider">DIAS</span>
                          </div>
                          <div className="bg-gray-800/80 backdrop-blur-sm text-white flex flex-col items-center justify-center w-10 h-12 rounded-sm shadow-lg border border-gray-600/50">
                            <span className="text-sm font-bold leading-none mt-1">07</span>
                            <span className="text-[7px] text-gray-300 mt-1 tracking-wider">HORAS</span>
                          </div>
                          <div className="bg-gray-800/80 backdrop-blur-sm text-white flex flex-col items-center justify-center w-10 h-12 rounded-sm shadow-lg border border-gray-600/50">
                            <span className="text-sm font-bold leading-none mt-1">26</span>
                            <span className="text-[7px] text-gray-300 mt-1 tracking-wider">MIN</span>
                          </div>
                          <div className="bg-gray-800/80 backdrop-blur-sm text-white flex flex-col items-center justify-center w-10 h-12 rounded-sm shadow-lg border border-gray-600/50">
                            <span className="text-sm font-bold leading-none mt-1">13</span>
                            <span className="text-[7px] text-gray-300 mt-1 tracking-wider">SEG</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PRODUCT DETAILS */}
                    <div className="flex flex-col flex-1 justify-end">
                      <h3 className="text-[14px] text-gray-800 font-semibold line-clamp-2 min-h-[40px] mb-2 group-hover:text-primary transition-colors leading-snug">{product.name}</h3>
                      <div className="mb-4">
                        <Rating value={product.rating} />
                      </div>
                      
                      <div className="mt-auto flex items-end justify-between border-t border-gray-100 pt-3">
                        <div className="flex flex-col">
                          <span className="text-primary font-black text-lg leading-none">{product.price}</span>
                          {product.oldPrice && <span className="text-gray-400 line-through text-[11px] mt-1.5 font-medium">{product.oldPrice}</span>}
                        </div>
                        {product.discount && (
                          <span className="bg-primary text-white text-[11px] font-bold px-2 py-0.5 rounded-sm shadow-sm">{product.discount}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TOOLBAR BOTTOM */}
            <div className="flex flex-col sm:flex-row items-center justify-between border border-gray-200 p-3.5 bg-white mt-2 rounded-sm shadow-sm gap-4">
              <div className="flex gap-2">
                 <button className="bg-primary text-white p-2.5 rounded-sm shadow-sm hover:bg-primary-light transition-colors"><FiGrid size={16} /></button>
                 <button className="bg-gray-50 border border-gray-200 text-gray-500 p-2.5 rounded-sm hover:bg-gray-100 transition-colors shadow-sm"><FiList size={16} /></button>
              </div>
              <div className="text-[13px] text-gray-600 font-medium">
                 A mostrar 1 a 12 de 12 (1 Página)
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}