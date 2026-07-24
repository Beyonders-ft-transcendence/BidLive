import { useState } from "react";
import { UserPlus, Search, Gavel, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function HowItWorksSection() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);

  const steps = [
    {
      icon: UserPlus,
      image: "https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&w=600&q=80",
      label: t("home.how.step1.label", "Crie Sua Conta Grátis"),
      badge: t("home.how.step1.badge", "Passo 01"),
      title: t("home.how.step1.title", "Cadastro Rápido e Gratuito"),
      description: t("home.how.step1.description", "Registre-se em menos de 2 minutos, sem taxas ou burocracia. Preencha seus dados, valide seu e-mail e já estará pronto para participar dos leilões."),
      features: [
        t("home.how.step1.feature1", "Cadastro 100% gratuito"),
        t("home.how.step1.feature2", "Verificação instantânea por e-mail"),
        t("home.how.step1.feature3", "Dados protegidos com criptografia"),
      ],
    },
    {
      icon: Search,
      image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&q=80",
      label: t("home.how.step2.label", "Explore os Lotes Disponíveis"),
      badge: t("home.how.step2.badge", "Passo 02"),
      title: t("home.how.step2.title", "Encontre as Melhores Oportunidades"),
      description: t("home.how.step2.description", "Navegue por centenas de lotes ativos: imóveis, veículos, eletrônicos e muito mais. Use filtros avançados para encontrar exatamente o que procura."),
      features: [
        t("home.how.step2.feature1", "Busca por categoria e localização"),
        t("home.how.step2.feature2", "Fotos e laudos de cada lote"),
        t("home.how.step2.feature3", "Alertas de novos leilões"),
      ],
    },
    {
      icon: Gavel,
      image: "https://images.unsplash.com/photo-1555374018-1c4fa47820a4?auto=format&fit=crop&w=600&q=80",
      label: t("home.how.step3.label", "Dê Seu Lance em Tempo Real"),
      badge: t("home.how.step3.badge", "Passo 03"),
      title: t("home.how.step3.title", "Lance ao Vivo com Segurança"),
      description: t("home.how.step3.description", "Acompanhe o pregão ao vivo, faça seus lances com um clique e receba notificações instantâneas. A plataforma garante total transparência em cada disputa."),
      features: [
        t("home.how.step3.feature1", "Lances em tempo real"),
        t("home.how.step3.feature2", "Notificações imediatas de superação"),
        t("home.how.step3.feature3", "Histórico completo de lances"),
      ],
    }
  ];

  const step = steps[active];

  return (
    <section id="como-funciona" className="py-20 lg:py-24 bg-muted/30 overflow-hidden border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="flex flex-col lg:flex-row justify-between gap-10 lg:gap-14 items-stretch w-full">

          {/* Left — Steps List */}
          <div className="flex flex-col gap-4 w-full lg:w-[400px] shrink-0">
            {/* Header */}
            <div className="flex flex-col items-start mb-4">
              <span className="inline-block bg-primary/10 text-primary text-[11px] font-bold tracking-[1.6px] uppercase px-4 py-1.5 rounded-full border border-primary/20 mb-4">
                {t("home.how_works_badge", "Como Funciona")}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground leading-[1.15] tracking-tight">
                {t("home.how_works_title_1", "Participe de Leilões em")}
                <br />
                <span className="text-primary">{t("home.how_works_title_2", "Apenas Alguns Passos")}</span>
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const isActive = i === active;
                return (
                  <button
                    key={s.badge}
                    onClick={() => setActive(i)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-300 text-left cursor-pointer group ${
                      isActive
                        ? "bg-primary border-primary shadow-lg shadow-primary/20"
                        : "bg-card border-border hover:border-primary/40 hover:shadow-md"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        isActive
                          ? "bg-white/20"
                          : "bg-primary/5 group-hover:bg-primary/10"
                      }`}
                    >
                      <Icon
                        size={22}
                        className={isActive ? "text-primary-foreground" : "text-primary"}
                        strokeWidth={2.5}
                      />
                    </div>
                    <span
                      className={`text-[15px] font-bold transition-colors duration-300 ${
                        isActive ? "text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right — Detail Card */}
          <div 
            className="bg-card rounded-2xl border border-border shadow-xl shadow-muted/50 flex flex-col lg:flex-row overflow-hidden min-h-[380px] w-full lg:w-[600px] xl:w-[760px] shrink-0"
          >
            <div
                key={active}
                className="flex flex-col lg:flex-row w-full animate-in fade-in slide-in-from-right-4 duration-500 fill-mode-both"
            >
              {/* Illustration panel */}
              <div className="lg:w-[320px] xl:w-[360px] w-full h-56 sm:h-64 lg:h-auto bg-muted relative overflow-hidden flex-shrink-0">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-background/90 via-background/20 to-transparent lg:opacity-0" />
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center gap-5 p-7 sm:p-8 lg:p-10 flex-1">
                <div className="flex flex-col gap-3">
                    {/* Badge */}
                    <div className="inline-flex items-center bg-primary/10 rounded-full px-3.5 py-1.5 w-fit border border-primary/10">
                    <span className="text-[10px] font-black tracking-[1.5px] uppercase text-primary">
                        {step.badge}
                    </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-black text-foreground leading-snug tracking-tight">
                    {step.title}
                    </h3>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Features */}
                <ul className="flex flex-col gap-3 mt-2">
                  {step.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={12} className="text-primary" strokeWidth={3} />
                      </div>
                      <span className="text-sm font-semibold text-foreground/90">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
