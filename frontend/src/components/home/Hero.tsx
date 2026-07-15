import { useState, useEffect, useCallback } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function Hero() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const slides = [
    {
      tagline: t("home.slides.0.tagline", "Plataforma Segura, Transparente e em Tempo Real."),
      title: t("home.slides.0.title", "Leilões Online Exclusivos e em Tempo Real"),
      description: t("home.slides.0.description", "Participe de leilões ao vivo e conquiste imóveis, veículos, eletrônicos e muito mais em uma plataforma segura e transparente."),
      cta: t("home.slides.0.cta", "Explorar Leilões Agora"),
      link: "/leiloes"
    },
    {
      tagline: t("home.slides.1.tagline", "Oportunidades Únicas a Cada Dia."),
      title: t("home.slides.1.title", "Dê Lances e Conquiste os Melhores Negócios"),
      description: t("home.slides.1.description", "Acompanhe disputas ao vivo, faça seus lances em tempo real e garanta produtos com valores muito abaixo do mercado."),
      cta: t("home.slides.1.cta", "Ver Leilões Ao Vivo"),
      link: "/leiloes?status=live"
    },
    {
      tagline: t("home.slides.2.tagline", "Cadastro Gratuito e Sem Complicações."),
      title: t("home.slides.2.title", "Crie Sua Conta e Comece a Dar Lances Hoje"),
      description: t("home.slides.2.description", "Registre-se gratuitamente, explore centenas de lotes disponíveis e participe dos leilões mais disputados do Brasil."),
      cta: t("home.slides.2.cta", "Criar Conta Grátis"),
      link: "/signup"
    },
  ];

  const go = useCallback((index: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent((index + slides.length) % slides.length);
      setAnimating(false);
    }, 300); // 300ms matches the fade out duration
  }, [animating, slides.length]);

  useEffect(() => {
    const timer = setInterval(() => go(current + 1), 5500);
    return () => clearInterval(timer);
  }, [current, go]);

  const slide = slides[current];

  return (
    <section id="home" className="relative h-[520px] lg:h-[600px] w-7xl mx-auto mt-4 rounded-xl overflow-hidden border-b border-border/50">
      
      {/* Background */}
      <div className="absolute inset-0 bg-muted">
        <img
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1920&q=80"
          alt="Hero background"
          className="w-full h-full object-cover object-center"
        />

      </div>

      {/* Hero Card */}
      <div className="absolute inset-x-0 bottom-8 sm:bottom-12 z-10 flex justify-center px-4 sm:px-6 pointer-events-none">
        <div className="bg-card/95 backdrop-blur-md rounded-xl shadow-2xl px-6 lg:px-8 py-6 lg:py-7 flex flex-col items-center text-center overflow-hidden border border-border/50 relative max-w-xl w-full pointer-events-auto">
          
          <div
            className={`flex flex-col items-center w-full transition-all duration-300 ease-in-out ${animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
          >
            {/* Content: tagline + title + description + CTA */}
            <div className="flex flex-col items-center gap-3.5 min-w-0">
              <div className="flex flex-col items-center">
                  <p className="text-[10px] sm:text-[11px] font-bold tracking-[1.8px] uppercase text-primary mb-1.5">
                    {slide.tagline}
                  </p>
                  <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black leading-tight text-foreground tracking-tight">
                    {slide.title}
                  </h1>
              </div>

              <div className="w-10 h-1 bg-primary/20 rounded-full my-0.5" />

              <p className="text-[13px] sm:text-sm text-muted-foreground font-medium leading-relaxed max-w-md">
                {slide.description}
              </p>

              <div className="mt-2">
                  <Link 
                    to={slide.link}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold tracking-wider uppercase px-8 py-3.5 rounded-md transition-all shadow-md shadow-primary/20 whitespace-nowrap"
                  >
                    {slide.cta}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slider arrows */}
      <div className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
        <button
          onClick={() => go(current + 1)}
          className="w-12 h-12 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary/90 hover:scale-105 transition-all"
        >
          <ChevronRight size={24} className="text-primary-foreground stroke-[2.5]" />
        </button>
        <button
          onClick={() => go(current - 1)}
          className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-md flex items-center justify-center hover:bg-accent hover:scale-105 transition-all"
        >
          <ChevronLeft size={24} className="text-foreground stroke-[2.5]" />
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 right-8 flex items-center gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === current ? "w-8 bg-primary" : "w-2.5 bg-primary/30 hover:bg-primary/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
