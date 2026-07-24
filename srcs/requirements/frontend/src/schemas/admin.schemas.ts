import { z } from "zod";

export const roleWriteSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  permission_names: z.array(z.string()).min(1, "Selecione pelo menos uma permissão"),
});

export type RoleWriteFormData = z.infer<typeof roleWriteSchema>;

export const userBanSchema = z.object({
  status: z.enum(['BANNED', 'SUSPENDED', 'ACTIVE']),
});

export type UserBanFormData = z.infer<typeof userBanSchema>;

export const userAdminUpdateSchema = z.object({
  role_names: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
});

export type UserAdminUpdateFormData = z.infer<typeof userAdminUpdateSchema>;
