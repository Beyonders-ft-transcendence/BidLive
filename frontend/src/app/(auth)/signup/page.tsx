"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Mail, IdCard } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/auth.store";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Divider from "@/components/common/Divider";
import { GoogleIcon } from "@/components/common/Icons";
import AuthSidebar from "@/components/auth/AuthSidebar";
import { signUpSchema, type SignUpInput } from "@/schema/auth.schema";

export default function SignUp() {
    const router = useRouter();

    const registerUser = useAuthStore((state) => state.register);
    const authorizeFortyTwo = useAuthStore((state) => state.authorizeFortyTwo);
    const isLoading = useAuthStore((state) => state.isLoading);
    const apiError = useAuthStore((state) => state.error);
    const clearError = useAuthStore((state) => state.clearError);

    const [step, setStep] = useState<1 | 2>(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit: handleFormSubmit,
        trigger,
        watch,
        formState: { errors },
    } = useForm<SignUpInput>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            full_name: "",
            username: "",
            email: "",
            password: "",
            password_confirm: "",
        },
    });

    // Clear API error when typing
    const formValues = watch();
    useEffect(() => {
        if (apiError) clearError();
    }, [formValues.full_name, formValues.username, formValues.email, formValues.password, formValues.password_confirm, apiError, clearError]);

    const nextStep = async () => {
        const isValid = await trigger(["full_name", "username", "email"]);
        if (isValid) {
            clearError();
            setStep(2);
        }
    };

    const previousStep = () => {
        clearError();
        setStep(1);
    };

    const onSubmit = async (data: SignUpInput) => {
        try {
            await registerUser({
                full_name: data.full_name,
                username: data.username,
                email: data.email,
                password: data.password,
            });

            setSuccessMessage("Conta criada com sucesso. Redirecionando...");
            setTimeout(() => {
                router.push("/signin");
            }, 1500);
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
                    {/* Top: Progress indicator */}
                    <div className="w-full max-w-[370px] mx-auto pt-2">
                        <div className="flex items-center justify-between text-[11px] text-gray-500 mb-2">
                            <span>
                                Etapa {step} de 2
                            </span>
                            <span className="font-semibold text-gray-700">
                                {step === 1 ? "Informações pessoais" : "Segurança da conta"}
                            </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-primary transition-all duration-300 ${
                                    step === 1 ? "w-1/2" : "w-full"
                                }`}
                            />
                        </div>
                    </div>

                    {/* Form Wrap */}
                    <div className="max-w-[370px] w-full mx-auto py-4">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Criar sua conta</h2>
                        <p className="text-xs text-gray-400 mt-1 font-normal">Cadastre-se para começar a licitar em tempo real</p>

                        {/* Social credentials (step 1 only) */}
                        {step === 1 && (
                            <>
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        fullWidth
                                        className="text-xs font-semibold py-2.5"
                                        icon={<GoogleIcon />}
                                    >
                                        Criar com Google
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
                                        Criar com 42
                                    </Button>
                                </div>
                                <Divider>Ou com e-mail</Divider>
                            </>
                        )}

                        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4 mt-4">
                            {step === 1 ? (
                                <div className="space-y-4">
                                    <Input
                                        type="text"
                                        placeholder="Nome completo"
                                        fullWidth
                                        icon={<IdCard size={16} />}
                                        error={errors.full_name?.message}
                                        {...register("full_name")}
                                    />
                                    <Input
                                        type="text"
                                        placeholder="Nome de usuário"
                                        fullWidth
                                        icon={<User size={16} />}
                                        error={errors.username?.message}
                                        {...register("username")}
                                    />
                                    <Input
                                        type="email"
                                        placeholder="E-mail"
                                        fullWidth
                                        icon={<Mail size={16} />}
                                        error={errors.email?.message}
                                        {...register("email")}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4">
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
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirmar senha"
                                        fullWidth
                                        iconPosition="right"
                                        error={errors.password_confirm?.message}
                                        icon={
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none flex items-center"
                                                aria-label="Mostrar confirmação de senha"
                                            >
                                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        }
                                        {...register("password_confirm")}
                                    />
                                </div>
                            )}

                            {/* API Errors */}
                            {apiError && (
                                <div className="text-xs text-red-500 font-medium pt-1">
                                    {apiError}
                                </div>
                            )}

                            {/* Success message */}
                            {successMessage && (
                                <div className="text-xs text-green-600 font-medium pt-1">
                                    {successMessage}
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="pt-2">
                                {step === 1 ? (
                                    <Button
                                        type="button"
                                        variant="primary"
                                        onClick={nextStep}
                                        fullWidth
                                        className="font-semibold shadow-md shadow-blue-500/10"
                                    >
                                        Continuar
                                    </Button>
                                ) : (
                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={previousStep}
                                            className="flex-1 font-semibold"
                                        >
                                            Voltar
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            loading={isLoading}
                                            className="flex-1 font-semibold shadow-md shadow-blue-500/10"
                                        >
                                            Criar Conta
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </form>

                        {/* Bottom register link */}
                        <p className="text-center text-xs text-gray-500 mt-6 select-none">
                            Já tem uma conta?{" "}
                            <Link href="/signin" className="text-gray-900 font-bold hover:underline">
                                Faça login
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