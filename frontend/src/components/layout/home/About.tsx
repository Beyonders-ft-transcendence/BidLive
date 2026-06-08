import Image from "next/image";
import {
  UserPlus,
  Gavel,
} from "lucide-react";
import aboutImg from "@/assets/images/hero_bg.png"



export default function AboutSection() {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          {/* LEFT SIDE */}
          <div className="relative">
            <div className="relative w-full max-w-[540px]">
              
              {/* Imagem principal */}
              <div className="relative h-[500px] overflow-hidden">
                <Image
                  src={aboutImg.src}
                  alt="Leilões"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Imagem flutuante */}
              <div className="absolute top-10 left-[-40px] w-[220px] h-[260px] bg-white p-3 shadow-xl">
                <div className="relative w-full h-full">
                  <Image
                    src={aboutImg.src}
                    alt="Equipe"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Experience Box */}
              <div className="absolute bottom-0 left-[-30px] bg-white px-8 py-6 shadow-lg">
                <h3 className="text-5xl font-bold text-[#0C263A]">
                  20<span className="text-primary">+</span>
                </h3>

                <p className="text-sm text-gray-500 mt-2">
                  Anos de
                  <br />
                  Experiência
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div>
            {/* Subtitle */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-[2px] bg-primary" />
              <span className="text-sm font-medium text-gray-500">
                Como Funciona
              </span>
            </div>

            {/* Title */}
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-[#0C263A]">
             Participe dos Nossos Leilões em Apenas Alguns Passos
            </h2>

            {/* Description */}
            <p className="mt-6 text-gray-500 leading-relaxed">
              Nossa plataforma foi desenvolvida para oferecer uma experiência simples, segura e transparente. Cadastre-se, explore os leilões disponíveis, faça seus lances em tempo real e acompanhe cada etapa até o arremate.
            </p>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              
              <div>
                <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mb-4">
                  <UserPlus
                    className="text-primary"
                    size={24}
                  />
                </div>

                <h3 className="text-xl font-semibold text-[#0C263A] mb-3">
                  1. Crie sua Conta
                </h3>

                <p className="text-gray-500 text-sm leading-relaxed">
                  Cadastre-se gratuitamente em poucos minutos, valide seus dados e prepare-se para os leilões.
                </p>
              </div>

              <div>
                <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mb-4">
                  <Gavel
                    className="text-primary"
                    size={24}
                  />
                </div>

                <h3 className="text-xl font-semibold text-[#0C263A] mb-3">
                  2. Dê seus Lances
                </h3>

                <p className="text-gray-500 text-sm leading-relaxed">
                  Acompanhe os leilões ao vivo, faça suas ofertas em tempo real e arremate excelentes oportunidades.
                </p>
              </div>
            </div>

            {/* Button */}
            <button className="mt-10 bg-primary hover:bg-primary-light transition-all px-8 py-4 rounded-full text-sm font-semibold text-white shadow-md shadow-blue-500/20">
              Começar Agora
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}