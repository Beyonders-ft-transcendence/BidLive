import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AboutSection() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(0);

  const accordionItems = [
    {
      title: t("home.about.accordion1.title", "Nossa Missão"),
      content: t("home.about.accordion1.content", "Com anos de experiência no mercado, nossa equipe é dedicada a oferecer leilões confiáveis, priorizando transparência, segurança e as melhores oportunidades para nossos usuários."),
    },
    {
      title: t("home.about.accordion2.title", "Nossa Visão"),
      content: t("home.about.accordion2.content", "Ser a maior plataforma de leilões online do Brasil, democratizando o acesso a negócios exclusivos para qualquer pessoa, em qualquer lugar."),
    },
    {
      title: t("home.about.accordion3.title", "Nossos Valores"),
      content: t("home.about.accordion3.content", "Transparência, segurança e inovação guiam cada decisão. Acreditamos em construir relações de longo prazo baseadas em confiança e resultados reais."),
    },
  ];

  return (
    <section id="sobre" className="py-20 lg:py-24 bg-background overflow-hidden border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-14 items-center">

          {/* COLUNA 1 — Texto */}
          <div className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="inline-block bg-primary/10 text-primary text-[11px] font-bold tracking-[1.6px] uppercase px-4 py-1.5 rounded-full border border-primary/20 mb-5">
              {t("home.about.badge", "Sobre Nós")}
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-4xl font-black leading-tight text-foreground tracking-tight mb-5">
              {t("home.about.title", "Transformando a Forma de Participar em Leilões")}
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-8">
              {t("home.about.description", "Desenvolvemos uma plataforma segura e transparente para conectar compradores a oportunidades reais — imóveis, veículos, eletrônicos e muito mais.")}
            </p>

            <button className="bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-bold tracking-[1.4px] uppercase px-8 py-4 rounded-md shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5">
              {t("home.about.cta", "Saiba Mais")}
            </button>
          </div>

          {/* COLUNA 2 — Imagem */}
          <div className="relative rounded-2xl overflow-hidden h-[340px] lg:h-[420px] shadow-2xl shadow-muted/50 border border-border/50 animate-in fade-in zoom-in-95 duration-700 delay-150">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80"
              alt="Plataforma BidLive"
              className="w-full h-full object-cover"
            />
          </div>

          {/* COLUNA 3 — Accordion */}
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
            {accordionItems.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={item.title}
                  onClick={() => setOpenIndex(i)}
                  className={`rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border ${
                    isOpen
                      ? "bg-primary border-primary shadow-lg shadow-primary/20"
                      : "bg-card border-border hover:border-primary/40 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between px-5 py-4 sm:p-5">
                    <span
                      className={`text-[15px] font-bold transition-colors ${
                        isOpen ? "text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      {item.title}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        isOpen ? "bg-white/25" : "bg-primary/10"
                      }`}
                    >
                      {isOpen ? (
                        <ChevronUp size={16} className="text-primary-foreground stroke-[2.5]" />
                      ) : (
                        <ChevronDown size={16} className="text-primary stroke-[2.5]" />
                      )}
                    </div>
                  </div>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 sm:px-5 pb-5 text-sm text-primary-foreground/90 leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
