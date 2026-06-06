"use client";

import { Search } from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";

const profitLossData = [
    { name: "Jan", profit: 24, loss: 12 },
    { name: "Feb", profit: 34, loss: 18 },
    { name: "Mar", profit: 22, loss: 15 },
    { name: "Apr", profit: 38, loss: 24 },
    { name: "May", profit: 45, loss: 30 },
    { name: "Jun", profit: 30, loss: 12 },
    { name: "Jul", profit: 48, loss: 20 },
    { name: "Aug", profit: 36, loss: 16 }
];

export default function Dashboard() {
    return (
        <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
            {/* Header Greeting Banner */}
            <div className="mb-6 select-none">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Good morning, Admin</h1>
                <p className="text-xs text-gray-400 mt-1">Stay on top of your tasks, monitor progress, and track status.</p>
            </div>

            {/* Main Responsive Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* COLUMN 1: Balance, Spending Limit, Cards (col-span-4) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    
                    {/* Total Balance Card */}
                    <div className="bg-white rounded-lg border border-gray-150 p-5 shadow-sm flex flex-col gap-4">
                        <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
                            <span>Total Balance</span>
                            <select className="bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5 text-[10px] text-gray-600 focus:outline-none">
                                <option>AOA (Kz)</option>
                                <option>USD ($)</option>
                                <option>EUR (€)</option>
                            </select>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-950">Kz 689.372.000,00</h2>
                            <span className="inline-block bg-green-50 text-green-600 text-[9px] font-bold px-2 py-0.5 rounded-full mt-1.5">
                                ↑ 5.2% than last month
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-1">
                            <button className="bg-primary text-white text-xs font-bold py-2 rounded-lg shadow-sm shadow-primary/20 hover:bg-primary-light transition-all cursor-pointer">
                                Transfer
                            </button>
                            <button className="bg-white border border-gray-200 text-gray-600 text-xs font-bold py-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer">
                                Request
                            </button>
                        </div>

                        {/* Wallets section */}
                        <div className="border-t border-gray-100 pt-4 mt-1 flex flex-col gap-3">
                            <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold border-b border-gray-50 pb-1.5">
                                <span>Wallets</span>
                                <span>Total 3 wallets</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-gray-50 rounded p-2 text-center flex flex-col items-center">
                                    <span className="text-[8px] text-gray-400 font-medium">USD</span>
                                    <span className="text-[10px] font-black text-gray-800 mt-1">$22,678</span>
                                    <span className="text-[7px] text-green-500 font-bold mt-0.5">Active</span>
                                </div>
                                <div className="bg-gray-50 rounded p-2 text-center flex flex-col items-center">
                                    <span className="text-[8px] text-gray-400 font-medium">EUR</span>
                                    <span className="text-[10px] font-black text-gray-800 mt-1">€18,345</span>
                                    <span className="text-[7px] text-green-500 font-bold mt-0.5">Active</span>
                                </div>
                                <div className="bg-gray-50 rounded p-2 text-center flex flex-col items-center border border-primary/20 bg-primary/5">
                                    <span className="text-[8px] text-primary font-bold">AOA (Kz)</span>
                                    <span className="text-[10px] font-black text-primary mt-1">Kz 15.0M</span>
                                    <span className="text-[7px] text-primary font-bold mt-0.5">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Spending Limit Card */}
                    <div className="bg-white rounded-lg border border-gray-150 p-5 shadow-sm flex flex-col gap-3.5">
                        <div className="text-xs text-gray-400 font-medium">
                            <span>Monthly Spending Limit</span>
                        </div>
                        <div>
                            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mt-1">
                                <div className="bg-primary h-full w-[25%]" />
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2 font-medium">
                                <span className="text-gray-900 font-bold">Kz 1.400.000 spent</span>
                                <span>out of Kz 5.500.000</span>
                            </div>
                        </div>
                    </div>

                    {/* My Cards Card */}
                    <div className="bg-white rounded-lg border border-gray-150 p-5 shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
                            <span>My Cards</span>
                            <button className="text-primary hover:underline text-[10px] font-bold cursor-pointer">+ Add new</button>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-1 mt-1 scrollbar-none">
                            {/* Card 1 - Dark/Blue */}
                            <div className="bg-gradient-to-br from-[#0B1F3B] to-[#1B59F8] text-white rounded-lg p-3.5 min-w-[190px] h-[115px] flex flex-col justify-between shadow-md">
                                <div className="flex justify-between items-start">
                                    <span className="text-[8px] bg-white/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                                        Active
                                    </span>
                                    <div className="flex -space-x-1.5">
                                        <div className="w-4 h-4 rounded-full bg-red-500 opacity-90"></div>
                                        <div className="w-4 h-4 rounded-full bg-amber-500 opacity-90"></div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-mono tracking-widest">•••• •••• •••• 6782</p>
                                    <div className="flex justify-between items-center mt-2.5 text-[8px] text-gray-300">
                                        <div>
                                            <p className="text-[6px] uppercase font-light text-gray-400">Exp</p>
                                            <p className="font-semibold text-white">09/29</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[6px] uppercase font-light text-gray-400">CVV</p>
                                            <p className="font-semibold text-white">611</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2 - Light/Primary */}
                            <div className="bg-gradient-to-br from-primary to-primary-light text-white rounded-lg p-3.5 min-w-[140px] h-[115px] flex flex-col justify-between shadow-md opacity-80 hover:opacity-100 transition-opacity">
                                <div className="flex justify-between items-start">
                                    <span className="text-[8px] bg-white/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                                        Active
                                    </span>
                                    <div className="w-4 h-4 rounded-full bg-white/25"></div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-mono tracking-widest">•••• •••• •••• 4356</p>
                                    <p className="text-[8px] font-semibold mt-2.5">Kz Wallet Card</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMN 2: Stats Grid & Recent Activities (col-span-5) */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    {/* 4 Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Card 1: Total Earnings (Highlighted Primary) */}
                        <div className="bg-primary text-white rounded-lg p-4 shadow-md shadow-primary/10 flex flex-col justify-between h-[105px]">
                            <div className="flex justify-between items-start">
                                <span className="text-[9px] font-bold text-blue-100 uppercase tracking-wider">Total Earnings</span>
                                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">💰</span>
                            </div>
                            <div>
                                <h3 className="text-base font-black">Kz 950.000</h3>
                                <p className="text-[8px] text-blue-100/90 mt-1">↑ 27% This month</p>
                            </div>
                        </div>

                        {/* Card 2: Total Spending */}
                        <div className="bg-white border border-gray-150 rounded-lg p-4 shadow-sm flex flex-col justify-between h-[105px]">
                            <div className="flex justify-between items-start">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Total Spending</span>
                                <span className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center text-[10px]">💳</span>
                            </div>
                            <div>
                                <h3 className="text-base font-black text-gray-950">Kz 700.000</h3>
                                <p className="text-[8px] text-red-500 font-bold mt-1">↓ 5% This month</p>
                            </div>
                        </div>

                        {/* Card 3: Total Income */}
                        <div className="bg-white border border-gray-150 rounded-lg p-4 shadow-sm flex flex-col justify-between h-[105px]">
                            <div className="flex justify-between items-start">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Total Income</span>
                                <span className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center text-[10px]">📥</span>
                            </div>
                            <div>
                                <h3 className="text-base font-black text-gray-950">Kz 1.050.000</h3>
                                <p className="text-[8px] text-green-600 font-bold mt-1">↑ 8% This month</p>
                            </div>
                        </div>

                        {/* Card 4: Total Revenue */}
                        <div className="bg-white border border-gray-150 rounded-lg p-4 shadow-sm flex flex-col justify-between h-[105px]">
                            <div className="flex justify-between items-start">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Total Revenue</span>
                                <span className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center text-[10px]">📈</span>
                            </div>
                            <div>
                                <h3 className="text-base font-black text-gray-950">Kz 850.000</h3>
                                <p className="text-[8px] text-green-600 font-bold mt-1">↑ 4% This month</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="bg-white border border-gray-150 rounded-lg p-5 shadow-sm flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-950">Recent Activities</span>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        className="bg-gray-50 border border-gray-200 text-[9px] rounded-md pl-6 pr-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary w-28"
                                    />
                                    <Search size={9} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                                <button className="border border-gray-200 text-gray-600 text-[9px] px-2.5 py-1 rounded-md bg-white hover:bg-gray-50 flex items-center gap-1 font-medium cursor-pointer">
                                    Filter
                                </button>
                            </div>
                        </div>

                        {/* Activities Table */}
                        <div className="overflow-x-auto scrollbar-none">
                            <table className="w-full text-left border-collapse min-w-[400px]">
                                <thead>
                                    <tr className="border-b border-gray-100 text-[8px] text-gray-400 font-bold uppercase tracking-wider">
                                        <th className="py-2 font-semibold">Order ID</th>
                                        <th className="py-2 font-semibold">Activity</th>
                                        <th className="py-2 font-semibold">Price</th>
                                        <th className="py-2 font-semibold">Status</th>
                                        <th className="py-2 font-semibold">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-[9px]">
                                    <tr>
                                        <td className="py-2.5 text-gray-500 font-mono">INV_000076</td>
                                        <td className="py-2.5 font-semibold text-gray-800">Mobile App Purchase</td>
                                        <td className="py-2.5 font-bold text-gray-950">Kz 25.500</td>
                                        <td className="py-2.5">
                                            <span className="inline-flex items-center gap-1 text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded-full text-[8px]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Completed
                                            </span>
                                        </td>
                                        <td className="py-2.5 text-gray-400">17 Apr, 2026 03:45 PM</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 text-gray-500 font-mono">INV_000075</td>
                                        <td className="py-2.5 font-semibold text-gray-800">Hotel Booking</td>
                                        <td className="py-2.5 font-bold text-gray-950">Kz 32.750</td>
                                        <td className="py-2.5">
                                            <span className="inline-flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded-full text-[8px]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> Pending
                                            </span>
                                        </td>
                                        <td className="py-2.5 text-gray-400">15 Apr, 2026 11:30 AM</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 text-gray-500 font-mono">INV_000074</td>
                                        <td className="py-2.5 font-semibold text-gray-800">Flight Ticket Booking</td>
                                        <td className="py-2.5 font-bold text-gray-950">Kz 40.200</td>
                                        <td className="py-2.5">
                                            <span className="inline-flex items-center gap-1 text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded-full text-[8px]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Completed
                                            </span>
                                        </td>
                                        <td className="py-2.5 text-gray-400">15 Apr, 2026 12:00 PM</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 text-gray-500 font-mono">INV_000073</td>
                                        <td className="py-2.5 font-semibold text-gray-800">Grocery Purchase</td>
                                        <td className="py-2.5 font-bold text-gray-950">Kz 50.200</td>
                                        <td className="py-2.5">
                                            <span className="inline-flex items-center gap-1 text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded-full text-[8px]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> In Progress
                                            </span>
                                        </td>
                                        <td className="py-2.5 text-gray-400">14 Apr, 2026 09:15 PM</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 text-gray-500 font-mono">INV_000073</td>
                                        <td className="py-2.5 font-semibold text-gray-800">Software License</td>
                                        <td className="py-2.5 font-bold text-gray-950">Kz 15.900</td>
                                        <td className="py-2.5">
                                            <span className="inline-flex items-center gap-1 text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded-full text-[8px]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Completed
                                            </span>
                                        </td>
                                        <td className="py-2.5 text-gray-400">10 Apr, 2026 06:00 AM</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* COLUMN 3: Income Recharts Stacked Bar Chart (col-span-3) */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="bg-white border border-gray-150 rounded-lg p-5 shadow-sm flex flex-col gap-4 w-full">
                        <div>
                            <h3 className="text-xs font-bold text-gray-950">Total Income</h3>
                            <p className="text-[9px] text-gray-400 mt-0.5">View your income in a certain period of time</p>
                        </div>

                        {/* Legend indicators */}
                        <div className="flex items-center gap-3 text-[9px] font-semibold mt-1">
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-primary"></span>
                                <span className="text-gray-600">Profit</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#0B1F3B]"></span>
                                <span className="text-gray-600">Loss</span>
                            </div>
                        </div>

                        {/* Bar chart container */}
                        <div className="h-64 mt-4 text-[9px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={profitLossData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 9 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 9 }} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    {/* Stacked Bars representing Profit and Loss */}
                                    <Bar dataKey="loss" stackId="a" fill="#0B1F3B" radius={[0, 0, 0, 0]} barSize={12} />
                                    <Bar dataKey="profit" stackId="a" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={12} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}