import Header from "./Header"
import Sidebar from "./Sidebar"

export default function Container({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[#F8FAFC] text-gray-900 font-sans">
            {/* Sidebar */}
            <Sidebar />
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 pl-60">
                {/* Top Header */}
                <Header />
                
                {/* Dashboard / Backoffice Page Content */}
                <div className="flex-1 p-6 md:p-8 ">
                    {children}
                </div>
            </div>
        </div>
    )
}