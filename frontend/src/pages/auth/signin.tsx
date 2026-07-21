import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuthStore } from "@/shared/stores/auth.store";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { signInSchema, type SignInInput } from "@/shared/schema/auth.schema";
import logoImg from "@/assets/images/logo.png";
import logoImgDark from "@/assets/images/logo2.png";
import { toast } from "sonner";
import ENV from "@/shared/utils/env.utils";

function SigninForm() {
    const { t } = useTranslation();

    const navigate = useNavigate();

    const login = useAuthStore((state) => state.login);
    const authorizeFortyTwo = useAuthStore((state) => state.authorizeFortyTwo);
    const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
    const isLoading = useAuthStore((state) => state.isLoading);
    const apiError = useAuthStore((state) => state.error);
    const clearError = useAuthStore((state) => state.clearError);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<SignInInput>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const formValues = watch();

    useEffect(() => {
        if (apiError && clearError) {
            clearError();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formValues.email, formValues.password]);

    const handleSuccessRedirect = () => {
        const userState = useAuthStore.getState().user;
        const hasAdminRole = userState?.roles?.some((r: any) => 
            (typeof r === "string" && r === "SUPER_ADMIN") || 
            (typeof r === "object" && r !== null && r.name === "SUPER_ADMIN")
        );
        if (hasAdminRole) {
            navigate("/backoffice");
        } else {
            navigate("/leiloes");
        }
    };

    const onSubmit = async (data: SignInInput) => {
        try {
            await login(data);
            handleSuccessRedirect();
        } catch (err: any) {
            console.error("Falha ao entrar com e-mail/senha:", err);
            toast.error(err?.response?.data?.message || err?.message || t('auth.error_signin'));
        }
    };

    const handleIntraLogin = async () => {
        try {
            const redirectUri = window.location.origin + "/";
            const url = await authorizeFortyTwo(redirectUri);
            if (url) {
                window.location.href = url;
            } else {
                console.error("A URL de autorização da Intra está vazia.");
                toast.error("Serviço de autenticação da Intra temporariamente indisponível.");
            }
        } catch (err: any) {
            console.error("Falha ao autorizar 42:", err);
            toast.error("Ocorreu um erro ao tentar conectar com a Intra 42.");
        }
    };

    const executeGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                await loginWithGoogle({ access_token: tokenResponse.access_token });
                handleSuccessRedirect();
            } catch (error: any) {
                console.error("Erro na integração Google Auth do Backend:", error);
                toast.error("Erro ao completar a autenticação com o Google.");
            }
        },
        onError: () => {
            console.error("Google Login falhou na resposta da tela do OAuth.");
            toast.error("Autenticação cancelada ou falhou. Tente novamente.");
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center w-full font-sans bg-slate-200 dark:bg-slate-950 text-foreground p-4 sm:p-8">
            <div className="flex flex-col lg:flex-row w-full max-w-5xl bg-card rounded-sm shadow-2xl overflow-hidden lg:h-[600px] max-h-[90vh] border border-border">
                {/* Left Column */}
                <div className="w-full lg:w-1/2 flex flex-col relative p-6 lg:p-8 bg-card overflow-y-auto">
                    {/* Form Container */}
                    <div className="flex-1 flex items-center justify-center py-2">
                        <div className="w-full max-w-[360px] flex flex-col items-center text-center">
                            {/* Logo */}
                            <Link to="/" className="flex items-center justify-center hover:opacity-80 transition-opacity w-fit mb-4">
                                <img src={logoImg} alt="BidLive Logo" className="h-8 object-contain dark:hidden" />
                                <img src={logoImgDark} alt="BidLive Logo" className="h-8 object-contain hidden dark:block" />
                            </Link>

                            <h1 className="text-2xl font-bold mb-1 text-foreground">Bem-vindo de volta</h1>
                            <p className="text-muted-foreground text-sm mb-4">Bem-vindo de volta! Por favor, insira os seus dados.</p>

                            <div className="w-full text-left">
                                <div className="flex gap-3 mb-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => executeGoogleLogin()}
                                    className="flex-1 h-11 bg-background border border-border text-foreground hover:bg-muted rounded-sm font-semibold text-base transition-colors shadow-sm flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Google
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleIntraLogin}
                                    className="flex-1 h-11 bg-background border border-border text-foreground hover:bg-muted rounded-sm font-semibold text-base transition-colors shadow-sm flex items-center justify-center gap-2"
                                >
                                    <span className="font-bold text-lg leading-none">42</span>
                                    Intra 42
                                </Button>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-1 border-t border-border"></div>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Ou</span>
                                <div className="flex-1 border-t border-border"></div>
                            </div>

                            <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-foreground">Email</label>
                                    <div className="relative">
                                        <Input
                                            type="email"
                                            placeholder="Insira o seu email"
                                            {...register("email")}
                                            className={`h-11 bg-background border rounded-sm focus-visible:ring-1 shadow-sm w-full text-foreground placeholder:text-muted-foreground pr-32 ${errors.email ? 'border-destructive focus-visible:ring-destructive focus-visible:border-destructive' : 'border-border focus-visible:ring-primary focus-visible:border-primary'}`}
                                        />
                                        {errors.email && (
                                            <p className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive text-xs font-medium">
                                                {errors.email.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-foreground">Palavra-passe</label>
                                    <div className="relative">
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            {...register("password")}
                                            className={`h-11 bg-background border rounded-sm focus-visible:ring-1 shadow-sm w-full text-foreground placeholder:text-muted-foreground pr-32 ${errors.password ? 'border-destructive focus-visible:ring-destructive focus-visible:border-destructive' : 'border-border focus-visible:ring-primary focus-visible:border-primary'}`}
                                        />
                                        {errors.password && (
                                            <p className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive text-xs font-medium">
                                                {errors.password.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-end text-sm">
                                    <Link to="/auth/forgot-password" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                                        Esqueceu a palavra-passe?
                                    </Link>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm font-semibold text-base transition-colors shadow-sm"
                                    >
                                        {isLoading ? "A entrar..." : "Entrar"}
                                    </Button>
                                </div>
                            </form>

                                <div className="mt-6 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Não tem uma conta? <Link to="/signup" className="text-primary font-semibold hover:underline">Registe-se</Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Artwork) */}
                <div className="hidden lg:flex w-1/2 h-full bg-secondary items-center justify-center relative overflow-hidden">
                    <div className="relative flex flex-col items-center">
                        {/* Top half circle */}
                        <div className="w-[240px] h-[120px] bg-primary rounded-t-full relative z-10" style={{ boxShadow: "inset 0px -4px 10px rgba(0,0,0,0.05)" }}></div>
                        {/* Blurry shadow reflection */}
                        <div className="w-[240px] h-[120px] bg-primary/40 blur-[40px] rounded-b-full relative -mt-4 z-0"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Signin() {
  useDocumentTitle("Login");

    const googleClientId = ENV.GOOGLE_CLIENT_ID;
    
    if (!googleClientId) {
        console.warn("VITE_GOOGLE_CLIENT_ID não está configurado. Login via Google pode falhar.");
    }

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <SigninForm />
        </GoogleOAuthProvider>
    );
}
