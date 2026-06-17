import React from "react";
import Button from "@/components/common/Button";
import { GoogleIcon } from "@/components/common/Icons";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { UserRole } from "@/types/auth.types";

interface SocialAuthButtonsProps {
    onFortyTwoClick?: () => void;
    mode: "signin" | "signup";
}

export default function SocialAuthButtons({ onFortyTwoClick, mode }: SocialAuthButtonsProps) {
    const router = useRouter();
    const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
    const isSignIn = mode === "signin";
    const googleLabel = isSignIn ? "Entrar com Google" : "Criar com Google";
    const fortyTwoLabel = isSignIn ? "Entrar com 42" : "Criar com 42";

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            const toastId = toast.loading("Autenticando com o Google...");
            try {
                await loginWithGoogle({ access_token: tokenResponse.access_token });
                toast.success("Autenticação concluída com sucesso!", { id: toastId });
                
                const userRoles = useAuthStore.getState().user?.roles || [];
                if (userRoles.includes(UserRole.USER)) {
                    router.replace("/user");
                } else {
                    router.replace("/backoffice/dashboard");
                }
            } catch (error) {
                toast.error("Falha na autenticação com o Google.", { id: toastId });
                console.error("Google Auth Error:", error);
            }
        },
        onError: () => {
            toast.error("Falha na autenticação com o Google.");
            console.error("Google Login Failed");
        },
    });

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => handleGoogleLogin()}
                className="text-xs font-semibold py-2.5 !bg-[#0B0F19] !border-slate-700 !text-slate-300 hover:!bg-slate-800 hover:!text-white"
                icon={<GoogleIcon />}
            >
                {googleLabel}
            </Button>
            <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={onFortyTwoClick}
                className="text-xs font-semibold py-2.5 !bg-[#0B0F19] !border-slate-700 !text-slate-300 hover:!bg-slate-800 hover:!text-white"
                icon={
                    <svg className="h-4 w-4 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                    </svg>
                }
            >
                {fortyTwoLabel}
            </Button>
        </div>
    );
}
