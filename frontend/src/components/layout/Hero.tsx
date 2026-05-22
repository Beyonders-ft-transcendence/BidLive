import Image from "next/image";
import herobcg from "@/assets/images/hero-img.jpg";

export default function HeroSection() {
    return (
        <section className="py-8 bg-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[420px] max-w-7xl mx-auto">

                {/* Search Card */}
                <div className="bg-white rounded-md shadow-sm border border-gray-100 p-5 flex flex-col justify-between">

                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-4">
                            Encontrar Leilões
                        </h3>

                        <div className="space-y-3">

                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">
                                    Categoria
                                </label>

                                <select className="w-full border rounded-md border-gray-300 px-3 py-2 text-sm outline-none0">
                                    <option>Todos</option>
                                    <option>Imóveis</option>
                                    <option>Veículos</option>
                                    <option>Tecnologia</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">
                                    Localização
                                </label>

                                <input
                                    type="text"
                                    placeholder="Digite a cidade"
                                    className="w-full border rounded-md px-3 py-2 text-sm outline-none border-gray-300"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">
                                    Tipo
                                </label>

                                <select className="w-full border rounded-md px-3 py-2 text-sm outline-none border-gray-300">
                                    <option>Ao Vivo</option>
                                    <option>Agendado</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-3 rounded-md transition">
                        Procurar
                    </button>
                </div>

                {/* Main Hero Banner */}
                <div className="lg:col-span-3 relative overflow-hidden rounded-md">

                    {/* Background */}
                    <Image
                        src={herobcg}
                        alt="Hero Background"
                        fill
                        className="object-cover"
                        priority
                    />

                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-black/45" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">

                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 max-w-2xl leading-tight">
                            Os Melhores Leilões Online
                        </h1>

                        <p className="text-gray-200 text-sm md:text-base mb-6 max-w-xl">
                            Participe de leilões em tempo real e descubra oportunidades exclusivas.
                        </p>

                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-sm font-medium transition">
                            Explorar Agora
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}