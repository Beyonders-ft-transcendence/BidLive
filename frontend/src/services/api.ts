/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Auction, Bid, Stream, AuctionStatus } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=400&q=80';

export interface AuctionCategory {
  id: number;
  name: string;
  slug: string;
}

// Custom fetch wrapper supporting JWT and auto-refresh
async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; message?: string; data?: T; errors?: any }> {
  const url = path.startsWith('http')
    ? path
    : `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const accessToken = localStorage.getItem('bidlive_access');
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    let response = await fetch(url, fetchOptions);

    if (response.status === 401 && localStorage.getItem('bidlive_refresh')) {
      const refreshed = await attemptTokenRefresh();
      if (refreshed) {
        const newAccessToken = localStorage.getItem('bidlive_access');
        if (newAccessToken) {
          headers.set('Authorization', `Bearer ${newAccessToken}`);
          response = await fetch(url, { ...options, headers });
        }
      } else {
        logout();
      }
    }

    const contentType = response.headers.get('Content-Type') || '';
    let responseData: any = null;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const textData = await response.text();
      return {
        success: response.ok,
        message: response.ok ? 'Sucesso' : `Erro do servidor: ${response.status}`,
        data: textData as any,
      };
    }

    if (!response.ok) {
      let errorMsg = 'Ocorreu um erro no servidor.';
      if (typeof responseData === 'object' && responseData !== null) {
        if (responseData.message) errorMsg = responseData.message;
        else if (responseData.detail) errorMsg = responseData.detail;
        else if (responseData.error) errorMsg = responseData.error;
        else if (Array.isArray(responseData.errors) && responseData.errors.length > 0)
          errorMsg = responseData.errors.join(', ');
        else if (Object.keys(responseData).length > 0) {
          const firstKey = Object.keys(responseData)[0];
          const val = responseData[firstKey];
          errorMsg = Array.isArray(val) ? `${firstKey}: ${val[0]}` : `${firstKey}: ${val}`;
        }
      }
      return {
        success: false,
        message: errorMsg,
        errors: responseData,
      };
    }

    if (responseData && typeof responseData === 'object' && 'success' in responseData) {
      return responseData;
    }

    return {
      success: true,
      data: responseData,
    };
  } catch (error: any) {
    console.error('API Request Failure:', error);
    return {
      success: false,
      message: `Impossível conectar ao servidor do backend. Certifique-se de que o backend esteja ativo e com CORS liberado. (${error?.message || 'Erro de Conexão'})`,
    };
  }
}

async function attemptTokenRefresh(): Promise<boolean> {
  const refreshToken = localStorage.getItem('bidlive_refresh');
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.ok) {
      const payload = await response.json();
      const data = payload.data || payload;
      const access = data.access_token || data.access;
      const refresh = data.refresh_token || data.refresh;
      if (access) {
        localStorage.setItem('bidlive_access', access);
      }
      if (refresh) {
        localStorage.setItem('bidlive_refresh', refresh);
      }
      return Boolean(access);
    }
  } catch (err) {
    console.error('Token Refresh Error:', err);
  }
  return false;
}

export function logout() {
  localStorage.removeItem('bidlive_access');
  localStorage.removeItem('bidlive_refresh');
  localStorage.removeItem('bid_live_current_user');
  window.dispatchEvent(new Event('bidlive_logout'));
}

function normalizeStringList(items: unknown): string[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object' && 'name' in item) return String((item as { name: string }).name);
    return String(item);
  });
}

function mapBackendRole(roles: unknown): User['role'] {
  const upper = normalizeStringList(roles).map((r) => r.toUpperCase());
  if (upper.some((r) => r.includes('ADMIN') || r.includes('SUPER'))) return 'ADMIN';
  if (upper.some((r) => r.includes('MANAGER'))) return 'MANAGER';
  return 'USER';
}

function mapUserPermissions(apiUser: any): string[] {
  if (Array.isArray(apiUser.permissions) && apiUser.permissions.length > 0) {
    return normalizeStringList(apiUser.permissions);
  }
  const roles = Array.isArray(apiUser.roles) ? apiUser.roles : [];
  return roles.flatMap((role: any) => normalizeStringList(role?.permissions));
}

function mapUser(apiUser: any): User {
  if (!apiUser) return null as any;
  return {
    id: String(apiUser.id || apiUser.username || 'u-unknown'),
    name: apiUser.full_name || apiUser.name || apiUser.first_name || apiUser.username || 'Usuário',
    email: apiUser.email || '',
    avatar:
      apiUser.avatar_url ||
      apiUser.avatar ||
      apiUser.profile?.avatar ||
      `https://api.dicebear.com/7.x/identicon/svg?seed=${apiUser.email || apiUser.id}`,
    role: mapBackendRole(apiUser.roles),
    balance: Number(apiUser.balance || 0),
    status: (apiUser.status || 'ACTIVE').toString().toUpperCase() === 'BANNED' ? 'BANNED' : 'ACTIVE',
    bio: apiUser.bio || apiUser.profile?.bio || 'Membro do portal BidLive.',
    permissions: mapUserPermissions(apiUser),
  };
}

function mapAuctionStatus(status: string): AuctionStatus {
  switch (status) {
    case 'LIVE':
      return 'ACTIVE';
    case 'SCHEDULED':
      return 'UPCOMING';
    case 'ENDED':
    case 'SOLD':
      return 'ENDED';
    case 'CANCELLED':
      return 'CANCELLED';
    default:
      return 'UPCOMING';
  }
}

function extractImages(item: any): string[] {
  if (!item?.images?.length) return [DEFAULT_IMAGE];
  const urls = item.images
    .map((img: any) => {
      if (typeof img === 'string') return img;
      return img.file?.url || img.url || null;
    })
    .filter(Boolean);
  return urls.length > 0 ? urls : [DEFAULT_IMAGE];
}

function mapAuction(apiAuction: any, liveStreamId: string | null = null): Auction {
  const item = apiAuction.item || apiAuction;
  const category = item.category?.name || item.category_label || item.category || 'Misto';
  const sellerId = item.seller?.id ?? item.seller ?? apiAuction.seller_id ?? null;
  const winner = apiAuction.winner;
  const winnerId = winner?.id ?? winner ?? null;
  const winnerName = winner?.full_name || winner?.username || null;

  return {
    id: String(apiAuction.id),
    title: item.title || apiAuction.title || '',
    description: item.description || apiAuction.description || '',
    category: typeof category === 'string' ? category : category?.name || 'Misto',
    images: extractImages(item),
    startPrice: Number(item.starting_price ?? apiAuction.start_price ?? apiAuction.startPrice ?? 0),
    currentPrice: Number(
      item.current_price ?? apiAuction.current_price ?? apiAuction.currentPrice ?? item.starting_price ?? 0
    ),
    buyNowPrice:
      item.buy_now_price != null || apiAuction.buy_now_price != null
        ? Number(item.buy_now_price ?? apiAuction.buy_now_price)
        : null,
    minIncrement: Number(item.minimum_increment ?? apiAuction.min_increment ?? apiAuction.minIncrement ?? 10),
    currentBidderId: winnerId != null ? String(winnerId) : null,
    currentBidderName: winnerName,
    startTime: apiAuction.start_time || apiAuction.startTime || new Date().toISOString(),
    endTime: apiAuction.end_time || apiAuction.endTime || new Date(Date.now() + 86400000).toISOString(),
    status: mapAuctionStatus(apiAuction.status || 'SCHEDULED'),
    views: Number(apiAuction.views_count ?? apiAuction.views ?? 0),
    watches: Number(apiAuction.watchers_count ?? apiAuction.watches ?? 0),
    creatorId: sellerId != null ? String(sellerId) : 'unknown',
    creatorName: item.seller_name || apiAuction.creator?.name || apiAuction.creatorName || 'Vendedor',
    bidsCount: Number(apiAuction.bids_count ?? apiAuction.bid_count ?? apiAuction.bidsCount ?? 0),
    streamId: liveStreamId,
  };
}

function mapBid(apiBid: any): Bid {
  const bidder = apiBid.bidder || apiBid.user || {};
  const name = bidder.full_name || bidder.name || bidder.username || apiBid.bidderName || 'Licitante';
  const seed = bidder.username || bidder.id || name;
  return {
    id: String(apiBid.id),
    auctionId: String(apiBid.auction_id ?? apiBid.auction ?? apiBid.auctionId),
    bidderName: name,
    bidderAvatar:
      bidder.avatar_url ||
      bidder.avatar ||
      apiBid.bidderAvatar ||
      `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`,
    amount: Number(apiBid.amount),
    timestamp: apiBid.timestamp || apiBid.created_at || new Date().toISOString(),
    status: (apiBid.status || 'SUCCESS') as Bid['status'],
  };
}

function mapBidsWithStatus(bids: any[]): Bid[] {
  const mapped = bids.map(mapBid).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return mapped.map((bid, index) => ({
    ...bid,
    status: index === 0 ? ('SUCCESS' as const) : ('OVERBID' as const),
  }));
}

function mapStream(apiStream: any, auctionTitle = 'Lote de Leilão'): Stream {
  const streamer = apiStream.streamer || {};
  const name = streamer.full_name || streamer.name || streamer.username || 'Leiloeiro';
  const isLive = apiStream.status === 'LIVE' || apiStream.is_live;
  return {
    id: String(apiStream.id),
    title: apiStream.title || 'Stream ao vivo',
    auctionId: String(apiStream.auction_id ?? apiStream.auction ?? ''),
    auctionTitle: apiStream.auction_title || apiStream.auction?.title || auctionTitle,
    streamerId: String(streamer.id ?? apiStream.streamerId ?? ''),
    streamerName: name,
    streamerAvatar:
      streamer.avatar_url ||
      streamer.avatar ||
      apiStream.streamerAvatar ||
      `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`,
    viewersCount: Number(apiStream.viewer_count ?? apiStream.viewersCount ?? 0),
    rtmpKey: apiStream.stream_key || apiStream.rtmpKey || 'live_key_hidden',
    status: isLive ? 'LIVE' : apiStream.status === 'ENDED' ? 'ENDED' : 'SCHEDULED',
    startedAt: apiStream.started_at || null,
  };
}

function extractList(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export const apiService = {
  async login(emailOrUsername: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> {
    const payload = emailOrUsername.includes('@')
      ? { email: emailOrUsername, password }
      : { username: emailOrUsername, password };

    const res = await request<any>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success && res.data) {
      const access = res.data.access_token || res.data.access;
      const refresh = res.data.refresh_token || res.data.refresh;
      if (access) localStorage.setItem('bidlive_access', access);
      if (refresh) localStorage.setItem('bidlive_refresh', refresh);

      const profile = await this.getMe();
      if (profile.success && profile.user) {
        localStorage.setItem('bid_live_current_user', JSON.stringify(profile.user));
        return { success: true, user: profile.user };
      }

      const userObj = mapUser(res.data.user || res.data);
      if (userObj) {
        localStorage.setItem('bid_live_current_user', JSON.stringify(userObj));
        return { success: true, user: userObj };
      }
    }

    return {
      success: false,
      message: res.message || 'Credenciais de login inválidas.',
    };
  },

  async register(username: string, email: string, password: string, full_name?: string): Promise<{ success: boolean; message?: string }> {
    const res = await request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({ username, email, full_name, password }),
    });
    return {
      success: res.success,
      message: res.message || (res.success ? 'Cadastro realizado com sucesso! Faça login.' : 'Erro ao cadastrar usuário.'),
    };
  },

  async verifyUser(uid: string, token: string): Promise<{ success: boolean; message?: string }> {
    const res = await request('/auth/verify-user/', {
      method: 'POST',
      body: JSON.stringify({ uid, token }),
    });
    return {
      success: res.success,
      message: res.message || (res.success ? 'E-mail verificado com sucesso.' : 'Link de verificação inválido ou expirado.'),
    };
  },

  async getMe(): Promise<{ success: boolean; user?: User }> {
    const res = await request('/auth/me/');
    if (res.success && res.data) {
      return { success: true, user: mapUser(res.data) };
    }
    return { success: false };
  },

  async getCategories(): Promise<{ success: boolean; categories: AuctionCategory[] }> {
    const res = await request<any>('/categories/');
    if (res.success && res.data) {
      return { success: true, categories: extractList(res.data) };
    }
    return { success: false, categories: [] };
  },

  async getAuctions(): Promise<{ success: boolean; auctions?: Auction[] }> {
    const res = await request<any>('/auctions/');
    if (res.success && res.data) {
      const list = extractList(res.data);
      return { success: true, auctions: list.map((auction: any) => mapAuction(auction)) };
    }
    return { success: false, auctions: [] };
  },

  async getAuctionDetails(id: string): Promise<{ success: boolean; auction?: Auction; message?: string }> {
    const res = await request<any>(`/auctions/${id}/`);
    if (res.success && res.data) {
      const streamsRes = await this.getStreams(id);
      const liveStream = streamsRes.streams?.find((s) => s.status === 'LIVE');
      return { success: true, auction: mapAuction(res.data, liveStream?.id ?? null) };
    }
    return { success: false, message: res.message || 'Lote de leilão não localizado.' };
  },

  async createAuction(auctionData: Record<string, unknown>): Promise<{ success: boolean; auction?: Auction; message?: string }> {
    const res = await request<any>('/auctions/', {
      method: 'POST',
      body: JSON.stringify(auctionData),
    });
    if (res.success && res.data) {
      return { success: true, auction: mapAuction(res.data) };
    }
    return { success: false, message: res.message };
  },

  async watchAuction(id: string): Promise<{ success: boolean }> {
    const res = await request(`/auctions/${id}/watch/`, { method: 'POST' });
    return { success: res.success };
  },

  async unwatchAuction(id: string): Promise<{ success: boolean }> {
    const res = await request(`/auctions/${id}/watch/`, { method: 'DELETE' });
    return { success: res.success };
  },

  async buyNow(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await request(`/auctions/${id}/buy-now/`, { method: 'POST', body: JSON.stringify({}) });
    return { success: res.success, message: res.message };
  },

  async getBids(auctionId: string): Promise<{ success: boolean; bids?: Bid[] }> {
    const res = await request<any>(`/auctions/${auctionId}/bids/`);
    if (res.success && res.data) {
      return { success: true, bids: mapBidsWithStatus(extractList(res.data)) };
    }
    return { success: false, bids: [] };
  },

  async placeBid(auctionId: string, amount: number): Promise<{ success: boolean; message?: string; bid?: Bid }> {
    const res = await request<any>(`/auctions/${auctionId}/bids/`, {
      method: 'POST',
      body: JSON.stringify({
        amount: amount.toFixed(2),
        metadata: { source: 'web' },
      }),
    });
    if (res.success && res.data) {
      return { success: true, message: res.message || 'Lance efetuado com sucesso!', bid: mapBid(res.data) };
    }
    return { success: false, message: res.message || 'Erro ao efetuar o lance.' };
  },

  async getStreams(auctionId: string): Promise<{ success: boolean; streams?: Stream[] }> {
    const res = await request<any>(`/auctions/${auctionId}/streams/`);
    if (res.success && res.data) {
      const list = extractList(res.data);
      return { success: true, streams: list.map((s: any) => mapStream(s)) };
    }
    return { success: false, streams: [] };
  },

  async startStream(auctionId: string, streamId: string): Promise<{ success: boolean; message?: string }> {
    const res = await request(`/auctions/${auctionId}/streams/${streamId}/start/`, { method: 'POST' });
    return { success: res.success, message: res.message };
  },

  async endStream(auctionId: string, streamId: string): Promise<{ success: boolean; message?: string }> {
    const res = await request(`/auctions/${auctionId}/streams/${streamId}/end/`, { method: 'POST' });
    return { success: res.success, message: res.message };
  },

  async getLiveKitToken(
    auctionId: string,
    streamId: string,
    role: 'viewer' | 'broadcaster' | 'moderator',
    participantName: string
  ): Promise<{
    success: boolean;
    message?: string;
    token?: string;
    url?: string;
    room_name?: string;
    identity?: string;
    can_publish?: boolean;
    can_subscribe?: boolean;
  }> {
    const res = await request<any>(`/auctions/${auctionId}/streams/${streamId}/livekit-token/`, {
      method: 'POST',
      body: JSON.stringify({
        role,
        participant_name: participantName,
        metadata: { source: 'frontend', device: 'desktop' },
      }),
    });

    if (res.success && res.data) {
      return {
        success: true,
        token: res.data.token,
        url: res.data.url,
        room_name: res.data.room_name,
        identity: res.data.identity,
        can_publish: res.data.can_publish,
        can_subscribe: res.data.can_subscribe,
      };
    }
    return { success: false, message: res.message || 'Erro ao emitir token do LiveKit.' };
  },
};
