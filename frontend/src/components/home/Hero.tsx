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
    <section id="home" className="relative h-[520px] lg:h-[600px] w-full overflow-hidden border-b border-border/50">
      
      {/* Background */}
      <div className="absolute inset-0 bg-muted">
        <img
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1920&q=80"
          alt="Hero background"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent dark:from-background/98 dark:via-background/80" />
      </div>

      {/* Hero Card */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-7xl px-4 sm:px-6 lg:px-8 z-10 flex justify-start">
        <div className="bg-card/95 backdrop-blur-md rounded-xl shadow-2xl px-6 lg:px-10 py-8 lg:py-10 flex flex-col lg:flex-row gap-8 lg:gap-10 items-start lg:items-center overflow-hidden min-h-[220px] border border-border/50 relative max-w-3xl">
          
          <div
            className={`flex flex-col lg:flex-row gap-8 lg:gap-10 items-start lg:items-center w-full transition-all duration-300 ease-in-out ${animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
          >
            {/* Content: tagline + title + description + CTA */}
            <div className="flex flex-col gap-4 min-w-0">
              <div>
                  <p className="text-[11px] font-bold tracking-[1.8px] uppercase text-primary mb-2">
                    {slide.tagline}
                  </p>
                  <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black leading-tight text-foreground tracking-tight">
                    {slide.title}
                  </h1>
              </div>

              <div className="w-12 h-1 bg-primary/20 rounded-full my-1" />

              <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed max-w-xl">
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
