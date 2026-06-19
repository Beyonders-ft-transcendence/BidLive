import { Outlet } from "react-router-dom";

export default function PublicLayout() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            {/* Simple Public Navbar */}
            <header className="border-b border-border bg-card">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-tight text-primary">BidLive</span>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col">
                <Outlet />
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-border bg-card py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} BidLive Platform. Todos os direitos reservados.
                </div>
            </footer>
        </div>
    );
}
