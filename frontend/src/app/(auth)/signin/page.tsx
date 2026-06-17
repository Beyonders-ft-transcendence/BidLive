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
import toast from "react-hot-toast";
import { signInSchema, type SignInInput } from "@/schema/auth.schema";
import { UserRole } from "@/types/auth.types";
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
            const user = useAuthStore.getState().user;
            toast.success(`Bem-vindo de volta, ${user?.full_name || user?.username}!`);

            if (user?.roles?.includes(UserRole.USER)) {
                router.push("/user");
            } else {
                router.push("/backoffice/dashboard");
            }
        } catch {
            const errMsg = useAuthStore.getState().error || "Erro ao realizar login. Verifique suas credenciais.";
            toast.error(errMsg);
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
        <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 md:p-8 font-sans antialiased">
            <div className="w-full max-w-[1050px] bg-[#151C2C] border border-slate-800 shadow-2xl rounded-sm overflow-hidden grid md:grid-cols-12 min-h-0 md:min-h-[620px]">
                {/* Left Side (Blue Dashboard Visual) */}
                <AuthSidebar />

                {/* Right Side (Auth Form) */}
                <div className="col-span-12 md:col-span-7 bg-[#151C2C] p-6 sm:p-10 md:p-12 flex flex-col justify-between min-h-0 md:min-h-[550px]">
                    {/* Top spacer for layout alignment */}
                    <div className="hidden md:block"></div>
                    {/* Form Wrap */}
                    <div className="max-w-[370px] w-full mx-auto py-6">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Entrar na sua conta</h2>
                        <p className="text-xs text-slate-400 mt-1 font-normal">Licite, acompanhe e compre de forma inteligente</p>

                        {/* Social Sign-In grid */}
                        <div className="opacity-90 hover:opacity-100 transition-opacity">
                            <SocialAuthButtons mode="signin" onFortyTwoClick={handle42Login} />
                        </div>

                        {/* Divider */}
                        <div className="opacity-80">
                            <Divider>Ou com e-mail</Divider>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
                            {/* Email */}
                            <div className="[&_input]:bg-[#0B0F19] [&_input]:border-slate-700 [&_input]:text-white [&_input]:placeholder-slate-500 [&_svg]:text-slate-400">
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
                            <div className="[&_input]:bg-[#0B0F19] [&_input]:border-slate-700 [&_input]:text-white [&_input]:placeholder-slate-500 [&_svg]:text-slate-400">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Senha"
                                    fullWidth
                                    leftIcon={<Lineicons icon={Locked1Outlined} size={16} />}
                                    rightIcon={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-slate-400 hover:text-white cursor-pointer focus:outline-none flex items-center"
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
                            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none hover:text-slate-300">
                                    <input type="checkbox" className="rounded-sm border-slate-700 bg-[#0B0F19] text-primary focus:ring-primary" />
                                    Lembrar de mim
                                </label>
                                <Link href="/forgot-password" className="hover:underline text-slate-400 hover:text-white transition-colors">
                                    Esqueceu a senha?
                                </Link>
                            </div>

                            {/* API Errors */}
                            {apiError && (
                                <div className="text-xs text-red-400 font-medium pt-1">
                                    {apiError}
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                loading={isLoading}
                                className="mt-4 shadow-lg shadow-blue-500/20 font-semibold"
                            >
                                Entrar
                            </Button>
                        </form>

                        {/* Bottom register link */}
                        <p className="text-center text-xs text-slate-400 mt-6 select-none">
                            Não tem uma conta?{" "}
                            <Link href="/signup" className="text-white font-bold hover:underline">
                                Cadastre-se
                            </Link>
                        </p>
                    </div>

                    {/* Footer Policy and Copyright */}
                    <div className="opacity-70 hover:opacity-100 transition-opacity">
                        <AuthFooter />
                    </div>
                </div>
            </div>
        </div>
    );
}