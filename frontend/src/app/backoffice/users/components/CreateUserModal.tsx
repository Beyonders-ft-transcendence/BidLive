"use client";

import { useState } from "react";
import Modal from "@/components/common/Modal";
import { Building2 } from "lucide-react";
import { type UserType, type UserStatus } from "../page";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateUser: (userData: {
    name: string;
    email: string;
    phone: string;
    type: UserType;
    status: UserStatus;
    verified: boolean;
    region: string;
    city: string;
    street: string;
    companyName?: string;
    companyDoc?: string;
    companyIndustry?: string;
  }) => void;
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onCreateUser,
}: CreateUserModalProps) {
  // Form fields state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<UserType>("Pessoa Física");
  const [status, setStatus] = useState<UserStatus>("Ativo");
  const [verified, setVerified] = useState(false);
  const [region, setRegion] = useState("Luanda");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  // Juridical extra fields
  const [companyName, setCompanyName] = useState("");
  const [companyDoc, setCompanyDoc] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;

    onCreateUser({
      name,
      email,
      phone,
      type,
      status,
      verified,
      region,
      city,
      street,
      ...(type === "Pessoa Jurídica" && {
        companyName,
        companyDoc,
        companyIndustry,
      }),
    });

    // Reset Form
    setName("");
    setEmail("");
    setPhone("");
    setType("Pessoa Física");
    setStatus("Ativo");
    setVerified(false);
    setCity("");
    setStreet("");
    setCompanyName("");
    setCompanyDoc("");
    setCompanyIndustry("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Utilizador Administrativo" size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 p-5 gap-4">
        
        {/* Type toggle */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Tipo de Conta
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("Pessoa Física")}
              className={`py-1.5 rounded-sm text-xs font-bold transition-all cursor-pointer border ${
                type === "Pessoa Física"
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
              }`}
            >
              Pessoa Física
            </button>
            <button
              type="button"
              onClick={() => setType("Pessoa Jurídica")}
              className={`py-1.5 rounded-sm text-xs font-bold transition-all cursor-pointer border ${
                type === "Pessoa Jurídica"
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
              }`}
            >
              Pessoa Jurídica (Empresa)
            </button>
          </div>
        </div>

        {/* Basic Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Manuel António"
              className="w-full bg-gray-50 border border-gray-100 rounded-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 text-gray-800 placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: manuel@email.com"
              className="w-full bg-gray-50 border border-gray-100 rounded-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 text-gray-800 placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Telefone
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: +244 923 000 000"
              className="w-full bg-gray-50 border border-gray-100 rounded-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 text-gray-800 placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Estado Inicial
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as UserStatus)}
              className="w-full bg-gray-50 border border-gray-100 rounded-sm px-3 py-2 text-xs focus:outline-none text-gray-800 cursor-pointer"
            >
              <option value="Ativo">Ativo</option>
              <option value="Suspenso">Suspenso</option>
              <option value="Bloqueado">Bloqueado</option>
            </select>
          </div>
        </div>

        {/* Toggle verification box */}
        <div className="flex items-center gap-2 border border-gray-50 p-2.5 rounded-sm bg-gray-50/30">
          <input
            type="checkbox"
            id="user-verified-check-modal"
            checked={verified}
            onChange={(e) => setVerified(e.target.checked)}
            className="rounded-sm border-gray-300 text-primary focus:ring-primary/20 h-4 w-4 cursor-pointer"
          />
          <label htmlFor="user-verified-check-modal" className="text-xs font-bold text-gray-700 cursor-pointer">
            Marcar conta como previamente Verificada (BI / Documentação OK)
          </label>
        </div>

        {/* Location Fields */}
        <div className="flex flex-col gap-2">
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-50 pb-0.5">
            Endereço & Localização
          </span>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[9px] text-gray-400 font-bold uppercase mb-0.5">Província</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-sm px-2 py-1.5 text-xs focus:outline-none text-gray-800 cursor-pointer"
              >
                <option value="Luanda">Luanda</option>
                <option value="Benguela">Benguela</option>
                <option value="Huíla">Huíla</option>
                <option value="Cabinda">Cabinda</option>
                <option value="Huambo">Huambo</option>
                <option value="Namibe">Namibe</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] text-gray-400 font-bold uppercase mb-0.5">Cidade / Município</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: Talatona"
                className="w-full bg-gray-50 border border-gray-100 rounded-sm px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 text-gray-800"
              />
            </div>
            <div>
              <label className="block text-[9px] text-gray-400 font-bold uppercase mb-0.5">Rua / Bairro</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Ex: Rua Central"
                className="w-full bg-gray-50 border border-gray-100 rounded-sm px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 text-gray-800"
              />
            </div>
          </div>
        </div>

        {/* Juridical specific section */}
        {type === "Pessoa Jurídica" && (
          <div className="flex flex-col gap-3.5 bg-blue-50/20 border border-blue-50/50 rounded-sm p-3.5 mt-2">
            <span className="text-[9px] text-primary font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Building2 size={12} />
              <span>Detalhes da Empresa</span>
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[9px] text-gray-400 font-bold uppercase mb-0.5">Razão Social</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Nova Era Lda"
                  className="w-full bg-white border border-gray-100 rounded-sm px-2 py-1.5 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] text-gray-400 font-bold uppercase mb-0.5">NIF Corporativo</label>
                <input
                  type="text"
                  value={companyDoc}
                  onChange={(e) => setCompanyDoc(e.target.value)}
                  placeholder="Ex: 5002931LA"
                  className="w-full bg-white border border-gray-100 rounded-sm px-2 py-1.5 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] text-gray-400 font-bold uppercase mb-0.5">Sector Comercial</label>
                <input
                  type="text"
                  value={companyIndustry}
                  onChange={(e) => setCompanyIndustry(e.target.value)}
                  placeholder="Ex: Importações"
                  className="w-full bg-white border border-gray-100 rounded-sm px-2 py-1.5 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit panel */}
        <div className="border-t border-gray-100 pt-4 flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 font-bold text-xs py-2 px-4 rounded-sm transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-primary hover:bg-primary/95 text-white font-bold text-xs py-2 px-5 rounded-sm transition-colors cursor-pointer"
          >
            Salvar Registo
          </button>
        </div>
      </form>
    </Modal>
  );
}
