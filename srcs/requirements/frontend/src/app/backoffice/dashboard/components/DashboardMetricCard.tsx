import { ReactNode } from "react";

interface DashboardMetricCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
}

export default function DashboardMetricCard({ title, value, icon }: DashboardMetricCardProps) {
    return (
        <div className="bg-[#0B0F19] rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between min-h-[130px] hover:border-slate-700 transition-colors relative overflow-hidden group">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 border border-primary/20 shrink-0 relative z-10">
                {icon}
            </div>
            <div className="relative z-10">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-black text-white mt-1 drop-shadow-md">{value}</h3>
            </div>
        </div>
    );
}
