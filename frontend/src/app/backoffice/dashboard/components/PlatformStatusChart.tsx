"use client";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";

// 12 months data matching the bar chart in the mockup
const statusData = [
    { name: "Jan", value: 12000 },
    { name: "Fev", value: 15000 },
    { name: "Mar", value: 14000 },
    { name: "Abr", value: 18000 },
    { name: "Mai", value: 20000 },
    { name: "Jun", value: 35000 }, // Peak month (highlighted)
    { name: "Jul", value: 15000 },
    { name: "Ago", value: 17000 },
    { name: "Set", value: 16000 },
    { name: "Out", value: 18000 },
    { name: "Nov", value: 14000 },
    { name: "Dez", value: 19000 }
];

export default function PlatformStatusChart() {
    return (
        <div className="lg:col-span-8 bg-[#0B0F19] rounded-xl border border-slate-800 p-6 shadow-lg flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-center mb-5">
                    <span className="text-sm font-bold text-white">Status da Plataforma</span>
                </div>
            </div>

            {/* Recharts Bar chart */}
            <div className="h-60 mt-1 text-[10px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} />
                        <Tooltip cursor={{ fill: '#1E293B', opacity: 0.4 }} contentStyle={{ backgroundColor: '#151C2C', borderColor: '#1E293B', color: '#fff', borderRadius: '8px' }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={16}>
                            {statusData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={index === 5 ? "#1B59F8" : "#1E293B"}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
