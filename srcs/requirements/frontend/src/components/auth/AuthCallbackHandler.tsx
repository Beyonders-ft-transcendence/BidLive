"use client";

import { useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { UserRole } from "@/types/auth.types";
import toast from "react-hot-toast";

function AuthCallback() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const loginWith42 = useAuthStore((state) => state.loginWith42);
    const hasProcessed = useRef(false);

    useEffect(() => {
        if (hasProcessed.current) return;

        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (code && state) {
            hasProcessed.current = true;
            const processAuth = async () => {
                const toastId = toast.loading("Autenticando com a 42...");
                try {
                    // We must pass the exact redirect_uri that we used to initiate the flow
                    const redirect_uri = window.location.origin + "/";
                    await loginWith42({ code, state, redirect_uri });
                    toast.success("Autenticação concluída com sucesso!", { id: toastId });
                    
                    const userRoles = useAuthStore.getState().user?.roles || [];
                    if (userRoles.includes(UserRole.USER)) {
                        router.replace("/user");
                    } else {
                        router.replace("/backoffice/dashboard");
                    }
                } catch (error) {
                    toast.error("Falha na autenticação com a 42.", { id: toastId });
                    console.error("42 Auth Error:", error);
                    router.replace("/signin");
                }
            };
            processAuth();
        }
    }, [searchParams, pathname, loginWith42, router]);

    return null;
}

export default function AuthCallbackHandler() {
    return (
        <Suspense fallback={null}>
            <AuthCallback />
        </Suspense>
    );
}
