/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Auction, Stream, User, Bid, Notification, Report, SystemLog, Message } from '../types';

export const CURRENT_LOCAL_USER: User = {
  id: 'u-current',
  name: 'Daniel Ndomba',
  email: 'ndondadaniel2020@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
  role: 'ADMIN', // Set as ADMIN so user can explore all sections, including Admin Panel
  balance: 24500.00,
  status: 'ACTIVE',
  bio: 'Colecionador entusiasta e investidor de ativos digitais e relógios de luxo.',
  permissions: ['user.read', 'role.manage', 'permission.manage', 'auction.create', 'auction.update', 'auction.delete', 'auction.bid', 'auction.manage', 'report.manage', 'stream.host']
};

export const INITIAL_USERS: User[] = [
  CURRENT_LOCAL_USER,
  {
    id: 'u-2',
    name: 'Ana Silva',
    email: 'ana.silva@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
    role: 'USER',
    balance: 5500.00,
    status: 'ACTIVE',
    bio: 'Focada em obras de artes analógicas e NFTs raros.',
    permissions: ['auction.create', 'auction.read', 'auction.bid']
  },
  {
    id: 'u-3',
    name: 'Carlos Oliveira',
    email: 'carlos.oli@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
    role: 'MANAGER',
    balance: 12000.00,
    status: 'ACTIVE',
    bio: 'Curador de leilões esportivos e colecionáveis raros.',
    permissions: ['auction.create', 'auction.read', 'auction.update', 'auction.bid', 'auction.manage']
  },
  {
    id: 'u-4',
    name: 'Beatriz Costa',
    email: 'beatriz.c@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80',
    role: 'USER',
    balance: 450.00,
    status: 'BANNED',
    bio: 'Perseguindo as melhores ofertas.',
    permissions: ['auction.read', 'auction.bid']
  },
  {
    id: 'u-5',
    name: 'Luiza Fonseca',
    email: 'luiza.f@example.com',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=100&h=100&q=80',
    role: 'USER',
    balance: 85000.00,
    status: 'ACTIVE',
    bio: 'Colecionadora de arte contemporânea, esculturas e alta costura.',
    permissions: ['auction.read', 'auction.bid', 'auction.create']
  },
  {
    id: 'u-6',
    name: 'Marcos Rocha',
    email: 'marcos.r@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80',
    role: 'USER',
    balance: 950000.00,
    status: 'ACTIVE',
    bio: 'Entusiasta de carros clássicos, hardware de ponta e tecnologia.',
    permissions: ['auction.read', 'auction.bid', 'auction.create']
  },
  {
    id: 'u-7',
    name: 'Sofia Mendes',
    email: 'sofia.m@example.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80',
    role: 'USER',
    balance: 1200000.00,
    status: 'ACTIVE',
    bio: 'Praticante de esportes radicais, triatleta e investidora imobiliária.',
    permissions: ['auction.read', 'auction.bid', 'auction.create']
  },
  {
    id: 'u-8',
    name: 'Gabriel Lima',
    email: 'gabriel.l@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80',
    role: 'USER',
    balance: 2500.00,
    status: 'ACTIVE',
    bio: 'Aficionado por retrogaming, consoles vintage e eletrônicos antigos.',
    permissions: ['auction.read', 'auction.bid', 'auction.create']
  }
];

// Seed relative times
const getDateOffset = (hours: number): string => {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date.toISOString();
};

export const INITIAL_AUCTIONS: Auction[] = [
  {
    id: 'auc-1',
    title: 'Rolex Daytona Platinum Ice Blue Dial',
    description: 'Um clássico lendário. Caixa de platina com mostrador azul glacial exuberante, luneta em cerâmica marrom e movimento automático calibre 4130 original. Inclui caixa, documentos de autenticidade carimbados e todos os elos originais. Estado de conservação impecável (Mint Condition 9.9/10).',
    category: 'Relógios de Luxo',
    images: [
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=600&h=400&q=80',
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=600&h=400&q=80',
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&h=400&q=80'
    ],
    startPrice: 72000.00,
    currentPrice: 75500.00,
    buyNowPrice: 95000.00,
    minIncrement: 500.00,
    currentBidderId: 'u-3',
    currentBidderName: 'Carlos Oliveira',
    startTime: getDateOffset(-2),
    endTime: getDateOffset(1.5), // Ends in 1.5 hours (ACTIVE)
    status: 'ACTIVE',
    views: 1420,
    watches: 189,
    creatorId: 'u-2',
    creatorName: 'Ana Silva',
    bidsCount: 3,
    streamId: 'str-1'
  },
  {
    id: 'auc-2',
    title: 'Estação de Trabalho Dev-AI SuperCluster (Dual RTX 4090)',
    description: 'Máquina de computação definitiva para Deep Learning. Equipado com 2x NVIDIA RTX 4090 24GB VRAM, AMD Threadripper PRO 5955WX (16 cores, 32 threads), 256GB ECC RAM DDR5, 4TB SSD NVMe PCIe Gen5, Fonte Titanium de 1600W redundante e refrigeração líquida selada industrial. Perfeito para treinamento de LLMs localmente.',
    category: 'Hardware & Tech',
    images: [
      'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=600&h=400&q=80',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&h=400&q=80'
    ],
    startPrice: 8500.00,
    currentPrice: 10200.00,
    buyNowPrice: 13500.00,
    minIncrement: 200.00,
    currentBidderId: 'u-current',
    currentBidderName: 'Daniel Ndomba',
    startTime: getDateOffset(-1),
    endTime: getDateOffset(3.2), // Ends in 3.2 hours (ACTIVE)
    status: 'ACTIVE',
    views: 890,
    watches: 45,
    creatorId: 'u-3',
    creatorName: 'Carlos Oliveira',
    bidsCount: 2,
    streamId: 'str-2'
  },
  {
    id: 'auc-3',
    title: 'Carta Magic: The Gathering - Black Lotus Limited Beta',
    description: 'A peça sagrada dos card games colecionáveis. Uma cópia impecável da carta mais valiosa e emblemática de MTG, impressa na coleção Beta de 1993. Certificação PSA 9 MINT. Excelente saturação de tintas estruturais, centrado magnífico (60/40) e bordas livres de atrito ou marcas d\'água.',
    category: 'Colecionáveis Raras',
    images: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&h=400&q=80'
    ],
    startPrice: 150000.00,
    currentPrice: 151500.00,
    buyNowPrice: null,
    minIncrement: 1000.00,
    currentBidderId: 'u-2',
    currentBidderName: 'Ana Silva',
    startTime: getDateOffset(-5),
    endTime: getDateOffset(24), // Ends in 24 hours (ACTIVE)
    status: 'ACTIVE',
    views: 5210,
    watches: 842,
    creatorId: 'u-admin',
    creatorName: 'System Manager',
    bidsCount: 3,
    streamId: null
  },
  {
    id: 'auc-4',
    title: 'Bicicleta de Estrada Colnago C68 Carbon Edition',
    description: 'Estrutura premium inteiramente em fibra de carbono produzida à mão na Itália. Rodas Lightweight Meilenstein Obermayer, grupo de transmissão eletrônico Campagnolo Super Record Wireless de 12 velocidades, guidão aerodinâmico integrado e sela customizada de titânio. Peso total extraordinário de apenas 6.3kg.',
    category: 'Esportes & Outdoor',
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&h=400&q=80',
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=600&h=400&q=80'
    ],
    startPrice: 12000.00,
    currentPrice: 12000.00,
    buyNowPrice: 16000.00,
    minIncrement: 250.00,
    currentBidderId: null,
    currentBidderName: null,
    startTime: getDateOffset(4), // Starts in 4 hours
    endTime: getDateOffset(52),
    status: 'UPCOMING',
    views: 310,
    watches: 18,
    creatorId: 'u-3',
    creatorName: 'Carlos Oliveira',
    bidsCount: 0,
    streamId: null
  },
  {
    id: 'auc-5',
    title: 'Estátua Geralt of Rivia Primordial Scale (Sideshow)',
    description: 'Estátua maciça colecionável em escala real 1/3, pintada individualmente à mão pelos mestres da Sideshow. Réplica precisa das texturas do jogo Witcher III. Inclui base temática iluminada por fibra ótica, duas espadas de metal reais intercambiáveis e cabeça esculpida alternativa.',
    category: 'Geek & HQ',
    images: [
      'https://images.unsplash.com/photo-1608889174637-3c44f6326f1a?auto=format&fit=crop&w=600&h=400&q=80'
    ],
    startPrice: 2200.00,
    currentPrice: 3400.00,
    buyNowPrice: 4200.00,
    minIncrement: 100.00,
    currentBidderId: 'u-current',
    currentBidderName: 'Daniel Ndomba',
    startTime: getDateOffset(-12),
    endTime: getDateOffset(-1), // Finished 1 hour ago
    status: 'ENDED',
    views: 940,
    watches: 67,
    creatorId: 'u-2',
    creatorName: 'Ana Silva',
    bidsCount: 3,
    streamId: null
  },
  {
    id: 'auc-6',
    title: 'O Eco do Infinito - Tela Abstrata por Gabriel Diniz',
    description: 'Obra de arte original pintada em acrílico sobre tela de alta qualidade (120x100cm). Esta peça explora a profundidade do azul ultramar e tons metálicos dourados, criando uma experiência visual imersiva e tridimensional. Perfeito para salas de estar modernas ou escritórios executivos de alto padrão. Assinada pelo artista no verso com certificado de autenticidade selado.',
    category: 'Galeria de Arte',
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&h=400&q=80',
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&h=400&q=80'
    ],
    startPrice: 4500.00,
    currentPrice: 5100.00,
    buyNowPrice: null,
    minIncrement: 150.00,
    currentBidderId: 'u-5',
    currentBidderName: 'Luiza Fonseca',
    startTime: getDateOffset(-1.5),
    endTime: getDateOffset(2.5),
    status: 'ACTIVE',
    views: 450,
    watches: 62,
    creatorId: 'u-2',
    creatorName: 'Ana Silva',
    bidsCount: 3,
    streamId: 'str-6'
  },
  {
    id: 'auc-7',
    title: 'Porsche 911 Carrera S Coupe (2022)',
    description: 'Uma verdadeira obra de arte sobre rodas. Cor Cinza Giz com interior em couro Club Marrom Trufa. Motor 3.0 Biturbo Boxer de 6 cilindros com 450cv, transmissão PDK de 8 marchas. Apenas 8.500 km rodados, todas as revisões feitas em concessionária autorizada Porsche, IPVA pago, blindagem nível III-A Carbon com vidros AGP Glass. Estado de novo, sem qualquer detalhe ou retoque.',
    category: 'Carros & Motos',
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&h=400&q=80',
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&h=400&q=80'
    ],
    startPrice: 790000.00,
    currentPrice: 810000.00,
    buyNowPrice: 890000.00,
    minIncrement: 5000.00,
    currentBidderId: 'u-current',
    currentBidderName: 'Daniel Ndomba',
    startTime: getDateOffset(-3),
    endTime: getDateOffset(4.5),
    status: 'ACTIVE',
    views: 1250,
    watches: 198,
    creatorId: 'u-6',
    creatorName: 'Marcos Rocha',
    bidsCount: 2,
    streamId: null
  },
  {
    id: 'auc-8',
    title: 'Bolsa Hermès Birkin 30 Togo Gold GHW',
    description: 'A bolsa mais cobiçada e exclusiva do mundo da moda. Couro Togo na cor Gold (marrom ícone da marca) com ferragens em metal banhado a ouro 18k (Gold Hardware). Tamanho 30, perfeito para o dia a dia. Nova, nunca usada, com todos os plásticos protetores nas ferragens. Acompanha caixa original, dustbag, capa de chuva, chaves, cadeado e nota fiscal de boutique oficial Hermès de Paris (2025).',
    category: 'Alta Costura',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&h=400&q=80'
    ],
    startPrice: 125000.00,
    currentPrice: 125000.00,
    buyNowPrice: 155000.00,
    minIncrement: 2000.00,
    currentBidderId: null,
    currentBidderName: null,
    startTime: getDateOffset(6),
    endTime: getDateOffset(72),
    status: 'UPCOMING',
    views: 215,
    watches: 45,
    creatorId: 'u-5',
    creatorName: 'Luiza Fonseca',
    bidsCount: 0,
    streamId: null
  },
  {
    id: 'auc-9',
    title: 'Apartamento Duplex Mobiliado nos Jardins - SP',
    description: 'Sofisticação e conforto no bairro mais nobre de São Paulo. Duplex de 180m² de área útil, totalmente reformado por arquiteto premiado. Possui 2 suítes master com closet, pé-direito duplo na sala de estar, automação residencial de iluminação e som, cozinha gourmet equipada com eletrodomésticos italianos e 3 vagas de garagem com carregador para carro elétrico. Prédio com infraestrutura completa de lazer.',
    category: 'Imóveis de Alto Padrão',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&h=400&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&h=400&q=80'
    ],
    startPrice: 2400000.00,
    currentPrice: 2400000.00,
    buyNowPrice: null,
    minIncrement: 20000.00,
    currentBidderId: null,
    currentBidderName: null,
    startTime: getDateOffset(24),
    endTime: getDateOffset(120),
    status: 'UPCOMING',
    views: 180,
    watches: 39,
    creatorId: 'u-7',
    creatorName: 'Sofia Mendes',
    bidsCount: 0,
    streamId: null
  },
  {
    id: 'auc-10',
    title: 'Console Game Boy DMG-01 Classic Original (1989)',
    description: 'Item de colecionador absoluto. Console Game Boy original lançado em 1989 (modelo DMG-01 cinza clássico). Caixa original com serial correspondente ao console, manual de instruções intacto, fone de ouvido original sem uso e cabo link. O console está em estado de vitrine, sem nenhum amarelado na carcaça e tela sem linhas mortas de pixels. Acompanha cartucho original de Tetris na caixinha.',
    category: 'Retro Gaming',
    images: [
      'https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?auto=format&fit=crop&w=600&h=400&q=80'
    ],
    startPrice: 1800.00,
    currentPrice: 2400.00,
    buyNowPrice: 3500.00,
    minIncrement: 50.00,
    currentBidderId: 'u-8',
    currentBidderName: 'Gabriel Lima',
    startTime: getDateOffset(-24),
    endTime: getDateOffset(-2),
    status: 'ENDED',
    views: 540,
    watches: 48,
    creatorId: 'u-8',
    creatorName: 'Gabriel Lima',
    bidsCount: 4,
    streamId: null
  },
  {
    id: 'auc-11',
    title: 'Câmera Leica M11 Rangefinder Edition',
    description: 'Uma lenda da fotografia alemã. Sensor CMOS BSI full-frame de tripla resolução (60/36/18 MP), processador Maestro III, memória interna de 64 GB e design clássico minimalista em metal preto fosco. Acompanha lente Leica Summilux-M 50mm f/1.4 ASPH, bateria sobressalente, alça de couro artesanal e certificado Leica de autenticidade.',
    category: 'Equipamento Fotográfico',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&h=400&q=80'
    ],
    startPrice: 42000.00,
    currentPrice: 44500.00,
    buyNowPrice: null,
    minIncrement: 500.00,
    currentBidderId: 'u-5',
    currentBidderName: 'Luiza Fonseca',
    startTime: getDateOffset(-5),
    endTime: getDateOffset(18),
    status: 'ACTIVE',
    views: 620,
    watches: 54,
    creatorId: 'u-6',
    creatorName: 'Marcos Rocha',
    bidsCount: 3,
    streamId: null
  },
  {
    id: 'auc-12',
    title: 'Escultura de Bronze \'O Pensador Silencioso\'',
    description: 'Escultura contemporânea de bronze fundido à cera perdida por escultor renomado. Edição limitada (número 3 de 10). Pátina escura rica com reflexos esverdeados. Pesa aproximadamente 14kg e mede 45cm de altura. Acompanha base de mármore Nero Marquina e laudo pericial de galeria de arte credenciada.',
    category: 'Escultura',
    images: [
      'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=600&h=400&q=80'
    ],
    startPrice: 18000.00,
    currentPrice: 19000.00,
    buyNowPrice: null,
    minIncrement: 500.00,
    currentBidderId: 'u-7',
    currentBidderName: 'Sofia Mendes',
    startTime: getDateOffset(-6),
    endTime: getDateOffset(12),
    status: 'ACTIVE',
    views: 310,
    watches: 27,
    creatorId: 'u-2',
    creatorName: 'Ana Silva',
    bidsCount: 2,
    streamId: null
  }
];

export const INITIAL_STREAMS: Stream[] = [
  {
    id: 'str-1',
    title: 'LEILÃO REALTIME: Rolex e Joias Raras da Alta Sociedade',
    auctionId: 'auc-1',
    auctionTitle: 'Rolex Daytona Platinum Ice Blue Dial',
    streamerId: 'u-2',
    streamerName: 'Ana Silva',
    streamerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
    viewersCount: 247,
    rtmpKey: 'live_rtmp_29841_908323_daytona_stream',
    status: 'LIVE',
    startedAt: getDateOffset(-2)
  },
  {
    id: 'str-2',
    title: 'Supercomputadores de Inteligência Artificial & Hardware Extremo',
    auctionId: 'auc-2',
    auctionTitle: 'Estação de Trabalho Dev-AI SuperCluster (Dual RTX 4090)',
    streamerId: 'u-3',
    streamerName: 'Carlos Oliveira',
    streamerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
    viewersCount: 112,
    rtmpKey: 'live_rtmp_44589_112049_cluster_stream',
    status: 'LIVE',
    startedAt: getDateOffset(-1)
  },
  {
    id: 'str-6',
    title: 'LIVE EXCLUSIVA: Galeria de Arte Contemporânea & Esculturas Modernas',
    auctionId: 'auc-6',
    auctionTitle: 'O Eco do Infinito - Tela Abstrata por Gabriel Diniz',
    streamerId: 'u-2',
    streamerName: 'Ana Silva',
    streamerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
    viewersCount: 85,
    rtmpKey: 'live_rtmp_10294_482910_diniz_stream',
    status: 'LIVE',
    startedAt: getDateOffset(-1.5)
  }
];

export const INITIAL_BIDS: Bid[] = [
  {
    id: 'bid-1',
    auctionId: 'auc-1',
    bidderName: 'Ana Silva',
    bidderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
    amount: 73000.00,
    timestamp: getDateOffset(-1.8),
    status: 'OVERBID'
  },
  {
    id: 'bid-2',
    auctionId: 'auc-1',
    bidderName: 'Daniel Ndomba',
    bidderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    amount: 74000.00,
    timestamp: getDateOffset(-1.2),
    status: 'OVERBID'
  },
  {
    id: 'bid-3',
    auctionId: 'auc-1',
    bidderName: 'Carlos Oliveira',
    bidderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
    amount: 75500.00,
    timestamp: getDateOffset(-0.4),
    status: 'SUCCESS'
  },
  {
    id: 'bid-4',
    auctionId: 'auc-2',
    bidderName: 'Carlos Oliveira',
    bidderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
    amount: 9000.00,
    timestamp: getDateOffset(-0.8),
    status: 'OVERBID'
  },
  {
    id: 'bid-5',
    auctionId: 'auc-2',
    bidderName: 'Daniel Ndomba',
    bidderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    amount: 10200.00,
    timestamp: getDateOffset(-0.2),
    status: 'SUCCESS'
  },
  {
    id: 'bid-6',
    auctionId: 'auc-6',
    bidderName: 'Luiza Fonseca',
    bidderAvatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=100&h=100&q=80',
    amount: 4650.00,
    timestamp: getDateOffset(-1.2),
    status: 'OVERBID'
  },
  {
    id: 'bid-7',
    auctionId: 'auc-6',
    bidderName: 'Sofia Mendes',
    bidderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80',
    amount: 4800.00,
    timestamp: getDateOffset(-0.8),
    status: 'OVERBID'
  },
  {
    id: 'bid-8',
    auctionId: 'auc-6',
    bidderName: 'Luiza Fonseca',
    bidderAvatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=100&h=100&q=80',
    amount: 5100.00,
    timestamp: getDateOffset(-0.3),
    status: 'SUCCESS'
  },
  {
    id: 'bid-9',
    auctionId: 'auc-7',
    bidderName: 'Sofia Mendes',
    bidderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80',
    amount: 795000.00,
    timestamp: getDateOffset(-2),
    status: 'OVERBID'
  },
  {
    id: 'bid-10',
    auctionId: 'auc-7',
    bidderName: 'Daniel Ndomba',
    bidderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    amount: 810000.00,
    timestamp: getDateOffset(-0.5),
    status: 'SUCCESS'
  },
  {
    id: 'bid-11',
    auctionId: 'auc-10',
    bidderName: 'Marcos Rocha',
    bidderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80',
    amount: 1850.00,
    timestamp: getDateOffset(-22),
    status: 'OVERBID'
  },
  {
    id: 'bid-12',
    auctionId: 'auc-10',
    bidderName: 'Gabriel Lima',
    bidderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80',
    amount: 1900.00,
    timestamp: getDateOffset(-20),
    status: 'OVERBID'
  },
  {
    id: 'bid-13',
    auctionId: 'auc-10',
    bidderName: 'Marcos Rocha',
    bidderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80',
    amount: 2000.00,
    timestamp: getDateOffset(-15),
    status: 'OVERBID'
  },
  {
    id: 'bid-14',
    auctionId: 'auc-10',
    bidderName: 'Gabriel Lima',
    bidderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80',
    amount: 2400.00,
    timestamp: getDateOffset(-10),
    status: 'SUCCESS'
  },
  {
    id: 'bid-15',
    auctionId: 'auc-11',
    bidderName: 'Luiza Fonseca',
    bidderAvatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=100&h=100&q=80',
    amount: 42500.00,
    timestamp: getDateOffset(-4),
    status: 'OVERBID'
  },
  {
    id: 'bid-16',
    auctionId: 'auc-11',
    bidderName: 'Gabriel Lima',
    bidderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80',
    amount: 43000.00,
    timestamp: getDateOffset(-3),
    status: 'OVERBID'
  },
  {
    id: 'bid-17',
    auctionId: 'auc-11',
    bidderName: 'Luiza Fonseca',
    bidderAvatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=100&h=100&q=80',
    amount: 44500.00,
    timestamp: getDateOffset(-1),
    status: 'SUCCESS'
  },
  {
    id: 'bid-18',
    auctionId: 'auc-12',
    bidderName: 'Luiza Fonseca',
    bidderAvatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=100&h=100&q=80',
    amount: 18500.00,
    timestamp: getDateOffset(-5),
    status: 'OVERBID'
  },
  {
    id: 'bid-19',
    auctionId: 'auc-12',
    bidderName: 'Sofia Mendes',
    bidderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80',
    amount: 19000.00,
    timestamp: getDateOffset(-2),
    status: 'SUCCESS'
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    roomId: 'str-1',
    senderName: 'Carlos Oliveira',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
    content: 'Esse Daytona é simplesmente uma joia absurda! Luneta perfeita.',
    timestamp: getDateOffset(-0.25),
    role: 'MANAGER'
  },
  {
    id: 'msg-2',
    roomId: 'str-1',
    senderName: 'Daniel Ndomba',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    content: 'Vale cada centavo, ótima condição. Estou acompanhando atento!',
    timestamp: getDateOffset(-0.2),
    role: 'ADMIN'
  },
  {
    id: 'msg-3',
    roomId: 'str-1',
    senderName: 'Ana Silva',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
    content: 'Obrigada pelo feedback gente! Esse relógio pertenceu a uma coleção histórica na Suíça.',
    timestamp: getDateOffset(-0.15),
    role: 'USER'
  },
  {
    id: 'msg-4',
    roomId: 'str-6',
    senderName: 'Luiza Fonseca',
    senderAvatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=100&h=100&q=80',
    content: 'Esta tela é fantástica, as cores são muito mais vibrantes na live!',
    timestamp: getDateOffset(-0.5),
    role: 'USER'
  },
  {
    id: 'msg-5',
    roomId: 'str-6',
    senderName: 'Sofia Mendes',
    senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80',
    content: 'Concordo plenamente, o contraste do azul com o dourado ficou excelente.',
    timestamp: getDateOffset(-0.4),
    role: 'USER'
  },
  {
    id: 'msg-6',
    roomId: 'str-6',
    senderName: 'Ana Silva',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
    content: 'Obrigado pelo carinho! O artista levou cerca de 3 meses para concluir essa peça.',
    timestamp: getDateOffset(-0.3),
    role: 'USER'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'not-1',
    title: 'Sua oferta foi superada!',
    description: 'No leilão Rolex Daytona Platinum, Carlos ofertou R$ 75.500,00.',
    type: 'OUTBID',
    read: false,
    timestamp: getDateOffset(-0.4)
  },
  {
    id: 'not-2',
    title: 'Sua oferta está vencendo!',
    description: 'Você é o maior ofertante da Estação de Trabalho Dev-AI SuperCluster por R$ 10.200,00.',
    type: 'BID_WON',
    read: true,
    timestamp: getDateOffset(-0.2)
  },
  {
    id: 'not-3',
    title: 'Live iniciada',
    description: 'Ana Silva iniciou a transmissão: Rolex e Joias Raras da Alta Sociedade.',
    type: 'LIVE_START',
    read: false,
    timestamp: getDateOffset(-2)
  },
  {
    id: 'not-4',
    title: 'Sua oferta foi superada!',
    description: 'No leilão da Leica M11, Gabriel ofertou R$ 43.000,00.',
    type: 'OUTBID',
    read: false,
    timestamp: getDateOffset(-0.8)
  },
  {
    id: 'not-5',
    title: 'Sua oferta é a maior!',
    description: 'Você lidera o leilão do Bronze \'O Pensador Silencioso\' com R$ 18.500,00.',
    type: 'BID_WON',
    read: true,
    timestamp: getDateOffset(-0.4)
  },
  {
    id: 'not-6',
    title: 'Live iniciada',
    description: 'Ana Silva iniciou a transmissão: Galeria de Arte Contemporânea & Esculturas Modernas.',
    type: 'LIVE_START',
    read: false,
    timestamp: getDateOffset(-1.5)
  }
];

export const INITIAL_REPORTS: Report[] = [
  {
    id: 'rep-1',
    auctionId: 'auc-5',
    auctionTitle: 'Estátua Geralt of Rivia',
    reporterName: 'Carlos Oliveira',
    reason: 'Imagem de qualidade questionável ou descrição incoerente do frete.',
    status: 'OPEN',
    timestamp: getDateOffset(-5)
  },
  {
    id: 'rep-2',
    auctionId: 'auc-7',
    auctionTitle: 'Porsche 911 Carrera S',
    reporterName: 'Luiza Fonseca',
    reason: 'Suspeita de lance de fachada (shill bidding) ou manipulação de preço.',
    status: 'OPEN',
    timestamp: getDateOffset(-1.5)
  },
  {
    id: 'rep-3',
    auctionId: 'auc-10',
    auctionTitle: 'Console Game Boy DMG-01',
    reporterName: 'Gabriel Lima',
    reason: 'Descrição do produto omitiu detalhes cruciais sobre arranhões na lente traseira.',
    status: 'OPEN',
    timestamp: getDateOffset(-3)
  }
];

export const INITIAL_SYSTEM_LOGS: SystemLog[] = [
  {
    id: 'log-1',
    level: 'INFO',
    module: 'WEBSOCKET_MANAGER',
    message: 'User u-current connected successfully.',
    details: 'JWT Authentication verified. Protocol upgrade approved.',
    timestamp: getDateOffset(-0.5)
  },
  {
    id: 'log-2',
    level: 'INFO',
    module: 'BID_PROCESSOR',
    message: 'Bid received for auc-1 from u-current.',
    details: 'Amount: R$ 74.000,00. Result: Succeeded & Synchronized.',
    timestamp: getDateOffset(-1.2)
  },
  {
    id: 'log-3',
    level: 'WARNING',
    module: 'OAUTH_CONNECTOR',
    message: 'Google login request throttled for IP 189.22.45.101',
    details: 'Rate Limit Threshold reached. Resetting in 60s.',
    timestamp: getDateOffset(-2.1)
  },
  {
    id: 'log-4',
    level: 'INFO',
    module: 'GATEWAY',
    message: 'User u-5 viewed auction auc-6.',
    details: 'Client: WebApp. Latency: 12ms.',
    timestamp: getDateOffset(-0.6)
  },
  {
    id: 'log-5',
    level: 'INFO',
    module: 'USER_SERVICE',
    message: 'User u-6 logged in successfully.',
    details: 'Method: Email/Password. IP: 177.34.192.12',
    timestamp: getDateOffset(-3.5)
  },
  {
    id: 'log-6',
    level: 'INFO',
    module: 'LIVEKIT_CONNECTOR',
    message: 'User u-7 joined livestream room str-6.',
    details: 'Webrtc protocol. Quality: 720p.',
    timestamp: getDateOffset(-1.1)
  }
];
