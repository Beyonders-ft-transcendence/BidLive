"use client";

import ActionCard from "@/components/common/ActionCard";
import Header from "@/components/layout/backoffice/Header";
import { ArrowDown, ArrowUp } from "lucide-react";

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
                        {/* TOP SMALL CARDS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* USERS */}
                            <div className="bg-white rounded-sm shadow-sm overflow-hidden">
                                <div className="p-4">
                                    <p className="text-gray-600 font-medium">Users</p>
                                    <div className="flex items-center space-x-4 mt-2">
                                        <h4 className="text-3xl font-semibold">33,956</h4>
                                        <span className="text-red-400 flex items-center text-sm font-medium">
                                            <ArrowDown className="w-4 h-4" />
                                            12,2%
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-sm">
                                        Total users world wide
                                    </p>
                                </div>

                                <div className="h-24">
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
                                </div>
                            </div>

                            {/* EMPRESAS */}
                            <div className="bg-white rounded-sm shadow-sm overflow-hidden">
                                <div className="p-4">
                                    <p className="text-gray-600 font-medium">Empresas</p>
                                    <div className="flex items-center space-x-4 mt-2">
                                        <h4 className="text-3xl font-semibold">50.36%</h4>
                                        <span className="text-green-400 flex items-center text-sm font-medium">
                                            <ArrowUp className="w-4 h-4" />
                                            9,12%
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-sm">
                                        Total empresas world wide
                                    </p>
                                </div>

                                <div className="h-24">
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
                                </div>
                            </div>
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
                                <div className="flex items-center space-x-4">
                                    <div className="w-32 h-32">
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
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Online</h4>
                                        <p className="text-2xl font-semibold">45,324</p>
                                    </div>
                                </div>

                                {/* OFFLINE */}
                                <div className="flex items-center space-x-4">
                                    <div className="w-32 h-32">
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
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Offline</h4>
                                        <p className="text-2xl font-semibold">12,236</p>
                                    </div>
                                </div>
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
                            <div>
                                <h4 className="text-sm text-gray-500">Active</h4>
                                <p className="text-2xl font-semibold">13,956</p>
                            </div>

                            <div>
                                <h4 className="text-sm text-gray-500">Scheduled</h4>
                                <p className="text-2xl font-semibold">27,219</p>
                            </div>

                            <div>
                                <h4 className="text-sm text-gray-500">Completed</h4>
                                <p className="text-2xl font-semibold">03,386</p>
                            </div>

                            <div>
                                <h4 className="text-sm text-gray-500">Canceled</h4>
                                <p className="text-2xl font-semibold">04,739</p>
                            </div>
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