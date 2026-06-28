/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Award, MessageSquare, Send, Shield, Users } from 'lucide-react';
import { Message, User } from '../../types';
import { apiService } from '../../services/api';

interface LiveChatProps {
  auctionId: string;
  currentUser: User;
}

export default function LiveChat({ auctionId, currentUser }: LiveChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMessages(showLoading = false) {
      if (showLoading) setIsLoading(true);
      const res = await apiService.getAuctionChatMessages(auctionId);
      if (!isMounted) return;

      if (res.success && res.messages) {
        setMessages(res.messages);
        setErrorMsg(null);
      } else if (showLoading) {
        setErrorMsg(res.message || 'Nao foi possivel carregar o chat.');
      }
      if (showLoading) setIsLoading(false);
    }

    loadMessages(true);
    const interval = setInterval(() => loadMessages(false), 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [auctionId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const messageText = inputVal.trim();
    const optimisticMessage: Message = {
      id: `msg-user-${Date.now()}`,
      roomId: auctionId,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content: messageText,
      timestamp: new Date().toISOString(),
      role: currentUser.role,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInputVal('');
    setErrorMsg(null);

    const res = await apiService.sendAuctionChatMessage(auctionId, messageText);
    if (res.success && res.chatMessage) {
      setMessages((prev) => [...prev.filter((msg) => msg.id !== optimisticMessage.id), res.chatMessage!]);
      return;
    }

    setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
    setInputVal(messageText);
    setErrorMsg(res.message || 'Nao foi possivel enviar a mensagem.');
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/60 border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-sky-400" />
          <h3 className="font-sans font-semibold text-white text-sm">Chat Transmissao</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950/40 border border-emerald-900/20 text-[10px] font-mono text-emerald-400">
          <Users className="h-3 w-3" />
          <span>REST Sync</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
        {isLoading && <div className="py-8 text-center text-zinc-500 text-xs">Carregando historico do chat...</div>}
        {!isLoading && messages.length === 0 && (
          <div className="py-8 text-center text-zinc-500 text-xs">Nenhuma mensagem nesta sala ainda.</div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-2.5 items-start">
            <img
              src={msg.senderAvatar}
              alt={msg.senderName}
              referrerPolicy="no-referrer"
              className="h-7 w-7 rounded-md object-cover ring-1 ring-zinc-800"
            />
            <div className="flex-1 leading-normal text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                {msg.role === 'ADMIN' && (
                  <span className="inline-flex items-center gap-0.5 px-1 rounded bg-red-950 text-red-400 font-bold font-sans text-[8px] tracking-wider uppercase border border-red-900/40">
                    <Shield className="h-2 w-2" />
                    Admin
                  </span>
                )}
                {msg.role === 'MANAGER' && (
                  <span className="inline-flex items-center gap-0.5 px-1 rounded bg-indigo-950 text-indigo-400 font-bold font-sans text-[8px] tracking-wider uppercase border border-indigo-900/40">
                    <Award className="h-2 w-2" />
                    Manager
                  </span>
                )}

                <span className="font-sans font-bold text-zinc-300">{msg.senderName}</span>
                <span className="text-[9px] text-zinc-600 font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-zinc-400 mt-1 leading-relaxed break-words bg-zinc-900/30 p-2 rounded border border-zinc-900/40">
                {msg.content}
              </p>
            </div>
          </div>
        ))}
        <div ref={chatBottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-900 bg-zinc-950">
        {errorMsg && (
          <div className="mb-2 rounded-md border border-red-900/40 bg-red-950/25 px-3 py-2 text-[11px] text-red-400">
            {errorMsg}
          </div>
        )}
        <div className="relative">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Enviar mensagem para o chat..."
            className="w-full h-10 pl-3.5 pr-11 text-xs text-white placeholder-zinc-500 bg-zinc-900 hover:bg-zinc-900/85 border border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            id="chat-input"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 p-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-md transition-colors disabled:opacity-50"
            id="chat-submit"
            disabled={!inputVal.trim()}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
