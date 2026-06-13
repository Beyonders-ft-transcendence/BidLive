/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  INITIAL_NOTIFICATIONS,
  INITIAL_REPORTS,
  INITIAL_SYSTEM_LOGS,
  INITIAL_USERS,
} from './data/mockData';
import { Auction, Bid, Stream, User, Notification, Report, SystemLog } from './types';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Auctions from './pages/Auctions';
import AuctionDetails from './pages/AuctionDetails';
import LiveStreams from './pages/LiveStreams';
import Profile from './pages/Profile';
import MyAuctions, { CreateAuctionInput } from './pages/MyAuctions';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import VerifyUser from './pages/VerifyUser';
import { apiService, logout } from './services/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  const syncBackendData = useCallback(async () => {
    const [auctionsRes] = await Promise.all([apiService.getAuctions()]);
    if (!auctionsRes.success || !auctionsRes.auctions) return;

    setAuctions(auctionsRes.auctions);

    const allStreams: Stream[] = [];
    const allBids: Bid[] = [];

    await Promise.all(
      auctionsRes.auctions.map(async (auction) => {
        const [sRes, bRes] = await Promise.all([
          apiService.getStreams(auction.id),
          apiService.getBids(auction.id),
        ]);
        if (sRes.success && sRes.streams) allStreams.push(...sRes.streams);
        if (bRes.success && bRes.bids) allBids.push(...bRes.bids);
      })
    );

    setStreams(allStreams);
    setBids(allBids);

    // Enrich auctions with highest bidder from latest bid
    setAuctions((prev) =>
      prev.map((auction) => {
        const auctionBids = allBids
          .filter((b) => b.auctionId === auction.id)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const topBid = auctionBids[0];
        const liveStream = allStreams.find((s) => s.auctionId === auction.id && s.status === 'LIVE');
        return {
          ...auction,
          streamId: liveStream?.id ?? auction.streamId,
          bidsCount: auctionBids.length || auction.bidsCount,
          currentBidderName: topBid?.bidderName ?? auction.currentBidderName,
        };
      })
    );
  }, []);

  const refreshAuction = useCallback(
    async (auctionId: string) => {
      const [aRes, bRes, sRes] = await Promise.all([
        apiService.getAuctionDetails(auctionId),
        apiService.getBids(auctionId),
        apiService.getStreams(auctionId),
      ]);

      if (aRes.success && aRes.auction) {
        const topBid = bRes.bids?.[0];
        const enriched = {
          ...aRes.auction,
          bidsCount: bRes.bids?.length ?? aRes.auction.bidsCount,
          currentBidderName: topBid?.bidderName ?? aRes.auction.currentBidderName,
        };
        setAuctions((prev) => prev.map((a) => (a.id === auctionId ? enriched : a)));
      }

      if (bRes.success && bRes.bids) {
        setBids((prev) => [...bRes.bids!, ...prev.filter((b) => b.auctionId !== auctionId)]);
      }

      if (sRes.success && sRes.streams) {
        setStreams((prev) => [...sRes.streams!, ...prev.filter((s) => s.auctionId !== auctionId)]);
      }
    },
    []
  );

  useEffect(() => {
    const localNotifs = localStorage.getItem('bid_live_notifications');
    const localReports = localStorage.getItem('bid_live_reports');
    const localLogs = localStorage.getItem('bid_live_system_logs');
    const localWatch = localStorage.getItem('bid_live_watchlist');

    setNotifications(localNotifs ? JSON.parse(localNotifs) : INITIAL_NOTIFICATIONS);
    setReports(localReports ? JSON.parse(localReports) : INITIAL_REPORTS);
    setSystemLogs(localLogs ? JSON.parse(localLogs) : INITIAL_SYSTEM_LOGS);
    if (localWatch) setWatchlist(JSON.parse(localWatch));

    async function bootstrap() {
      const token = localStorage.getItem('bidlive_access');
      if (!token) {
        setIsBootstrapping(false);
        return;
      }

      const cachedUser = localStorage.getItem('bid_live_current_user');
      if (cachedUser) setCurrentUser(JSON.parse(cachedUser));

      const me = await apiService.getMe();
      if (me.success && me.user) {
        me.user.balance = 500000.00; // Simula saldo para testes
        setCurrentUser(me.user);
        localStorage.setItem('bid_live_current_user', JSON.stringify(me.user));
        await syncBackendData();
      } else {
        logout();
        setCurrentUser(null);
      }
      setIsBootstrapping(false);
    }

    bootstrap();
  }, [syncBackendData]);

  useEffect(() => {
    if (!currentUser || !localStorage.getItem('bidlive_access')) return;

    const interval = setInterval(syncBackendData, 15000);
    return () => clearInterval(interval);
  }, [currentUser, syncBackendData]);

  useEffect(() => {
    const handleLogoutEvent = () => handleLogout();
    window.addEventListener('bidlive_logout', handleLogoutEvent);
    return () => window.removeEventListener('bidlive_logout', handleLogoutEvent);
  }, []);

  useEffect(() => {
    const handleWsSync = () => {
      if (selectedAuctionId) refreshAuction(selectedAuctionId);
      else syncBackendData();
    };
    window.addEventListener('bidlive_websocket_sync', handleWsSync);
    return () => window.removeEventListener('bidlive_websocket_sync', handleWsSync);
  }, [selectedAuctionId, refreshAuction, syncBackendData]);

  const saveToLocal = (key: string, data: unknown) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const placeBid = async (auctionId: string, amount: number) => {
    if (!currentUser) return { success: false, message: 'Usuário não autenticado.' };

    const res = await apiService.placeBid(auctionId, amount);
    if (res.success) {
      await refreshAuction(auctionId);
      return { success: true, message: res.message || 'Seu lance foi transmitido!' };
    }
    return { success: false, message: res.message || 'Falha ao registrar lance no backend.' };
  };

  const buyNowSubmit = async (auctionId: string) => {
    if (!currentUser) return { success: false, message: 'Usuário não autenticado.' };

    const res = await apiService.buyNow(auctionId);
    if (res.success) {
      const meRes = await apiService.getMe();
      if (meRes.success && meRes.user) {
        setCurrentUser(meRes.user);
        saveToLocal('bid_live_current_user', meRes.user);
      }
      await refreshAuction(auctionId);
      return { success: true, message: res.message || 'Parabéns, lote arrematado com sucesso!' };
    }
    return { success: false, message: res.message || 'Falha ao processar compra direta no backend.' };
  };

  const toggleWatchlist = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const isCurrentlyWatching = watchlist.includes(id);
    const nextList = isCurrentlyWatching ? watchlist.filter((wid) => wid !== id) : [...watchlist, id];
    setWatchlist(nextList);
    saveToLocal('bid_live_watchlist', nextList);

    if (isCurrentlyWatching) await apiService.unwatchAuction(id);
    else await apiService.watchAuction(id);
  };

  const addFundsSimulated = (amount: number) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, balance: currentUser.balance + amount };
    setCurrentUser(updatedUser);
    saveToLocal('bid_live_current_user', updatedUser);
  };

  const updateProfile = (name: string, bio: string, avatar: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, name, bio, avatar };
    setCurrentUser(updatedUser);
    saveToLocal('bid_live_current_user', updatedUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuctions([]);
    setBids([]);
    setStreams([]);
    localStorage.removeItem('bidlive_access');
    localStorage.removeItem('bidlive_refresh');
    localStorage.removeItem('bid_live_current_user');
    setCurrentPage('home');
  };

  const handleLoginSuccess = async (user: User) => {
    const enrichedUser = { ...user, balance: 500000.00 };
    setCurrentUser(enrichedUser);
    saveToLocal('bid_live_current_user', enrichedUser);
    await syncBackendData();

    const welcomeNotif: Notification = {
      id: `not-welcome-${Date.now()}`,
      title: `Bem-vindo à BidLive, ${user.name}! 🚀`,
      description: 'Autenticado com sucesso. Dados de leilões sincronizados com o backend.',
      type: 'SYSTEM',
      read: false,
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [welcomeNotif, ...prev]);
  };

  const createAuctionLot = async (data: CreateAuctionInput): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser) return { success: false, message: 'Usuário não autenticado.' };

    const payload: Record<string, unknown> = {
      title: data.title,
      description: data.description,
      condition_type: 'USED',
      starting_price: data.startPrice.toFixed(2),
      minimum_increment: data.minIncrement.toFixed(2),
      start_time: data.startTime,
      end_time: data.endTime,
      image_urls: data.images,
    };

    if (data.categoryId) payload.category_id = data.categoryId;
    if (data.buyNowPrice) payload.buy_now_price = data.buyNowPrice.toFixed(2);

    const res = await apiService.createAuction(payload);
    if (res.success && res.auction) {
      setAuctions((prev) => [res.auction!, ...prev]);
      await syncBackendData();
      return { success: true };
    }
    return { success: false, message: res.message || 'Erro ao publicar lote.' };
  };

  const resolveReport = (id: string, action: 'RESOLVED' | 'DISMISSED') => {
    const nextRepList = reports.map((r) => (r.id === id ? { ...r, status: action } : r));
    setReports(nextRepList);
    saveToLocal('bid_live_reports', nextRepList);
  };

  const markNotificationsAsRead = () => {
    const nextNotifs = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(nextNotifs);
    saveToLocal('bid_live_notifications', nextNotifs);
  };

  const navigateToDetails = (auctionId: string) => {
    setSelectedAuctionId(auctionId);
    setCurrentPage('details');
    refreshAuction(auctionId);
  };

  const navigateToStream = (streamId: string, watchPage: boolean) => {
    setSelectedStreamId(streamId);
    const associatedStr = streams.find((s) => s.id === streamId);
    if (associatedStr && watchPage) {
      setSelectedAuctionId(associatedStr.auctionId);
      setCurrentPage('details');
      refreshAuction(associatedStr.auctionId);
    } else {
      setCurrentPage('streams');
    }
  };

  const selectedAuction = selectedAuctionId ? auctions.find((a) => a.id === selectedAuctionId) ?? null : null;
  const isVerifyUserRoute = window.location.pathname === '/verify-user';

  const goToLoginFromVerification = () => {
    window.history.replaceState(null, '', '/');
    setCurrentPage('home');
  };

  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 text-sm">
        Conectando ao backend...
      </div>
    );
  }

  if (isVerifyUserRoute) {
    return <VerifyUser onBackToLogin={goToLoginFromVerification} />;
  }

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans flex flex-col selection:bg-sky-505 selection:text-white">
      <Header
        currentUser={currentUser}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        notifications={notifications}
        markNotificationsAsRead={markNotificationsAsRead}
        setSelectedAuctionId={setSelectedAuctionId}
        setSelectedStreamId={setSelectedStreamId}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-10 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage + (selectedAuctionId || '')}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-full text-zinc-300"
          >
            {currentPage === 'home' && (
              <Home
                auctions={auctions}
                streams={streams}
                onSelectAuction={navigateToDetails}
                onSelectStream={navigateToStream}
                watchlist={watchlist}
                onWatchToggle={toggleWatchlist}
              />
            )}

            {currentPage === 'auctions' && (
              <Auctions
                auctions={auctions}
                onSelectAuction={navigateToDetails}
                watchlist={watchlist}
                onWatchToggle={toggleWatchlist}
              />
            )}

            {currentPage === 'details' && selectedAuctionId && (
              <AuctionDetails
                auction={selectedAuction}
                auctionId={selectedAuctionId}
                currentUser={currentUser}
                onPlaceBid={placeBid}
                onBuyNow={buyNowSubmit}
                onWatchToggle={toggleWatchlist}
                isWatched={watchlist.includes(selectedAuctionId)}
                onBack={() => setCurrentPage('auctions')}
                bids={bids}
                streams={streams}
                onRefresh={() => refreshAuction(selectedAuctionId)}
              />
            )}

            {currentPage === 'streams' && (
              <LiveStreams streams={streams} onSelectStream={navigateToStream} />
            )}

            {currentPage === 'profile' && (
              <Profile
                currentUser={currentUser}
                onUpdateProfile={updateProfile}
                onAddFunds={addFundsSimulated}
                onLogout={handleLogout}
              />
            )}

            {currentPage === 'my-auctions' && (
              <MyAuctions currentUser={currentUser} onCreateAuction={createAuctionLot} />
            )}

            {currentPage === 'dashboard' && (
              <Dashboard
                currentUser={currentUser}
                onPageNav={(page, id) => {
                  if (page === 'details' && id) navigateToDetails(id);
                  else setCurrentPage(page);
                }}
                auctions={auctions}
                bids={bids}
                watchlist={watchlist}
                notifications={notifications}
              />
            )}

            {currentPage === 'admin' && (
              <AdminPanel
                initialUsers={INITIAL_USERS}
                reports={reports}
                onResolveReport={resolveReport}
                systemLogs={systemLogs}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="py-6 border-t border-zinc-900 bg-zinc-950 text-center text-xs text-zinc-650 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>© 12026 BidLive, Inc. Todos os direitos reservados.</span>
          <span className="text-[10px] text-zinc-700">
            Auditado por Protocolos RBAC e chaves WebRTC de latência ultra-baixa.
          </span>
        </div>
      </footer>
    </div>
  );
}
