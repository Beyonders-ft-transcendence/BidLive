"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MessageCircle,
  Send,
  Globe,
  X,
  IdCard,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

type SignUpFormState = {
  full_name: string;
  username: string;
  email: string;
  password: string;
  password_confirm: string;
};

const INITIAL_FORM: SignUpFormState = {
  full_name: "",
  username: "",
  email: "",
  password: "",
  password_confirm: "",
};

type SignUpStep = 1 | 2;

const TOTAL_STEPS = 2;

export default function SignUp() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const apiError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [form, setForm] = useState<SignUpFormState>(INITIAL_FORM);
  const [step, setStep] = useState<SignUpStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onChange =
    (field: keyof SignUpFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      if (apiError) {
        clearError();
      }

      if (localError) {
        setLocalError(null);
      }

      setForm((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const validateStepOne = () => {
    if (!form.full_name || !form.username || !form.email) {
      return "Preencha todos os campos.";
    }

    if (!form.email.includes("@")) {
      return "Informe um e-mail válido.";
    }

    return null;
  };

  const validateStepTwo = () => {
    if (!form.password || !form.password_confirm) {
      return "Preencha todos os campos.";
    }

    if (form.password.length < 8) {
      return "A senha precisa ter pelo menos 8 caracteres.";
    }

    if (form.password !== form.password_confirm) {
      return "As senhas não coincidem.";
    }

    return null;
  };

  const goToNextStep = () => {
    setSuccessMessage(null);
    const validationMessage = validateStepOne();

    if (validationMessage) {
      setLocalError(validationMessage);
      return;
    }

    setLocalError(null);
    setStep(2);
  };

  const goToPreviousStep = () => {
    setLocalError(null);
    setStep(1);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage(null);

    const validationMessage = validateStepTwo();
    if (validationMessage) {
      setLocalError(validationMessage);
      return;
    }

    try {
      await register({
        email: form.email,
        username: form.username,
        full_name: form.full_name,
        password: form.password,
      });

      setSuccessMessage("Conta criada com sucesso. Faça login para continuar.");
      setForm(INITIAL_FORM);
      router.push("/signin");
    } catch {
      // A mensagem de erro já é alimentada pelo auth store.
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-sm overflow-hidden">
        <div className="grid md:grid-cols-2" style={{ minHeight: 600 }}>
          <div className="relative p-10 flex flex-col justify-center">
            <Link href="/signin" className="absolute top-6 left-6 text-gray-700 hover:text-black">
              <X size={20} />
            </Link>

            <div className="max-w-sm mx-auto w-full">
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">Criar Conta</h1>
              <p className="text-sm text-gray-500 mb-6">Preencha os dados para começar.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {step === 1 && (
                  <>
                    <div className="relative">
                      <IdCard
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Nome completo"
                        value={form.full_name}
                        onChange={onChange("full_name")}
                        className="w-full border border-gray-200 rounded px-12 py-3 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Nome de usuário"
                        value={form.username}
                        onChange={onChange("username")}
                        className="w-full border border-gray-200 rounded px-12 py-3 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="email"
                        placeholder="E-mail"
                        value={form.email}
                        onChange={onChange("email")}
                        className="w-full border border-gray-200 rounded px-12 py-3 outline-none focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Senha"
                        value={form.password}
                        onChange={onChange("password")}
                        className="w-full border border-gray-200 rounded px-12 py-3 pr-12 outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        aria-label="Mostrar ou ocultar senha"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirmar senha"
                        value={form.password_confirm}
                        onChange={onChange("password_confirm")}
                        className="w-full border border-gray-200 rounded px-12 py-3 pr-12 outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        aria-label="Mostrar ou ocultar confirmação de senha"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </>
                )}

                {(localError || apiError) && (
                  <p className="text-sm text-red-600">
                    {localError ?? apiError}
                  </p>
                )}

                {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

                {step === 1 ? (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={goToNextStep}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded text-sm font-medium transition"
                    >
                      CONTINUAR
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={goToPreviousStep}
                      className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded text-sm font-medium transition"
                    >
                      VOLTAR
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-1/2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-8 py-3 rounded text-sm font-medium transition"
                    >
                      {isLoading ? "CRIANDO..." : "CRIAR CONTA"}
                    </button>
                  </div>
                )}
              </form>

              <div className="flex justify-between text-sm mt-6 mb-8">
                <Link href="/signin" className="text-blue-500 hover:underline">
                  Já tenho conta
                </Link>

                <Link href="/signin" className="text-gray-500 hover:underline">
                  Voltar ao login
                </Link>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-sm">ou</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="space-y-4">
                <button className="w-full flex items-center bg-[#3b5998] text-white rounded overflow-hidden">
                  <span className="px-4 py-3 border-r border-white/20">
                    <MessageCircle size={18} />
                  </span>
                  <span className="flex-1 py-3 text-sm font-medium">CRIAR COM FACEBOOK</span>
                </button>

                <button className="w-full flex items-center bg-[#1da1f2] text-white rounded overflow-hidden">
                  <span className="px-4 py-3 border-r border-white/20">
                    <Send size={18} />
                  </span>
                  <span className="flex-1 py-3 text-sm font-medium">CRIAR COM TWITTER</span>
                </button>

                <button className="w-full flex items-center bg-[#ea4335] text-white rounded overflow-hidden">
                  <span className="px-4 py-3 border-r border-white/20">
                    <Globe size={18} />
                  </span>
                  <span className="flex-1 py-3 text-sm font-medium">CRIAR COM GOOGLE</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-200 relative">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(to bottom right, rgb(243 244 246), rgb(229 231 235), rgb(209 213 219))",
              }}
            />
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[82%] max-w-sm bg-white/85 backdrop-blur-sm rounded-md border border-white/60 p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>Etapa {step} de {TOTAL_STEPS}</span>
                <span>{step === 1 ? "Dados pessoais" : "Senha e confirmação"}</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-blue-500 transition-all duration-300 ${step === 1 ? "w-1/2" : "w-full"}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
