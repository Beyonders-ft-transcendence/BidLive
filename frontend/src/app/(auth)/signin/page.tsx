"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff, Globe, GraduationCap } from "lucide-react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { useAuthStore } from "@/store/auth.store";

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
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="w-full max-w-5xl bg-white shadow-2xl rounded-sm overflow-hidden">
                <div className="grid md:grid-cols-2" style={{ minHeight: 600 }}>
                    {/* Left Side */}
                    <div className="relative p-10 flex flex-col justify-center">
                        <div className="max-w-sm mx-auto w-full">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Entrar no BidLive</h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Email */}
                                <div>
                                    <Input
                                        type="email"
                                        value={form.email}
                                        onChange={onChange("email")}
                                        placeholder="E-mail"
                                        icon={<User size={18} />}
                                        fullWidth
                                    />
                                </div>

                                {/* Password */}
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={form.password}
                                        onChange={onChange("password")}
                                        placeholder="Senha"
                                        icon={<Lock size={18} />}
                                        fullWidth
                                        className="pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                                        aria-label="Mostrar senha"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {/* Error messages */}
                                {(localError || apiError) && (
                                    <div className="text-sm text-red-500 font-medium">
                                        {localError || apiError}
                                    </div>
                                )}

                                {/* Remember + Login */}
                                <div className="flex items-center justify-between pt-2">
                                    <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none">
                                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        Lembrar de mim
                                    </label>

                                    <Button type="submit" variant="primary" size="md" className="px-8" loading={isLoading}>
                                        ENTRAR
                                    </Button>
                                </div>
                            </form>

                            {/* Links */}
                            <div className="flex justify-between text-sm mt-6 mb-8">
                                <Link href="/signup" className="text-blue-500 hover:underline font-medium">
                                    Cadastre-se agora
                                </Link>

                                <Link href="#" className="text-gray-500 hover:underline">
                                    Esqueceu a senha?
                                </Link>
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-gray-400 text-sm">ou</span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>

                            {/* Social Buttons */}
                            <div className="space-y-4">
                                <Button
                                    type="button"
                                    variant="social"
                                    fullWidth
                                    icon={<Globe size={18} />}
                                    className="justify-start text-white hover:text-white"
                                    style={{
                                        backgroundColor: "#ea4335",
                                        borderColor: "#ea4335",
                                    }}
                                >
                                    ENTRAR COM GOOGLE
                                </Button>

                                <Button
                                    type="button"
                                    variant="social"
                                    fullWidth
                                    onClick={handle42Login}
                                    icon={<GraduationCap size={18} />}
                                    className="justify-start text-white hover:text-white"
                                    style={{
                                        backgroundColor: "#111827",
                                        borderColor: "#111827",
                                    }}
                                >
                                    ENTRAR COM 42
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="bg-gray-200 relative">
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage:
                                    "linear-gradient(to bottom right, rgb(243 244 246), rgb(229 231 235), rgb(209 213 219))",
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}