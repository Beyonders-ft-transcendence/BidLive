import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SignInIllustration from "@/assets/images/signin_illustration.png";
import SignInIllustrationDark from "@/assets/images/signin_illustration2.png";
import Logo from "@/assets/images/logo.png";
import Logo2 from "@/assets/images/logo2.png";
import { User, Lock, Sun, Moon } from "lucide-react";
import { useAuthStore } from "@/shared/stores/auth.store";
import { getTheme, setTheme, type Theme } from "@/shared/utils/themes.utils";
import { signInSchema, type SignInInput } from "@/shared/schema/auth.schema";
import { UserRole } from "@/shared/types/auth.types";

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

    const handleToggleTheme = () => {
        const isDark = document.documentElement.classList.contains("dark");
        const newTheme = isDark ? "light" : "dark";
        setTheme(newTheme);
        setCurrentTheme(newTheme);
    };

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
        <div className="min-h-screen w-full flex items-center justify-center bg-secondary/30 p-4 relative">

            {/* Theme Toggle Button */}
            <button
                onClick={handleToggleTheme}
                title="Mudar Tema"
                className="absolute top-6 right-6 p-3 rounded-full bg-card shadow-lg border border-border text-muted-foreground hover:text-primary hover:scale-105 transition-all z-10"
            >
                {theme === "dark" || document.documentElement.classList.contains("dark") ? (
                    <Sun size={22} />
                ) : (
                    <Moon size={22} />
                )}
            </button>

            <div className="w-full max-w-4xl bg-card rounded-md shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[550px]">
                {/* Left Side - Illustration */}
                <div className="hidden md:flex flex-col w-1/2 bg-white dark:bg-[#0D1015] items-center justify-between p-8 pb-10 border-r border-border/50">
                    <div className="flex-1 flex items-center justify-center w-full">
                        <img
                            src={theme === "dark" || document.documentElement.classList.contains("dark") ? SignInIllustrationDark : SignInIllustration}
                            alt="Ilustração de login"
                            className="w-full max-w-md h-auto object-contain hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    <a href="#" className="text-sm font-semibold underline underline-offset-4 hover:text-primary transition-colors text-foreground">
                        Criar uma conta
                    </a>
                </div>

                {/* Right Side - Form */}
                <div className="w-full  md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-card relative">
                    <div className="max-w-sm w-full mx-auto">

                        <img
                            src={theme === "dark" || document.documentElement.classList.contains("dark") ? Logo2 : Logo}
                            alt="BidLive Logo"
                            className="h-10 w-40 mb-8 object-contain"
                        />


                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="relative flex items-center">
                                        <User className="absolute left-2 w-5 h-5 text-muted-foreground/70" />
                                        <Input
                                            type="email"
                                            placeholder="Seu E-mail"
                                            {...register("email")}
                                            className="pl-10 h-12 bg-transparent border-t-0 border-l-0 border-r-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-primary border-border shadow-none w-full text-base"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-destructive text-xs font-medium">{errors.email.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="relative flex items-center">
                                        <Lock className="absolute left-2 w-5 h-5 text-muted-foreground/70" />
                                        <Input
                                            type="password"
                                            placeholder="Senha"
                                            {...register("password")}
                                            className="pl-10 h-12 bg-transparent border-t-0 border-l-0 border-r-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-primary border-border shadow-none w-full text-base"
                                        />
                                    </div>
                                    {errors.password && (
                                        <p className="text-destructive text-xs font-medium">{errors.password.message}</p>
                                    )}
                                </div>
                            </div>

                            {apiError && <p className="text-destructive text-sm font-medium">{apiError}</p>}

                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
                                    />
                                    <label htmlFor="remember" className="text-sm font-medium text-muted-foreground cursor-pointer">
                                        Lembrar de mim
                                    </label>
                                </div>
                                <a href="#" className="text-sm font-semibold text-primary hover:underline underline-offset-4 transition-colors">
                                    Esqueci minha senha
                                </a>
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-6 rounded-md font-medium text-base shadow-lg hover:shadow-primary/30 transition-all"
                                >
                                    {isLoading ? "Entrando..." : "Entrar"}
                                </Button>
                            </div>
                        </form>

                        <div className="mt-10 flex flex-col items-center gap-8">
                            <div className="flex flex-col items-center gap-4 w-full">
                                <div className="flex items-center w-full">
                                    <div className="flex-1 border-t border-border"></div>
                                    <span className="px-4 text-sm font-medium text-muted-foreground">Ou entre com</span>
                                    <div className="flex-1 border-t border-border"></div>
                                </div>
                                <div className="flex gap-4 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => executeGoogleLogin()}
                                        className="w-11 h-11 rounded-md flex items-center justify-center bg-[#ea4335] text-white hover:opacity-90 hover:scale-105 transition-all shadow-md font-bold text-lg"
                                    >
                                        G
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleIntraLogin}
                                        className="w-11 h-11 rounded-md flex items-center justify-center bg-[#000000] dark:bg-white dark:text-black text-white hover:opacity-90 hover:scale-105 transition-all shadow-md font-bold text-base"
                                    >
                                        42
                                    </button>
                                </div>
                            </div>

                            {/* Mobile only link */}
                            <a href="#" className="md:hidden text-sm font-semibold underline underline-offset-4 hover:text-primary transition-colors text-foreground">
                                Criar uma conta
                            </a>
                        </div>
                    </div>
                </div>
            </div>
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
