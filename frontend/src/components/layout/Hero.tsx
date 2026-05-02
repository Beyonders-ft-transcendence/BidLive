import Image from "next/image";
import herobcg from "@/assets/images/hero-img.jpg";

export default function HeroSection() {
    return (
        <section className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                {/* Main Banner Card */}
                <div className="lg:col-span-2">
                    <div className="relative h-100 rounded-sm overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-linear-to-r from-slate-900 to-slate-800">
                        {/* Background Image */}
                        <Image 
                            src={herobcg} 
                            alt="Hero Background" 
                            layout="fill" 
                            objectFit="cover"
                            className="opacity-40"
                        />

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-linear-to-r from-slate-900/70 to-transparent"></div>

                        {/* Card Content */}
                        <div className="absolute inset-0 flex flex-col justify-center items-start p-8 md:p-12">
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 max-w-xl">
                                Leilões ao Vivo
                            </h1>
                            <p className="text-lg text-gray-200 mb-8 max-w-md">
                                Participe dos melhores leilões em tempo real e ganhe as melhores oportunidades.
                            </p>
                            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md">
                                Comece Agora
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side Small Cards Grid */}
                <div className="grid grid-cols-2 gap-2">
                    {/* Card 1 */}
                    <div className="rounded-sm overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-linear-to-br from-emerald-500 to-emerald-600 p-4 flex flex-col justify-between text-white">
                        <div>
                            <h3 className="text-sm font-bold mb-1">Ofertas Quentes</h3>
                            <p className="text-xs opacity-90">Maior movimento</p>
                        </div>
                        <button className="self-start px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded transition-colors duration-200 mt-2">
                            Ver
                        </button>
                    </div>

                    {/* Card 2 */}
                    <div className="rounded-sm overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-linear-to-br from-orange-500 to-orange-600 p-4 flex flex-col justify-between text-white">
                        <div>
                            <h3 className="text-sm font-bold mb-1">Próximos Leilões</h3>
                            <p className="text-xs opacity-90">Agendados hoje</p>
                        </div>
                        <button className="self-start px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded transition-colors duration-200 mt-2">
                            Ver
                        </button>
                    </div>

                    {/* Card 3 */}
                    <div className="rounded-sm overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-linear-to-br from-blue-500 to-blue-600 p-4 flex flex-col justify-between text-white">
                        <div>
                            <h3 className="text-sm font-bold mb-1">Minhas Apostas</h3>
                            <p className="text-xs opacity-90">Acompanhe aqui</p>
                        </div>
                        <button className="self-start px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded transition-colors duration-200 mt-2">
                            Ver
                        </button>
                    </div>

                    {/* Card 4 */}
                    <div className="rounded-sm overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-linear-to-br from-purple-500 to-purple-600 p-4 flex flex-col justify-between text-white">
                        <div>
                            <h3 className="text-sm font-bold mb-1">Histórico</h3>
                            <p className="text-xs opacity-90">Seus leilões</p>
                        </div>
                        <button className="self-start px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded transition-colors duration-200 mt-2">
                            Ver
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}