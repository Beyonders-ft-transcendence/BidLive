import { Search, Filter } from "lucide-react";

interface TableFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  onShowFiltersChange: (show: boolean) => void;
  filters: {
    type?: string;
    status?: string;
    verification?: string;
    category?: string;
  };
  onFilterChange: (filterName: string, value: string) => void;
  onClearFilters: () => void;
  filterOptions?: {
    typeOptions?: { value: string; label: string }[];
    statusOptions?: { value: string; label: string }[];
    verificationOptions?: { value: string; label: string }[];
    categoryOptions?: { value: string; label: string }[];
  };
}

const DEFAULT_VERIFICATION_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "Verificado", label: "Verificado" },
  { value: "Não Verificado", label: "Não Verificado" },
];

export default function TableFilters({
  search,
  onSearchChange,
  showFilters,
  onShowFiltersChange,
  filters,
  onFilterChange,
  onClearFilters,
  filterOptions = {},
}: TableFiltersProps) {
  const verificationOptions =
    filterOptions.verificationOptions || DEFAULT_VERIFICATION_OPTIONS;

  return (
    <div className="pb-4 border-b border-gray-200">
      {/* SEARCH BAR WITH FILTER TOGGLE */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
        <button
          onClick={() => onShowFiltersChange(!showFilters)}
          className={`px-3 py-2 border rounded-sm text-xs font-medium transition flex items-center gap-2 ${
            showFilters
              ? "bg-blue-600 text-white border-blue-600"
              : "border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/* FILTERS GRID - CONDITIONAL DISPLAY */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
          {/* TYPE FILTER */}
          {filterOptions.typeOptions && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Tipo
              </label>
              <select
                value={filters.type || ""}
                onChange={(e) => onFilterChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 appearance-none bg-white cursor-pointer"
              >
                {filterOptions.typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* CATEGORY FILTER */}
          {filterOptions.categoryOptions && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Categoria
              </label>
              <select
                value={filters.category || ""}
                onChange={(e) => onFilterChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 appearance-none bg-white cursor-pointer"
              >
                {filterOptions.categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* STATUS FILTER */}
          {filterOptions.statusOptions && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Status
              </label>
              <select
                value={filters.status || ""}
                onChange={(e) => onFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 appearance-none bg-white cursor-pointer"
              >
                {filterOptions.statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* VERIFICATION FILTER - Only show if not using category (simple heuristic for now) */}
          {!filterOptions.categoryOptions && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Verificação
              </label>
              <select
                value={filters.verification || ""}
                onChange={(e) => onFilterChange("verification", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 appearance-none bg-white cursor-pointer"
              >
                {verificationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* CLEAR FILTERS BUTTON */}
          <div className="flex items-end">
            <button
              onClick={onClearFilters}
              className="w-full px-3 py-2 text-xs font-medium text-gray-700 border border-gray-200 rounded-sm hover:bg-gray-50 transition"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

