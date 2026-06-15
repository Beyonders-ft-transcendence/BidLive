// components/layout/home/Hero.tsx
"use client";
import Image from "next/image";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import heroImage from "@/assets/images/hero-img.jpg";

const slides = [
  {
    tagline: "Plataforma Segura, Transparente e em Tempo Real.",
    title: "Leilões Online Exclusivos e em Tempo Real",
    description:
      "Participe de leilões ao vivo e conquiste imóveis, veículos, eletrônicos e muito mais em uma plataforma segura e transparente.",
    cta: "Explorar Leilões Agora",
  },
  {
    tagline: "Oportunidades Únicas a Cada Dia.",
    title: "Dê Lances e Conquiste os Melhores Negócios",
    description:
      "Acompanhe disputas ao vivo, faça seus lances em tempo real e garanta produtos com valores muito abaixo do mercado.",
    cta: "Ver Leilões Ao Vivo",
  },
  {
    tagline: "Cadastro Gratuito e Sem Complicações.",
    title: "Crie Sua Conta e Comece a Dar Lances Hoje",
    description:
      "Registre-se gratuitamente, explore centenas de lotes disponíveis e participe dos leilões mais disputados do Brasil.",
    cta: "Criar Conta Grátis",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = useCallback((index: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent((index + slides.length) % slides.length);
      setAnimating(false);
    }, 250);
  }, [animating]);

  useEffect(() => {
    const timer = setInterval(() => go(current + 1), 5500);
    return () => clearInterval(timer);
  }, [current, go]);

  const slide = slides[current];

  return (
    <section id="home" className="relative mt-4 h-[520px] lg:h-[600px] max-w-7xl mx-auto rounded-xl overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt="Hero background"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0C1B33]/70 via-[#0C1B33]/30 to-transparent" />
      </div>

      {/* Hero Card */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-[720px] px-6 lg:px-0 z-10">
        <div
          className={`bg-white rounded-xl shadow-2xl px-8 lg:px-10 py-8 lg:py-9 flex flex-col lg:flex-row gap-8 lg:gap-10 items-start lg:items-center transition-opacity duration-300 ${
            animating ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Left: tagline + title */}
          <div className="flex-[1.2] min-w-0">
            <p className="text-[11px] font-bold tracking-[1.8px] uppercase text-primary mb-3">
              {slide.tagline}
            </p>
            <h1 className="text-2xl lg:text-[28px] font-extrabold leading-tight text-[#0C1B33] tracking-tight">
              {slide.title}
            </h1>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px self-stretch bg-gray-100" />

          {/* Right: description + CTA */}
          <div className="flex-1 flex flex-col gap-5 min-w-0">
            <p className="text-sm text-gray-500 leading-relaxed">
              {slide.description}
            </p>
            <button className="self-start bg-primary hover:bg-primary/90 text-white text-xs font-bold tracking-[1px] uppercase px-6 py-3.5 rounded-lg transition-colors whitespace-nowrap">
              {slide.cta}
            </button>
          </div>
        </div>
      </div>

      {/* Slider arrows — right side, stacked vertically like na imagem */}
      <div className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        <button
          onClick={() => go(current + 1)}
          className="w-11 h-11 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary/90 transition-colors"
        >
          <ChevronRight size={20} className="text-white stroke-[2.5]" />
        </button>
        <button
          onClick={() => go(current - 1)}
          className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-600 stroke-[2.5]" />
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 right-8 flex items-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? "w-6 bg-primary" : "w-2 bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}