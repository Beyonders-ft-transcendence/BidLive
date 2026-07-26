import { z } from "zod";

export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(1, { message: "O nome completo é obrigatório." })
    .max(100, { message: "O nome completo não deve ultrapassar 100 caracteres." }),
  avatar_url: z
    .string()
    .url({ message: "Insira uma URL de imagem válida." })
    .or(z.literal(""))
    .optional(),
  bio: z
    .string()
    .max(500, { message: "A biografia não deve ultrapassar 500 caracteres." })
    .optional(),
});

export const changePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(1, { message: "A senha atual é obrigatória." }),
    new_password: z
      .string()
      .min(8, { message: "A nova senha deve conter pelo menos 8 caracteres." }),
    new_password_confirm: z
      .string()
      .min(1, { message: "Confirme a nova senha." }),
  })
  .refine((data) => data.new_password === data.new_password_confirm, {
    message: "As senhas novas não coincidem.",
    path: ["new_password_confirm"],
  });
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "O e-mail é obrigatório." })
    .email({ message: "Insira um e-mail válido." }),
  password: z
    .string()
    .min(1, { message: "A senha é obrigatória." }),
});

export type LoginInput = z.infer<typeof loginSchema>;
