"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

type SignInFormState = {
    email: string;
    password: string;
};

const INITIAL_FORM: SignInFormState = {
    email: "",
    password: "",
};

export default function SignIn() {
    const router = useRouter();

    const login = useAuthStore((state) => state.login);
    const authorizeFortyTwo = useAuthStore((state) => state.authorizeFortyTwo);
    const isLoading = useAuthStore((state) => state.isLoading);
    const apiError = useAuthStore((state) => state.error);
    const clearError = useAuthStore((state) => state.clearError);

    const [form, setForm] = useState<SignInFormState>(INITIAL_FORM);
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const onChange =
        (field: keyof SignInFormState) =>
        (event: ChangeEvent<HTMLInputElement>) => {
            if (apiError) clearError();
            if (localError) setLocalError(null);

            setForm((prev) => ({
                ...prev,
                [field]: event.target.value,
            }));
        };

    const validateForm = () => {
        if (!form.email || !form.password) {
            return "Preencha todos os campos.";
        }
        if (!form.email.includes("@")) {
            return "Informe um e-mail válido.";
        }
        return null;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const validation = validateForm();
        if (validation) {
            setLocalError(validation);
            return;
        }

        try {
            await login({
                email: form.email,
                password: form.password,
            });
            router.push("/");
        } catch {
            // erro tratado pela store
        }
    };

    const handle42Login = async () => {
        try {
            const url = await authorizeFortyTwo();
            if (url) {
                window.location.href = url;
            }
        } catch {
            // erro tratado pela store
        }
    };

    return (
        <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4 md:p-8 font-sans antialiased">
            {/* CSS Animation Injector */}
            <style>{`
                @keyframes bounceSlow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes bounceSlowReverse {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(8px); }
                }
                .animate-bounce-slow {
                    animation: bounceSlow 5s ease-in-out infinite;
                }
                .animate-bounce-slow-reverse {
                    animation: bounceSlowReverse 5s ease-in-out infinite;
                }
            `}</style>

            <div className="w-full max-w-[1050px] bg-white shadow-xl rounded-sm overflow-hidden grid md:grid-cols-12 min-h-[620px]">
                {/* Left Side (Blue Dashboard Visual) */}
                <div className="md:col-span-5 bg-primary p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    {/* Top Right Dot Grid Pattern */}
                    <div className="absolute top-8 right-8 opacity-20 text-white select-none pointer-events-none">
                        <svg className="w-12 h-12" viewBox="0 0 48 48">
                            <g fill="currentColor">
                                <circle cx="4" cy="4" r="1.5" /><circle cx="16" cy="4" r="1.5" /><circle cx="28" cy="4" r="1.5" /><circle cx="40" cy="4" r="1.5" />
                                <circle cx="4" cy="16" r="1.5" /><circle cx="16" cy="16" r="1.5" /><circle cx="28" cy="16" r="1.5" /><circle cx="40" cy="16" r="1.5" />
                                <circle cx="4" cy="28" r="1.5" /><circle cx="16" cy="28" r="1.5" /><circle cx="28" cy="28" r="1.5" /><circle cx="40" cy="28" r="1.5" />
                                <circle cx="4" cy="40" r="1.5" /><circle cx="16" cy="40" r="1.5" /><circle cx="28" cy="40" r="1.5" /><circle cx="40" cy="40" r="1.5" />
                            </g>
                        </svg>
                    </div>

                    {/* Bottom Left Dot Grid Pattern */}
                    <div className="absolute bottom-8 left-8 opacity-20 text-white select-none pointer-events-none">
                        <svg className="w-12 h-12" viewBox="0 0 48 48">
                            <g fill="currentColor">
                                <circle cx="4" cy="4" r="1.5" /><circle cx="16" cy="4" r="1.5" /><circle cx="28" cy="4" r="1.5" /><circle cx="40" cy="4" r="1.5" />
                                <circle cx="4" cy="16" r="1.5" /><circle cx="16" cy="16" r="1.5" /><circle cx="28" cy="16" r="1.5" /><circle cx="40" cy="16" r="1.5" />
                                <circle cx="4" cy="28" r="1.5" /><circle cx="16" cy="28" r="1.5" /><circle cx="28" cy="28" r="1.5" /><circle cx="40" cy="28" r="1.5" />
                                <circle cx="4" cy="40" r="1.5" /><circle cx="16" cy="40" r="1.5" /><circle cx="28" cy="40" r="1.5" /><circle cx="40" cy="40" r="1.5" />
                            </g>
                        </svg>
                    </div>

                    {/* Background circular segment blur */}
                    <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

                    {/* Logo */}
                    <div className="flex items-center z-10 select-none">
                        <svg className="h-6 w-6 text-white shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2.5" fill="none" />
                            <path d="M6 18L18 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                        <span className="text-lg font-bold ml-2 tracking-tight">BidLive.</span>
                    </div>

                    {/* Center Mockup Visuals */}
                    <div className="relative w-full max-w-[280px] mx-auto my-auto aspect-[1.1] scale-95 md:scale-100 transition-all duration-300">
                        {/* Main White Card */}
                        <div className="bg-white rounded-sm shadow-2xl p-4 text-gray-800 relative z-0 w-[90%] mx-auto">
                            {/* Income / Expenses header */}
                            <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium px-1">
                                <div>
                                    <p className="text-gray-400 font-normal">Licitações</p>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">$24.908,00</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-400 font-normal">Arrematado</p>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">$1.028,00</p>
                                </div>
                            </div>

                            {/* SVG Line Chart with floating tooltip */}
                            <div className="relative h-16 mt-4">
                                <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                                    <path d="M 0,40 Q 15,10 30,28 T 60,12 T 90,20 T 100,8 L 100,40 Z" fill="url(#chart-gradient)" opacity="0.08" />
                                    <path d="M 0,35 Q 15,10 30,28 T 60,12 T 90,20 T 100,8" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />
                                    <circle cx="30" cy="28" r="3" fill="var(--primary)" />
                                </svg>
                                <defs>
                                    <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--primary)" />
                                        <stop offset="100%" stopColor="#FFFFFF" />
                                    </linearGradient>
                                </defs>
                                <div className="absolute top-[8px] left-[18%] bg-gray-900 text-[8px] text-white px-2 py-0.5 rounded-md shadow-md font-semibold">
                                    Lance: $5.052
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="flex justify-between text-[8px] text-gray-400 mt-1 px-1">
                                <span>06 Jun</span>
                                <span>07 Jun</span>
                                <span>08 Jun</span>
                                <span>09 Jun</span>
                            </div>

                            {/* Transactions list */}
                            <div className="mt-3 space-y-2.5">
                                {/* Stripe */}
                                <div className="flex justify-between items-center text-[9px]">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center text-primary font-bold text-[8px]">
                                            M
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">MacBook Pro</p>
                                            <p className="text-[7px] text-gray-400 font-light">Hoje às 07:18</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-gray-900">+$523,10</span>
                                </div>
                                {/* Facebook */}
                                <div className="flex justify-between items-center text-[9px]">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-primary font-bold text-[8px]">
                                            P
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">PlayStation 5</p>
                                            <p className="text-[7px] text-gray-400 font-light">Hoje às 06:24</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-gray-500">-$550,00</span>
                                </div>
                            </div>
                        </div>

                        {/* Floating Card 1: Payment Received */}
                        <div className="absolute right-[-12px] top-[26%] bg-white rounded-sm shadow-lg border border-gray-50 p-2.5 flex items-center gap-2 z-10 w-[135px] text-gray-800 animate-bounce-slow">
                            <div className="w-6 h-6 rounded-sm bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="text-[8px]">
                                <p className="text-gray-400 font-normal">Lance Vencedor</p>
                                <p className="font-bold text-primary">+$24.900,00</p>
                            </div>
                        </div>

                        {/* Floating Card 2: Transfer Successful */}
                        <div className="absolute left-[-20px] bottom-[12%] bg-white rounded-sm shadow-lg border border-gray-50 p-2.5 flex flex-col items-center gap-1 z-10 w-[95px] text-center text-gray-800 animate-bounce-slow-reverse">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-[7px] text-gray-400 leading-tight">Licitação Confirmada</p>
                            <p className="text-[9px] font-bold text-gray-900">$950,00</p>
                        </div>
                    </div>

                    {/* Bottom Content */}
                    <div className="z-10 text-center md:text-left">
                        <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-none">
                            Rápido, Simples e Seguro
                        </h3>
                        <p className="text-xs md:text-[13px] text-blue-100 mt-3 font-light leading-relaxed max-w-[290px]">
                            O BidLive ajuda-o a gerir os seus leilões, licitações e negócios em tempo real com total transparência e segurança. Licite agora.
                        </p>
                        {/* Carousel indicators */}
                        <div className="flex justify-center md:justify-start gap-1.5 mt-5">
                            <span className="w-5 h-1 bg-white rounded-full"></span>
                            <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                            <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                        </div>
                    </div>
                </div>

                {/* Right Side (Auth Form) */}
                <div className="md:col-span-7 bg-white p-8 md:p-12 flex flex-col justify-between min-h-[550px]">
                    {/* Top spacer for layout alignment */}
                    <div className="hidden md:block"></div>

                    {/* Form Wrap */}
                    <div className="max-w-[370px] w-full mx-auto py-6">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Entrar na sua conta</h2>
                        <p className="text-xs text-gray-400 mt-1 font-normal">Licite, acompanhe e compre de forma inteligente</p>

                        {/* Social Sign-In grid */}
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                fullWidth
                                className="text-xs font-semibold py-2.5"
                                icon={
                                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                    </svg>
                                }
                            >
                                Sign In com Google
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                fullWidth
                                onClick={handle42Login}
                                className="text-xs font-semibold py-2.5"
                                icon={<GraduationCap size={16} className="text-gray-700 shrink-0" />}
                            >
                                Entrar com 42
                            </Button>
                        </div>

                        {/* Divider */}
                        <div className="relative flex py-5 items-center select-none pointer-events-none">
                            <div className="flex-grow border-t border-gray-100"></div>
                            <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-normal">Ou com e-mail</span>
                            <div className="flex-grow border-t border-gray-100"></div>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email */}
                            <div>
                                <Input
                                    type="email"
                                    value={form.email}
                                    onChange={onChange("email")}
                                    placeholder="E-mail"
                                    fullWidth
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={onChange("password")}
                                    placeholder="Senha"
                                    fullWidth
                                    required
                                    iconPosition="right"
                                    icon={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none flex items-center"
                                            aria-label="Mostrar senha"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    }
                                />
                            </div>

                            {/* Remember me + Forgot password */}
                            <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" className="rounded-sm border-gray-300 text-primary focus:ring-primary" />
                                    Lembrar de mim
                                </label>
                                <Link href="#" className="hover:underline text-gray-500 hover:text-gray-700">
                                    Esqueceu a senha?
                                </Link>
                            </div>

                            {/* API/Local Errors */}
                            {(localError || apiError) && (
                                <div className="text-xs text-red-500 font-medium pt-1">
                                    {localError || apiError}
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                loading={isLoading}
                                className="mt-4 shadow-md shadow-blue-500/10 font-semibold"
                            >
                                Entrar
                            </Button>
                        </form>

                        {/* Bottom register link */}
                        <p className="text-center text-xs text-gray-500 mt-6 select-none">
                            Não tem uma conta?{" "}
                            <Link href="/signup" className="text-gray-900 font-bold hover:underline">
                                Cadastre-se
                            </Link>
                        </p>
                    </div>

                    {/* Footer Policy and Copyright */}
                    <div className="flex justify-between items-center text-[10px] text-gray-400 mt-4 border-t border-gray-50 pt-4">
                        <Link href="#" className="hover:underline">Política de Privacidade</Link>
                        <span>Copyright 2026</span>
                    </div>
                </div>
            </div>
        </div>
    );
}