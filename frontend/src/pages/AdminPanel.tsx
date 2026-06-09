/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Radio, Cpu, Settings, Ban, ShieldCheck, Heart, AlertTriangle, Terminal, Sliders, Check } from 'lucide-react';
import { User, Report, SystemLog } from '../types';

interface AdminPanelProps {
  initialUsers: User[];
  reports: Report[];
  onResolveReport: (id: string, action: 'RESOLVED' | 'DISMISSED') => void;
  systemLogs: SystemLog[];
}

type AdminTab = 'users-rbac' | 'reports-moderation' | 'live-telemetry' | 'system-configs';

export default function AdminPanel({
  initialUsers,
  reports,
  onResolveReport,
  systemLogs: initialSystemLogs
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('users-rbac');
  const [users, setUsers] = useState<User[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(initialSystemLogs);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Platform configs state
  const [wsReconnectMs, setWsReconnectMs] = useState('3000');
  const [rateLimitThrot, setRateLimitThrot] = useState('60');
  const [webrtcCodec, setWebrtcCodec] = useState('H264 (High Profile)');

  // Sync users
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  // Telemetry loop - append realistic system logs to logs console every 8s
  useEffect(() => {
    const timer = setInterval(() => {
      const randomModules = ['CHANNELS_ROUTING', 'CELERY_ASYNC_WORKER', 'POSTGRES_POOLER', 'JWT_VERIFIER', 'WEBRTC_COORDINATOR'];
      const randomMsgs = [
        'Websocket heartbeat packet acknowledged for u-current.',
        'Asynchronous job CEL_JOB_90412 execution finished.',
        'Google OAuth endpoint cert signature verified.',
        'Active viewport count updated for stream str-1.',
        'Database connection pool statistics: 4 active / 48 idle.'
      ];
      
      const newLog: SystemLog = {
        id: `sys-log-sim-${Date.now()}`,
        level: Math.random() < 0.15 ? 'WARNING' : 'INFO',
        module: randomModules[Math.floor(Math.random() * randomModules.length)],
        message: randomMsgs[Math.floor(Math.random() * randomMsgs.length)],
        details: 'Self-diagnosed payload verified. No actions needed.',
        timestamp: new Date().toISOString()
      };

      setSystemLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
    }, 8500);

    return () => clearInterval(timer);
  }, []);

  // Ban toggle simulator
  const toggleUserBan = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
        setShowToast(`Status do usuário ${u.name} alterado para ${nextStatus}`);
        setTimeout(() => setShowToast(null), 3000);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const saveConfigs = (e: React.FormEvent) => {
    e.preventDefault();
    setShowToast('Parâmetros administrativos salvos e consolidados em base de dados.');
    setTimeout(() => setShowToast(null), 3000);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Title section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight font-sans flex items-center gap-2">
            <ShieldAlert className="h-5.5 w-5.5 text-indigo-400" />
            Central de Comando Executivo
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5 font-sans">Painel integrado para auditoria RBAC correntes, banimentos, logs e moderação de reports.</p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-950/20 border border-red-900/30 rounded-lg text-xs font-mono text-red-400 animate-pulse">
          <span className="flex h-1.5 w-1.5 rounded-full bg-red-500" />
          <span>Servidor Principal: Online</span>
        </div>
      </div>

      {/* Show alert confirmations toast if set */}
      {showToast && (
        <div className="p-3 bg-zinc-900 border border-indigo-500/40 text-indigo-400 rounded-lg text-xs text-left animate-in fade-in duration-150 font-medium">
          ⚙️ {showToast}
        </div>
      )}

      {/* Grid selector buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-b border-zinc-900 pb-2">
        <button
          onClick={() => setActiveTab('users-rbac')}
          className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center gap-1.5 justify-center transition-all ${
            activeTab === 'users-rbac' ? 'bg-zinc-900 text-white border-b-2 border-sky-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          id="tab-admin-users"
        >
          <Users className="h-4 w-4" />
          Usuários & Roles
        </button>

        <button
          onClick={() => setActiveTab('reports-moderation')}
          className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center gap-1.5 justify-center transition-all ${
            activeTab === 'reports-moderation' ? 'bg-zinc-900 text-white border-b-2 border-sky-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          id="tab-admin-reports"
        >
          <AlertTriangle className="h-4 w-4" />
          Reports Pendentes ({reports.filter(r => r.status === 'OPEN').length})
        </button>

        <button
          onClick={() => setActiveTab('live-telemetry')}
          className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center gap-1.5 justify-center transition-all ${
            activeTab === 'live-telemetry' ? 'bg-zinc-900 text-white border-b-2 border-sky-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          id="tab-admin-logs"
        >
          <Terminal className="h-4 w-4" />
          Telemetria do Servidor
        </button>

        <button
          onClick={() => setActiveTab('system-configs')}
          className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center gap-1.5 justify-center transition-all ${
            activeTab === 'system-configs' ? 'bg-zinc-900 text-white border-b-2 border-sky-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          id="tab-admin-configs"
        >
          <Sliders className="h-4 w-4" />
          Configurações API
        </button>
      </div>

      {/* Main core window canvas */}
      <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-900 shadow-xl min-h-[300px]">
        
        {/* TAB 1: USERS list & dynamic ban moderation */}
        {activeTab === 'users-rbac' && (
          <div className="space-y-4">
            <h3 className="text-zinc-200 font-sans font-bold text-sm border-b border-zinc-900 pb-3 flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-sky-400" />
              Relação de Usuários da Rede
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-900/40 text-zinc-500 font-mono font-bold uppercase tracking-wider border-b border-zinc-900">
                    <th className="px-5 py-3">Nome</th>
                    <th className="px-5 py-3">E-mail</th>
                    <th className="px-5 py-3">Nível RBAC</th>
                    <th className="px-5 py-3 text-right font-mono">Disponível R$</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60 font-sans text-zinc-300">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-zinc-900/10 transition-colors">
                      <td className="px-5 py-3.5 flex items-center gap-2">
                        <img src={u.avatar} alt="User Avatar" className="h-6 w-6 rounded-md object-cover" />
                        <span className="font-semibold text-zinc-200">{u.name}</span>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-400 font-mono text-zinc-500">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wide ${
                          u.role === 'ADMIN' ? 'bg-red-950 text-red-400 border border-red-900/40' : u.role === 'MANAGER' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/40' : 'bg-zinc-900 text-zinc-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-emerald-400 font-bold">
                        R$ {u.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {u.status === 'ACTIVE' ? (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-semibold border border-emerald-900/20">Active</span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-400 text-[10px] font-semibold border border-red-900/20">Banned</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {u.id !== 'u-current' ? (
                          <button
                            onClick={() => toggleUserBan(u.id)}
                            className={`p-1.5 rounded transition-all border ${
                              u.status === 'ACTIVE'
                                ? 'bg-red-950/20 text-red-400 border-red-900/40 hover:bg-red-950/50'
                                : 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30 hover:bg-emerald-950/50'
                            }`}
                            title={u.status === 'ACTIVE' ? 'Banir Usuário' : 'Normalizar conta'}
                            id={`btn-ban-${u.id}`}
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-zinc-650 font-mono italic">Você (Admin)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Reported lots, modulations */}
        {activeTab === 'reports-moderation' && (
          <div className="space-y-4">
            <h3 className="text-zinc-200 font-sans font-bold text-sm border-b border-zinc-900 pb-3 flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
              Denúncias e Riscos sob Lotes Registrados
            </h3>

            {reports.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                Nenhuma denúncia pendente de intermediação.
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map(rep => (
                  <div key={rep.id} className="p-4 rounded-xl border border-zinc-900/80 bg-zinc-900/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-500">Lote Denunciado: {rep.auctionTitle}</span>
                      <p className="font-sans font-bold text-zinc-200 text-xs leading-normal">Motivo: {rep.reason}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">Enviador por: {rep.reporterName} • {new Date(rep.timestamp).toLocaleDateString('pt-BR')}</p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {rep.status === 'OPEN' ? (
                        <>
                          <button
                            onClick={() => onResolveReport(rep.id, 'DISMISSED')}
                            className="px-3 py-1.5 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white rounded text-[11px] font-semibold transition-colors"
                            id={`btn-dismiss-${rep.id}`}
                          >
                            Descartar
                          </button>
                          <button
                            onClick={() => onResolveReport(rep.id, 'RESOLVED')}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-[11px] font-bold transition-colors"
                            id={`btn-resolve-${rep.id}`}
                          >
                            Bloquear Lote
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-zinc-500 italic font-mono uppercase bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                          Status: {rep.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Simulated server telemetry logs console screen */}
        {activeTab === 'live-telemetry' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <h3 className="text-zinc-200 font-sans font-bold text-sm flex items-center gap-2">
                <Terminal className="h-4.5 w-4.5 text-indigo-400" />
                Console de Diagnósticos do Servidor
              </h3>
              <span className="text-[9px] font-mono text-zinc-500">Auto-refresh ativo (8s)</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 font-mono text-[11px] text-left leading-relaxed text-zinc-400 space-y-2 h-72 overflow-y-auto scrollbar-thin">
              {systemLogs.map(log => (
                <div key={log.id} className="flex gap-2.5 items-start">
                  
                  {/* Log level color blocks */}
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black shrink-0 ${
                    log.level === 'ERROR' ? 'bg-red-950 text-red-400' : log.level === 'WARNING' ? 'bg-amber-950 text-amber-500' : 'bg-zinc-900 text-zinc-500'
                  }`}>
                    {log.level}
                  </span>

                  <span className="text-zinc-600 font-bold">[{log.module}]</span>
                  <div className="flex-1">
                    <span className="text-zinc-300">{log.message}</span>
                    <span className="block text-[9px] text-zinc-650 mt-0.5 italic">{log.details}</span>
                  </div>

                  <span className="text-zinc-600 font-semibold">{new Date(log.timestamp).toLocaleTimeString('pt-BR')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PLATFORM CONFIG PARAMETERS forms settings */}
        {activeTab === 'system-configs' && (
          <form onSubmit={saveConfigs} className="space-y-5">
            <h3 className="text-zinc-200 font-sans font-bold text-sm border-b border-zinc-900 pb-3 flex items-center gap-2">
              <Settings className="h-4.5 w-4.5 text-sky-400" />
              Parâmetros de Rede e throttling API
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              
              <div className="space-y-1.5 text-left">
                <label className="text-zinc-500 text-xs font-mono font-bold block font-sans">Heartbeat Reconnect Interval (ms)</label>
                <input
                  type="number"
                  value={wsReconnectMs}
                  onChange={(e) => setWsReconnectMs(e.target.value)}
                  className="w-full h-10 px-3 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs font-mono"
                  id="config-ws-ms"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-zinc-500 text-xs font-mono font-bold block">Rate Limit Throttling/Minuto</label>
                <input
                  type="number"
                  value={rateLimitThrot}
                  onChange={(e) => setRateLimitThrot(e.target.value)}
                  className="w-full h-10 px-3 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs font-mono"
                  id="config-rate-limit"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-zinc-505 text-xs font-mono font-bold block border-zinc-800">WebRTC Video Codec</label>
                <select
                  value={webrtcCodec}
                  onChange={(e) => setWebrtcCodec(e.target.value)}
                  className="w-full h-10 px-3 bg-zinc-900 border border-zinc-850 text-zinc-300 text-xs rounded-lg focus:outline-none cursor-pointer appearance-none border-zinc-800"
                  id="config-codec-select"
                >
                  <option value="H264 (High Profile)">H264 (High Profile / Low-Latency)</option>
                  <option value="AV1">AV1 (Next-Gen High compression)</option>
                  <option value="VP9">VP9 (Legacy compatibility)</option>
                </select>
              </div>

            </div>

            <p className="text-[10px] text-zinc-500 text-left leading-normal p-3 bg-zinc-900/20 border border-zinc-900 rounded-lg">
              Estes parâmetros ajustam a performance global de transmissões e requisições HTTP do Django REST Framework. Alteração de codec exige reinicialização do proxy nginx port 3000.
            </p>

            <div className="pt-2 border-t border-zinc-900 text-right">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-all shadow bg-indigo-600"
                id="btn-admin-config-submit"
              >
                Atualizar Servidores
              </button>
            </div>
          </form>
        )}

      </div>

    </div>
  );
}
