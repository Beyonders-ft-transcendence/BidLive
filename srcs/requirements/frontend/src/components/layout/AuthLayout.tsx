import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/shared/stores/auth.store";

export default function AuthLayout() {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
            {/* Sidebar Placeholder */}
            <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-border">
                    <span className="text-xl font-bold tracking-tight text-primary">BidLive</span>
                </div>
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    <Link 
                        to="/user" 
                        className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                        Painel de Controle
                    </Link>
                    <Link 
                        to="/explore" 
                        className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                        Explorar Leilões
                    </Link>
                </nav>
                <div className="p-4 border-t border-border">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-destructive hover:bg-destructive/90 transition-colors"
                    >
                        Sair da conta
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Mobile Menu Toggle Placeholder */}
                    <div className="flex items-center md:hidden">
                        <span className="text-xl font-bold text-primary">BidLive</span>
                    </div>

                    <div className="flex-1 flex justify-end items-center gap-4">
                        {/* Profile Area */}
                        <div className="flex items-center gap-3">
                            <div className="text-sm text-right hidden sm:block">
                                <p className="font-medium leading-none text-foreground">{user?.full_name || user?.username}</p>
                                <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold uppercase select-none">
                                {(user?.full_name || user?.username || "U")[0]}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
