"use client";

import { type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TableSectionProps {
  filters?: ReactNode;
  children: ReactNode;
  pagination?: {
    currentPage: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (page: number) => void;
  };
  entityName?: string;
}

export default function TableSection({
  filters,
  children,
  pagination,
  entityName = "registros",
}: TableSectionProps) {
  const showPagination = pagination && pagination.totalCount > 0;
  
  // Calculate paging ranges
  const startRange = showPagination
    ? (pagination.currentPage - 1) * pagination.pageSize + 1
    : 0;
  const endRange = showPagination
    ? Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)
    : 0;

  const totalPages = showPagination
    ? Math.ceil(pagination.totalCount / pagination.pageSize)
    : 1;

  const hasPrevious = showPagination && pagination.currentPage > 1;
  const hasNext = showPagination && pagination.currentPage < totalPages;

  return (
    <div className="bg-white p-4 rounded-sm border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      {/* FILTER BAR SLOT */}
      {filters && <div className="mb-4">{filters}</div>}

      {/* TABLE WRAPPER FOR HORIZONTAL SCROLLING */}
      <div className="overflow-x-auto scrollbar-none">
        {children}
      </div>

      {/* PAGINATION FOOTER */}
      {showPagination && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
          <span className="text-[10px] text-gray-400 font-bold">
            Mostrando {startRange}–{endRange} de {pagination.totalCount} {entityName}
          </span>
          
          <div className="flex items-center gap-1 select-none">
            {/* Prev Button */}
            <button
              onClick={() => hasPrevious && pagination.onPageChange(pagination.currentPage - 1)}
              disabled={!hasPrevious}
              className={`p-1 border border-gray-100 bg-white rounded-sm transition-colors ${
                hasPrevious
                  ? "text-gray-600 hover:bg-gray-50 cursor-pointer"
                  : "text-gray-300 cursor-not-allowed"
              }`}
            >
              <ChevronLeft size={12} />
            </button>

            {/* Current Page Indicator */}
            <button className="px-2.5 py-0.5 bg-primary text-white text-[10px] font-bold rounded-sm focus:outline-none">
              {pagination.currentPage}
            </button>

            {/* Next Button */}
            <button
              onClick={() => hasNext && pagination.onPageChange(pagination.currentPage + 1)}
              disabled={!hasNext}
              className={`p-1 border border-gray-100 bg-white rounded-sm transition-colors ${
                hasNext
                  ? "text-gray-600 hover:bg-gray-50 cursor-pointer"
                  : "text-gray-300 cursor-not-allowed"
              }`}
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
