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
    bidsCount: 7,
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
    bidsCount: 12,
    streamId: 'str-2'
  },
  {
    id: 'auc-3',
    title: 'Carta Magic: The Gathering - Black Lotus Limited Beta',
    description: 'A peça sagrada dos card games colecionáveis. Uma cópia impecável da carta mais valiosa e emblemática de MTG, impressa na coleção Beta de 1993. Certificação PSA 9 MINT. Excelente saturação de tintas estruturais, centrado magnífico (60/40) e bordas livres de atrito ou marcas d\'água.',
    category: 'Colecionáveis Raros',
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
    bidsCount: 14,
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
  }
];
