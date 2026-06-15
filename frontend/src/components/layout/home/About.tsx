    // components/layout/home/AboutSection.tsx
    "use client";
    import Image from "next/image";
    import { useState } from "react";
    import { ChevronUp, ChevronDown } from "lucide-react";
    import aboutImg from "@/assets/images/hero_bg.png";

    const accordionItems = [
    {
        title: "Nossa Missão",
        content:
        "Com anos de experiência no mercado, nossa equipe é dedicada a oferecer leilões confiáveis, priorizando transparência, segurança e as melhores oportunidades para nossos usuários.",
    },
    {
        title: "Nossa Visão",
        content:
        "Ser a maior plataforma de leilões online do Brasil, democratizando o acesso a negócios exclusivos para qualquer pessoa, em qualquer lugar.",
    },
    {
        title: "Nossos Valores",
        content:
        "Transparência, segurança e inovação guiam cada decisão. Acreditamos em construir relações de longo prazo baseadas em confiança e resultados reais.",
    },
    ];

    export default function AboutSection() {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section id="sobre" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-3 gap-12 lg:gap-14 items-start">

            {/* COLUNA 1 — Texto */}
            <div>
                <span className="inline-block bg-primary/10 text-primary text-[11px] font-bold tracking-[1.6px] uppercase px-3 py-1.5 rounded mb-5">
                Sobre Nós
                </span>

                <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight text-[#0C1B33] tracking-tight mb-4">
                Transformando a Forma de Participar em Leilões
                </h2>

                <p className="text-sm text-gray-500 leading-relaxed mb-8">
                Desenvolvemos uma plataforma segura e transparente para conectar
                compradores a oportunidades reais — imóveis, veículos,
                eletrônicos e muito mais.
                </p>

                <button className="bg-primary hover:bg-primary/90 text-white text-[11px] font-bold tracking-[1.4px] uppercase px-6 py-3.5 rounded-lg transition-colors">
                Saiba Mais
                </button>
            </div>

            {/* COLUNA 2 — Imagem */}
            <div className="relative rounded-xl overflow-hidden h-[340px] lg:h-[380px]">
                <Image
                src={aboutImg}
                alt="Plataforma BidLive"
                fill
                className="object-cover"
                />
            </div>

            {/* COLUNA 3 — Accordion */}
            <div className="flex flex-col gap-3">
                {accordionItems.map((item, i) => {
                const isOpen = openIndex === i;
                return (
                    <div
                    key={item.title}
                    onClick={() => setOpenIndex(i)}
                    className={`rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                        isOpen
                        ? "bg-primary"
                        : "bg-gray-50 border border-gray-100"
                    }`}
                    >
                    <div className="flex items-center justify-between px-5 py-4">
                        <span
                        className={`text-sm font-bold ${
                            isOpen ? "text-white" : "text-[#0C1B33]"
                        }`}
                        >
                        {item.title}
                        </span>
                        <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isOpen ? "bg-white/25" : "bg-primary"
                        }`}
                        >
                        {isOpen ? (
                            <ChevronUp size={13} className="text-white stroke-[2.5]" />
                        ) : (
                            <ChevronDown size={13} className="text-white stroke-[2.5]" />
                        )}
                        </div>
                    </div>

                    {isOpen && (
                        <p className="px-5 pb-5 text-[12.5px] text-white/90 leading-relaxed">
                        {item.content}
                        </p>
                    )}
                    </div>
                );
                })}
            </div>

            </div>
        </div>
        </section>
    );
    }