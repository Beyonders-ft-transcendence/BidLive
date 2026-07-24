import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/shared/stores/auth.store";
import { UserRole } from "@/shared/types/auth.types";
import { usePermissions } from "@/hooks/usePermissions";

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    const permissions = usePermissions();

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const isBackofficeRoute = allowedRoles.includes(UserRole.SUPER_ADMIN) || allowedRoles.includes(UserRole.MONITOR);

        if (isBackofficeRoute) {
            if (!permissions.isAdminOrMonitor && !user?.is_staff) {
                return <Navigate to="/user" replace />;
            }
        } else {
            const hasRequiredRole = allowedRoles.some((role) => permissions.hasRole(role));
            if (!hasRequiredRole && !permissions.isSuperAdmin) {
                return <Navigate to="/user" replace />;
            }
        }
    }

    return <Outlet />;
}
