"use client";

import Header from "@/components/layout/backoffice/Header";
import ActionCard from "@/components/common/ActionCard";
import TableFilters from "@/components/common/TableFilters";
import { categoryStatusColor, CategoryStatus } from "@/utils/category";
import {
  Edit3,
  Trash2,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string;
  auctionsCount: number;
  status: CategoryStatus;
  createdAt: string;
}

const initialCategories: CategoryData[] = [
  {
    id: "CAT-001",
    name: "Veículos",
    slug: "veiculos",
    description: "Carros, motos, barcos e outros veículos motorizados.",
    auctionsCount: 145,
    status: "Ativo",
    createdAt: "10 Jan 2025",
  },
  {
    id: "CAT-002",
    name: "Imóveis",
    slug: "imoveis",
    description: "Casas, apartamentos, terrenos e galpões comerciais.",
    auctionsCount: 82,
    status: "Ativo",
    createdAt: "12 Jan 2025",
  },
  {
    id: "CAT-003",
    name: "Eletrônicos",
    slug: "eletronicos",
    description: "Smartphones, laptops, câmeras e acessórios.",
    auctionsCount: 215,
    status: "Ativo",
    createdAt: "15 Jan 2025",
  },
  {
    id: "CAT-004",
    name: "Equipamentos",
    slug: "equipamentos",
    description: "Maquinário industrial e equipamentos de construção.",
    auctionsCount: 43,
    status: "Ativo",
    createdAt: "20 Jan 2025",
  },
  {
    id: "CAT-005",
    name: "Arte & Colecionáveis",
    slug: "arte-colecionaveis",
    description: "Pinturas, moedas raras, selos e antiguidades.",
    auctionsCount: 12,
    status: "Inativo",
    createdAt: "05 Fev 2025",
  },
];

export default function Categories() {
  const [categories, setCategories] = useState<CategoryData[]>(initialCategories);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchSearch =
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        cat.slug.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter ? cat.status === statusFilter : true;

      return matchSearch && matchStatus;
    });
  }, [categories, search, statusFilter]);

  const handleOpenModal = (category?: CategoryData) => {
    if (category) {
      setEditingCategory(category);
    } else {
      setEditingCategory(null);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto w-full px-4 py-6">
        <ActionCard
          title="Gestão de Categorias"
          buttonLabel="Nova Categoria"
          onButtonClick={() => handleOpenModal()}
        />

        {/* TABLE */}
        <div className="bg-white p-4 rounded-sm shadow-sm mt-4 overflow-hidden">
          {/* SEARCH & FILTERS */}
          <TableFilters
            search={search}
            onSearchChange={setSearch}
            showFilters={showFilters}
            onShowFiltersChange={setShowFilters}
            filters={{
              status: statusFilter,
            }}
            onFilterChange={(filterName, value) => {
              if (filterName === "status") setStatusFilter(value);
            }}
            onClearFilters={() => {
              setSearch("");
              setStatusFilter("");
            }}
            filterOptions={{
              statusOptions: [
                { value: "", label: "Todos os Status" },
                { value: "Ativo", label: "Ativo" },
                { value: "Inativo", label: "Inativo" },
              ],
            }}
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-300">
              <thead className="bg-gray-50 text-left">
                <tr className="text-xs text-gray-600 border-b border-gray-200">
                  <th className="p-3 font-semibold">Nome da Categoria</th>
                  <th className="text-xs font-semibold">Slug</th>
                  <th className="text-xs font-semibold">Descrição</th>
                  <th className="text-xs font-semibold">Leilões</th>
                  <th className="text-xs font-semibold">Status</th>
                  <th className="text-xs font-semibold">Data Criação</th>
                  <th className="text-xs font-semibold">Ações</th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-xs text-gray-500">
                      Nenhuma categoria encontrada
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr
                      key={cat.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition text-xs"
                    >
                      <td className="p-3 font-medium text-gray-900">{cat.name}</td>
                      <td className="text-xs text-gray-500">/{cat.slug}</td>
                      <td className="text-xs text-gray-600 max-w-xs truncate">
                        {cat.description}
                      </td>
                      <td className="text-xs font-medium text-blue-600">
                        {cat.auctionsCount}
                      </td>
                      <td className="text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase ${categoryStatusColor(
                            cat.status
                          )}`}
                        >
                          {cat.status}
                        </span>
                      </td>
                      <td className="text-xs text-gray-500">{cat.createdAt}</td>
                      <td className="text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(cat)}
                            className="p-1.5 rounded-sm hover:bg-blue-100 text-blue-600 transition"
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1.5 rounded-sm hover:bg-red-100 text-red-600 transition"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between p-3 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Mostrando 1–5 de {filteredCategories.length}
            </div>

            <div className="flex items-center gap-1.5">
              <button className="p-1 border border-gray-200 rounded-sm hover:bg-gray-50">
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button className="px-2.5 py-1 bg-blue-600 text-white rounded-sm text-xs font-medium shadow-sm">
                1
              </button>
              <button className="p-1 border border-gray-200 rounded-sm hover:bg-gray-50">
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL NOVA/EDITAR CATEGORIA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  placeholder="Ex: Veículos"
                  defaultValue={editingCategory?.name}
                  className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Slug
                </label>
                <div className="flex items-center">
                  <span className="bg-gray-100 px-3 py-2 border border-r-0 border-gray-200 rounded-l-sm text-xs text-gray-500">
                    /
                  </span>
                  <input
                    type="text"
                    placeholder="veiculos"
                    defaultValue={editingCategory?.slug}
                    className="w-full px-3 py-2 border border-gray-200 rounded-r-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Status
                </label>
                <select 
                  defaultValue={editingCategory?.status || "Ativo"}
                  className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Descrição
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva o tipo de itens nesta categoria..."
                  defaultValue={editingCategory?.description}
                  className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-sm border border-gray-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-sm shadow-sm transition"
                >
                  {editingCategory ? "Salvar Alterações" : "Criar Categoria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
