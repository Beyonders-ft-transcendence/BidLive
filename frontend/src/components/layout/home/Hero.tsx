import Image from "next/image";
import {
  Play,
  ArrowRight,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative h-[850px] overflow-hidden">
      {/* Fundo dividido */}
      <div className="absolute inset-0 flex">
        {/* Lado Azul */}
        <div className="w-1/2 bg-[#102A83]" />

        {/* Lado Imagem */}
        <div
          className="w-1/2 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1600')",
          }}
        />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-6">
        <div className="flex items-center h-full">
          
          {/* Card Branco */}
          <div className="bg-white shadow-2xl max-w-xl p-12 lg:p-16">
            
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#F5B321] mb-5">
              <span className="w-2 h-2 rounded-full bg-[#F5B321]" />
              Plataforma de Leilões Online
            </span>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-[#102A83]">
              Encontre
              <br />
              Grandes
              <br />
              Oportunidades
              <br />
              Em Leilões
            </h1>

            <p className="mt-6 text-gray-500 leading-relaxed max-w-md">
              Descubra imóveis, veículos, equipamentos e muito mais
              através da nossa plataforma moderna de leilões digitais.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              
              {/* Botão principal */}
              <button className="bg-[#F5B321] hover:bg-[#e4a71d] transition-all rounded-full px-8 py-4 text-sm font-semibold text-black flex items-center gap-2">
                Explorar Leilões
                <ArrowRight size={18} />
              </button>

              {/* Watch Video */}
              <button className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:shadow-md transition-all">
                  <Play
                    size={16}
                    className="fill-[#F5B321] text-[#F5B321] ml-0.5"
                  />
                </div>

                <span className="text-sm font-medium text-gray-700">
                  Ver Demonstração
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay opcional */}
      <div className="absolute inset-0 bg-black/5" />
    </section>
  );
}