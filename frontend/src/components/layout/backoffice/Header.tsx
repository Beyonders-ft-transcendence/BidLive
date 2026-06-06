"use client";

import { Search, Bell, Menu, ChevronDown, PlusCircle } from "lucide-react";

export default function Header() {
    return (
        <header className="w-full bg-primary h-14 flex items-center justify-between px-6 select-none shadow-md text-white z-30">
            {/* LEFT: Hamburger & Brand Logo */}
            <div className="flex items-center gap-4 shrink-0">
                <span className="text-xl font-black tracking-tight">BidLive</span>
                <button className="text-white/80 hover:text-white transition-colors cursor-pointer">
                    <Menu size={18} />
                </button>
            </div>

            {/* MIDDLE: Search bar with transparent styling */}
            <div className="relative w-80 max-w-xs md:max-w-md">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60" />
                <input
                    type="text"
                    placeholder="Pesquisar..."
                    className="w-full bg-white/10 border border-white/20 rounded-sm pl-9 pr-4 py-1.5 text-xs text-white placeholder:text-white/60 focus:outline-none focus:bg-white/20 focus:border-white/30 transition-all font-sans"
                />
            </div>

            {/* RIGHT: Notifications, Profile & Quick Actions */}
            <div className="flex items-center gap-4">
                {/* Notification Bell with yellow badge */}
                <button className="w-8 h-8 rounded-sm hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors relative cursor-pointer">
                    <Bell size={15} />
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                </button>

                {/* Profile User Dropdown */}
                <div className="flex items-center gap-2.5 cursor-pointer hover:bg-white/10 px-2.5 py-1.5 rounded-sm transition-colors">
                    {/* User profile picture mockup */}
                    <div className="w-6 h-6 rounded-sm bg-white/20 text-white font-black text-[10px] flex items-center justify-center border border-white/30">
                        SA
                    </div>
                    <span className="hidden md:inline text-xs font-bold text-white">Super Admin</span>
                    <ChevronDown size={12} className="text-white/60" />
                </div>

                {/* Divider line */}
                <span className="w-px h-5 bg-white/20"></span>

                {/* Plus circle action button */}
                <button className="text-white/80 hover:text-white transition-colors cursor-pointer">
                    <PlusCircle size={18} />
                </button>
            </div>
        </header>
    );
}