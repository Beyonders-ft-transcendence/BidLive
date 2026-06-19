import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SignInIllustration from "@/assets/images/signin_illustration.png";
import { User, Lock } from "lucide-react";
import { useAuthStore } from "@/shared/stores/auth.store";

export default function Signin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, authorizeFortyTwo, isLoading, error } = useAuthStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;
        try {
            await login({ email, password });
            // Redirecionamento costuma ser tratado em camada superior (Router)
        } catch (err) {
            console.error("Falha ao entrar:", err);
        }
    };

    const handleIntraLogin = async () => {
        try {
            const url = await authorizeFortyTwo();
            if (url) {
                window.location.href = url;
            }
        } catch (err) {
            console.error("Falha ao autorizar 42:", err);
        }
    };

    const handleGoogleLogin = () => {
        // Integração do Google OAuth pendente de biblioteca @react-oauth/google
        console.log("Login com Google");
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-secondary/30 p-4">
            <div className="w-full max-w-4xl bg-card rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[550px]">
                {/* Left Side - Illustration */}
                <div className="hidden md:flex flex-col w-1/2 bg-white items-center justify-between p-8 pb-10">
                    <div className="flex-1 flex items-center justify-center w-full">
                        <img
                            src={SignInIllustration}
                            alt="Ilustração de login"
                            className="w-full max-w-md h-auto object-contain hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    <a href="#" className="text-sm font-semibold underline underline-offset-4 hover:text-primary transition-colors text-black">
                        Criar uma conta
                    </a>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-card">
                    <div className="max-w-sm w-full mx-auto">
                        <h1 className="text-4xl font-bold mb-8 text-foreground">Entrar</h1>

                        <form className="space-y-6" onSubmit={handleLogin}>
                            <div className="space-y-6">
                                <div className="relative flex items-center">
                                    <User className="absolute left-2 w-5 h-5 text-muted-foreground/70" />
                                    <Input
                                        type="email"
                                        placeholder="Seu E-mail"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-10 h-12 bg-transparent border-t-0 border-l-0 border-r-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-primary border-border shadow-none w-full text-base"
                                    />
                                </div>

                                <div className="relative flex items-center">
                                    <Lock className="absolute left-2 w-5 h-5 text-muted-foreground/70" />
                                    <Input
                                        type="password"
                                        placeholder="Senha"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="pl-10 h-12 bg-transparent border-t-0 border-l-0 border-r-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-primary border-border shadow-none w-full text-base"
                                    />
                                </div>
                            </div>

                            {error && <p className="text-destructive text-sm font-medium">{error}</p>}

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
                                    className="w-full py-6 rounded-xl font-medium text-base shadow-lg hover:shadow-primary/30 transition-all"
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
                                        onClick={handleGoogleLogin}
                                        className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#ea4335] text-white hover:opacity-90 hover:scale-105 transition-all shadow-md font-bold text-lg"
                                    >
                                        G
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleIntraLogin}
                                        className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#000000] dark:bg-white dark:text-black text-white hover:opacity-90 hover:scale-105 transition-all shadow-md font-bold text-base"
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
