import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useState } from 'react';
import Container from '@/components/layout/backoffice/Container';
import PageHeader from '@/components/layout/backoffice/PageHeader';
import Toolbar from '@/components/layout/backoffice/Toolbar';
import { 
  useAdminReportsQuery, 
  useUpdateReportStatusMutation, 
  useApplyReportActionMutation 
} from '@/hooks/useAdmin';
import Avatar from '@/components/common/Avatar';
import { 
  ShieldAlert, 
  AlertTriangle, 
  AlertOctagon, 
  Clock, 
  XCircle,
  X,
  Flag,
  CheckCircle,
  ShieldBan,
  MessageSquare
} from 'lucide-react';
import type { Report, ReportActionType } from '@/shared/types/admin.types';
import { useTranslation } from 'react-i18next';

export default function ReportsPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('backoffice_reports.title'));

  const [selectedTargetType, setSelectedTargetType] = useState<string>('');
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [actionType, setActionType] = useState<ReportActionType>('COMMENT');

  const { data: reports = [], isLoading } = useAdminReportsQuery(
    undefined, // We load all statuses to populate the Kanban board
    selectedTargetType || undefined
  );

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateReportStatusMutation();
  const { mutate: applyAction, isPending: isApplyingAction } = useApplyReportActionMutation();

  const handleUpdateStatus = (id: number, status: 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED' | 'IGNORED') => {
    updateStatus({
      id,
      payload: { status, note: `Estado alterado manualmente para ${status}` }
    }, {
      onSuccess: (data) => {
        if (activeReport?.id === id) {
          setActiveReport(data);
        }
      }
    });
  };

  const handleApplyAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReport) return;
    
    applyAction({
      id: activeReport.id,
      payload: {
        action: actionType,
        note: actionNote,
        new_status: actionType === 'BAN_USER' || actionType === 'DELETE_CONTENT' ? 'RESOLVED' : undefined
      }
    }, {
      onSuccess: (data) => {
        setActiveReport(data);
        setActionNote('');
        setActionType('COMMENT');
      }
    });
  };

  const getReasonLabel = (reason: string) => {
    const reasons: Record<string, string> = {
      SPAM: 'Spam',
      HARASSMENT: 'Assédio',
      SCAM: 'Burla',
      HATE_SPEECH: 'Ódio',
      FRAUD: 'Fraude',
      INAPPROPRIATE_CONTENT: 'Inapropriado',
      COPYRIGHT: 'Copyright',
      OTHER: 'Outro',
    };
    return reasons[reason] || reason;
  };

  const KanbanColumn = ({ title, icon, statusList, accentColor }: { title: string, icon: any, statusList: string[], accentColor: string }) => {
    const columnReports = reports.filter(r => statusList.includes(r.status));
    
    return (
      <div className="flex flex-col bg-zinc-900/30 border border-zinc-800/80 rounded-xl overflow-hidden h-[calc(100vh-220px)] min-w-[320px]">
        <div className={`p-4 border-b border-zinc-800/80 bg-zinc-900/50 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <span className={accentColor}>{icon}</span>
            <h3 className="font-semibold text-zinc-100">{title}</h3>
          </div>
          <span className="bg-black border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full text-xs font-bold">
            {columnReports.length}
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {isLoading ? (
             Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-zinc-800/50 h-24 rounded-lg"></div>
            ))
          ) : columnReports.length === 0 ? (
            <div className="text-center p-6 text-zinc-600 text-sm font-medium border border-dashed border-zinc-800/50 rounded-lg">
              {t('backoffice_reports.no_reports')}
            </div>
          ) : (
            columnReports.map(report => (
              <div 
                key={report.id}
                onClick={() => {
                  setActiveReport(report);
                  setActionNote('');
                }}
                className={`bg-black border p-4 rounded-lg cursor-pointer transition-all hover:border-zinc-500 hover:shadow-md group
                  ${activeReport?.id === report.id ? 'border-zinc-500 ring-1 ring-zinc-500/50' : 'border-zinc-800'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-zinc-300 border border-zinc-800 uppercase">
                    {report.target_type}
                  </span>
                  <span className="text-[10px] text-zinc-500">#{report.id}</span>
                </div>
                
                <h4 className="text-sm font-medium text-zinc-100 mb-1">{getReasonLabel(report.reason)}</h4>
                
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-900">
                  <Avatar name={report.reporter.full_name} src={report.reporter.avatar_url} size="sm" />
                  <span className="text-xs text-zinc-500 truncate">{report.reporter.full_name}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <Container>
      <PageHeader 
        title={t('backoffice_reports.title')}
        description={t('backoffice_reports.description')}
        icon={<Flag size={20} />}
      />

      <div className="flex flex-col gap-6 max-w-[1400px] w-full relative">
        <Toolbar>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-sm font-medium text-zinc-400">Filtrar Alvo:</span>
            <select
              value={selectedTargetType}
              onChange={(e) => setSelectedTargetType(e.target.value)}
              className="bg-black border border-zinc-800 text-zinc-100 px-3 py-1.5 rounded-lg text-sm font-medium focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all appearance-none"
            >
              <option value="">Todos</option>
              <option value="USER">Utilizador</option>
              <option value="AUCTION">Leilão</option>
              <option value="STREAM">Transmissão</option>
              <option value="MESSAGE">Mensagem de Chat</option>
              <option value="BID">Lance</option>
            </select>
          </div>
        </Toolbar>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-x-auto pb-4">
          <KanbanColumn 
            title="Em Fila (Novas)" 
            icon={<AlertTriangle size={16} />} 
            statusList={['OPEN']} 
            accentColor="text-red-400"
          />
          <KanbanColumn 
            title="Em Revisão" 
            icon={<Eye size={16} />} 
            statusList={['UNDER_REVIEW']} 
            accentColor="text-amber-400"
          />
          <KanbanColumn 
            title="Fechadas" 
            icon={<CheckCircle size={16} />} 
            statusList={['RESOLVED', 'REJECTED', 'IGNORED']} 
            accentColor="text-zinc-500"
          />
        </div>

      </div>

      {/* Right Drawer Backdrop */}
      {activeReport && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-in fade-in"
          onClick={() => setActiveReport(null)}
        />
      )}

      {/* Right Drawer Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-black border-l border-zinc-800 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${
          activeReport ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/20">
          <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
            <ShieldAlert className="text-zinc-400" size={20} />
            Detalhes #{activeReport?.id}
          </h2>
          <button 
            onClick={() => setActiveReport(null)}
            className="p-2 text-zinc-400 hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-800/50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeReport ? (
            <div className="p-6 flex flex-col gap-8">
              
              {/* Target & Reason */}
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-2 py-1 rounded bg-zinc-800 text-[10px] font-bold text-zinc-300 border border-zinc-700/50 uppercase">
                    Alvo: {activeReport.target_type} ({activeReport.target_id})
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Estado: <span className="text-zinc-300">{activeReport.status}</span>
                  </span>
                </div>
                
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Motivo Principal</span>
                  <p className="text-lg font-semibold text-red-400">{getReasonLabel(activeReport.reason)}</p>
                </div>

                {activeReport.description && (
                  <div className="mt-4 pt-4 border-t border-zinc-800/50">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Descrição</span>
                    <p className="text-sm bg-black p-3 border border-zinc-800 rounded-lg text-zinc-300 whitespace-pre-wrap leading-relaxed">
                      {activeReport.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Reporter Info */}
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Denunciante</span>
                <div className="flex items-center gap-3 bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/80">
                  <Avatar name={activeReport.reporter.full_name} src={activeReport.reporter.avatar_url} size="md" />
                  <div>
                    <h4 className="font-semibold text-sm text-zinc-100">{activeReport.reporter.full_name}</h4>
                    <p className="text-xs text-zinc-500">@{activeReport.reporter.username}</p>
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex gap-2 pb-4 border-b border-zinc-800/50">
                <button 
                  disabled={isUpdatingStatus || activeReport.status === 'UNDER_REVIEW'}
                  onClick={() => handleUpdateStatus(activeReport.id, 'UNDER_REVIEW')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  <Clock size={14} /> Rever
                </button>
                <button 
                  disabled={isUpdatingStatus || activeReport.status === 'IGNORED'}
                  onClick={() => handleUpdateStatus(activeReport.id, 'IGNORED')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 border border-zinc-700/50 rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  <XCircle size={14} /> Ignorar
                </button>
              </div>

              {/* Take Administrative Action Form */}
              <form onSubmit={handleApplyAction} className="space-y-4">
                <div>
                  <h3 className="font-semibold text-zinc-100 mb-1">Ação Administrativa</h3>
                  <p className="text-xs text-zinc-500 mb-4">Alique uma penalização ou adicione uma nota à moderação.</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-300">Tipo de Ação</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as ReportActionType)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-100 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all appearance-none"
                  >
                    <option value="COMMENT">📝 Adicionar Comentário Interno</option>
                    <option value="WARN_USER">⚠️ Alertar Utilizador</option>
                    <option value="BAN_USER">🔨 Banir Utilizador (Resolve Denúncia)</option>
                    <option value="DELETE_CONTENT">🗑️ Remover Conteúdo (Resolve Denúncia)</option>
                    <option value="ESCALATE">↗️ Escalar Denúncia</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-300">Nota / Justificação</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Escreve a justificação para a ação tomada..."
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-100 p-3 rounded-lg text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isApplyingAction}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-100 hover:bg-white text-black rounded-lg text-sm font-semibold transition cursor-pointer disabled:opacity-50 mt-4"
                >
                  <AlertOctagon size={16} /> 
                  {isApplyingAction ? 'A Aplicar...' : 'Aplicar Ação'}
                </button>
              </form>

              {/* History / Actions Timeline */}
              {activeReport.actions && activeReport.actions.length > 0 && (
                <div className="space-y-3 pt-6 border-t border-zinc-800/50">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Histórico de Ações</span>
                  <div className="space-y-3">
                    {activeReport.actions.map((act) => (
                      <div key={act.id} className="text-xs bg-zinc-900/30 p-3 rounded-lg border border-zinc-800/50 relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-zinc-800 before:rounded-r">
                        <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 mb-1.5 ml-2">
                          <span>{act.admin.full_name}</span>
                          <span>{new Date(act.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="font-semibold text-zinc-300 uppercase text-[10px] ml-2 mb-1">{act.action}</p>
                        {act.note && <p className="text-zinc-400 italic ml-2">"{act.note}"</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : null}
        </div>
      </div>
    </Container>
  );
}
