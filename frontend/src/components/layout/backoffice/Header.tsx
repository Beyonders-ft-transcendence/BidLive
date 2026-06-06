"use client";

import { Search, Bell, Send } from "lucide-react";

export default function Header() {
    return (
        <header className="sticky top-0 z-20 w-full bg-white border-b border-gray-100 h-16 flex items-center justify-between px-8 select-none shadow-sm">
            {/* LEFT: Search Input (light gray bg, rounded-sm) */}
            <div className="relative w-72">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Pesquisar..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-sm pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 text-gray-800 placeholder:text-gray-400 font-sans"
                />
            </div>

            {/* RIGHT: Quick Tools & Profile */}
            <div className="flex items-center gap-4">
                {/* Send/Paper Plane button */}
                <button className="w-9 h-9 rounded-sm bg-white hover:bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shadow-sm cursor-pointer">
                    <Send size={14} className="rotate-45 -translate-y-0.5" />
                </button>

                {/* Bell/Notification button */}
                <button className="w-9 h-9 rounded-sm bg-white hover:bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shadow-sm relative cursor-pointer">
                    <Bell size={14} />
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500"></span>
                </button>

                {/* Profile Widget */}
                <div className="flex items-center gap-2.5 ml-1.5">
                    <div className="hidden sm:flex flex-col text-right">
                        <span className="text-[10px] font-bold text-gray-900 leading-none">Super Admin</span>
                        <span className="text-[8px] text-gray-400 mt-0.5 leading-none">admin@bidlive.co.ao</span>
                    </div>
                    {/* Avatar box */}
                    <div className="w-9 h-9 rounded-sm bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 shrink-0">
                        SA
                    </div>
                </div>
            </div>
        </header>
    );
}