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
        const hasRequiredRole = user?.roles?.some((role) => allowedRoles.includes(role));
        
        if (!hasRequiredRole) {
            // Se o usuário estiver autenticado mas não tiver a permissão, pode redirecionar 
            // de volta para a dashboard geral ou uma página de Acesso Negado.
            // Por simplicidade, enviando para /user como default.
            return <Navigate to="/user" replace />;
        }
    }

    return <Outlet />;
}
