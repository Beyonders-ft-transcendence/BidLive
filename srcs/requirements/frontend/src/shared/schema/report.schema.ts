import { z } from "zod";
import { ReportTargetType, ReportReason } from "../types/report.types";

export const createReportSchema = z.object({
  target_type: z.nativeEnum(ReportTargetType, {
    message: "Tipo de denúncia inválido.",
  }),
  target_id: z.number().min(1, "ID do alvo é obrigatório."),
  reason: z.nativeEnum(ReportReason, {
    message: "Selecione um motivo válido para a denúncia.",
  }),
  description: z.string().max(2000, "A descrição deve ter no máximo 2000 caracteres.").optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
