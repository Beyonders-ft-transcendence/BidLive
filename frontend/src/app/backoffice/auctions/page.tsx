"use client";

import Header from "@/components/layout/backoffice/Header";
import ActionCard from "@/components/common/ActionCard";
import TableFilters from "@/components/common/TableFilters";
import { auctionStatusColor, formatCurrency, AuctionStatus } from "@/utils/auction";
import {
  Eye,
  Ban,
  Trash2,
  CheckCircle,
  Pause,
  Play,
  Edit3,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { useMemo, useState } from "react";

interface AuctionData {
  id: string;
  title: string;
  category: string;
  creator: string;
  startingPrice: number;
  currentBid: number;
  status: AuctionStatus;
  startDate: string;
  endDate: string;
  bidsCount: number;
  isFraudulent: boolean;
}

const auctionsData: AuctionData[] = [
  {
    id: "AUC-1001",
    title: "Toyota Land Cruiser 2023",
    category: "Veículos",
    creator: "Ana Silva",
    startingPrice: 25000000,
    currentBid: 28500000,
    status: "Ativo",
    startDate: "01 Mai 2025",
    endDate: "15 Mai 2025",
    bidsCount: 12,
    isFraudulent: false,
  },
  {
    id: "AUC-1002",
    title: "Apartamento T3 em Talatona",
    category: "Imóveis",
    creator: "Empresa Nova Era",
    startingPrice: 85000000,
    currentBid: 0,
    status: "Aguardando Aprovação",
    startDate: "10 Mai 2025",
    endDate: "30 Mai 2025",
    bidsCount: 0,
    isFraudulent: false,
  },
  {
    id: "AUC-1003",
    title: "iPhone 15 Pro Max",
    category: "Eletrônicos",
    creator: "Carlos Mendes",
    startingPrice: 850000,
    currentBid: 920000,
    status: "Finalizado",
    startDate: "20 Abr 2025",
    endDate: "05 Mai 2025",
    bidsCount: 45,
    isFraudulent: false,
  },
  {
    id: "AUC-1004",
    title: "Gerador Industrial 50kVA",
    category: "Equipamentos",
    creator: "José Santos",
    startingPrice: 4500000,
    currentBid: 4500000,
    status: "Pausado",
    startDate: "02 Mai 2025",
    endDate: "20 Mai 2025",
    bidsCount: 1,
    isFraudulent: false,
  },
  {
    id: "AUC-1005",
    title: "Lote de Terreno - Benfica",
    category: "Imóveis",
    creator: "Maria Oliveira",
    startingPrice: 12000000,
    currentBid: 12500000,
    status: "Cancelado",
    startDate: "01 Abr 2025",
    endDate: "15 Abr 2025",
    bidsCount: 3,
    isFraudulent: true,
  },
];

export default function Auctions() {
  const [selectedAuction, setSelectedAuction] = useState<AuctionData | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredAuctions = useMemo(() => {
    return auctionsData.filter((auction) => {
      const matchSearch =
        auction.title.toLowerCase().includes(search.toLowerCase()) ||
        auction.creator.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter ? auction.status === statusFilter : true;
      const matchCategory = categoryFilter ? auction.category === categoryFilter : true;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [search, statusFilter, categoryFilter]);

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto w-full px-4 py-6">
        <ActionCard
          title="Gestão de Leilões"
          buttonLabel="Novo Leilão"
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
              category: categoryFilter,
            }}
            onFilterChange={(filterName, value) => {
              switch (filterName) {
                case "status":
                  setStatusFilter(value);
                  break;
                case "category":
                  setCategoryFilter(value);
                  break;
              }
            }}
            onClearFilters={() => {
              setSearch("");
              setStatusFilter("");
              setCategoryFilter("");
            }}
            filterOptions={{
              statusOptions: [
                { value: "", label: "Todos os Status" },
                { value: "Ativo", label: "Ativo" },
                { value: "Finalizado", label: "Finalizado" },
                { value: "Cancelado", label: "Cancelado" },
                { value: "Pausado", label: "Pausado" },
                { value: "Aguardando Aprovação", label: "Pendente" },
              ],
              categoryOptions: [
                { value: "", label: "Todas as Categorias" },
                { value: "Veículos", label: "Veículos" },
                { value: "Imóveis", label: "Imóveis" },
                { value: "Eletrônicos", label: "Eletrônicos" },
                { value: "Equipamentos", label: "Equipamentos" },
              ],
            }}
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-300">
              <thead className="bg-gray-50 text-left">
                <tr className="text-xs text-gray-600 border-b border-gray-200">
                  <th className="p-3">Leilão</th>
                  <th className="text-xs">Criador</th>
                  <th className="text-xs">Preço Inicial</th>
                  <th className="text-xs">Lance Atual</th>
                  <th className="text-xs">Status</th>
                  <th className="text-xs">Término</th>
                  <th className="text-xs">Lances</th>
                  <th className="text-xs">Ações</th>
                </tr>
              </thead>

              <tbody>
                {filteredAuctions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-xs text-gray-500">
                      Nenhum leilão encontrado
                    </td>
                  </tr>
                ) : (
                  filteredAuctions.map((auction) => (
                    <tr
                      key={auction.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition text-xs"
                    >
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{auction.title}</span>
                          <span className="text-[10px] text-gray-500">{auction.category}</span>
                        </div>
                      </td>

                      <td className="text-xs text-gray-600">{auction.creator}</td>

                      <td className="text-xs font-medium">{formatCurrency(auction.startingPrice)}</td>

                      <td className="text-xs font-bold text-blue-600">
                        {auction.currentBid > 0 ? formatCurrency(auction.currentBid) : "—"}
                      </td>

                      <td className="text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase ${auctionStatusColor(
                            auction.status
                          )}`}
                        >
                          {auction.status}
                        </span>
                      </td>

                      <td className="text-xs text-gray-600">{auction.endDate}</td>

                      <td className="text-xs text-center">{auction.bidsCount}</td>

                      <td className="text-xs">
                        <div className="flex items-center gap-1">
                          <button
                            title="Ver Detalhes"
                            onClick={() => setSelectedAuction(auction)}
                            className="p-1.5 rounded-sm hover:bg-blue-100 text-blue-600"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {auction.status === "Aguardando Aprovação" && (
                            <button
                              title="Aprovar Leilão"
                              className="p-1.5 rounded-sm hover:bg-green-100 text-green-600"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {auction.status === "Ativo" && (
                            <button
                              title="Pausar Leilão"
                              className="p-1.5 rounded-sm hover:bg-yellow-100 text-yellow-600"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {auction.status === "Pausado" && (
                            <button
                              title="Retomar Leilão"
                              className="p-1.5 rounded-sm hover:bg-green-100 text-green-600"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            title="Editar Leilão"
                            className="p-1.5 rounded-sm hover:bg-gray-100 text-gray-700"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title="Cancelar Leilão"
                            className="p-1.5 rounded-sm hover:bg-red-100 text-red-600"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>

                          {auction.isFraudulent && (
                            <button
                              title="Remover Fraudulento"
                              className="p-1.5 rounded-sm bg-red-600 text-white hover:bg-red-700 shadow-sm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between p-3">
            <div className="text-xs text-gray-500">
              Mostrando 1–10 de {filteredAuctions.length}
            </div>

            <div className="flex items-center gap-1.5">
              <button className="p-1 border border-gray-200 rounded-sm hover:bg-gray-50">
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button className="px-2.5 py-1 bg-blue-600 text-white rounded-sm text-xs font-medium">
                1
              </button>
              <button className="p-1 border border-gray-200 rounded-sm hover:bg-gray-50">
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL (SIMPLIFIED FOR NOW) */}
      {selectedAuction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm max-w-2xl w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Detalhes do Leilão
                {selectedAuction.isFraudulent && (
                  <span className="flex items-center gap-1 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3" /> Possível Fraude
                  </span>
                )}
              </h2>
              <button
                onClick={() => setSelectedAuction(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ChevronRight className="w-5 h-5 rotate-90" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Título</p>
                <p className="text-sm font-medium">{selectedAuction.title}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Categoria</p>
                <p className="text-sm font-medium">{selectedAuction.category}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Criador</p>
                <p className="text-sm font-medium">{selectedAuction.creator}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Status</p>
                <span
                  className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase ${auctionStatusColor(
                    selectedAuction.status
                  )}`}
                >
                  {selectedAuction.status}
                </span>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Preço Inicial</p>
                <p className="text-sm font-medium">{formatCurrency(selectedAuction.startingPrice)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Lance Atual</p>
                <p className="text-sm font-bold text-blue-600">
                  {selectedAuction.currentBid > 0 ? formatCurrency(selectedAuction.currentBid) : "Sem lances"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Data de Início</p>
                <p className="text-sm font-medium">{selectedAuction.startDate}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Data de Término</p>
                <p className="text-sm font-medium">{selectedAuction.endDate}</p>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setSelectedAuction(null)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-sm border border-gray-200"
              >
                Fechar
              </button>
              {selectedAuction.status === "Aguardando Aprovação" && (
                <button className="px-4 py-2 text-xs font-medium bg-green-600 text-white hover:bg-green-700 rounded-sm">
                  Aprovar Agora
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
