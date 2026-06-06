"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Divider from "@/components/common/Divider";
import { useAuthStore } from "@/store/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthSidebar from "@/components/auth/AuthSidebar";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import AuthFooter from "@/components/auth/AuthFooter";
import { signInSchema, type SignInInput } from "@/schema/auth.schema";
import { Lineicons } from "@lineiconshq/react-lineicons";
import { Envelope1Outlined, Locked1Outlined, EyeOutlined, EyeStroke } from "@lineiconshq/free-icons";

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
            <div className="w-full max-w-[1050px] bg-white shadow-xl rounded-sm overflow-hidden grid md:grid-cols-12 min-h-0 md:min-h-[620px]">
                {/* Left Side (Blue Dashboard Visual) */}
                <AuthSidebar />

                {/* Right Side (Auth Form) */}
                <div className="col-span-12 md:col-span-7 bg-white p-6 sm:p-10 md:p-12 flex flex-col justify-between min-h-0 md:min-h-[550px]">
                    {/* Top spacer for layout alignment */}
                    <div className="hidden md:block"></div>
                    {/* Form Wrap */}
                    <div className="max-w-[370px] w-full mx-auto py-6">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Entrar na sua conta</h2>
                        <p className="text-xs text-gray-400 mt-1 font-normal">Licite, acompanhe e compre de forma inteligente</p>

                        {/* Social Sign-In grid */}
                        <SocialAuthButtons mode="signin" onFortyTwoClick={handle42Login} />

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
                                    leftIcon={<Lineicons icon={Envelope1Outlined} size={16} />}
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
                                    leftIcon={<Lineicons icon={Locked1Outlined} size={16} />}
                                    rightIcon={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none flex items-center"
                                            aria-label="Mostrar senha"
                                        >
                                            {showPassword ? <Lineicons icon={EyeStroke} size={16} /> : <Lineicons icon={EyeOutlined} size={16} />}
                                        </button>
                                    }
                                    error={errors.password?.message}
                                    {...register("password")}
                                />
                            </div>

                            {/* Remember me + Forgot password */}
                            <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" className="rounded-sm border-gray-300 text-primary focus:ring-primary" />
                                    Lembrar de mim
                                </label>
                                <Link href="/forgot-password" className="hover:underline text-gray-500 hover:text-gray-700">
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
                    <AuthFooter />
                </div>
            </div>
        </div>
    );
}