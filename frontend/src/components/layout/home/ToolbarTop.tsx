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
    <div className="flex flex-col md:flex-row items-center justify-between border border-slate-800 p-4 md:p-3.5 bg-[#151C2C] rounded-sm shadow-sm gap-4 md:gap-0">
      
      {/* TOGGLES */}
      <div className="flex gap-2 w-full md:w-auto justify-center md:justify-start border-b border-slate-800 pb-4 md:border-0 md:pb-0">
         <button className="flex-1 md:flex-none flex justify-center bg-primary text-white p-2.5 md:p-2.5 rounded-sm shadow-sm hover:bg-primary-light transition-colors"><FiGrid size={16} /></button>
         <button className="flex-1 md:flex-none flex justify-center bg-[#0B0F19] border border-slate-800 text-slate-400 p-2.5 md:p-2.5 rounded-sm hover:bg-slate-800 hover:text-white transition-colors shadow-sm"><FiList size={16} /></button>
      </div>

      {/* FILTERS */}
      <div className="flex w-full md:w-auto gap-4 text-xs md:text-[13px] text-slate-300 font-medium">
         
         <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-2.5 w-1/2 md:w-auto">
           <span className="text-[10px] md:text-[13px] text-slate-500 md:text-slate-400 font-bold md:font-medium uppercase tracking-wider md:tracking-normal md:normal-case">Ordenar</span>
           <select 
             value={ordering}
             onChange={(e) => {
               setOrdering(e.target.value);
               setPage(1);
             }}
             className="border border-slate-800 p-2 md:px-3 outline-none rounded-sm bg-[#0B0F19] cursor-pointer hover:border-slate-600 focus:border-primary transition-colors w-full md:min-w-[140px] text-slate-200"
           >
             <option value="">Padrão</option>
             <option value="item__current_price">Preço (Menor)</option>
             <option value="-item__current_price">Preço (Maior)</option>
             <option value="end_time">A Terminar em Breve</option>
           </select>
         </div>

         <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-2.5 w-1/2 md:w-auto">
           <span className="text-[10px] md:text-[13px] text-slate-500 md:text-slate-400 font-bold md:font-medium uppercase tracking-wider md:tracking-normal md:normal-case">Mostrar</span>
           <select 
             value={pageSize}
             onChange={(e) => {
               setPageSize(Number(e.target.value));
               setPage(1);
             }}
             className="border border-slate-800 p-2 md:px-3 outline-none rounded-sm bg-[#0B0F19] cursor-pointer hover:border-slate-600 focus:border-primary transition-colors w-full text-slate-200"
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
