"use client";

import { useForm } from "react-hook-form";
import Modal from "@/components/common/Modal";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { type UserStatus } from "@/types/auth.types";
import { UserStatus as AuthUserStatus } from "@/types/auth.types";

interface CreateUserFormData {
  username: string;
  email: string;
  full_name: string;
  password: string;
  bio: string;
  is_verified: boolean;
  is_staff: boolean;
  status: UserStatus;
}

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateUser: (userData: CreateUserFormData) => void;
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onCreateUser,
}: CreateUserModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormData>({
    defaultValues: {
      username: "",
      email: "",
      full_name: "",
      password: "",
      bio: "",
      is_verified: false,
      is_staff: false,
      status: AuthUserStatus.ACTIVE,
    },
  });

  const onSubmitForm = (data: CreateUserFormData) => {
    onCreateUser(data);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Utilizador Administrativo" size="lg">
      <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col flex-1 p-5 gap-4">
        
        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome de Utilizador (Username)"
            placeholder="Ex: manuelantonio"
            required
            error={errors.username?.message}
            {...register("username", {
              required: "Nome de utilizador é obrigatório",
              minLength: { value: 3, message: "Mínimo de 3 caracteres" },
            })}
          />

          <Input
            label="Nome Completo"
            placeholder="Ex: Manuel António"
            required
            error={errors.full_name?.message}
            {...register("full_name", {
              required: "Nome completo é obrigatório",
            })}
          />

          <Input
            label="Endereço de Email"
            type="email"
            placeholder="Ex: manuel@email.com"
            required
            error={errors.email?.message}
            {...register("email", {
              required: "E-mail é obrigatório",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Endereço de email inválido",
              },
            })}
          />

          <Input
            label="Palavra-passe (Senha)"
            type="password"
            placeholder="Mínimo 8 caracteres"
            required
            error={errors.password?.message}
            {...register("password", {
              required: "Senha é obrigatória",
              minLength: { value: 8, message: "Mínimo de 8 caracteres" },
            })}
          />

          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Estado Inicial
            </label>
            <select
              {...register("status")}
              className="w-full rounded-sm px-4 py-3 text-sm border border-gray-200 bg-white transition-all duration-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 cursor-pointer"
            >
              <option value={AuthUserStatus.ACTIVE}>Ativo (ACTIVE)</option>
              <option value={AuthUserStatus.SUSPENDED}>Suspenso (SUSPENDED)</option>
              <option value={AuthUserStatus.BANNED}>Banido (BANNED)</option>
            </select>
          </div>

          <Input
            label="Biografia / Descrição"
            placeholder="Ex: Administrador do leilão de Luanda"
            error={errors.bio?.message}
            {...register("bio")}
          />
        </div>

        {/* Toggles & Checkboxes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-b border-gray-50 py-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_verified"
              className="rounded-sm border-gray-300 text-primary focus:ring-primary/20 h-4 w-4 cursor-pointer"
              {...register("is_verified")}
            />
            <label htmlFor="is_verified" className="text-xs font-bold text-gray-600 cursor-pointer">
              Conta de e-mail pré-verificada
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_staff"
              className="rounded-sm border-gray-300 text-primary focus:ring-primary/20 h-4 w-4 cursor-pointer"
              {...register("is_staff")}
            />
            <label htmlFor="is_staff" className="text-xs font-bold text-gray-600 cursor-pointer">
              Membro do Staff Administrativo (Staff Access)
            </label>
          </div>
        </div>

        {/* Submit panel */}
        <div className="pt-2 flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={isSubmitting}
          >
            Salvar Registo
          </Button>
        </div>
      </form>
    </Modal>
  );
}
