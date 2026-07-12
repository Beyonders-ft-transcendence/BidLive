import { z } from "zod";

export const domainCreateSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").max(255, "Nome muito longo"),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "paused", "completed"]).optional(),
  budget: z.union([z.string(), z.number()]).optional(),
});

export type DomainCreateFormData = z.infer<typeof domainCreateSchema>;

export const domainUpdateSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").max(255, "Nome muito longo").optional(),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "paused", "completed"]).optional(),
  budget: z.union([z.string(), z.number()]).optional(),
  is_archived: z.boolean().optional(),
});

export type DomainUpdateFormData = z.infer<typeof domainUpdateSchema>;
