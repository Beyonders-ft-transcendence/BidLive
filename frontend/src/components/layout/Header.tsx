/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Gavel, Tv, Search, Bell, User as UserIcon, LayoutDashboard, PlusCircle, ShieldCheck, DollarSign, Sparkles, LogOut } from 'lucide-react';
import { User, Notification } from '../../types';

interface HeaderProps {
  currentUser: User;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  notifications: Notification[];
  markNotificationsAsRead: () => void;
  setSelectedAuctionId: (id: string | null) => void;
  setSelectedStreamId: (id: string | null) => void;
  onLogout: () => void;
}

export default function Header({
  currentUser,
  currentPage,
  setCurrentPage,
  notifications,
  markNotificationsAsRead,
  setSelectedAuctionId,
  setSelectedStreamId,
  onLogout
}: HeaderProps) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNav = (page: string) => {
    setSelectedAuctionId(null);
    setSelectedStreamId(null);
    setCurrentPage(page);
    setShowNotifDropdown(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Brand Logo */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-2.5 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-md py-1"
          id="btn-nav-home-logo"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-md text-white">
            <Gavel className="h-5 w-5" />
          </div>
          <div className="text-left">
            <span className="block font-sans text-lg font-bold tracking-tight text-white">BidLive</span>
            <span className="block font-mono text-[10px] tracking-wider uppercase text-sky-400">Realtime Hub</span>
          </div>
        </button>

        {/* Global Navigation links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => handleNav('home')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentPage === 'home' 
                ? 'bg-zinc-800 text-white' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
            id="nav-link-home"
          >
            Início
          </button>
          <button
            onClick={() => handleNav('auctions')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentPage === 'auctions' 
                ? 'bg-zinc-800 text-white' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
            id="nav-link-auctions"
          >
            Leilões
          </button>
          <button
            onClick={() => handleNav('streams')}
            className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
              currentPage === 'streams' 
                ? 'bg-red-950/40 text-red-400' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
            id="nav-link-streams"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
            Transmissões
          </button>
          <button
            onClick={() => handleNav('dashboard')}
            className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
              currentPage === 'dashboard' 
                ? 'bg-zinc-800 text-white' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
            id="nav-link-dashboard"
          >
            <LayoutDashboard className="h-4 w-4" />
            Minha Conta
          </button>
          <button
            onClick={() => handleNav('my-auctions')}
            className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
              currentPage === 'my-auctions' 
                ? 'bg-zinc-800 text-white' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
            id="nav-link-my-auctions"
          >
            <PlusCircle className="h-4 w-4" />
            Anunciar
          </button>
          {currentUser.role === 'ADMIN' && (
            <button
              onClick={() => handleNav('admin')}
              className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors border ${
                currentPage === 'admin'
                  ? 'bg-indigo-950/50 border-indigo-500/50 text-indigo-300'
                  : 'text-indigo-400/80 border-indigo-900/20 hover:text-indigo-300 hover:bg-indigo-950/20'
              }`}
              id="nav-link-admin"
            >
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              Painel Admin
            </button>
          )}
        </nav>

        {/* Dynamic Wallet, Notification and User Avatar */}
        <div className="flex items-center gap-3">
          
          {/* User balance wallet */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-sm">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            <span className="font-mono font-medium text-emerald-400">
              R$ {currentUser.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Real-time Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                if (!showNotifDropdown) markNotificationsAsRead();
              }}
              className={`p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors relative ${
                showNotifDropdown ? 'bg-zinc-900 text-white' : ''
              }`}
              id="btn-notification-bell"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications panel dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl z-50 p-1">
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900">
                  <h3 className="font-sans font-semibold text-white text-sm">Notificações Recentes</h3>
                  <button 
                    onClick={() => handleNav('dashboard')}
                    className="text-xs text-sky-400 hover:text-sky-300 font-medium"
                  >
                    Ver todas
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto py-1">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-zinc-500 text-xs">
                      Nenhuma notificação nova.
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        className={`px-4 py-3 border-b border-zinc-900/40 hover:bg-zinc-900/30 transition-colors flex gap-3 ${
                          !notif.read ? 'bg-sky-950/10' : ''
                        }`}
                      >
                        <div className="mt-0.5">
                          {notif.type === 'OUTBID' && <span className="flex h-2 w-2 rounded-full bg-red-500 mt-1.5" />}
                          {notif.type === 'BID_WON' && <span className="flex h-2 w-2 rounded-full bg-emerald-500 mt-1.5" />}
                          {notif.type === 'LIVE_START' && <span className="flex h-2 w-2 rounded-full bg-red-500 mt-1.5" />}
                          {notif.type === 'SYSTEM' && <span className="flex h-2 w-2 rounded-full bg-sky-500 mt-1.5" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-zinc-200 text-xs font-semibold leading-snug">{notif.title}</p>
                          <p className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">{notif.description}</p>
                          <span className="block text-[9px] text-zinc-500 font-mono mt-1">
                            {new Date(notif.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar button */}
          <button
            onClick={() => handleNav('profile')}
            className={`flex items-center gap-2 p-1 pl-1.5 pr-2 sm:pr-3 rounded-lg border border-zinc-800 hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors ${
              currentPage === 'profile' ? 'bg-zinc-900 border-sky-500/50' : 'bg-transparent'
            }`}
            id="btn-nav-profile"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="h-7 w-7 rounded-md object-cover ring-1 ring-zinc-700"
            />
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-semibold text-white leading-none">{currentUser.name}</span>
              <span className="block text-[9px] text-zinc-400 leading-none mt-0.5 font-mono uppercase tracking-wider">
                {currentUser.role}
              </span>
            </div>
          </button>

          {/* Sair / Logout Button */}
          <button
            onClick={onLogout}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-red-400 hover:bg-red-950/20 hover:border-red-900/35 transition-colors cursor-pointer"
            title="Sair da Conta"
            id="btn-header-logout"
          >
            <LogOut className="h-4 w-4" />
          </button>

        </div>
      </div>

      {/* Mobile Quick Rail Navigation (only visible under medium screens) */}
      <div className="md:hidden border-t border-zinc-900 bg-zinc-950/95 overflow-x-auto whitespace-nowrap px-4 py-2 flex gap-1.5 scrollbar-none">
        <button
          onClick={() => handleNav('home')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            currentPage === 'home' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
          }`}
        >
          Início
        </button>
        <button
          onClick={() => handleNav('auctions')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            currentPage === 'auctions' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
          }`}
        >
          Leilões
        </button>
        <button
          onClick={() => handleNav('streams')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            currentPage === 'streams' ? 'bg-red-950/40 text-red-400' : 'text-zinc-400'
          }`}
        >
          Transmissões
        </button>
        <button
          onClick={() => handleNav('dashboard')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            currentPage === 'dashboard' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
          }`}
        >
          Minha Conta
        </button>
        <button
          onClick={() => handleNav('my-auctions')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            currentPage === 'my-auctions' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
          }`}
        >
          Anunciar
        </button>
        {currentUser.role === 'ADMIN' && (
          <button
            onClick={() => handleNav('admin')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              currentPage === 'admin' ? 'bg-indigo-950/50 border-indigo-500/50 text-indigo-300' : 'text-indigo-400 border-indigo-900/30'
            }`}
          >
            Admin
          </button>
        )}
        <button
          onClick={onLogout}
          className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-red-400 border border-red-950/40 bg-red-950/10 hover:bg-red-950/20 active:bg-red-950/30 transition-colors"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
