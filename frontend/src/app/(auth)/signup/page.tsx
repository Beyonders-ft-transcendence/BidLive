"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/auth.store";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Divider from "@/components/common/Divider";
import AuthSidebar from "@/components/auth/AuthSidebar";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import AuthFooter from "@/components/auth/AuthFooter";
import toast from "react-hot-toast";
import { signUpSchema, type SignUpInput } from "@/schema/auth.schema";
import { Lineicons } from "@lineiconshq/react-lineicons";
import {
    Envelope1Outlined,
    Locked1Outlined,
    EyeOutlined,
    EyeStroke,
    User4Outlined,
    UserMultiple4Outlined,
} from "@lineiconshq/free-icons";

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

            toast.success("Conta criada com sucesso! Redirecionando para login...");
            setTimeout(() => {
                router.push("/signin");
            }, 1500);
        } catch {
            const errMsg = useAuthStore.getState().error || "Erro ao registrar conta. Tente outro e-mail/usuário.";
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
        <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4 md:p-8 font-sans antialiased">
            <div className="w-full max-w-[1050px] bg-white shadow-xl rounded-sm overflow-hidden grid md:grid-cols-12 min-h-0 md:min-h-[620px]">
                {/* Left Side (Blue Dashboard Visual - Signup mode) */}
                <AuthSidebar mode="signup" />

                {/* Right Side (Auth Form) */}
                <div className="col-span-12 md:col-span-7 bg-white p-6 sm:p-10 md:p-12 flex flex-col justify-between min-h-0 md:min-h-[550px]">
                    {/* Top spacer for layout alignment */}
                    <div className="hidden md:block"></div>

                    {/* Form Wrap */}
                    <div className="max-w-[370px] w-full mx-auto py-4">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Criar sua conta</h2>
                        <p className="text-xs text-gray-400 mt-1 font-normal">Cadastre-se para começar a licitar em tempo real</p>

                        {/* Social credentials (step 1 only) */}
                        {step === 1 && (
                            <>
                                <SocialAuthButtons mode="signup" onFortyTwoClick={handle42Login} />
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
                                        leftIcon={<Lineicons icon={UserMultiple4Outlined} size={16} />}
                                        error={errors.full_name?.message}
                                        {...register("full_name")}
                                    />
                                    <Input
                                        type="text"
                                        placeholder="Nome de usuário"
                                        fullWidth
                                        leftIcon={<Lineicons icon={User4Outlined} size={16} />}
                                        error={errors.username?.message}
                                        {...register("username")}
                                    />
                                    <Input
                                        type="email"
                                        placeholder="E-mail"
                                        fullWidth
                                        leftIcon={<Lineicons icon={Envelope1Outlined} size={16} />}
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
                                        {...register("password")}
                                    />
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirmar senha"
                                        fullWidth
                                        leftIcon={<Lineicons icon={Locked1Outlined} size={16} />}
                                        rightIcon={
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none flex items-center"
                                                aria-label="Mostrar confirmação de senha"
                                            >
                                                {showConfirmPassword ? <Lineicons icon={EyeStroke} size={16} /> : <Lineicons icon={EyeOutlined} size={16} />}
                                            </button>
                                        }
                                        {...register("password_confirm")}
                                    />
                                </div>
                            )}

                            {/* API Errors */}
                            {apiError && (
                                <div className="text-xs text-red-500 font-medium pt-1">
                                    {typeof apiError === 'string' ? apiError : JSON.stringify(apiError)}
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
                    <AuthFooter />
                </div>
            </div>
        </div>
    );
}