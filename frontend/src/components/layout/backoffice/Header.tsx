"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, HelpCircle, User } from "lucide-react";

export default function Header() {
    const pathname = usePathname();

    const NAV = [
        { name: "Overview", href: "/backoffice/dashboard" },
        { name: "Activity", href: "/backoffice/bids" },
        { name: "Manage", href: "/backoffice/auctions" },
        { name: "Program", href: "/backoffice/categories" },
        { name: "Account", href: "/backoffice/users" },
        { name: "Reports", href: "/backoffice/reports" }
    ];

    // Helper to determine active state of general nav items
    const getIsActive = (href: string) => {
        if (href === "/backoffice/dashboard") {
            return pathname === href || pathname === "/backoffice";
        }
        return pathname.startsWith(href);
    };

    return (
        <header className="w-full bg-white border-b border-gray-100 h-16 flex items-center justify-between px-6 select-none sticky top-0 z-20">
            {/* LEFT: Logo & Icon */}
            <div className="flex items-center shrink-0">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-md shadow-primary/25">
                    <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="none" />
                        <path d="M6 18L18 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </div>
                <span className="text-base font-black ml-2 tracking-tight text-gray-900">BidLive.</span>
            </div>

            {/* CENTER: Navigation Links (Pill Style) */}
            <nav className="hidden md:flex items-center gap-1.5">
                {NAV.map((item) => {
                    const isActive = getIsActive(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                                isActive
                                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                        >
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* RIGHT: Quick Tools & Profile */}
            <div className="flex items-center gap-4">
                {/* Icons Grid */}
                <div className="flex items-center gap-1.5">
                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors border border-gray-100">
                        <Search size={14} />
                    </button>
                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors border border-gray-100 relative">
                        <Bell size={14} />
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    </button>
                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors border border-gray-100">
                        <HelpCircle size={14} />
                    </button>
                </div>

                {/* Divider */}
                <div className="w-[1px] h-6 bg-gray-100"></div>

                {/* Profile Widget */}
                <div className="flex items-center gap-2.5">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20">
                        SA
                    </div>
                    {/* Details */}
                    <div className="hidden sm:flex flex-col text-left">
                        <span className="text-[10px] font-bold text-gray-900 leading-none">Super Admin</span>
                        <span className="text-[8px] text-gray-400 mt-0.5 leading-none">admin@bidlive.co.ao</span>
                    </div>
                </div>
            </div>
        </header>
    );
}