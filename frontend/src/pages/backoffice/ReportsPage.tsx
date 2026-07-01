import { useState } from 'react';
import Container from '@/components/layout/backoffice/Container';
import { 
  useAdminReportsQuery, 
  useUpdateReportStatusMutation, 
  useApplyReportActionMutation 
} from '@/hooks/useAdmin';
import Avatar from '@/components/common/Avatar';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Eye, 
  AlertOctagon, 
  Clock, 
  XCircle,
  FileText,
  ExternalLink
} from 'lucide-react';
import type { Report, ReportStatus, ReportActionType } from '@/shared/types/admin.types';

export default function ReportsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedTargetType, setSelectedTargetType] = useState<string>('');
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [actionType, setActionType] = useState<ReportActionType>('COMMENT');

  const { data: reports = [], isLoading } = useAdminReportsQuery(
    selectedStatus || undefined, 
    selectedTargetType || undefined
  );

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateReportStatusMutation();
  const { mutate: applyAction, isPending: isApplyingAction } = useApplyReportActionMutation();

  const handleUpdateStatus = (id: number, status: 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED' | 'IGNORED') => {
    updateStatus({
      id,
      payload: { status, note: `Status alterado manualmente para ${status}` }
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

  const getStatusBadge = (status: ReportStatus) => {
    const styles: Record<ReportStatus, string> = {
      OPEN: 'bg-red-500/10 text-red-500 border border-red-500/20',
      UNDER_REVIEW: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
      RESOLVED: 'bg-green-500/10 text-green-500 border border-green-500/20',
      REJECTED: 'bg-slate-500/10 text-slate-500 border border-slate-500/20',
      IGNORED: 'bg-gray-500/10 text-gray-500 border border-gray-500/20',
    };
    const labels: Record<ReportStatus, string> = {
      OPEN: 'Aberto',
      UNDER_REVIEW: 'Em Revisão',
      RESOLVED: 'Resolvido',
      REJECTED: 'Rejeitado',
      IGNORED: 'Ignorado',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getReasonLabel = (reason: string) => {
    const reasons: Record<string, string> = {
      SPAM: 'Spam / Mensagens repetitivas',
      HARASSMENT: 'Assédio / Ofensas',
      SCAM: 'Burla / Golpe',
      HATE_SPEECH: 'Discurso de Ódio',
      FRAUD: 'Fraude / Manipulação',
      INAPPROPRIATE_CONTENT: 'Conteúdo Inapropriado',
      COPYRIGHT: 'Direitos de Autor',
      OTHER: 'Outro Motivo',
    };
    return reasons[reason] || reason;
  };

  return (
    <Container>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* LEFT/MIDDLE: List of Reports */}
        <div className="xl:col-span-2 space-y-6">
          {/* Filters Bar */}
          <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="text-primary" size={20} />
              <h2 className="font-bold text-foreground">Moderação de Denúncias</h2>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-background border border-border text-foreground px-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:border-primary"
              >
                <option value="">Todos os Estados</option>
                <option value="OPEN">Abertos</option>
                <option value="UNDER_REVIEW">Em Revisão</option>
                <option value="RESOLVED">Resolvidos</option>
                <option value="REJECTED">Rejeitados</option>
                <option value="IGNORED">Ignorados</option>
              </select>

              <select
                value={selectedTargetType}
                onChange={(e) => setSelectedTargetType(e.target.value)}
                className="bg-background border border-border text-foreground px-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:border-primary"
              >
                <option value="">Todos os Alvos</option>
                <option value="USER">Utilizador</option>
                <option value="AUCTION">Leilão</option>
                <option value="STREAM">Transmissão</option>
                <option value="MESSAGE">Mensagem de Chat</option>
                <option value="BID">Lance</option>
              </select>
            </div>
          </div>

          {/* List Table */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Denunciante</th>
                    <th className="px-6 py-4">Alvo</th>
                    <th className="px-6 py-4">Motivo</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Criado em</th>
                    <th className="px-6 py-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-5 w-32 bg-muted rounded"></div></td>
                        <td className="px-6 py-4"><div className="h-5 w-24 bg-muted rounded"></div></td>
                        <td className="px-6 py-4"><div className="h-5 w-28 bg-muted rounded"></div></td>
                        <td className="px-6 py-4"><div className="h-5 w-16 bg-muted rounded"></div></td>
                        <td className="px-6 py-4"><div className="h-5 w-20 bg-muted rounded"></div></td>
                        <td className="px-6 py-4"><div className="h-8 w-8 bg-muted rounded ml-auto"></div></td>
                      </tr>
                    ))
                  ) : reports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        Nenhuma denúncia registada ou encontrada com estes filtros.
                      </td>
                    </tr>
                  ) : (
                    reports.map((report) => (
                      <tr 
                        key={report.id} 
                        className={`hover:bg-muted/30 transition-colors cursor-pointer ${activeReport?.id === report.id ? 'bg-primary/5' : ''}`}
                        onClick={() => {
                          setActiveReport(report);
                          setActionNote('');
                        }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Avatar name={report.reporter.full_name} src={report.reporter.avatar_url} size="sm" />
                            <div>
                              <div className="font-semibold text-foreground">{report.reporter.full_name}</div>
                              <div className="text-[10px] text-muted-foreground">@{report.reporter.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground uppercase">
                            {report.target_type} ({report.target_id})
                          </span>
                        </td>
                        <td className="px-6 py-4 text-foreground font-medium">
                          {getReasonLabel(report.reason)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(report.status)}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs">
                          {new Date(report.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setActiveReport(report);
                              setActionNote('');
                            }}
                            className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition"
                            title="Ver detalhes"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT: Selected Report Details & Action Panel */}
        <div className="xl:col-span-1">
          {activeReport ? (
            <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="font-bold text-foreground flex items-center gap-1.5">
                  <AlertTriangle className="text-amber-500" size={16} />
                  Denúncia #{activeReport.id}
                </h3>
                {getStatusBadge(activeReport.status)}
              </div>

              {/* Reporter Info */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Denunciante</span>
                <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-lg border border-border/50">
                  <Avatar name={activeReport.reporter.full_name} src={activeReport.reporter.avatar_url} size="md" />
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{activeReport.reporter.full_name}</h4>
                    <p className="text-xs text-muted-foreground">@{activeReport.reporter.username}</p>
                  </div>
                </div>
              </div>

              {/* Target & Details */}
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Alvo da Denúncia</span>
                  <p className="text-sm font-semibold mt-1">
                    Elemento: <span className="text-primary font-bold">{activeReport.target_type}</span> (ID: {activeReport.target_id})
                  </p>
                </div>
                
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Motivo</span>
                  <p className="text-sm font-bold text-destructive mt-0.5">{getReasonLabel(activeReport.reason)}</p>
                </div>

                {activeReport.description && (
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Descrição Adicional</span>
                    <p className="text-xs bg-muted/40 p-3 border border-border/30 rounded-lg text-foreground mt-1 whitespace-pre-wrap leading-relaxed">
                      {activeReport.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Evidence Section */}
              {activeReport.evidence && activeReport.evidence.length > 0 && (
                <div className="space-y-2 border-t border-border pt-4">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Evidências Anexadas</span>
                  <div className="grid grid-cols-2 gap-2">
                    {activeReport.evidence.map((ev) => (
                      <a 
                        key={ev.id} 
                        href={ev.file} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 p-2 bg-muted/50 border border-border hover:border-primary/50 text-muted-foreground hover:text-primary transition rounded-lg text-xs font-semibold"
                      >
                        <FileText size={14} />
                        Ficheiro Anexo
                        <ExternalLink size={10} className="ml-auto" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* History / Actions Timeline */}
              {activeReport.actions && activeReport.actions.length > 0 && (
                <div className="space-y-2 border-t border-border pt-4">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Histórico de Ações</span>
                  <div className="space-y-3">
                    {activeReport.actions.map((act) => (
                      <div key={act.id} className="text-xs bg-muted/30 p-2.5 rounded-lg border border-border/20">
                        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                          <span>{act.admin.full_name} (@{act.admin.username})</span>
                          <span>{new Date(act.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="mt-1 font-semibold text-primary uppercase text-[9px]">{act.action}</p>
                        {act.note && <p className="mt-1 text-foreground/80 font-medium italic">"{act.note}"</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Update Quick Buttons */}
              <div className="space-y-2 border-t border-border pt-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Alterar Estado</span>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    disabled={isUpdatingStatus}
                    onClick={() => handleUpdateStatus(activeReport.id, 'UNDER_REVIEW')}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    <Clock size={12} /> Rever
                  </button>
                  <button 
                    disabled={isUpdatingStatus}
                    onClick={() => handleUpdateStatus(activeReport.id, 'IGNORED')}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 border border-gray-500/20 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    <XCircle size={12} /> Ignorar
                  </button>
                </div>
              </div>

              {/* Take Administrative Action Form */}
              <form onSubmit={handleApplyAction} className="space-y-3 border-t border-border pt-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Ação Administrativa</span>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-bold">Tipo de Ação</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as ReportActionType)}
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary"
                  >
                    <option value="COMMENT">Adicionar Comentário</option>
                    <option value="WARN_USER">Notificar / Alertar Utilizador</option>
                    <option value="BAN_USER">Banir Utilizador</option>
                    <option value="DELETE_CONTENT">Remover Conteúdo Denunciado</option>
                    <option value="ESCALATE">Escalar Denúncia</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-bold">Nota / Justificação Interna</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Indique a justificação da ação tomada..."
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    className="w-full bg-background border border-border text-foreground p-3 rounded-lg text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isApplyingAction}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-black transition cursor-pointer border-none"
                >
                  <AlertOctagon size={14} /> Aplicar Ação
                </button>
              </form>

            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl shadow-sm p-8 text-center text-muted-foreground">
              <ShieldAlert className="mx-auto text-muted-foreground/30 mb-3" size={36} />
              <p className="text-sm font-semibold">Selecione uma denúncia da lista para ver os detalhes completos e aplicar ações corretivas.</p>
            </div>
          )}
        </div>

      </div>
    </Container>
  );
}
