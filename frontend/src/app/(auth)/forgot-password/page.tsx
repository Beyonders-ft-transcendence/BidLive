"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { useAuthStore } from "@/store/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import AuthSidebar from "@/components/auth/AuthSidebar";
import AuthFooter from "@/components/auth/AuthFooter";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/schema/auth.schema";
import { Lineicons } from "@lineiconshq/react-lineicons";
import { Envelope1Outlined } from "@lineiconshq/free-icons";

export default function ForgotPassword() {
    const forgotPassword = useAuthStore((state) => state.forgotPassword);
    const isLoading = useAuthStore((state) => state.isLoading);
    const apiError = useAuthStore((state) => state.error);
    const clearError = useAuthStore((state) => state.clearError);

    const {
        register,
        handleSubmit: handleFormSubmit,
        watch,
        formState: { errors },
    } = useForm<ForgotPasswordInput>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    // Clear API error when typing
    const emailValue = watch("email");
    useEffect(() => {
        if (apiError) clearError();
    }, [emailValue, apiError, clearError]);

    const onSubmit = async (data: ForgotPasswordInput) => {
        try {
            await forgotPassword(data);
            toast.success("Um link de recuperação de senha foi enviado para o seu e-mail.");
        } catch {
            const errMsg = useAuthStore.getState().error || "Erro ao solicitar redefinição de senha.";
            toast.error(errMsg);
        }
    };

    return (
        <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4 md:p-8 font-sans antialiased">
            <div className="w-full max-w-[1050px] bg-white shadow-xl rounded-sm overflow-hidden grid md:grid-cols-12 min-h-0 md:min-h-[620px]">
                {/* Left Side (Blue Dashboard Visual) */}
                <AuthSidebar mode="forgot-password" />

                {/* Right Side (Auth Form) */}
                <div className="col-span-12 md:col-span-7 bg-white p-6 sm:p-10 md:p-12 flex flex-col justify-between min-h-0 md:min-h-[550px]">
                    {/* Top spacer for layout alignment */}
                    <div className="hidden md:block"></div>
                    {/* Form Wrap */}
                    <div className="max-w-[370px] w-full mx-auto py-6">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Recuperar senha</h2>
                        <p className="text-xs text-gray-400 mt-1 font-normal">Insira o seu e-mail cadastrado para redefinir a sua senha</p>

                        {/* Form */}
                        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4 mt-6">
                            {/* Email */}
                            <div>
                                <Input
                                    type="email"
                                    placeholder="E-mail cadastrado"
                                    fullWidth
                                    leftIcon={<Lineicons icon={Envelope1Outlined} size={16} />}
                                    error={errors.email?.message}
                                    {...register("email")}
                                />
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
                                Enviar Link de Recuperação
                            </Button>
                        </form>

                        {/* Bottom back to login link */}
                        <p className="text-center text-xs text-gray-500 mt-6 select-none">
                            Lembrou da senha?{" "}
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
