import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function FAQSection() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: t("home.faq.q1", "Como faço para participar de um leilão?"),
      answer: t("home.faq.a1", "Basta criar uma conta gratuita, validar o seu e-mail e procurar os leilões que estão abertos. Depois, é só clicar em 'Dar Lance' e introduzir o valor desejado."),
    },
    {
      question: t("home.faq.q2", "A plataforma cobra alguma taxa de inscrição?"),
      answer: t("home.faq.a2", "Não! O cadastro na BidLive é 100% gratuito. Só paga o valor do lote se for o grande vencedor do leilão e as respetivas taxas legais comunicadas previamente."),
    },
    {
      question: t("home.faq.q3", "É seguro adicionar as minhas informações de pagamento?"),
      answer: t("home.faq.a3", "Sim, a nossa plataforma utiliza os mais altos padrões de encriptação e processadores de pagamento certificados para garantir que os seus dados estão seguros."),
    },
    {
      question: t("home.faq.q4", "O que acontece se eu for o vencedor do leilão?"),
      answer: t("home.faq.a4", "Assim que o leilão terminar e o seu lance for o vencedor, receberá um e-mail com todas as instruções de pagamento e passos para a transferência de propriedade ou envio do artigo."),
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 lg:py-24 bg-background border-b border-border/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-xl mb-5">
             <HelpCircle className="text-primary w-6 h-6" strokeWidth={2.5} />
          </div>
          <span className="inline-block bg-primary/10 text-primary text-[11px] font-bold tracking-[1.6px] uppercase px-4 py-1.5 rounded-full border border-primary/20 mb-4">
            {t("home.faq.badge", "FAQ")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground leading-[1.15] tracking-tight mb-4">
            {t("home.faq.title", "Perguntas Frequentes")}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            {t("home.faq.description", "Tem dúvidas sobre o funcionamento da plataforma? Reunimos as perguntas mais comuns para ajudar você.")}
          </p>
        </div>

        {/* FAQ List */}
        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                onClick={() => toggleFAQ(index)}
                className={`border rounded-xl cursor-pointer transition-all duration-300 shadow-sm ${
                  isOpen ? "bg-card border-primary/40 shadow-primary/10" : "bg-card border-border hover:border-primary/30 hover:shadow-md"
                }`}
              >
                <div className="flex items-center justify-between p-5 sm:p-6">
                  <h3 className={`text-[15px] font-bold transition-colors ${
                    isOpen ? "text-primary" : "text-foreground"
                  }`}>
                    {faq.question}
                  </h3>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 transition-colors ${
                    isOpen ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {isOpen ? (
                      <ChevronUp size={16} className="stroke-[2.5]" />
                    ) : (
                      <ChevronDown size={16} className="stroke-[2.5]" />
                    )}
                  </div>
                </div>
                
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
