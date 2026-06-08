import Image from "next/image";
import {
  Play,
  ArrowRight,
} from "lucide-react";
import heroImage from "@/assets/images/hero_bg.png"

export default function Hero() {
  return (
    <section className="relative h-[850px] overflow-hidden">
      {/* Fundo dividido */}
      <div className="absolute inset-0 flex">
        {/* Lado Azul */}
        <div className="w-2/5 bg-[#0C263A]" />

        {/* Lado Imagem */}
        <div
          className="w-3/5 bg-cover bg-center"
          style={{
            backgroundImage:
              `url(${heroImage.src})`,
          }}
        />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-6">
        <div className="flex items-center h-full">
          
          {/* Card Branco */}
          <div className="bg-white shadow-2xl max-w-xl p-8 lg:p-12 rounded-lg">

            <h1 className="text-3xl lg:text-4xl font-semibold leading-tight text-[#0C263A]">
              Encontre Oportunidades Exclusivas e Participe dos Melhores Leilões Online em Tempo Real
            </h1>

            <p className="mt-6 text-gray-500 leading-relaxed max-w-md">
              Participe de leilões online em tempo real e tenha acesso a imóveis, veículos, equipamentos, eletrônicos e muito mais. Faça lances, acompanhe disputas ao vivo e conquiste os melhores negócios em uma plataforma segura e transparente.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              
              {/* Botão principal */}
              <button className="bg-primary hover:bg-primary-light transition-all rounded-full px-8 py-4 text-sm font-semibold text-white flex items-center gap-2 shadow-md shadow-blue-500/20">
                Explorar Leilões
                <ArrowRight size={18} />
              </button>

              {/* Watch Video */}
              <button className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:shadow-md transition-all">
                  <Play
                    size={16}
                    className="fill-primary text-primary ml-0.5"
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