"use client";

import { useForm } from "react-hook-form";
import Modal from "@/components/common/Modal";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

interface CreateUserFormData {
  username: string;
  email: string;
  full_name: string;
  password: string;
  bio: string;
  role: string;
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
      role: "USER",
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
              Cargo / Função Principal
            </label>
            <select
              {...register("role")}
              className="w-full rounded-sm px-4 py-3 text-sm border border-gray-200 bg-white transition-all duration-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 cursor-pointer"
            >
              <option value="USER">Licitante (USER)</option>
              <option value="MONITOR">Moderador (MONITOR)</option>
              <option value="SUPER_ADMIN">Administrador (SUPER_ADMIN)</option>
            </select>
          </div>

          <Input
            label="Biografia / Descrição"
            placeholder="Ex: Administrador do leilão de Luanda"
            error={errors.bio?.message}
            {...register("bio")}
          />
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
