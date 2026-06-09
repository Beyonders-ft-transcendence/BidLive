/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Shield, Award, MessageSquare } from 'lucide-react';
import { Message, User } from '../../types';

interface LiveChatProps {
  roomId: string;
  currentUser: User;
}

const CHAT_SIMULATOR_COMMENTERS = [
  { name: 'Ana Silva', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=50&h=50&q=80', role: 'USER' },
  { name: 'Carlos Oliveira', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=50&h=50&q=80', role: 'MANAGER' },
  { name: 'Roberto Santos', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=50&h=50&q=80', role: 'USER' },
  { name: 'Amanda Rocha', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=50&h=50&q=80', role: 'USER' },
  { name: 'Marcos Dev', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=50&h=50&q=80', role: 'USER' }
];

const CHAT_SIMULATOR_PHRASES = [
  'Essa peça é incrível!',
  'Será que sobe muito o preço ainda?',
  'Meu deus, meu bolso não acompanha',
  'Caramba, o estado de conservação parece impecável mesmo!',
  'Alguém daria lance de buy now agora?',
  'Esse leiloeiro é excelente, sempre trazendo jóias raras',
  'Lance pesado acabei de ver ali',
  'Estou de olho desde ontem...',
  'A qualidade da live está ótima!! 🚀',
  'Alguém me empresta uma grana? Quero muito isso haha',
  'Interesse absurdo, muito bom!',
];

export default function LiveChat({ roomId, currentUser }: LiveChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize with initial room messages
  useEffect(() => {
    const initialMsgs: Message[] = [
      {
        id: 'msg-init-1',
        roomId,
        senderName: 'Carlos Oliveira',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
        content: 'Olá pessoal! Conexão estabelecida com sucesso com o servidor central.',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        role: 'MANAGER'
      },
      {
        id: 'msg-init-2',
        roomId,
        senderName: 'Ana Silva',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
        content: 'Sejam bem-vindos! Tirem suas dúvidas pelo chat a qualquer momento.',
        timestamp: new Date(Date.now() - 150000).toISOString(),
        role: 'USER'
      }
    ];
    setMessages(initialMsgs);
  }, [roomId]);

  // Handle auto scroll
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate remote chat messages periodically
  useEffect(() => {
    const timer = setInterval(() => {
      // 30% chance to generate a comment from a mock user
      if (Math.random() < 0.35) {
        const commenter = CHAT_SIMULATOR_COMMENTERS[Math.floor(Math.random() * CHAT_SIMULATOR_COMMENTERS.length)];
        const phrase = CHAT_SIMULATOR_PHRASES[Math.floor(Math.random() * CHAT_SIMULATOR_PHRASES.length)];

        const newMsg: Message = {
          id: `msg-sim-${Date.now()}`,
          roomId,
          senderName: commenter.name,
          senderAvatar: commenter.avatar,
          content: phrase,
          timestamp: new Date().toISOString(),
          role: commenter.role as any
        };

        setMessages(prev => [...prev, newMsg]);
      }
    }, 7000);

    return () => clearInterval(timer);
  }, [roomId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const myMsg: Message = {
      id: `msg-user-${Date.now()}`,
      roomId,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content: inputVal.trim(),
      timestamp: new Date().toISOString(),
      role: currentUser.role
    };

    setMessages(prev => [...prev, myMsg]);
    setInputVal('');
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg">
      
      {/* Header chat room info */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/60 border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-sky-400" />
          <h3 className="font-sans font-semibold text-white text-sm">Chat Transmissão</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950/40 border border-emerald-900/20 text-[10px] font-mono text-emerald-400 animate-pulse">
          <Users className="h-3 w-3" />
          <span>Realtime Connection</span>
        </div>
      </div>

      {/* Messages Scroll Wrapper */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
        {messages.map(msg => (
          <div key={msg.id} className="flex gap-2.5 items-start">
            <img
              src={msg.senderAvatar}
              alt={msg.senderName}
              referrerPolicy="no-referrer"
              className="h-7 w-7 rounded-md object-cover ring-1 ring-zinc-800"
            />
            <div className="flex-1 leading-normal text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                
                {/* Role tags inside chat log */}
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
                  {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
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

      {/* Message Submit Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-900 bg-zinc-950">
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
            className="absolute right-1.5 top-1.5 p-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-md transition-colors"
            id="chat-submit"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
