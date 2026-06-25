import Header from "@/components/layout/Header";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock } from "lucide-react";
import { UserRole } from "@/shared/types/auth.types";
import { useAuthStore } from "@/shared/stores/auth.store";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import SignInIllustration from "@/assets/images/signin_illustration.png";
import SignInIllustrationDark from "@/assets/images/signin_illustration2.png";
import { signInSchema, type SignInInput } from "@/shared/schema/auth.schema";
import { getTheme, type Theme } from "@/shared/utils/themes.utils";

function SigninForm() {
    const navigate = useNavigate();

    const login = useAuthStore((state) => state.login);
    const authorizeFortyTwo = useAuthStore((state) => state.authorizeFortyTwo);
    const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
    const isLoading = useAuthStore((state) => state.isLoading);
    const apiError = useAuthStore((state) => state.error);
    const clearError = useAuthStore((state) => state.clearError);

    const [theme, setCurrentTheme] = useState<Theme>("light");

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
        setCurrentTheme(getTheme());
    }, []);

    useEffect(() => {
        if (apiError && clearError) {
            clearError();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formValues.email, formValues.password]);

    const handleSuccessRedirect = () => {
        const user = useAuthStore.getState().user;
        if (user?.roles?.includes(UserRole.USER)) {
            navigate("/user");
        } else if (user?.roles?.includes(UserRole.SUPER_ADMIN) || user?.roles?.includes(UserRole.MONITOR)) {
            navigate("/backoffice/dashboard");
        } else {
            navigate("/user"); // Fallback
        }
    };

    const onSubmit = async (data: SignInInput) => {
        try {
            await login(data);
            handleSuccessRedirect();
        } catch (err) {
            console.error("Falha ao entrar com e-mail/senha:", err);
        }
    };

    const handleIntraLogin = async () => {
        try {
            const url = await authorizeFortyTwo();
            if (url) {
                window.location.href = url;
            } else {
                console.error("A URL de autorização da Intra está vazia.");
            }
        } catch (err) {
            console.error("Falha ao autorizar 42:", err);
        }
    };

    const executeGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                await loginWithGoogle({ access_token: tokenResponse.access_token });
                handleSuccessRedirect();
            } catch (error) {
                console.error("Erro na integração Google Auth do Backend:", error);
            }
        },
        onError: () => {
            console.error("Google Login falhou na resposta da tela do OAuth.");
        },
    });

    return (
        <div className="min-h-screen flex flex-col font-sans bg-background relative overflow-hidden">
            {/* Background split (z-0) */}
            <div className="absolute inset-0 flex z-0">
                <div className="w-[40%] bg-background"></div>
                <div className="w-[60%] bg-secondary"></div>
            </div>

            {/* Header Component */}
            <Header />

            {/* Main Content (z-10) */}
            <main className="relative z-10 flex-1 flex items-center justify-center w-full max-w-7xl mx-auto p-4 sm:p-8">
                <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">
                    
                    {/* Left Image */}
                    <div className="hidden lg:block w-1/2 relative">
                        <div className="rounded-3xl overflow-hidden shadow-2xl border-[12px] border-background bg-background transform translate-x-12 relative z-20 aspect-square max-w-md mx-auto">
                            <img src={theme === "dark" || document.documentElement.classList.contains("dark") ? SignInIllustrationDark : SignInIllustration} alt="Ilustração de login" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    {/* Right Form */}
                    <div className="w-full lg:w-1/2 max-w-md bg-background/50 backdrop-blur-sm p-8 rounded-2xl lg:bg-transparent lg:backdrop-blur-none lg:p-0 lg:rounded-none">
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold text-primary mb-3 tracking-tight">Entrar no Sistema</h1>
                            <p className="text-muted-foreground text-sm">Bem-vindo ao BidLive. Por favor, insira suas credenciais.</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">Endereço de Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                                    <Input
                                        type="email"
                                        placeholder="exemplo@email.com"
                                        {...register("email")}
                                        className="pl-10 h-12 bg-background border border-border rounded-md focus-visible:ring-1 focus-visible:ring-primary shadow-sm w-full"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-destructive text-xs font-medium">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">Palavra-passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        {...register("password")}
                                        className="pl-10 h-12 bg-background border border-border rounded-md focus-visible:ring-1 focus-visible:ring-primary shadow-sm w-full"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-destructive text-xs font-medium">{errors.password.message}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end">
                                <a href="#" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                                    Esqueceu a palavra-passe?
                                </a>
                            </div>

                            {apiError && <p className="text-destructive text-sm font-medium">{apiError}</p>}

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base transition-all shadow-md"
                                >
                                    {isLoading ? "Acedendo..." : "Aceder à Plataforma"}
                                </Button>
                            </div>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-muted-foreground">
                                Ainda não tem acesso? <a href="#" className="text-primary font-semibold hover:underline">Crie uma conta.</a>
                            </p>
                        </div>

                        {/* Social Login */}
                        <div className="mt-8 flex flex-col items-center gap-6">
                            <div className="flex items-center w-full">
                                <div className="flex-1 border-t border-border"></div>
                                <span className="px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Ou entre com</span>
                                <div className="flex-1 border-t border-border"></div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => executeGoogleLogin()}
                                    className="w-12 h-12 rounded-full flex items-center justify-center bg-background border border-border text-[#ea4335] hover:bg-muted transition-all shadow-sm"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleIntraLogin}
                                    className="w-12 h-12 rounded-full flex items-center justify-center bg-foreground text-background hover:opacity-80 transition-all shadow-sm font-bold text-lg"
                                >
                                    42
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default function Signin() {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
    
    if (!googleClientId) {
        console.warn("VITE_GOOGLE_CLIENT_ID não está configurado. Login via Google pode falhar.");
    }

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <SigninForm />
        </GoogleOAuthProvider>
    );
};
