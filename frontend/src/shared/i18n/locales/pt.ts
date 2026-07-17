const pt = {
    nav: {
        home: "Início",
        auctions: "Leilões",
        menu: "Menu",
        language: "Idioma",
        theme: "Mudar Tema",
        signin: "Registrar / Entrar",
        notifications: "Notificações",
        unread: "{count} novas",
        noNotifications: "Sem notificações",
        markRead: "Marcar como lida",
    },
    hero: {
        badge: "Leilões a acontecer agora",
        titleLead: "Seu próximo grande arremate acontece",
        titleHighlight: "ao vivo",
        subtitle:
            "Assista às transmissões, dê lances em tempo real e arremate itens únicos — tudo dentro do BidLive, de onde você estiver.",
        exploreCta: "Explorar Leilões",
        sellCta: "Começar a Vender",
        dashboardCta: "Ir para o Painel",
        statLive: "ao vivo agora",
        statTotal: "leilões na plataforma",
        statCategories: "categorias",
    },
    mock: {
        itemTitle: "Relógio suíço de coleção · 1968",
        viewers: "{count} assistindo",
        newBid: "Novo lance!",
    },
    live: {
        badge: "Ao Vivo",
        title: "Acontecendo Agora",
        subtitle: "Entre na sala, assista ao leiloeiro e dispute em tempo real.",
        empty: "Nenhum leilão ao vivo neste momento.",
        emptyHint: "Explore os leilões agendados e ative as notificações para não perder o início.",
        viewScheduled: "Ver Leilões Agendados",
        seeAll: "Ver Todos",
        currentBid: "Lance Atual",
        enter: "Entrar no Leilão",
        noPhoto: "Sem foto",
    },
    featured: {
        title: "Em Destaque",
        subtitle: "Seleção especial da nossa equipe.",
        badge: "Destaque",
    },
    categories: {
        title: "Explore por Categoria",
        subtitle: "Encontre exatamente o que procura.",
    },
    how: {
        title: "Como Funciona",
        subtitle: "Do cadastro ao arremate em três passos.",
        step1Title: "Crie sua conta",
        step1Text: "Registre-se gratuitamente com e-mail, Google ou sua conta da 42.",
        step2Title: "Dê lances ao vivo",
        step2Text:
            "Acompanhe a transmissão do leiloeiro e dispute em tempo real com outros participantes.",
        step3Title: "Arremate e comemore",
        step3Text:
            "Venceu? O item é seu. Combine a entrega com o vendedor pelo chat da plataforma.",
    },
    features: {
        title: "Por que o BidLive?",
        subtitle: "Tudo o que um leilão presencial tem — sem sair de casa.",
        liveTitle: "Transmissão ao Vivo",
        liveText: "Vídeo em direto do leiloeiro em cada leilão, com áudio e contagem de espectadores.",
        bidsTitle: "Lances em Tempo Real",
        bidsText:
            "Cada lance aparece instantaneamente para todos os participantes. Sem atrasos, sem surpresas.",
        secureTitle: "Segurança e Confiança",
        secureText:
            "Contas verificadas, denúncias com moderação ativa e histórico completo de cada lance.",
        notifyTitle: "Notificações Instantâneas",
        notifyText: "Seja avisado quando um leilão começa, quando for superado e quando vencer.",
    },
    cta: {
        title: "Pronto para o seu primeiro arremate?",
        text: "Crie sua conta em menos de um minuto e entre no próximo leilão ao vivo.",
        primary: "Criar Conta Grátis",
        secondary: "Ver Leilões",
    },
    footer: {
        tagline: "Leilões ao vivo, lances em tempo real e a emoção de arrematar — em qualquer lugar.",
        navigation: "Navegação",
        account: "Conta",
        signin: "Entrar",
        signup: "Criar Conta",
        language: "Idioma",
        rights: "Todos os direitos reservados.",
        madeBy: "Projeto ft_transcendence — 42 Luanda",
    },
};

type MessageShape<T> = { [K in keyof T]: T[K] extends string ? string : MessageShape<T[K]> };

/** Estrutura canónica das traduções — pt é a fonte de verdade. */
export type Messages = MessageShape<typeof pt>;

export default pt;
