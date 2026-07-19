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
    <div className="bg-card p-5 rounded-sm border border-border shadow-sm overflow-hidden flex flex-col text-foreground">
      {/* FILTER BAR SLOT */}
      {filters && <div className="mb-4">{filters}</div>}

      {/* TABLE WRAPPER FOR HORIZONTAL SCROLLING */}
      <div className="overflow-x-auto scrollbar-none">
        {children}
      </div>

      {/* PAGINATION FOOTER */}
      {showPagination && (
        <div className="flex items-center justify-between border-t border-border pt-4 mt-4">
          <span className="text-xs text-muted-foreground font-semibold">
            Mostrando {startRange}–{endRange} de {pagination.totalCount} {entityName}
          </span>

          <div className="flex items-center gap-1.5 select-none">
            {/* Prev Button */}
            <button
              onClick={() => hasPrevious && pagination.onPageChange(pagination.currentPage - 1)}
              disabled={!hasPrevious}
              className={`p-1.5 border border-border bg-background rounded-sm transition-colors ${hasPrevious
                  ? "text-foreground hover:bg-muted cursor-pointer"
                  : "text-muted-foreground cursor-not-allowed opacity-55"
                }`}
            >
              <ChevronLeft size={14} />
            </button>

            {/* Current Page Indicator */}
            <button className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-sm focus:outline-none shadow-sm border-none">
              {pagination.currentPage}
            </button>

            {/* Next Button */}
            <button
              onClick={() => hasNext && pagination.onPageChange(pagination.currentPage + 1)}
              disabled={!hasNext}
              className={`p-1.5 border border-border bg-background rounded-sm transition-colors ${hasNext
                  ? "text-foreground hover:bg-muted cursor-pointer"
                  : "text-muted-foreground cursor-not-allowed opacity-55"
                }`}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
