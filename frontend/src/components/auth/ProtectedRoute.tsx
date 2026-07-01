import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/shared/stores/auth.store";
import { UserRole } from "@/shared/types/auth.types";

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const hasRequiredRole = user?.roles?.some((role: any) => {
            if (typeof role === 'string') {
                return allowedRoles.includes(role as UserRole);
            }
            if (typeof role === 'object' && role !== null) {
                return allowedRoles.includes(role.name as UserRole);
            }
            return false;
        });
        
        if (!hasRequiredRole) {
            // Se o usuário estiver autenticado mas não tiver a permissão, redireciona
            return <Navigate to="/user" replace />;
        }
    }

    return <Outlet />;
}
