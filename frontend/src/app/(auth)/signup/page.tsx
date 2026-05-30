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
  Globe,
  GraduationCap,
  IdCard,
} from "lucide-react";

import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
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

  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const apiError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [form, setForm] = useState<SignUpFormState>(INITIAL_FORM);
  const [step, setStep] = useState<SignUpStep>(1);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onChange =
    (field: keyof SignUpFormState) =>
      (event: ChangeEvent<HTMLInputElement>) => {
        if (apiError) clearError();
        if (localError) setLocalError(null);

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
      return "A senha deve ter pelo menos 8 caracteres.";
    }

    if (form.password !== form.password_confirm) {
      return "As senhas não coincidem.";
    }

    return null;
  };

  const nextStep = () => {
    const validation = validateStepOne();

    if (validation) {
      setLocalError(validation);
      return;
    }

    setLocalError(null);
    setStep(2);
  };

  const previousStep = () => {
    setLocalError(null);
    setStep(1);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validation = validateStepTwo();

    if (validation) {
      setLocalError(validation);
      return;
    }

    try {
      await register({
        full_name: form.full_name,
        username: form.username,
        email: form.email,
        password: form.password,
      });

      setSuccessMessage(
        "Conta criada com sucesso. Faça login para continuar."
      );

      router.push("/signin");
    } catch {
      // erro tratado pela store
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-sm overflow-hidden">
        <div
          className="grid md:grid-cols-2"
          style={{ minHeight: "600px" }}
        >
          {/* LEFT */}
          <div className="relative p-10 flex flex-col justify-center">
   
            <div className="max-w-sm mx-auto w-full">

              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div className="space-y-4">
                    <Input
                      value={form.full_name}
                      onChange={onChange("full_name")}
                      placeholder="Nome completo"
                      icon={<IdCard size={18} />}
                      fullWidth
                    />

                    <Input
                      value={form.username}
                      onChange={onChange("username")}
                      placeholder="Nome de usuário"
                      icon={<User size={18} />}
                      fullWidth
                    />

                    <Input
                      type="email"
                      value={form.email}
                      onChange={onChange("email")}
                      placeholder="E-mail"
                      icon={<Mail size={18} />}
                      fullWidth
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
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
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <Input
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={form.password_confirm}
                        onChange={onChange("password_confirm")}
                        placeholder="Confirmar senha"
                        icon={<Lock size={18} />}
                        fullWidth
                        className="pr-12"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {(localError || apiError) && (
                  <div className="mt-4 text-sm text-red-500">
                    {localError || apiError}
                  </div>
                )}

                {successMessage && (
                  <div className="mt-4 text-sm text-green-600">
                    {successMessage}
                  </div>
                )}

                <div className="mt-6">
                  {step === 1 ? (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={nextStep}
                      fullWidth
                    >
                      CONTINUAR
                    </Button>
                  ) : (
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={previousStep}
                        className="flex-1"
                      >
                        VOLTAR
                      </Button>

                      <Button
                        type="submit"
                        variant="primary"
                        loading={isLoading}
                        className="flex-1"
                      >
                        CRIAR CONTA
                      </Button>
                    </div>
                  )}
                </div>
              </form>

              <div className="flex justify-between text-sm mt-6 mb-8">
                <Link
                  href="/signin"
                  className="text-blue-500 hover:underline"
                >
                  Já tenho conta
                </Link>

                <Link
                  href="/signin"
                  className="text-gray-500 hover:underline"
                >
                  Voltar ao login
                </Link>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-sm">ou</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="space-y-4">
                <Button
                  variant="social"
                  fullWidth
                  icon={<Globe size={18} />}
                  className="justify-start text-white hover:text-white"
                  style={{
                    backgroundColor: "#ea4335",
                    borderColor: "#ea4335",
                  }}
                >
                  CRIAR COM GOOGLE
                </Button>

                <Button
                  variant="social"
                  fullWidth
                  icon={<GraduationCap size={18} />}
                  className="justify-start text-white hover:text-white"
                  style={{
                    backgroundColor: "#111827",
                    borderColor: "#111827",
                  }}
                >
                  CRIAR COM 42
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-gray-200 relative">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(to bottom right, rgb(243 244 246), rgb(229 231 235), rgb(209 213 219))",
              }}
            />

            <div className="absolute top-10 left-10 right-10 bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <span>
                  Etapa {step} de {TOTAL_STEPS}
                </span>

                <span>
                  {step === 1
                    ? "Informações pessoais"
                    : "Segurança da conta"}
                </span>
              </div>

              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-blue-500 transition-all duration-300 ${step === 1 ? "w-1/2" : "w-full"
                    }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}