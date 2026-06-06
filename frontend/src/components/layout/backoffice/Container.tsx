"use client";

import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Container({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-gray-900 font-sans select-none">
            {/* Top Full-width Header */}
            <Header />
            
            <div className="flex flex-1 min-h-0 relative">
                {/* Sidebar under header */}
                <Sidebar />
                
                {/* Main Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}