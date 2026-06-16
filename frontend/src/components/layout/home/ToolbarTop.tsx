import { FiGrid, FiList } from "react-icons/fi";

interface ToolbarTopProps {
  ordering: string;
  setOrdering: (val: string) => void;
  pageSize: number;
  setPageSize: (val: number) => void;
  setPage: (val: number) => void;
}

export default function ToolbarTop({
  ordering,
  setOrdering,
  pageSize,
  setPageSize,
  setPage
}: ToolbarTopProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between border border-gray-200 p-3.5 bg-white rounded-sm shadow-sm gap-4">
      <div className="flex gap-2">
         <button className="bg-primary text-white p-2.5 rounded-sm shadow-sm hover:bg-primary-light transition-colors"><FiGrid size={16} /></button>
         <button className="bg-gray-50 border border-gray-200 text-gray-500 p-2.5 rounded-sm hover:bg-gray-100 transition-colors shadow-sm"><FiList size={16} /></button>
      </div>
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[13px] text-gray-600 font-medium">
         <div className="flex items-center gap-2.5">
           <span>Ordenar por:</span>
           <select 
             value={ordering}
             onChange={(e) => {
               setOrdering(e.target.value);
               setPage(1);
             }}
             className="border border-gray-300 p-2 px-3 outline-none rounded-sm bg-gray-50 cursor-pointer hover:border-gray-400 focus:border-primary transition-colors min-w-[120px]"
           >
             <option value="">Padrão</option>
             <option value="item__current_price">Preço (Menor)</option>
             <option value="-item__current_price">Preço (Maior)</option>
             <option value="end_time">A Terminar em Breve</option>
           </select>
         </div>
         <div className="flex items-center gap-2.5">
           <span>Mostrar:</span>
           <select 
             value={pageSize}
             onChange={(e) => {
               setPageSize(Number(e.target.value));
               setPage(1);
             }}
             className="border border-gray-300 p-2 px-3 outline-none rounded-sm bg-gray-50 cursor-pointer hover:border-gray-400 focus:border-primary transition-colors"
           >
             <option value={16}>16</option>
             <option value={32}>32</option>
             <option value={64}>64</option>
           </select>
         </div>
      </div>
    </div>
  );
}
