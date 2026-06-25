import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/shared/stores/auth.store";
import { UserRole } from "@/shared/types/auth.types";

export default function AuthCallbackHandler() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const loginWith42 = useAuthStore((state) => state.loginWith42);
    const hasProcessed = useRef(false);

    useEffect(() => {
        if (hasProcessed.current) return;

        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (code && state) {
            hasProcessed.current = true;
            const processAuth = async () => {
                try {
                    // O redirect_uri precisa ser o mesmo passado inicialmente para gerar o auth url
                    const redirect_uri = window.location.origin + "/";
                    await loginWith42({ code, state, redirect_uri });
                    
                    const userRoles = useAuthStore.getState().user?.roles || [];
                    if (userRoles.includes(UserRole.USER)) {
                        navigate("/user");
                    } else if (userRoles.includes(UserRole.SUPER_ADMIN) || userRoles.includes(UserRole.MONITOR)) {
                        navigate("/backoffice/dashboard");
                    } else {
                        navigate("/user");
                    }
                } catch (error) {
                    console.error("42 Auth Error:", error);
                    navigate("/signin");
                }
            };
            processAuth();
        }
    }, [searchParams, navigate, loginWith42]);

    return null;
}
