"use client";

import ActionCard from "@/components/common/ActionCard";
import StatCard from "@/components/common/StatCard";
import PieStatCard from "@/components/common/PieStatCard";
import StatItem from "@/components/common/StatItem";
import Header from "@/components/layout/backoffice/Header";

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    CartesianGrid,
    XAxis,
} from "recharts";

const userTrendData = [
    { value: 22 },
    { value: 18 },
    { value: 28 },
    { value: 24 },
    { value: 30 },
    { value: 14 },
    { value: 20 },
];

const companyTrendData = [
    { value: 12 },
    { value: 20 },
    { value: 16 },
    { value: 25 },
    { value: 19 },
    { value: 24 },
    { value: 22 },
];

const auctionTrendData = [
    { name: "Seg", active: 240, completed: 180 },
    { name: "Ter", active: 300, completed: 210 },
    { name: "Qua", active: 220, completed: 350 },
    { name: "Qui", active: 180, completed: 260 },
    { name: "Sex", active: 360, completed: 290 },
    { name: "Sab", active: 200, completed: 170 },
];

const onlineData = [
    { name: "Online", value: 72 },
    { name: "Restante", value: 28 },
];

const offlineData = [
    { name: "Offline", value: 45 },
    { name: "Restante", value: 55 },
];

export default function Dashboard() {
    return (
        <div className="flex flex-col gap-4 bg-gray-100 flex-1 min-h-screen">
            <Header />

            <div className="max-w-7xl mx-auto w-full px-4 pb-8">
                <ActionCard
                    title="Bem-vindo ao Dashboard!"
                    buttonLabel="Novo Leilão"
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    {/* LEFT SIDE */}
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* USERS */}
                            <StatCard
                                label="Users"
                                value="33,956"
                                trend="down"
                                trendValue="12,2%"
                                chart={
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={userTrendData}>
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#34d399"
                                                fill="#d1fae5"
                                                strokeWidth={3}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                }
                            />

                            {/* EMPRESAS */}
                            <StatCard
                                label="Empresas"
                                value="50.36%"
                                trend="up"
                                trendValue="9,12%"
                                chart={
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={companyTrendData}>
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#60a5fa"
                                                fill="#dbeafe"
                                                strokeWidth={3}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                }
                            />
                        </div>

                        {/* STATUS USERS */}
                        <div className="bg-white rounded-sm shadow-sm p-4">
                            <h4 className="font-semibold text-xl">Status usuários</h4>
                            <p className="text-gray-500 text-sm mb-6">
                                Acompanhe o comportamento dos usuários online e offline na
                                plataforma em tempo real.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* ONLINE */}
                                <PieStatCard
                                    label="Online"
                                    value="45,324"
                                    chart={
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={onlineData}
                                                    dataKey="value"
                                                    innerRadius={38}
                                                    outerRadius={52}
                                                    stroke="none"
                                                >
                                                    <Cell fill="#10b981" />
                                                    <Cell fill="#e5e7eb" />
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    }
                                />

                                {/* OFFLINE */}
                                <PieStatCard
                                    label="Offline"
                                    value="12,236"
                                    chart={
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={offlineData}
                                                    dataKey="value"
                                                    innerRadius={38}
                                                    outerRadius={52}
                                                    stroke="none"
                                                >
                                                    <Cell fill="#f59e0b" />
                                                    <Cell fill="#e5e7eb" />
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="bg-white rounded-sm shadow-sm p-4">
                        <h4 className="font-semibold text-xl">Total leilões</h4>
                        <p className="text-gray-500 text-sm">
                            Monitoramento de performance de leilões ativos, agendados,
                            concluídos e cancelados.
                        </p>

                        {/* STATS */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <StatItem label="Active" value="13,956" />
                            <StatItem label="Scheduled" value="27,219" />
                            <StatItem label="Completed" value="03,386" />
                            <StatItem label="Canceled" value="04,739" />
                        </div>

                        {/* MAIN GRAPH */}
                        <div className="h-80 mt-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={auctionTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="active"
                                        stroke="#60a5fa"
                                        strokeWidth={3}
                                        dot={false}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="completed"
                                        stroke="#f472b6"
                                        strokeWidth={3}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}