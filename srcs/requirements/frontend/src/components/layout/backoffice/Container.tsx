"use client";

import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Container({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#0B0F19] p-2 text-slate-200 font-sans select-none">
            {/* Dark card container holding both sidebar and content */}
            <div className="flex flex-1 w-full h-full bg-[#151C2C] border border-slate-800 rounded-md shadow-2xl overflow-hidden p-6 gap-6 relative">
                {/* Sidebar on the left */}
                <Sidebar />
                
                {/* Main Content Column on the right */}
                <div className="flex-1 flex flex-col max-w-7xl mx-auto h-full overflow-hidden">
                    {/* Header at the top of the content area */}
                    <Header />
                    
                    {/* Page Content below header */}
                    <div className="flex-1 overflow-y-auto scrollbar-none pr-1">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}