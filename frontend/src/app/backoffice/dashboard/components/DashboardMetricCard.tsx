import { ReactNode } from "react";

interface DashboardMetricCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
}

export default function DashboardMetricCard({ title, value, icon }: DashboardMetricCardProps) {
    return (
        <div className="bg-white rounded-md border border-slate-200 p-5 shadow-md flex flex-col justify-between min-h-[130px]">
            <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center mb-3 border border-primary/10 shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{title}</p>
                <h3 className="text-xl font-black text-slate-900 mt-1">{value}</h3>
            </div>
        </div>
    );
}
