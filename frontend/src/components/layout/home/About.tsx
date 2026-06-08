import Image from "next/image";
import {
  Users,
  Clock3,
} from "lucide-react";


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
                  src="/images/about-main.jpg"
                  alt="Leilões"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Imagem flutuante */}
              <div className="absolute top-10 left-[-40px] w-[220px] h-[260px] bg-white p-3 shadow-xl">
                <div className="relative w-full h-full">
                  <Image
                    src="/images/about-small.jpg"
                    alt="Equipe"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Experience Box */}
              <div className="absolute bottom-0 left-[-30px] bg-white px-8 py-6 shadow-lg">
                <h3 className="text-5xl font-bold text-[#102A83]">
                  20<span className="text-[#F5B321]">+</span>
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
              <div className="w-10 h-[2px] bg-[#F5B321]" />
              <span className="text-sm font-medium text-gray-500">
                Sobre a Plataforma
              </span>
            </div>

            {/* Title */}
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-[#102A83]">
              A Melhor Plataforma
              <br />
              Para Participar
              <br />
              De Leilões Online
            </h2>

            {/* Description */}
            <p className="mt-6 text-gray-500 leading-relaxed">
              Participe de leilões de imóveis, veículos,
              equipamentos e outros ativos com total segurança,
              transparência e praticidade.
            </p>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              
              <div>
                <div className="w-14 h-14 rounded-full bg-[#F5B321]/15 flex items-center justify-center mb-4">
                  <Users
                    className="text-[#F5B321]"
                    size={24}
                  />
                </div>

                <h3 className="text-xl font-semibold text-[#102A83] mb-3">
                  Equipe Especializada
                </h3>

                <p className="text-gray-500 text-sm leading-relaxed">
                  Suporte especializado para ajudar durante
                  todo o processo de participação nos leilões.
                </p>
              </div>

              <div>
                <div className="w-14 h-14 rounded-full bg-[#F5B321]/15 flex items-center justify-center mb-4">
                  <Clock3
                    className="text-[#F5B321]"
                    size={24}
                  />
                </div>

                <h3 className="text-xl font-semibold text-[#102A83] mb-3">
                  Disponível 24/7
                </h3>

                <p className="text-gray-500 text-sm leading-relaxed">
                  Acesse os leilões a qualquer momento,
                  em qualquer dispositivo e de qualquer lugar.
                </p>
              </div>
            </div>

            {/* Button */}
            <button className="mt-10 bg-[#F5B321] hover:bg-[#e2a51d] transition-all px-8 py-4 rounded-full text-sm font-semibold text-black">
              Saiba Mais
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}