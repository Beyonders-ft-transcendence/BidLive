// components/layout/home/HowItWorksSection.tsx
"use client";
import { useState } from "react";
import {
  UserPlus,
  Search,
  Gavel,
  CheckCircle2,
} from "lucide-react";
import step1Image from "@/assets/images/step1.png"
import step2Image from "@/assets/images/step2.png"
import step3Image from "@/assets/images/step3.png"
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  {
    icon: UserPlus,
    image: step1Image,
    label: "Crie Sua Conta Grátis",
    badge: "Passo 01",
    title: "Cadastro Rápido e Gratuito",
    description:
      "Registre-se em menos de 2 minutos, sem taxas ou burocracia. Preencha seus dados, valide seu e-mail e já estará pronto para participar dos leilões.",
    features: [
      "Cadastro 100% gratuito",
      "Verificação instantânea por e-mail",
      "Dados protegidos com criptografia",
    ],
  },
  {
    icon: Search,
    image: step2Image,
    label: "Explore os Lotes Disponíveis",
    badge: "Passo 02",
    title: "Encontre as Melhores Oportunidades",
    description:
      "Navegue por centenas de lotes ativos: imóveis, veículos, eletrônicos e muito mais. Use filtros avançados para encontrar exatamente o que procura.",
    features: [
      "Busca por categoria e localização",
      "Fotos e laudos de cada lote",
      "Alertas de novos leilões",
    ],
  },
  {
    icon: Gavel,
    image: step3Image,
    label: "Dê Seu Lance em Tempo Real",
    badge: "Passo 03",
    title: "Lance ao Vivo com Segurança",
    description:
      "Acompanhe o pregão ao vivo, faça seus lances com um clique e receba notificações instantâneas. A plataforma garante total transparência em cada disputa.",
    features: [
      "Lances em tempo real",
      "Notificações imediatas de superação",
      "Histórico completo de lances",
    ],
  }
];

export default function HowItWorksSection() {
  const [active, setActive] = useState(1);

  const step = steps[active];
  const StepDetailIcon = step.icon;

  return (
    <section id="como-funciona" className="py-24 bg-[#F4F5F7] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">

        {/* Main Grid */}
        <div className="flex flex-col lg:flex-row justify-between gap-8 lg:gap-12 items-stretch w-full">

          {/* Left — Steps List */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col gap-3 w-full lg:w-[380px] xl:w-[400px] shrink-0"
          >
            {/* Header */}
            <div className="flex flex-col items-start mb-6">
              <span className="inline-block bg-primary/10 text-primary text-[11px] font-bold tracking-[1.6px] uppercase px-4 py-1.5 rounded-full border border-primary/20 mb-4">
                Como Funciona
              </span>
              <h2 className="text-3xl font-extrabold text-[#0C1B33] text-left leading-tight tracking-tight">
                Participe de Leilões em<br />Apenas Alguns Passos
              </h2>
            </div>
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === active;
              return (
                <button
                  key={s.badge}
                  onClick={() => setActive(i)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-200 text-left cursor-pointer ${
                    isActive
                      ? "bg-primary border-primary shadow-lg shadow-primary/20"
                      : "bg-white border-gray-100 hover:border-primary/30"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                      isActive
                        ? "bg-white/20"
                        : "bg-gray-100"
                    }`}
                  >
                    <Icon
                      size={19}
                      className={isActive ? "text-white" : "text-gray-400"}
                      strokeWidth={2.2}
                    />
                  </div>
                  <span
                    className={`text-sm font-bold transition-colors duration-200 ${
                      isActive ? "text-white" : "text-[#0C1B33]"
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
              );
            })}
          </motion.div>

          {/* Right — Detail Card */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-white rounded-xl border border-gray-100 flex flex-col lg:flex-row overflow-hidden min-h-[340px] w-full lg:w-[580px] xl:w-[740px] shrink-0"
          >
            <AnimatePresence mode="wait">
              <motion.div 
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col lg:flex-row w-full"
              >
                {/* Illustration panel */}
                <div className="lg:w-[320px] w-full h-64 lg:h-auto bg-primary/5 flex-shrink-0 relative overflow-hidden">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-4 p-7 lg:p-9 flex-1">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 bg-primary/10 rounded-lg px-3 py-1.5 w-fit">
                    <span className="text-[11px] font-extrabold tracking-[1.2px] uppercase text-primary">
                      {step.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl lg:text-2xl font-extrabold text-[#0C1B33] leading-snug tracking-tight">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Features */}
                  <ul className="flex flex-col gap-2.5 mt-1">
                    {step.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 size={12} className="text-white" strokeWidth={3} />
                        </div>
                        <span className="text-sm font-semibold text-[#0C1B33]">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button className="self-start mt-auto bg-primary hover:bg-primary/90 text-white text-[11px] font-bold tracking-[1.2px] uppercase px-6 py-3.5 rounded-lg transition-colors">
                    Saiba Mais
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

        </div>
      </div>
    </section>
  );
}