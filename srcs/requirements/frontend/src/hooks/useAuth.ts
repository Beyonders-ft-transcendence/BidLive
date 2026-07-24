import { useQuery, useMutation } from "@tanstack/react-query";
import authService from "@/services/auth.service";
import type {
  RegisterPayload,
  LoginPayload,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "@/shared/types/auth.types";

export function useMeQuery(enabled = true) {
  return useQuery({
    queryKey: ["authMe"],
    queryFn: async () => {
      const res = await authService.me();
      if (!res.success) throw new Error(res.message || "Falha ao obter perfil.");
      return res.data;
    },
    enabled,
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: (token?: string) => authService.logout(token),
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authService.changePassword(payload),
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authService.forgotPassword(payload),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authService.resetPassword(payload),
  });
}
