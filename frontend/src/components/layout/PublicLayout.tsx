import { Outlet } from "react-router-dom";

export default function PublicLayout() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col">
                <Outlet />
            </main>
        </div>
    );
}
