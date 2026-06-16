"use client";

import { useState, useMemo } from "react";
import ActionCard from "@/components/common/ActionCard";
import TableFilters from "@/components/common/TableFilters";
import TableSection from "@/components/common/TableSection";
import { useCategoriesQuery } from "@/hooks/useCategory";
import type { Category } from "@/types/category.types";
import {
  Folder,
  ArrowRight,
  Layers
} from "lucide-react";

export default function Categories() {
  const { data: categoriesData, isLoading: loading } = useCategoriesQuery();
  const categories = categoriesData || [];
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchSearch =
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        cat.slug.toLowerCase().includes(search.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter
        ? (statusFilter === "Ativo" ? cat.is_active : !cat.is_active)
        : true;

      return matchSearch && matchStatus;
    });
  }, [categories, search, statusFilter]);

  // Find parent name helper
  const getParentCategoryName = (parentId: number | null) => {
    if (!parentId) return "—";
    const parent = categories.find((c) => c.id === parentId);
    return parent ? parent.name : `ID: ${parentId}`;
  };

  const filtersSlot = (
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
          { value: "", label: "Todos os Estados" },
          { value: "Ativo", label: "Ativas" },
          { value: "Inativo", label: "Inativas" },
        ],
      }}
    />
  );

  return (
    <div className="flex flex-col gap-5 p-1 select-none">
      
      {/* HEADER SECTION */}
      <ActionCard
        title="Gestão de Categorias"
        subtitle="Consulte e gerencie as taxonomias e agrupamentos de leilões da plataforma. A modificação de categorias é feita no painel administrativo principal do Django."
      />

      {/* TABLE SECTION */}
      <TableSection
        filters={filtersSlot}
        entityName="categorias"
      >
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-100 text-[9px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50/50">
              <th className="p-3">Categoria</th>
              <th className="py-3">Caminho (Slug)</th>
              <th className="py-3">Categoria Pai</th>
              <th className="py-3">Descrição</th>
              <th className="py-3">Status</th>
              <th className="py-3 text-right pr-6">ID Interno</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-[10px] text-gray-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400 font-medium">
                  Carregando categorias da API...
                </td>
              </tr>
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400 font-medium">
                  Nenhuma categoria encontrada com os filtros selecionados.
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-sm bg-primary/5 text-primary flex items-center justify-center border border-primary/10">
                        <Folder size={12} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-950 text-xs leading-tight">
                          {cat.name}
                        </span>
                        <span className="text-[8px] font-bold text-gray-400 mt-0.5 tracking-wider uppercase font-mono">
                          Ordem: {cat.sort_order}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 font-mono text-gray-500">/{cat.slug}</td>
                  <td className="py-3">
                    {cat.parent ? (
                      <div className="flex items-center gap-1.5 text-gray-800">
                        <Layers size={10} className="text-gray-400" />
                        <span className="font-medium">{getParentCategoryName(cat.parent)}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 font-semibold">—</span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className="text-gray-600 font-medium line-clamp-1 max-w-[280px]">
                      {cat.description || "Sem descrição disponível."}
                    </span>
                  </td>
                  <td className="py-3">
                    {cat.is_active ? (
                      <span className="px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase bg-green-50 text-green-600">
                        Ativo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase bg-gray-100 text-gray-400">
                        Inativo
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right pr-6 font-mono text-gray-400 font-bold">
                    #{cat.id}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableSection>
    </div>
  );
}
