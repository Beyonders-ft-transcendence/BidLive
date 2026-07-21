import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/shared/stores/auth.store";

export default function GuestRoute() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (isAuthenticated) {
        return <Navigate to="/user" replace />;
    }

    return <Outlet />;
}
