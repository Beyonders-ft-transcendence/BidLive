"use client";

import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Container({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#1B59F8] p-2 text-gray-900 font-sans select-none">
            {/* White card container holding both sidebar and content */}
            <div className="flex flex-1 w-full h-full bg-white rounded-md shadow-xl overflow-hidden p-6 gap-6 relative">
                {/* Sidebar on the left */}
                <Sidebar />
                
                {/* Main Content Column on the right */}
                <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
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