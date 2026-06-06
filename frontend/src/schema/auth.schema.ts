import { z } from "zod";

export const signInSchema = z.object({
    email: z
        .string()
        .min(1, { message: "O e-mail é obrigatório." })
        .email({ message: "Informe um e-mail válido." }),
    password: z
        .string()
        .min(1, { message: "A senha é obrigatória." }),
});

export const signUpSchema = z.object({
    full_name: z
        .string()
        .min(1, { message: "O nome completo é obrigatório." }),
    username: z
        .string()
        .min(3, { message: "O nome de usuário deve ter pelo menos 3 caracteres." }),
    email: z
        .string()
        .min(1, { message: "O e-mail é obrigatório." })
        .email({ message: "Informe um e-mail válido." }),
    password: z
        .string()
        .min(8, { message: "A senha deve ter pelo menos 8 caracteres." }),
    password_confirm: z
        .string()
        .min(1, { message: "A confirmação de senha é obrigatória." }),
}).refine((data) => data.password === data.password_confirm, {
    message: "As senhas não coincidem.",
    path: ["password_confirm"],
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
