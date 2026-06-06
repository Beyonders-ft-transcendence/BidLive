"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Divider from "@/components/common/Divider";
import { GoogleIcon } from "@/components/common/Icons";
import { useAuthStore } from "@/store/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthSidebar from "@/components/auth/AuthSidebar";
import { signInSchema, type SignInInput } from "@/schema/auth.schema";

export default function SignIn() {
    const router = useRouter();

    const login = useAuthStore((state) => state.login);
    const authorizeFortyTwo = useAuthStore((state) => state.authorizeFortyTwo);
    const isLoading = useAuthStore((state) => state.isLoading);
    const apiError = useAuthStore((state) => state.error);
    const clearError = useAuthStore((state) => state.clearError);

    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit: handleFormSubmit,
        watch,
        formState: { errors },
    } = useForm<SignInInput>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    // Clear API error when typing
    const formValues = watch();
    useEffect(() => {
        if (apiError) clearError();
    }, [formValues.email, formValues.password, apiError, clearError]);

    const onSubmit = async (data: SignInInput) => {
        try {
            await login(data);
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
                                icon={<GoogleIcon />}
                            >
                                Entrar com Google
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                fullWidth
                                onClick={handle42Login}
                                className="text-xs font-semibold py-2.5"
                                icon={
                                    <svg className="h-4 w-4 text-gray-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                                    </svg>
                                }
                            >
                                Entrar com 42
                            </Button>
                        </div>

                        {/* Divider */}
                        <Divider>Ou com e-mail</Divider>

                        {/* Login Form */}
                        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
                            {/* Email */}
                            <div>
                                <Input
                                    type="email"
                                    placeholder="E-mail"
                                    fullWidth
                                    error={errors.email?.message}
                                    {...register("email")}
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Senha"
                                    fullWidth
                                    iconPosition="right"
                                    error={errors.password?.message}
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
                                    {...register("password")}
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

                            {/* API Errors */}
                            {apiError && (
                                <div className="text-xs text-red-500 font-medium pt-1">
                                    {apiError}
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