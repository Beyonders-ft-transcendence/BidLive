"use client";

import ActionCard from "@/components/common/ActionCard";
import TableFilters from "@/components/common/TableFilters";
import { bidStatusColor, BidStatus } from "@/utils/bid";
import { formatCurrency } from "@/utils/auction";
import {
  Ban,
  Eye,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  User,
  Gavel,
  History,
} from "lucide-react";
import { useMemo, useState } from "react";

interface BidData {
  id: string;
  auctionTitle: string;
  bidderName: string;
  value: number;
  status: BidStatus;
  time: string;
}

const initialBids: BidData[] = [
  {
    id: "BID-9001",
    auctionTitle: "Toyota Land Cruiser 2023",
    bidderName: "Ana Silva",
    value: 28500000,
    status: "Vencedor",
    time: "Hoje, 14:20:15",
  },
  {
    id: "BID-9002",
    auctionTitle: "iPhone 15 Pro Max",
    bidderName: "Carlos Mendes",
    value: 920000,
    status: "Superado",
    time: "Hoje, 13:45:00",
  },
  {
    id: "BID-9003",
    auctionTitle: "Toyota Land Cruiser 2023",
    bidderName: "José Santos",
    value: 28000000,
    status: "Superado",
    time: "Hoje, 12:10:30",
  },
  {
    id: "BID-9004",
    auctionTitle: "Apartamento T3 em Talatona",
    bidderName: "Empresa Nova Era",
    value: 86000000,
    status: "Válido",
    time: "Ontem, 22:15:00",
  },
  {
    id: "BID-9005",
    auctionTitle: "Gerador Industrial 50kVA",
    bidderName: "Maria Oliveira",
    value: 4600000,
    status: "Cancelado",
    time: "08 Mai, 16:20:00",
  },
];

export default function Bids() {
  const [bids, setBids] = useState<BidData[]>(initialBids);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredBids = useMemo(() => {
    return bids.filter((bid) => {
      const matchSearch =
        bid.auctionTitle.toLowerCase().includes(search.toLowerCase()) ||
        bid.bidderName.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter ? bid.status === statusFilter : true;

      return matchSearch && matchStatus;
    });
  }, [bids, search, statusFilter]);

  return (
    <>
      <ActionCard
        title="Histórico de Lances"
        subtitle="Monitore todos os lances efetuados na plataforma"
        buttonLabel="Exportar Relatório"
        buttonVariant="outline"
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
              { value: "Vencedor", label: "Vencedor" },
              { value: "Válido", label: "Válido" },
              { value: "Superado", label: "Superado" },
              { value: "Cancelado", label: "Cancelado" },
            ],
          }}
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-300">
            <thead className="bg-gray-50 text-left">
              <tr className="text-xs text-gray-600 border-b border-gray-200">
                <th className="p-3">Leilão</th>
                <th className="text-xs">Licitante</th>
                <th className="text-xs">Valor do Lance</th>
                <th className="text-xs">Status</th>
                <th className="text-xs">Horário</th>
                <th className="text-xs text-right p-3">Ações</th>
              </tr>
            </thead>

            <tbody>
              {filteredBids.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-xs text-gray-500">
                    Nenhum lance encontrado
                  </td>
                </tr>
              ) : (
                filteredBids.map((bid) => (
                  <tr
                    key={bid.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition text-xs"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Gavel className="w-3 h-3 text-gray-400" />
                        <span className="font-medium text-gray-900">{bid.auctionTitle}</span>
                      </div>
                    </td>

                    <td className="text-xs">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">{bid.bidderName}</span>
                      </div>
                    </td>

                    <td className="text-xs font-bold text-blue-600">
                      {formatCurrency(bid.value)}
                    </td>

                    <td className="text-xs">
                      <span
                        className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase ${bidStatusColor(
                          bid.status
                        )}`}
                      >
                        {bid.status}
                      </span>
                    </td>

                    <td className="text-xs">
                      <div className="flex items-center gap-2 text-gray-500">
                        <History className="w-3 h-3" />
                        <span>{bid.time}</span>
                      </div>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Ver Detalhes do Lance"
                          className="p-1.5 rounded-sm hover:bg-blue-100 text-blue-600 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {bid.status !== "Cancelado" && (
                          <button
                            title="Cancelar Lance"
                            className="p-1.5 rounded-sm hover:bg-red-100 text-red-600 transition"
                          >
                            <Ban className="w-3.5 h-3.5" />
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
        <div className="flex items-center justify-between p-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Mostrando 1–5 de {filteredBids.length}
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
    </>
  );
}

