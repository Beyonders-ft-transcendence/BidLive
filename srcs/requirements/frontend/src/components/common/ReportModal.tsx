import { X, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createReportSchema, type CreateReportInput } from "@/shared/schema/report.schema";
import { useCreateReport } from "@/hooks/useReport";
import { ReportTargetType, ReportReason } from "@/shared/types/report.types";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: number;
}

export default function ReportModal({ isOpen, onClose, targetType, targetId }: ReportModalProps) {
  
  const { mutate: createReport, isPending } = useCreateReport();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateReportInput>({
    resolver: zodResolver(createReportSchema),
    defaultValues: {
      target_type: targetType,
      target_id: targetId,
    },
  });

  const onSubmit = (data: CreateReportInput) => {
    createReport(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      <div className="relative bg-card border border-border w-full max-w-md rounded-sm shadow-xl p-6 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-sm hover:bg-muted text-muted-foreground transition-colors cursor-pointer border-none bg-transparent"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-sm bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20 shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-foreground">Denunciar Conteúdo</h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Ajuda-nos a manter a plataforma segura e confiável.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("target_type")} />
          <input type="hidden" {...register("target_id", { valueAsNumber: true })} />

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Motivo da Denúncia
            </label>
            <select
              {...register("reason")}
              className={`w-full px-3 py-2 border rounded-sm bg-background text-foreground text-xs outline-none transition duration-150 cursor-pointer ${
                errors.reason
                  ? "border-destructive focus:ring-1 focus:ring-destructive"
                  : "border-border focus:ring-1 focus:ring-primary focus:border-primary"
              }`}
            >
              <option value="">Selecione um motivo...</option>
              <option value={ReportReason.SPAM}>Spam ou Conteúdo Irrelevante</option>
              <option value={ReportReason.HARASSMENT}>Assédio ou Intimidação</option>
              <option value={ReportReason.SCAM}>Tentativa de Burla (Scam)</option>
              <option value={ReportReason.FRAUD}>Fraude ou Falsificação</option>
              <option value={ReportReason.HATE_SPEECH}>Discurso de Ódio</option>
              <option value={ReportReason.INAPPROPRIATE_CONTENT}>Conteúdo Inapropriado</option>
              <option value={ReportReason.COPYRIGHT}>Violação de Direitos Autorais</option>
              <option value={ReportReason.OTHER}>Outro Motivo</option>
            </select>
            {errors.reason && (
              <p className="text-[10px] text-destructive font-bold">{errors.reason.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Descrição (Opcional)
            </label>
            <textarea
              {...register("description")}
              rows={4}
              placeholder="Forneça mais detalhes sobre a denúncia para ajudar a nossa equipa de moderação..."
              className={`w-full px-3 py-2 border rounded-sm bg-background text-foreground text-xs outline-none resize-none transition duration-150 ${
                errors.description
                  ? "border-destructive focus:ring-1 focus:ring-destructive"
                  : "border-border focus:ring-1 focus:ring-primary focus:border-primary"
              }`}
            />
            {errors.description && (
              <p className="text-[10px] text-destructive font-bold">{errors.description.message}</p>
            )}
            <p className="text-[9px] text-muted-foreground text-right">Máx. 2000 caracteres</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 bg-transparent hover:bg-muted text-foreground text-xs font-bold rounded-sm transition uppercase cursor-pointer disabled:opacity-50 border-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold rounded-sm shadow-sm shadow-destructive/10 transition uppercase cursor-pointer disabled:opacity-50 border-none"
            >
              {isPending ? "A Enviar..." : "Submeter Denúncia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
