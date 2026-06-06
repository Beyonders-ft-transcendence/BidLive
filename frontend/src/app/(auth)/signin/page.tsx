"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import AuthSidebar from "@/components/auth/AuthSidebar";

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
            <div className="w-full max-w-[1050px] bg-white shadow-xl rounded-sm overflow-hidden grid md:grid-cols-12 min-h-[620px]">
                {/* Left Side (Blue Dashboard Visual) */}
                <AuthSidebar />

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