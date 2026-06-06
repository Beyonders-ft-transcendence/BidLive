"use client";

import { Search, Bell, Send } from "lucide-react";

export default function Header() {
    return (
        <header className="w-full bg-[#F8FAFC] h-16 flex items-center justify-between px-8 select-none">
            {/* LEFT: Search Input in rounded light card */}
            <div className="relative w-72">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Pesquisar..."
                    className="w-full bg-white border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 text-gray-800 placeholder:text-gray-400 shadow-sm"
                />
            </div>

            {/* RIGHT: Quick Tools & Profile */}
            <div className="flex items-center gap-4">
                {/* Send/Paper Plane tool */}
                <button className="w-9 h-9 rounded-xl bg-white hover:bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors shadow-sm cursor-pointer">
                    <Send size={14} className="text-gray-400 rotate-45 -translate-y-0.5" />
                </button>

                {/* Bell/Notification notification */}
                <button className="w-9 h-9 rounded-xl bg-white hover:bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors shadow-sm relative cursor-pointer">
                    <Bell size={14} className="text-gray-400" />
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-red-500"></span>
                </button>

                {/* Profile Widget */}
                <div className="flex items-center gap-2.5 ml-1.5">
                    <div className="hidden sm:flex flex-col text-right">
                        <span className="text-[10px] font-bold text-gray-900 leading-none">Super Admin</span>
                        <span className="text-[8px] text-gray-400 mt-0.5 leading-none">admin@bidlive.co.ao</span>
                    </div>
                    {/* Avatar circle */}
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 shrink-0">
                        SA
                    </div>
                </div>
            </div>
        </header>
    );
}